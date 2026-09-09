'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

export default function CharterIntelligencePanel({ companyInfo, onClose }) {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Inputs
  const [cargoType, setCargoType] = useState('Coking Coal');
  const [volumeMT, setVolumeMT] = useState(150000);
  const [originPort, setOriginPort] = useState('AUNCL');
  const [destPort, setDestPort] = useState('INVTZ');
  const [contractDuration, setContractDuration] = useState('Mid-Term Period Charter (6 - 12 Months)');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timing' | 'vessel' | 'idle' | 'risk'

  // Real-Time Telemetry State
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(true);
  const [telemetry, setTelemetry] = useState({
    bdi: 1845,
    bdiDelta: +14,
    bci: 2790,
    bciDelta: -18,
    bpi: 1620,
    bpiDelta: +6,
    bsi: 1385,
    bsiDelta: +9,
    bunkerUSD: 614,
    bunkerDelta: -4,
    anchorageQueue: 18,
    lastUpdate: 'Live Syncing',
  });

  // Real-Time AIS Coastal Dispatch Feed
  const [aisEvents, setAisEvents] = useState([
    { id: 1, time: 'Just now', port: 'Visakhapatnam', vessel: 'MV Eastern Star', event: 'Anchor dropped at Outer Harbour berth OB-1 (Draft 17.8m Safe)', type: 'normal' },
    { id: 2, time: '42s ago', port: 'Paradip', vessel: 'MV Oceanic Pioneer', event: 'Automated coal unloader engaged at 45,000 MT/day rate', type: 'fast' },
    { id: 3, time: '1m ago', port: 'Haldia', vessel: 'SS Sindhu Ratna', event: 'Hooghly river tide cresting (+3.4m). Channel pilot aboard', type: 'draft' },
    { id: 4, time: '2m ago', port: 'Kamarajar (Ennore)', vessel: 'MV Coromandel Express', event: 'Coastal coal discharge completed. Repositioning ballast southward', type: 'backhaul' },
  ]);

  const hasInitialized = useRef(false);

  // Fetch initial catalog & run simulation on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/charter-intelligence');
      const data = await res.json();
      if (data.success) {
        setApiData(data.data);
        if (data.data.liveTelemetry) {
          setTelemetry((prev) => ({
            ...prev,
            bdi: data.data.liveTelemetry.bdi,
            bci: data.data.liveTelemetry.bci,
            bpi: data.data.liveTelemetry.bpi,
            bsi: data.data.liveTelemetry.bsi,
            bunkerUSD: data.data.liveTelemetry.vlsfoBunkerUSD,
          }));
        }
      }
      await runSimulation({
        cargoType: 'Coking Coal',
        volumeMT: 150000,
        originPort: 'AUNCL',
        destPort: 'INVTZ',
        contractDuration: 'Mid-Term Period Charter (6 - 12 Months)',
      });
      hasInitialized.current = true;
    } catch (err) {
      console.error('Error loading initial data:', err);
      setErrorMsg('Failed to initialize intelligence engine. Check API connection.');
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Reactive Auto-Recalculation on ANY input change (Debounced 250ms)
  useEffect(() => {
    if (!hasInitialized.current) return;
    const timer = setTimeout(() => {
      runSimulation({
        cargoType,
        volumeMT: Number(volumeMT) || 60000,
        originPort,
        destPort,
        contractDuration,
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [cargoType, volumeMT, originPort, destPort, contractDuration]);

  // Real-Time Streaming Telemetry Ticker (updates every 3.5 seconds)
  useEffect(() => {
    if (!isLiveTelemetry) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Natural micro-fluctuations in global indices
        const bdiJitter = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5 + 1);
        const bciJitter = (Math.random() > 0.45 ? 1 : -1) * Math.floor(Math.random() * 8 + 1);
        const bunkerJitter = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.6 ? 1 : 0);

        return {
          ...prev,
          bdi: Math.max(1200, prev.bdi + bdiJitter),
          bdiDelta: bdiJitter,
          bci: Math.max(2000, prev.bci + bciJitter),
          bciDelta: bciJitter,
          bunkerUSD: Math.max(550, prev.bunkerUSD + bunkerJitter),
          bunkerDelta: bunkerJitter,
          lastUpdate: new Date().toLocaleTimeString('en-GB'),
        };
      });

      // Periodically cycle fresh coastal AIS events
      if (Math.random() > 0.6) {
        const sampleVessels = ['MV Sea Syntax', 'MT Bengal Star', 'MV Marina Horizon', 'MV Oceanic Star', 'SS Sindhu Ratna'];
        const samplePorts = ['Visakhapatnam', 'Paradip', 'Haldia', 'Chennai', 'Krishnapatnam'];
        const sampleStatuses = [
          'Cleared outbound customs; underway to Malacca Strait at 13.8 knots',
          'Draft inspection confirmed: UKC margin 1.4m safe',
          'Anchorage queue cleared; tugs secured for pilotage',
          'Bunker barge replenishment completed (650 MT VLSFO)',
        ];

        const randomVessel = sampleVessels[Math.floor(Math.random() * sampleVessels.length)];
        const randomPort = samplePorts[Math.floor(Math.random() * samplePorts.length)];
        const randomStatus = sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];

        setAisEvents((prev) => [
          { id: Date.now(), time: 'Just now', port: randomPort, vessel: randomVessel, event: randomStatus, type: 'live' },
          ...prev.slice(0, 4),
        ]);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveTelemetry]);

  const runSimulation = async (customParams = null) => {
    setLoading(true);
    setErrorMsg('');
    const params = customParams || {
      cargoType,
      volumeMT: Number(volumeMT) || 60000,
      originPort,
      destPort,
      contractDuration,
    };

    try {
      const res = await fetch('/api/charter-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'Optimization calculation failed.');
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setErrorMsg(err.message || 'Error executing freight simulation.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setCargoType(preset.cargoType);
    setVolumeMT(preset.volumeMT);
    setOriginPort(preset.originPort);
    setDestPort(preset.destPort);
    setContractDuration(preset.contractDuration);
  };

  // SVG Chart Calculations for 90-day Forward Curve
  const chartData = useMemo(() => {
    if (!results?.marketEntryTiming?.forwardCurve) return null;
    const curve = results.marketEntryTiming.forwardCurve;
    const rates = curve.map((c) => c.spotRateUSD);
    const minRate = Math.min(...rates) * 0.95;
    const maxRate = Math.max(...rates) * 1.05;
    const range = maxRate - minRate || 1;

    const width = 640;
    const height = 180;
    const padding = 35;

    const points = curve.map((pt, idx) => {
      const x = padding + (idx / (curve.length - 1)) * (width - padding * 2);
      const y = height - padding - ((pt.spotRateUSD - minRate) / range) * (height - padding * 2);
      return { ...pt, x, y };
    });

    const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

    return { points, pathD, minRate, maxRate, width, height };
  }, [results]);

  const ports = apiData?.ports || {};
  const originPorts = apiData?.originPorts || {};

  return (
    <div className="charter-ai-container">
      {/* Real-Time Live Streaming Financial & AIS Ticker Ribbon */}
      <div className="charter-realtime-ticker">
        <div className="ticker-live-indicator">
          <span className={`pulsing-dot ${isLiveTelemetry ? 'active' : 'paused'}`} />
          <span>{isLiveTelemetry ? 'LIVE TELEMETRY STREAM' : 'TELEMETRY PAUSED'}</span>
        </div>

        <div className="ticker-items-scroller">
          <div className="ticker-item">
            <span className="ticker-label">Baltic Dry Index (BDI):</span>
            <strong className="ticker-val">{telemetry.bdi.toLocaleString()}</strong>
            <span className={`ticker-delta ${telemetry.bdiDelta >= 0 ? 'up' : 'down'}`}>
              {telemetry.bdiDelta >= 0 ? `+${telemetry.bdiDelta} ▲` : `${telemetry.bdiDelta} ▼`}
            </span>
          </div>

          <div className="ticker-item">
            <span className="ticker-label">BCI (Capesize):</span>
            <strong className="ticker-val">{telemetry.bci.toLocaleString()}</strong>
            <span className={`ticker-delta ${telemetry.bciDelta >= 0 ? 'up' : 'down'}`}>
              {telemetry.bciDelta >= 0 ? `+${telemetry.bciDelta} ▲` : `${telemetry.bciDelta} ▼`}
            </span>
          </div>

          <div className="ticker-item">
            <span className="ticker-label">BPI (Panamax):</span>
            <strong className="ticker-val">{telemetry.bpi.toLocaleString()}</strong>
            <span className={`ticker-delta ${telemetry.bpiDelta >= 0 ? 'up' : 'down'}`}>
              {telemetry.bpiDelta >= 0 ? `+${telemetry.bpiDelta} ▲` : `${telemetry.bpiDelta} ▼`}
            </span>
          </div>

          <div className="ticker-item">
            <span className="ticker-label">VLSFO Bunker Fuel:</span>
            <strong className="ticker-val">${telemetry.bunkerUSD}/MT</strong>
            <span className={`ticker-delta ${telemetry.bunkerDelta >= 0 ? 'up' : 'down'}`}>
              {telemetry.bunkerDelta >= 0 ? `+$${telemetry.bunkerDelta}` : `-$${Math.abs(telemetry.bunkerDelta)}`}
            </span>
          </div>

          <div className="ticker-item">
            <span className="ticker-label">East Coast Anchorage Queue:</span>
            <strong className="ticker-val" style={{ color: '#f59e0b' }}>{telemetry.anchorageQueue} Vessels</strong>
          </div>
        </div>

        <div className="ticker-controls">
          <button
            type="button"
            className="ticker-toggle-btn"
            onClick={() => setIsLiveTelemetry((prev) => !prev)}
            title="Toggle Live AIS and index simulation streaming"
          >
            {isLiveTelemetry ? '⏸ Pause Feed' : '▶ Resume Live'}
          </button>
        </div>
      </div>

      {/* Top Header Banner */}
      <div className="charter-ai-header">
        <div className="charter-ai-header-left">
          <div className="charter-ai-badge-row">
            <span className="charter-badge-sih">SIH Problem Statement Solver</span>
            <span className="charter-badge-live">⚡ Real-Time Reactive Model</span>
            <span className="charter-badge-clock">{telemetry.lastUpdate}</span>
          </div>
          <h2 className="charter-ai-title">
            Intelligent Freight Forecasting & Vessel Chartering Model
          </h2>
          <p className="charter-ai-subtitle">
            Overseas Bulk Cargo Procurement & Charter Optimization for India&apos;s Strategic East Coast Ports
          </p>
        </div>

        <div className="charter-ai-header-actions">
          <button
            type="button"
            className="charter-btn-refresh"
            onClick={() => runSimulation()}
            disabled={loading}
            title="Recalculate models"
          >
            {loading ? 'Recalculating...' : '🔄 Re-Sync Models'}
          </button>
          {onClose && (
            <button
              type="button"
              className="charter-btn-close"
              onClick={onClose}
              title="Close to Gateway"
            >
              ✕ Exit
            </button>
          )}
        </div>
      </div>

      {/* Error notification if any */}
      {errorMsg && (
        <div className="charter-error-strip">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Preset Quick-Buttons */}
      <div className="charter-presets-bar">
        <span className="charter-presets-label">⚡ Real-Time Scenario Presets:</span>
        <div className="charter-presets-list">
          <button
            type="button"
            className="charter-preset-pill"
            onClick={() =>
              applyPreset({
                cargoType: 'Coking Coal',
                volumeMT: 150000,
                originPort: 'AUNCL',
                destPort: 'INVTZ',
                contractDuration: 'Mid-Term Period Charter (6 - 12 Months)',
              })
            }
          >
            🇦🇺 Aus Coal → Vizag Outer (Capesize 150k MT)
          </button>
          <button
            type="button"
            className="charter-preset-pill"
            onClick={() =>
              applyPreset({
                cargoType: 'Thermal Coal',
                volumeMT: 75000,
                originPort: 'IDSRD',
                destPort: 'INPRT',
                contractDuration: 'Short-Term Time Charter (1 - 3 Months)',
              })
            }
          >
            🇮🇩 Indo Coal → Paradip (Panamax 75k MT)
          </button>
          <button
            type="button"
            className="charter-preset-pill"
            onClick={() =>
              applyPreset({
                cargoType: 'Thermal Coal',
                volumeMT: 35000,
                originPort: 'ZARCB',
                destPort: 'INCCU',
                contractDuration: 'Spot Single Voyage',
              })
            }
          >
            🇿🇦 SA Coal → Haldia (Handysize Draft 35k MT)
          </button>
          <button
            type="button"
            className="charter-preset-pill"
            onClick={() =>
              applyPreset({
                cargoType: 'Iron Ore',
                volumeMT: 70000,
                originPort: 'AUPHL',
                destPort: 'INENR',
                contractDuration: 'Short-Term Time Charter (1 - 3 Months)',
              })
            }
          >
            🇦🇺 Port Hedland → Ennore (Panamax 70k MT)
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (Inputs), Right Dynamic Analysis */}
      <div className="charter-ai-grid">
        {/* Left Side: Simulation Parameters Input Card */}
        <aside className="charter-input-panel">
          <div className="charter-panel-title">
            <span>1. Reactive Cargo & Route Inputs</span>
            <span className="live-pill">Auto-Sync</span>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="charter-form">
            {/* Cargo Type */}
            <div className="charter-form-group">
              <label htmlFor="cargoType">Bulk Commodity Type</label>
              <select
                id="cargoType"
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="charter-select"
              >
                <option value="Coking Coal">Coking Coal (Metallurgical)</option>
                <option value="Thermal Coal">Thermal Steam Coal (Power Utility)</option>
                <option value="Iron Ore">Iron Ore Fines & Pellets</option>
                <option value="Bauxite & Alumina">Bauxite & Alumina</option>
                <option value="Rock Phosphate & Fertilizers">Rock Phosphate & Fertilizers</option>
                <option value="Industrial Limestone">Industrial Limestone</option>
                <option value="Manganese Ore">Manganese Ore</option>
              </select>
            </div>

            {/* Cargo Volume in MT with Real-time Slider */}
            <div className="charter-form-group">
              <div className="charter-lbl-row">
                <label htmlFor="volumeMT">Parcel Volume (MT)</label>
                <span className="charter-val-indicator">{Number(volumeMT).toLocaleString()} MT</span>
              </div>
              {/* Real-time interactive range slider */}
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={volumeMT}
                onChange={(e) => setVolumeMT(Number(e.target.value))}
                className="charter-slider"
              />
              <input
                type="number"
                id="volumeMT"
                min="5000"
                max="250000"
                step="5000"
                value={volumeMT}
                onChange={(e) => setVolumeMT(Number(e.target.value) || 10000)}
                className="charter-input"
              />
              <div className="charter-quick-vol">
                <button type="button" onClick={() => setVolumeMT(35000)}>35k Handy</button>
                <button type="button" onClick={() => setVolumeMT(60000)}>60k Supra</button>
                <button type="button" onClick={() => setVolumeMT(75000)}>75k Pana</button>
                <button type="button" onClick={() => setVolumeMT(150000)}>150k Cape</button>
              </div>
            </div>

            {/* Overseas Loading Origin Port */}
            <div className="charter-form-group">
              <label htmlFor="originPort">Overseas Loading Port (Origin)</label>
              <select
                id="originPort"
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
                className="charter-select"
              >
                {Object.values(originPorts).map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.country}) • Typical: {p.cargoTypical}
                  </option>
                ))}
              </select>
            </div>

            {/* Discharge Destination Port on India's East Coast */}
            <div className="charter-form-group">
              <label htmlFor="destPort">Discharge Port (India East Coast)</label>
              <select
                id="destPort"
                value={destPort}
                onChange={(e) => setDestPort(e.target.value)}
                className="charter-select highlight-dest"
              >
                {Object.values(ports).map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.code}) — {p.state} [Draft: {p.outerHarbour?.maxDraftMeters}m]
                  </option>
                ))}
              </select>
            </div>

            {/* Desired Contract Duration */}
            <div className="charter-form-group">
              <label htmlFor="contractDuration">Target Charter Contract Duration</label>
              <select
                id="contractDuration"
                value={contractDuration}
                onChange={(e) => setContractDuration(e.target.value)}
                className="charter-select"
              >
                <option value="Spot Single Voyage">Spot Single Voyage (Immediate)</option>
                <option value="Short-Term Time Charter (1 - 3 Months)">
                  Short-Term Time Charter (1 - 3 Months)
                </option>
                <option value="Mid-Term Period Charter (6 - 12 Months)">
                  Mid-Term Period Charter (6 - 12 Months)
                </option>
              </select>
            </div>
          </form>

          {/* Real-Time Voyage Metrics Sidebar */}
          {results?.vesselOptimization?.voyageEstimates && (
            <div className="charter-voyage-summary">
              <div className="charter-voyage-header">Real-Time Nautical Routing</div>
              <div className="charter-voyage-row">
                <span>Distance:</span>
                <strong>{results.vesselOptimization.voyageEstimates.seaDistanceNM.toLocaleString()} NM</strong>
              </div>
              <div className="charter-voyage-row">
                <span>Steaming Duration:</span>
                <strong>~{results.vesselOptimization.voyageEstimates.steamingDaysOneWay} Days (One-way)</strong>
              </div>
              <div className="charter-voyage-row">
                <span>Discharge Turnaround:</span>
                <strong>~{results.vesselOptimization.voyageEstimates.portDischargeDays} Days</strong>
              </div>
              <div className="charter-voyage-row">
                <span>Roundtrip Cycle:</span>
                <strong style={{ color: '#00f0ff' }}>
                  ~{results.vesselOptimization.voyageEstimates.totalRoundtripDays} Days
                </strong>
              </div>
            </div>
          )}

          {/* Live AIS Coastal Telemetry Stream Box */}
          <div className="charter-ais-feed-box">
            <div className="charter-ais-header">
              <span className="pulsing-radar-dot" />
              <span>Live Coastal AIS Dispatch</span>
            </div>
            <div className="charter-ais-list">
              {aisEvents.map((evt) => (
                <div key={evt.id} className="charter-ais-item">
                  <div className="ais-item-top">
                    <span className="ais-item-vessel">{evt.vessel}</span>
                    <span className="ais-item-time">{evt.time}</span>
                  </div>
                  <div className="ais-item-port">📍 {evt.port}</div>
                  <div className="ais-item-desc">{evt.event}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Tabbed Intelligence Results (Modules A, B, C, D) */}
        <section className="charter-results-panel">
          {/* Module Navigation Tabs */}
          <div className="charter-tabs">
            <button
              type="button"
              className={`charter-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Executive Summary
            </button>
            <button
              type="button"
              className={`charter-tab ${activeTab === 'timing' ? 'active' : ''}`}
              onClick={() => setActiveTab('timing')}
            >
              (a) Market Entry Timing
            </button>
            <button
              type="button"
              className={`charter-tab ${activeTab === 'vessel' ? 'active' : ''}`}
              onClick={() => setActiveTab('vessel')}
            >
              (b) Vessel Optimization
            </button>
            <button
              type="button"
              className={`charter-tab ${activeTab === 'idle' ? 'active' : ''}`}
              onClick={() => setActiveTab('idle')}
            >
              (c) Idle & Backhaul
            </button>
            <button
              type="button"
              className={`charter-tab ${activeTab === 'risk' ? 'active' : ''}`}
              onClick={() => setActiveTab('risk')}
            >
              (d) Risk Mitigation
            </button>
          </div>

          {!results && loading && (
            <div className="charter-loading-card">
              <div className="charter-spinner" />
              <p>Evaluating East Coast berth depths, forward indices, and backhaul triangular routes...</p>
            </div>
          )}

          {results && (
            <div className="charter-content-area">
              {/* ===================== TAB 0: OVERVIEW ===================== */}
              {activeTab === 'overview' && (
                <div className="charter-tab-overview">
                  {/* Top KPI Cards Grid */}
                  <div className="charter-kpi-grid">
                    <div className="charter-kpi-card accent-cyan">
                      <div className="charter-kpi-lbl">Recommended Vessel</div>
                      <div className="charter-kpi-val">{results.vesselOptimization.recommendedClass}</div>
                      <div className="charter-kpi-sub">
                        {results.vesselOptimization.recommendedVessel}
                      </div>
                    </div>

                    <div className="charter-kpi-card accent-emerald">
                      <div className="charter-kpi-lbl">Optimal Entry Window</div>
                      <div className="charter-kpi-val">Week {results.marketEntryTiming.optimalWeek}</div>
                      <div className="charter-kpi-sub">
                        {results.marketEntryTiming.optimalDateLabel} (~{results.marketEntryTiming.savingsPercent}% savings)
                      </div>
                    </div>

                    <div className="charter-kpi-card accent-purple">
                      <div className="charter-kpi-lbl">Est. Charter Cost Savings</div>
                      <div className="charter-kpi-val">
                        ${results.marketEntryTiming.savingsPerDayUSD.toLocaleString()}
                        <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}> /day</span>
                      </div>
                      <div className="charter-kpi-sub">
                        ~${results.marketEntryTiming.estimatedVoyageSavingsUSD.toLocaleString()} on 25-day leg
                      </div>
                    </div>

                    <div className="charter-kpi-card accent-amber">
                      <div className="charter-kpi-lbl">Port Risk & Congestion</div>
                      <div className="charter-kpi-val" style={{ fontSize: '1.25rem' }}>
                        {results.riskMitigation.riskLevel}
                      </div>
                      <div className="charter-kpi-sub">
                        Wait: {results.riskMitigation.portCongestion.avgWaitingDays} days @ {ports[destPort]?.name || 'Port'}
                      </div>
                    </div>
                  </div>

                  {/* Strategic Recommendation Callout */}
                  <div className="charter-callout-box">
                    <div className="charter-callout-icon">💡</div>
                    <div className="charter-callout-body">
                      <h4>Strategic Charter Action Brief</h4>
                      <p>{results.marketEntryTiming.recommendationSummary}</p>
                      <div className="charter-callout-meta">
                        <span><strong>Contract Strategy:</strong> {results.marketEntryTiming.contractStrategy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Cost Cutting & ROI Breakdown Matrix */}
                  <div className="charter-cost-cutting-matrix">
                    <div className="cost-matrix-header">
                      <div className="cost-matrix-title">
                        <span className="cost-matrix-icon">💰</span>
                        <div>
                          <h4>Integrated Cost Cutting & Procurement ROI Matrix</h4>
                          <span className="cost-matrix-sub">Direct Dollar Value Saved per Overseas Shipment Cycle</span>
                        </div>
                      </div>
                      <div className="cost-matrix-total-badge">
                        <span>Total Projected Savings:</span>
                        <strong>
                          ~${(
                            results.marketEntryTiming.estimatedVoyageSavingsUSD +
                            results.idleScenarioManagement.backhaulOptions[0].estimatedBunkerSavingsUSD +
                            results.riskMitigation.portCongestion.estimatedDemurrageExposureUSD
                          ).toLocaleString()} USD
                        </strong>
                      </div>
                    </div>

                    <div className="cost-matrix-grid">
                      <div className="cost-col-card">
                        <div className="cost-col-tag">Vector 1: Market Timing</div>
                        <div className="cost-col-amount" style={{ color: '#00ffaa' }}>
                          +${results.marketEntryTiming.estimatedVoyageSavingsUSD.toLocaleString()}
                        </div>
                        <div className="cost-col-label">Charter Rate Dip Savings</div>
                        <p className="cost-col-desc">
                          Locking contracts in Week {results.marketEntryTiming.optimalWeek} saves ${results.marketEntryTiming.savingsPerDayUSD.toLocaleString()}/day vs current peak spot rate.
                        </p>
                      </div>

                      <div className="cost-col-card">
                        <div className="cost-col-tag">Vector 2: Ballast Elimination</div>
                        <div className="cost-col-amount" style={{ color: '#38bdf8' }}>
                          +${results.idleScenarioManagement.backhaulOptions[0].estimatedBunkerSavingsUSD.toLocaleString()}
                        </div>
                        <div className="cost-col-label">Bunker Fuel Expense Saved</div>
                        <p className="cost-col-desc">
                          Eliminating {results.idleScenarioManagement.backhaulOptions[0].ballastDaysEliminated} empty deadhead ballast days via pre-contracted East Coast outbound export cargo.
                        </p>
                      </div>

                      <div className="cost-col-card">
                        <div className="cost-col-tag">Vector 3: Demurrage Mitigation</div>
                        <div className="cost-col-amount" style={{ color: '#f59e0b' }}>
                          +${results.riskMitigation.portCongestion.estimatedDemurrageExposureUSD.toLocaleString()}
                        </div>
                        <div className="cost-col-label">Demurrage Penalty Averted</div>
                        <p className="cost-col-desc">
                          Synchronized berthing prevents {results.riskMitigation.portCongestion.avgWaitingDays} days of idle anchorage delay penalties at ${results.riskMitigation.portCongestion.dailyDemurrageRateUSD.toLocaleString()}/day.
                        </p>
                      </div>

                      <div className="cost-col-card">
                        <div className="cost-col-tag">Vector 4: Vessel Sizing</div>
                        <div className="cost-col-amount" style={{ color: '#c084fc' }}>
                          Feasible ({results.vesselOptimization.recommendedClass})
                        </div>
                        <div className="cost-col-label">Lighterage & Port Fee Efficiency</div>
                        <p className="cost-col-desc">
                          Ensures draft compliance at {ports[destPort]?.name || 'Port'} without requiring expensive outer anchorage lighterage transshipment ($8-$14/MT).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Core Pillars Mini-Summary */}
                  <div className="charter-modules-summary-grid">
                    <div className="charter-mini-card">
                      <div className="charter-mini-header">
                        <span className="charter-mini-tag">Module (a)</span>
                        <h5>Market Timing Curve</h5>
                      </div>
                      <p>Forward rates drop to seasonal trough at Week {results.marketEntryTiming.optimalWeek} (${results.marketEntryTiming.optimalRateUSD.toLocaleString()}/day) before second-half monsoon rally.</p>
                      <button type="button" onClick={() => setActiveTab('timing')} className="charter-link-btn">
                        View 90-Day Rate Curve →
                      </button>
                    </div>

                    <div className="charter-mini-card">
                      <div className="charter-mini-header">
                        <span className="charter-mini-tag">Module (b)</span>
                        <h5>Vessel & Draft Feasibility</h5>
                      </div>
                      <p>
                        Selected {results.vesselOptimization.recommendedClass} has {results.vesselOptimization.allVesselEvaluations.find(v => v.vesselClass === results.vesselOptimization.recommendedClass)?.draftMarginMeters}m draft safety margin at {ports[destPort]?.name}.
                      </p>
                      <button type="button" onClick={() => setActiveTab('vessel')} className="charter-link-btn">
                        Inspect Port Infrastructure →
                      </button>
                    </div>

                    <div className="charter-mini-card">
                      <div className="charter-mini-header">
                        <span className="charter-mini-tag">Module (c)</span>
                        <h5>Idle & Repositioning</h5>
                      </div>
                      <p>
                        {results.idleScenarioManagement.backhaulOptions[0].opportunity} eliminates {results.idleScenarioManagement.backhaulOptions[0].ballastDaysEliminated} empty ballast days.
                      </p>
                      <button type="button" onClick={() => setActiveTab('idle')} className="charter-link-btn">
                        View Backhaul Routes →
                      </button>
                    </div>

                    <div className="charter-mini-card">
                      <div className="charter-mini-header">
                        <span className="charter-mini-tag">Module (d)</span>
                        <h5>Risk Early Warnings</h5>
                      </div>
                      <p>
                        {results.riskMitigation.earlyWarnings.length} active risk warnings detected (Congestion: {results.riskMitigation.portCongestion.index}, Bay of Bengal Weather: {results.riskMitigation.meteorological.cycloneRiskLevel}).
                      </p>
                      <button type="button" onClick={() => setActiveTab('risk')} className="charter-link-btn">
                        Review Warning Alarms →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================== TAB 1: OPTIMAL TIMING ===================== */}
              {activeTab === 'timing' && (
                <div className="charter-tab-timing">
                  <div className="charter-section-title">
                    <h3>a. Optimal Market Entry Timing (90-Day Freight Forward Forecast)</h3>
                    <span className="charter-tag">Econometric Baltic Index Simulation</span>
                  </div>

                  <p className="charter-section-desc">
                    By forecasting short-term and mid-term spot charter rates across the 12-week horizon, logistics managers can pinpoint contract entry windows to prevent procurement variances and capture market troughs.
                  </p>

                  {/* SVG 12-Week Interactive Forward Curve Chart */}
                  {chartData && (
                    <div className="charter-chart-wrapper">
                      <div className="charter-chart-header">
                        <span>Projected Charter Rate Trend (USD / Day) vs Contract Laycan Week</span>
                        <div className="charter-chart-legend">
                          <span className="legend-spot">● Spot Charter Rate</span>
                          <span className="legend-target">★ Recommended Entry Window</span>
                        </div>
                      </div>

                      <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="charter-svg-chart">
                        {/* Grid lines */}
                        <line x1="35" y1="35" x2="605" y2="35" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />
                        <line x1="35" y1="85" x2="605" y2="85" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />
                        <line x1="35" y1="135" x2="605" y2="135" stroke="rgba(255,255,255,0.08)" strokeDasharray="3" />

                        {/* Area gradient under path */}
                        <defs>
                          <linearGradient id="charterCurveGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Closed Area */}
                        <path
                          d={`${chartData.pathD} L ${chartData.points[chartData.points.length - 1].x} ${chartData.height - 35} L ${chartData.points[0].x} ${chartData.height - 35} Z`}
                          fill="url(#charterCurveGrad)"
                        />

                        {/* Curve line */}
                        <path d={chartData.pathD} fill="none" stroke="#00f0ff" strokeWidth="2.5" />

                        {/* Data points */}
                        {chartData.points.map((pt) => (
                          <g key={pt.week}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={pt.isOptimal ? 6.5 : 3.5}
                              fill={pt.isOptimal ? '#00ffaa' : '#00f0ff'}
                              stroke="#020710"
                              strokeWidth="2"
                            />
                            {pt.isOptimal && (
                              <text
                                x={pt.x}
                                y={pt.y - 12}
                                textAnchor="middle"
                                fill="#00ffaa"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                Best: ${pt.spotRateUSD.toLocaleString()}
                              </text>
                            )}
                            {/* X-axis week label */}
                            <text
                              x={pt.x}
                              y={chartData.height - 18}
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="9"
                            >
                              W{pt.week}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}

                  {/* 12-Week Table */}
                  <div className="charter-table-wrapper">
                    <table className="charter-table">
                      <thead>
                        <tr>
                          <th>Week</th>
                          <th>Projected Date</th>
                          <th>Spot Charter Rate</th>
                          <th>Period Time Charter</th>
                          <th>Market Variance</th>
                          <th>Recommendation Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.marketEntryTiming.forwardCurve.map((row) => (
                          <tr key={row.week} className={row.isOptimal ? 'row-optimal' : ''}>
                            <td>Week {row.week}</td>
                            <td>{row.dateLabel}</td>
                            <td>${row.spotRateUSD.toLocaleString()} /day</td>
                            <td>${row.timeCharterRateUSD.toLocaleString()} /day</td>
                            <td style={{ color: row.variancePct <= 0 ? '#4ade80' : '#f87171' }}>
                              {row.variancePct > 0 ? `+${row.variancePct}%` : `${row.variancePct}%`}
                            </td>
                            <td>
                              {row.isOptimal ? (
                                <span className="status-pill-green">★ OPTIMAL ENTRY WINDOW</span>
                              ) : row.variancePct > 10 ? (
                                <span className="status-pill-red">High Season Peak</span>
                              ) : (
                                <span className="status-pill-neutral">Standard Spot</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================== TAB 2: VESSEL OPTIMIZATION ===================== */}
              {activeTab === 'vessel' && (
                <div className="charter-tab-vessel">
                  <div className="charter-section-title">
                    <h3>b. Vessel Type & East Coast Port Infrastructure Optimization</h3>
                    <span className="charter-tag">Berth Draft & LOA Constraint Engine</span>
                  </div>

                  <p className="charter-section-desc">
                    Cross-evaluates cargo volume parcel efficiency against destination port engineering parameters (Permissible Draft, Length Overall, Beam, and Turnaround Cranes) to eliminate lighterage and demurrage risks.
                  </p>

                  {/* Port Specs Banner */}
                  <div className="charter-port-specs-banner">
                    <div className="port-banner-header">
                      <span>Destination Port Specification: <strong>{results.vesselOptimization.portInfrastructure.portName} ({results.vesselOptimization.portInfrastructure.portCode})</strong></span>
                    </div>
                    <div className="port-banner-grid">
                      <div className="port-banner-item">
                        <span>Max Permissible Draft:</span>
                        <strong>{results.vesselOptimization.portInfrastructure.maxDraftPermissible} Meters</strong>
                      </div>
                      <div className="port-banner-item">
                        <span>Max Berth LOA:</span>
                        <strong>{results.vesselOptimization.portInfrastructure.maxLOAPermissible} Meters</strong>
                      </div>
                      <div className="port-banner-item">
                        <span>Mechanized Handling Rate:</span>
                        <strong>{results.vesselOptimization.portInfrastructure.berthHandlingRateMTPD.toLocaleString()} MT / Day</strong>
                      </div>
                    </div>
                  </div>

                  {/* Comparative Sizing Table */}
                  <div className="charter-table-wrapper">
                    <table className="charter-table">
                      <thead>
                        <tr>
                          <th>Vessel Class</th>
                          <th>Laden Draft</th>
                          <th>LOA</th>
                          <th>Gear Status</th>
                          <th>Draft Clearance</th>
                          <th>Voyages Needed</th>
                          <th>Feasibility Score</th>
                          <th>Engineering Assessment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.vesselOptimization.allVesselEvaluations.map((evalItem) => {
                          const isRec = evalItem.vesselClass === results.vesselOptimization.recommendedClass;
                          return (
                            <tr key={evalItem.vesselClass} className={isRec ? 'row-recommended' : ''}>
                              <td>
                                <strong>{evalItem.vesselName}</strong>
                                {isRec && <span className="rec-badge">RECOMMENDED</span>}
                              </td>
                              <td>{evalItem.typicalDraft}m</td>
                              <td>{evalItem.typicalLOA}m</td>
                              <td>{evalItem.hasGear ? 'Geared (Cranes)' : 'Gearless'}</td>
                              <td style={{ color: evalItem.draftMarginMeters >= 1.0 ? '#4ade80' : evalItem.draftMarginMeters >= 0 ? '#f59e0b' : '#ef4444' }}>
                                {evalItem.draftMarginMeters >= 0 ? `+${evalItem.draftMarginMeters}m Safe` : `${evalItem.draftMarginMeters}m Exceeded`}
                              </td>
                              <td>{evalItem.numVoyagesRequired} {evalItem.numVoyagesRequired === 1 ? 'Voyage' : 'Voyages'}</td>
                              <td>
                                <span className={`score-badge ${evalItem.feasibilityScore >= 75 ? 'high' : evalItem.feasibilityScore >= 40 ? 'med' : 'low'}`}>
                                  {evalItem.feasibilityScore} / 100
                                </span>
                              </td>
                              <td style={{ fontSize: '0.8rem', maxWidth: 260 }}>
                                {evalItem.reasons.join(' ')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================== TAB 3: IDLE SCENARIO MANAGEMENT ===================== */}
              {activeTab === 'idle' && (
                <div className="charter-tab-idle">
                  <div className="charter-section-title">
                    <h3>c. Idle Scenario Management & Triangular Route Optimization</h3>
                    <span className="charter-tag">Deadhead Ballast Elimination</span>
                  </div>

                  <p className="charter-section-desc">
                    Empty ballast deadheading after discharge accounts for up to 40% of unremunerated voyage costs. Our algorithm pairs discharge ports with high-demand Indian East Coast outbound bulk flows to monetize the backhaul leg.
                  </p>

                  <div className="charter-callout-box emerald">
                    <div className="charter-callout-icon">🔄</div>
                    <div className="charter-callout-body">
                      <h4>Backhaul Repositioning Strategy</h4>
                      <p>{results.idleScenarioManagement.ballastReductionSummary}</p>
                    </div>
                  </div>

                  {/* Backhaul Options Cards */}
                  <div className="charter-backhaul-grid">
                    {results.idleScenarioManagement.backhaulOptions.map((opt, idx) => (
                      <div className="charter-backhaul-card" key={idx}>
                        <div className="backhaul-card-header">
                          <span className="backhaul-pill">{opt.feasibility}</span>
                          <span className="backhaul-demand">Demand: {opt.demandLevel}</span>
                        </div>
                        <h4 className="backhaul-title">{opt.opportunity}</h4>
                        <div className="backhaul-route">
                          <strong>Route:</strong> {opt.route}
                        </div>
                        <div className="backhaul-cargo">
                          <strong>Cargo:</strong> {opt.cargoType}
                        </div>
                        <p className="backhaul-desc">{opt.desc}</p>

                        <div className="backhaul-metrics-row">
                          <div className="backhaul-metric">
                            <span>Ballast Days Saved:</span>
                            <strong style={{ color: '#00ffaa' }}>+{opt.ballastDaysEliminated} Days</strong>
                          </div>
                          <div className="backhaul-metric">
                            <span>Bunker Savings:</span>
                            <strong style={{ color: '#38bdf8' }}>~${opt.estimatedBunkerSavingsUSD.toLocaleString()}</strong>
                          </div>
                          <div className="backhaul-metric">
                            <span>Est. Freight Revenue:</span>
                            <strong>~${opt.freightRevenueUSD.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===================== TAB 4: RISK MITIGATION ===================== */}
              {activeTab === 'risk' && (
                <div className="charter-tab-risk">
                  <div className="charter-section-title">
                    <h3>d. Risk Mitigation & Early Warning Engine</h3>
                    <span className="charter-tag">Port Congestion, Demurrage & Weather Risk</span>
                  </div>

                  <p className="charter-section-desc">
                    Predictive radar evaluating anchorage waiting times, potential demurrage penalty exposure, and seasonal cyclonic depression patterns along the Bay of Bengal.
                  </p>

                  {/* Risk Overview Gauges */}
                  <div className="charter-kpi-grid">
                    <div className="charter-kpi-card accent-amber">
                      <div className="charter-kpi-lbl">Composite Risk Score</div>
                      <div className="charter-kpi-val">{results.riskMitigation.overallRiskScore} / 100</div>
                      <div className="charter-kpi-sub">{results.riskMitigation.riskLevel}</div>
                    </div>

                    <div className="charter-kpi-card accent-purple">
                      <div className="charter-kpi-lbl">Anchorage Waiting Duration</div>
                      <div className="charter-kpi-val">
                        {results.riskMitigation.portCongestion.avgWaitingDays}
                        <span style={{ fontSize: '0.85rem' }}> Days</span>
                      </div>
                      <div className="charter-kpi-sub">
                        Status: {results.riskMitigation.portCongestion.index} Congestion
                      </div>
                    </div>

                    <div className="charter-kpi-card accent-cyan">
                      <div className="charter-kpi-lbl">Demurrage Exposure Risk</div>
                      <div className="charter-kpi-val">
                        ${results.riskMitigation.portCongestion.estimatedDemurrageExposureUSD.toLocaleString()}
                      </div>
                      <div className="charter-kpi-sub">
                        Rate: ${results.riskMitigation.portCongestion.dailyDemurrageRateUSD.toLocaleString()} / Day
                      </div>
                    </div>

                    <div className="charter-kpi-card accent-emerald">
                      <div className="charter-kpi-lbl">Bay of Bengal Cyclone Index</div>
                      <div className="charter-kpi-val" style={{ fontSize: '1.1rem' }}>
                        {results.riskMitigation.meteorological.cycloneRiskLevel}
                      </div>
                      <div className="charter-kpi-sub">Seasonality Factor Active</div>
                    </div>
                  </div>

                  {/* Early Warning Alert Banners */}
                  <div className="charter-alerts-stack">
                    <h4>Active Maritime Early Warnings & Advisories:</h4>
                    {results.riskMitigation.earlyWarnings.map((alert, aIdx) => (
                      <div key={aIdx} className={`charter-alert-banner ${alert.type.toLowerCase()}`}>
                        <div className="alert-badge">{alert.type}</div>
                        <div className="alert-content">
                          <div className="alert-title">{alert.title}</div>
                          <div className="alert-message">{alert.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
