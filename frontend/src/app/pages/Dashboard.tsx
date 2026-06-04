{state === "result" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

            {/* Certificate Details */}
            <BentoCard delay={0} className="col-span-1 md:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Certificate details</p>
                  <h3 className="text-xl md:text-2xl font-bold text-white break-all">{subject}</h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#00A3FF]/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#00A3FF]" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0B0E14] rounded-lg p-3 border border-[#1e2532]">
                  <div className="text-xs text-gray-400 mb-1">Algorithm</div>
                  <div className="text-sm font-bold text-white">{algo}{keySize ? `-${keySize}` : ""}</div>
                </div>
                <div className="bg-[#0B0E14] rounded-lg p-3 border border-[#1e2532]">
                  <div className="text-xs text-gray-400 mb-1">TLS Version</div>
                  <div className="text-sm font-bold" style={{ color: tlsVersion.includes("1.3") ? "#00FF94" : tlsVersion.includes("1.2") ? "#FFB84D" : "#FF4D4D" }}>{tlsVersion}</div>
                </div>
                <div className="bg-[#0B0E14] rounded-lg p-3 border border-[#1e2532]">
                  <div className="text-xs text-gray-400 mb-1">Expires in</div>
                  <div className="text-sm font-bold" style={{ color: expiryColor }}>{daysLeft !== null ? `${daysLeft} days` : "Unknown"}</div>
                </div>
                <div className="bg-[#0B0E14] rounded-lg p-3 border border-[#1e2532]">
                  <div className="text-xs text-gray-400 mb-1">Issuer</div>
                  <div className="text-sm font-bold text-white truncate" title={issuer}>{issuer}</div>
                </div>
              </div>
              {notAfter && (
                <div className="mt-3 text-xs text-gray-500">Valid until: {notAfter.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
              )}
            </BentoCard>

            {/* Algorithm card */}
            <BentoCard delay={0.1}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Public key algorithm</p>
                  <h3 className="text-xl md:text-2xl font-bold text-white">{algo}{keySize ? `-${keySize}` : ""}</h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#FF4D4D]/20 flex items-center justify-center">
                  <Key className="w-5 h-5 md:w-6 md:h-6 text-[#FF4D4D]" />
                </div>
              </div>
              <p className="text-sm text-gray-300">{resultSummary.summary}</p>
            </BentoCard>

            {/* Key strength card */}
            <BentoCard delay={0.15}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Key strength</p>
                  <h3 className="text-xl md:text-2xl font-bold text-white">{keySize ? `${keySize}-bit` : "Unknown"}</h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#00A3FF]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#00A3FF]" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Classical security</span>
                    <span className="text-[#00FF94]">{classicalScore}%</span>
                  </div>
                  <div className="h-2 bg-[#1e2532] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-[#00FF94] to-[#00A3FF]" initial={{ width: 0 }} animate={{ width: `${classicalScore}%` }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Quantum urgency</span>
                    <span style={{ color: riskColor }}>{quantumScore}%</span>
                  </div>
                  <div className="h-2 bg-[#1e2532] rounded-full overflow-hidden">
                    <motion.div className="h-full" style={{ backgroundColor: riskColor }} initial={{ width: 0 }} animate={{ width: `${quantumScore}%` }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} />
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Risk assessment card */}
            <BentoCard delay={0.2} className="col-span-1 md:col-span-2">
              <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Quantum vulnerability assessment — {subject}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <h3 className="text-2xl md:text-3xl font-bold" style={{ color: riskColor }}>{riskLevel} Risk</h3>
                    <div className={`px-3 py-1 border rounded-full ${riskBg}`}>
                      <span className="text-xs font-bold" style={{ color: riskColor }}>{riskPriorityLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${riskColor}22` }}>
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" style={{ color: riskColor }} />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1 max-w-full lg:max-w-md space-y-3">
                  <p className="text-sm md:text-base text-gray-300">
                    {analysis.quantumVulnerable
                      ? `${subject} uses ${algo}${keySize ? `-${keySize}` : ""} which is vulnerable to quantum computing attacks via Shor's algorithm. Immediate PQC migration planning is recommended.`
                      : `${subject} may be using quantum-resistant or hybrid algorithms. Continue monitoring as post-quantum standards evolve.`}
                  </p>
                  {reasons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {reasons.slice(0, 4).map((reason: string) => (
                        <div key={`reason-${reason}`} className="px-3 py-1 rounded-lg text-xs" style={{ backgroundColor: `${riskColor}18`, border: `1px solid ${riskColor}33`, color: riskColor }}>
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="self-center lg:self-auto">
                  <CircularGauge percentage={vulnScore} label="Vulnerability Index" color={riskColor} />
                  <div className="mt-3 text-sm text-gray-300 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="px-3 py-1 bg-[#0B0E14] border border-[#1e2532] rounded-md">
                        <div className="text-xs text-gray-400">Classical</div>
                        <div className="text-sm font-bold text-[#00FF94]">{classicalScore}%</div>
                      </div>
                      <div className="px-3 py-1 bg-[#0B0E14] border border-[#1e2532] rounded-md">
                        <div className="text-xs text-gray-400">Quantum urgency</div>
                        <div className="text-sm font-bold" style={{ color: riskColor }}>{quantumScore}%</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">Score for: {subject}</div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Recommendations card */}
            <BentoCard delay={0.3} className="col-span-1 md:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">NIST PQC migration recommendation</p>
                  <h3 className="text-xl md:text-2xl font-bold text-white">ML-KEM-768</h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#00FF94]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#00FF94]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0B0E14] rounded-lg p-4 border border-[#1e2532]">
                  <div className="text-xs text-gray-400 mb-1">Recommended algorithm</div>
                  <div className="text-sm font-bold text-[#00FF94]">ML-KEM (Kyber)</div>
                  <div className="text-xs text-gray-500 mt-1">Module-lattice-based</div>
                </div>
                <div className="bg-[#0B0E14] rounded-lg p-4 border border-[#1e2532]">
                  <div className="text-xs text-gray-400 mb-1">Security level</div>
                  <div className="text-sm font-bold text-[#00A3FF]">Level 3 (AES-192)</div>
                  <div className="text-xs text-gray-500 mt-1">768-bit parameter</div>
                </div>
                <div className="bg-[#0B0E14] rounded-lg p-4 border border-[#1e2532]">
                  <div className="text-xs text-gray-400 mb-1">Implementation status</div>
                  <div className="text-sm font-bold text-[#00FF94]">Standardized 2024</div>
                  <div className="text-xs text-gray-500 mt-1">Production ready</div>
                </div>
              </div>
              {recommendations.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {recommendations.map((rec: string, i: number) => (
                    <div key={`rec-${i}`} className="p-3 bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-lg">
                      <p className="text-xs md:text-sm text-gray-300"><span className="font-bold text-[#00FF94]">→ </span>{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-4 bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-300">
                    <span className="font-bold text-[#00FF94]">Migration path:</span> Implement hybrid TLS with ML-KEM-768 + X25519 to keep both quantum-safe and classical security during transition.
                  </p>
                </div>
              )}
            </BentoCard>
          </div>

          <ScanHistoryList
            scans={recentScans}
            title="Recent scans"
            subtitle="History"
            emptyMessage="No scans yet. Run an audit to populate the history."
            delay={0.15}
          />
          {historyError && (
            <div className="rounded-lg border border-[#FFB84D]/20 bg-[#FFB84D]/10 px-4 py-3 text-sm text-[#FFB84D]">
              {historyError}
            </div>
          )}
        </div>
      )}

      {state === "error" && (
        <BentoCard>
          <div className="text-center py-4 md:py-6">
            <AlertTriangle className="w-12 h-12 text-[#FF4D4D] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Audit failed</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-2xl mx-auto">{errorMessage || "Unable to contact the audit backend. Try again later."}</p>
            <div className="mt-4">
              <button onClick={handleReset} className="px-4 py-2 bg-[#00A3FF] text-white rounded-lg">Back</button>
            </div>
          </div>
        </BentoCard>
      )}