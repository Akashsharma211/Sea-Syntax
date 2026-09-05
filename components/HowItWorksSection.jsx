export default function HowItWorksSection() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <span className="pulse-dot" />
            <span>Execution Blueprint</span>
          </div>
          <h2 className="section-title">
            How It Is Going To Happen:{' '}
            <span className="gradient-text">The End-to-End Pipeline</span>
          </h2>
          <p className="section-subtitle">
            A battle-tested 4-phase architectural pipeline delivering from raw ocean currents to emergency command desks in under a second.
          </p>
        </div>

        <div className="pipeline-flow">
          {/* Step 1 */}
          <div className="pipeline-step">
            <div className="step-marker">01</div>
            <div className="step-card">
              <div className="step-header">
                <h3 className="step-title">Multi-Vector Ocean Data Ingestion</h3>
                <span className="step-tag">Phase 1 • Acquisition</span>
              </div>
              <p className="step-desc">
                Deploying autonomous sensor buoys equipped with multiparameter probes across critical coastal choke points, complemented by European Space Agency Sentinel-1/2 SAR optical passes and terrestrial AIS radio receivers.
              </p>
              <div className="step-tech-pills">
                <span className="step-tech-pill">ESP32-S3 IoT Nodes</span>
                <span className="step-tech-pill">Sentinel-1/2 SAR</span>
                <span className="step-tech-pill">LoRaWAN Gateways</span>
                <span className="step-tech-pill">Terrestrial AIS</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="pipeline-step">
            <div className="step-marker">02</div>
            <div className="step-card">
              <div className="step-header">
                <h3 className="step-title">Edge Cleansing &amp; Telemetry Synchronization</h3>
                <span className="step-tag">Phase 2 • Pre-Processing</span>
              </div>
              <p className="step-desc">
                High-frequency raw data undergoes Kalman filtering, tidal calibration, bio-fouling drift compensation, and geographic coordinate alignment right on local edge gateways before uplink, minimizing bandwidth costs.
              </p>
              <div className="step-tech-pills">
                <span className="step-tech-pill">Kalman Smoothing</span>
                <span className="step-tech-pill">Edge Noise Filter</span>
                <span className="step-tech-pill">Tidal Offset Calibration</span>
                <span className="step-tech-pill">MQTT Broker</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="pipeline-step">
            <div className="step-marker">03</div>
            <div className="step-card">
              <div className="step-header">
                <h3 className="step-title">Neural Anomaly Detection &amp; Marine Health Index</h3>
                <span className="step-tag">Phase 3 • AI Core</span>
              </div>
              <p className="step-desc">
                Our twin neural models execute: A spatial computer vision model identifying surface slicks and dark ships, coupled with an LSTM recurrent network calculating the unified Marine Health Index (MHI) to predict hypoxia and coral bleaching 72 hours out.
              </p>
              <div className="step-tech-pills">
                <span className="step-tech-pill">YOLO-Marine SAR</span>
                <span className="step-tech-pill">Bi-Directional LSTM</span>
                <span className="step-tech-pill">MHI Scoring Algorithm</span>
                <span className="step-tech-pill">PyTorch &amp; ONNX</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="pipeline-step">
            <div className="step-marker">04</div>
            <div className="step-card">
              <div className="step-header">
                <h3 className="step-title">Actionable Command &amp; Stakeholder Dispatch</h3>
                <span className="step-tag">Phase 4 • Delivery</span>
              </div>
              <p className="step-desc">
                Actionable threat indices trigger automated geo-fenced bulletins to Indian Coast Guard tactical units, SMS advisories to local fishing cooperatives in regional languages, and live streaming to government dashboard APIs.
              </p>
              <div className="step-tech-pills">
                <span className="step-tech-pill">WebSockets Stream</span>
                <span className="step-tech-pill">SMS Gateway (Regional)</span>
                <span className="step-tech-pill">GeoJSON Heatmaps</span>
                <span className="step-tech-pill">Role-Based Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
