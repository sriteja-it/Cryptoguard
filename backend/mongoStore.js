const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const DATA_DIR = path.join(__dirname, 'data');
const API_KEYS_FILE = path.join(DATA_DIR, 'api_keys.json');
const SCANS_FILE = path.join(DATA_DIR, 'scan_history.json');

let client;
let db;
let connectionPromise = null;

function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

async function ensureIndexes(database) {
  await Promise.all([
    database.collection('api_keys').createIndex({ hashed_key: 1 }, { unique: true }),
    database.collection('scan_history').createIndex({ scannedAt: -1 }),
    database.collection('scan_history').createIndex({ apiKeyId: 1, scannedAt: -1 }),
  ]);
}

async function seedLegacyData(database) {
  const apiKeysCollection = database.collection('api_keys');
  const scansCollection = database.collection('scan_history');

  if ((await apiKeysCollection.countDocuments()) === 0) {
    const legacyApiKeys = readJsonFile(API_KEYS_FILE, []);
    if (legacyApiKeys.length > 0) {
      await apiKeysCollection.insertMany(legacyApiKeys);
    }
  }

  if ((await scansCollection.countDocuments()) === 0) {
    const legacyScans = readJsonFile(SCANS_FILE, []);
    if (legacyScans.length > 0) {
      await scansCollection.insertMany(legacyScans);
    }
  }

  if ((await apiKeysCollection.countDocuments()) === 0) {
    const seedKey = 'dev_local_key_please_change';
    const hashed = crypto.createHash('sha256').update(seedKey).digest('hex');
    await apiKeysCollection.insertOne({
      id: 1,
      name: 'local-dev',
      hashed_key: hashed,
      quota: 1000,
      usage_count: 0,
      expires_at: null,
    });
  }
}

async function resetFromLegacyData() {
  const database = await connectMongo();
  await Promise.all([
    database.collection('api_keys').deleteMany({}),
    database.collection('scan_history').deleteMany({}),
  ]);
  await seedLegacyData(database);
}

async function connectMongo() {
  if (db) return db;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    // BUG FIX #1: Validate MONGODB_URI before attempting connection to give a clear error
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set. Please create a .env file with MONGODB_URI=<your-connection-string>');
    }

    const dbName = process.env.MONGODB_DB_NAME || 'darkmode_pqc';
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    await ensureIndexes(db);
    await seedLegacyData(db);
    return db;
  })();

  try {
    return await connectionPromise;
  } catch (err) {
    connectionPromise = null;
    throw err;
  }
}

async function getApiKeyByHash(hashedKey) {
  const database = await connectMongo();
  return database.collection('api_keys').findOne({ hashed_key: hashedKey });
}

async function incrementApiKeyUsage(apiKeyId) {
  const database = await connectMongo();
  return database.collection('api_keys').findOneAndUpdate(
    { id: apiKeyId },
    { $inc: { usage_count: 1 } },
    { returnDocument: 'after' }
  );
}

async function getNextScanId() {
  const database = await connectMongo();
  const lastScan = await database.collection('scan_history')
    .findOne({}, { sort: { id: -1 }, projection: { id: 1 } });
  return lastScan && typeof lastScan.id === 'number' ? lastScan.id + 1 : 1;
}

// BUG FIX #2: MongoDB driver v5+ does NOT support sort/limit as find() options.
// Must use .sort() and .limit() method chaining instead.
async function getRecentScans(limit = 10) {
  const database = await connectMongo();
  return database.collection('scan_history')
    .find({})
    .sort({ scannedAt: -1 })
    .limit(limit)
    .toArray();
}

async function insertScan(scan) {
  const database = await connectMongo();
  const result = await database.collection('scan_history').insertOne(scan);
  return { ...scan, _id: result.insertedId };
}

async function deleteScanById(scanId, apiKeyId) {
  const database = await connectMongo();
  const id = Number(scanId);
  if (!Number.isFinite(id)) return { deletedCount: 0, reason: 'invalid_scan_id' };

  const filter = { id };
  if (apiKeyId != null) filter.apiKeyId = apiKeyId;

  const result = await database.collection('scan_history').deleteOne(filter);
  return { deletedCount: result.deletedCount };
}

async function deleteScansByApiKeyId(apiKeyId) {
  const database = await connectMongo();
  const id = Number(apiKeyId);
  if (!Number.isFinite(id)) return { deletedCount: 0, reason: 'invalid_api_key_id' };

  const result = await database.collection('scan_history').deleteMany({ apiKeyId: id });
  return { deletedCount: result.deletedCount };
}

async function closeMongo() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
    connectionPromise = null;
  }
}

async function setApiKeyUnlimitedById(apiKeyId) {
  const database = await connectMongo();
  const id = Number(apiKeyId);
  if (!Number.isFinite(id)) throw new Error('invalid_api_key_id');

  return database.collection('api_keys').findOneAndUpdate(
    { id },
    { $set: { quota: null } },
    { returnDocument: 'after' }
  );
}

async function revokeApiKeyById(apiKeyId, action = 'expire') {
  const database = await connectMongo();
  const id = Number(apiKeyId);
  if (!Number.isFinite(id)) throw new Error('invalid_api_key_id');

  if (action === 'delete') {
    const r = await database.collection('api_keys').deleteOne({ id });
    return { deletedCount: r.deletedCount, revoked: false, doc: null };
  }

  const updatedDoc = await database.collection('api_keys').findOneAndUpdate(
    { id },
    { $set: { expires_at: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  return { deletedCount: 0, revoked: !!updatedDoc, doc: updatedDoc };
}

// BUG FIX #3: Projection { hashed_key: 1 } only returns hashed_key and _id — 
// this caused name, id, quota, usage_count to be missing from admin key list.
// Changed to { hashed_key: 0 } to exclude hashed_key and return all other fields.
async function listApiKeys() {
  const database = await connectMongo();
  const keys = await database.collection('api_keys')
    .find({}, { projection: { hashed_key: 0 } })
    .toArray();
  return keys.map((key) => ({
    ...key,
    keyFingerprint: typeof key.hashed_key === 'string' ? key.hashed_key.slice(0, 16) : null,
  }));
}

async function setQuotaForAll(q) {
  const database = await connectMongo();
  const quota = Number(q);
  if (!Number.isFinite(quota) || quota < 0) throw new Error('invalid_quota');
  const r = await database.collection('api_keys').updateMany({}, { $set: { quota } });
  return { matchedCount: r.matchedCount, modifiedCount: r.modifiedCount };
}

async function setQuotaForApiKeyId(apiKeyId, q) {
  const database = await connectMongo();
  const quota = Number(q);
  const id = Number(apiKeyId);
  if (!Number.isFinite(id)) throw new Error('invalid_api_key_id');
  if (!Number.isFinite(quota) || quota < 0) throw new Error('invalid_quota');

  return database.collection('api_keys').findOneAndUpdate(
    { id },
    { $set: { quota } },
    { returnDocument: 'after' }
  );
}

module.exports = {
  connectMongo,
  getApiKeyByHash,
  incrementApiKeyUsage,
  getNextScanId,
  getRecentScans,
  insertScan,
  deleteScanById,
  deleteScansByApiKeyId,
  closeMongo,
  resetFromLegacyData,
  setApiKeyUnlimitedById,
  revokeApiKeyById,
  listApiKeys,
  setQuotaForAll,
  setQuotaForApiKeyId,
};
