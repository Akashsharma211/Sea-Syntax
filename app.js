/* =========================================================
   MarineMetrics - Team Sea & Syntax
   Client-Side Application Logic & Real-Time Simulation
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initNavbar();
  initSolutionTabs();
  initMissionModal();
});

/* =========================================================
   1. Dynamic Oceanic Bioluminescent Canvas Animation
   ========================================================= */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 20), 75);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2, // Upward drifting plankton
      hue: Math.random() > 0.4 ? 185 : 160, // Cyan or emerald
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      pulseAngle: Math.random() * Math.PI * 2
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Subtle ambient marine wave line
    const time = Date.now() * 0.001;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 15) {
      const y = height * 0.85 + Math.sin(x * 0.005 + time) * 35 + Math.cos(x * 0.002 + time * 0.8) * 20;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw & update particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.pulseAngle += p.pulseSpeed;
      const currentOpacity = p.opacity * (0.65 + 0.35 * Math.sin(p.pulseAngle));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${currentOpacity})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Movement
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      // Connections between nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* =========================================================
   2. Navbar Scroll Effects, Active Links & Mobile Menu
   ========================================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.textContent = '☰';
      });
    });
  }
}

/* =========================================================
   3. Solution Explorer Tabs
   ========================================================= */
function initSolutionTabs() {
  const tabBtns = document.querySelectorAll('.sol-tab-btn');
  const tabPanes = document.querySelectorAll('.sol-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${targetTab}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* =========================================================
   4. Live Telemetry Mission Control (Triggered by 'START' CTA)
   ========================================================= */
function initMissionModal() {
  const startBtn = document.getElementById('startBtn');
  const navLaunchBtn = document.getElementById('navLaunchBtn');
  const modal = document.getElementById('missionModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const stationChips = document.querySelectorAll('.station-chip');
  const anomalyBtn = document.getElementById('btnTriggerAnomaly');
  const logContainer = document.getElementById('streamLogContainer');

  // Station Telemetry Presets
  const stations = {
    mumbai: {
      name: "Arabian Sea Buoy Array #07 • Mumbai Offshore",
      temp: 28.4,
      dO: 6.8,
      ph: 8.1,
      salinity: 35.2,
      turbidity: 2.4,
      mhi: 94.8
    },
    vizag: {
      name: "Bay of Bengal Deep Sensor Mesh • Visakhapatnam",
      temp: 29.1,
      dO: 6.4,
      ph: 8.05,
      salinity: 33.8,
      turbidity: 3.1,
      mhi: 91.2
    },
    kochi: {
      name: "Laccadive Sea Coastal Sensor Node #03 • Kochi",
      temp: 27.9,
      dO: 7.1,
      ph: 8.15,
      salinity: 34.6,
      turbidity: 2.0,
      mhi: 96.5
    },
    sundarbans: {
      name: "Sundarbans Estuary Biosphere Array • West Bengal",
      temp: 26.5,
      dO: 5.9,
      ph: 7.85,
      salinity: 28.2,
      turbidity: 5.8,
      mhi: 88.4
    }
  };

  let activeStationKey = 'mumbai';
  let isAnomalyMode = false;
  let simulationInterval = null;

  // Open Modal Functions
  function openModal() {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      appendLog("MarineMetrics Mission Control connected. Uplink established to IN-EEZ grid.", "info");
      startLiveTelemetryEngine();
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (simulationInterval) clearInterval(simulationInterval);
    }
  }

  if (startBtn) startBtn.addEventListener('click', openModal);
  if (navLaunchBtn) navLaunchBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Station Switching
  stationChips.forEach(chip => {
    chip.addEventListener('click', () => {
      stationChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeStationKey = chip.getAttribute('data-station');
      isAnomalyMode = false;

      const stationData = stations[activeStationKey];
      document.getElementById('currentStationLabel').textContent = stationData.name;
      updateGaugeDisplays(stationData);
      appendLog(`Switched active telemetry channel to ${stationData.name}. Syncing satellite pass.`, "info");
    });
  });

  function updateGaugeDisplays(data) {
    const elTemp = document.getElementById('valTemp');
    const elDO = document.getElementById('valDO');
    const elPH = document.getElementById('valPH');
    const elSalinity = document.getElementById('valSalinity');
    const elTurbidity = document.getElementById('valTurbidity');
    const elMHI = document.getElementById('valMHI');

    if (elTemp) elTemp.innerHTML = `${data.temp.toFixed(1)}<span class="unit">°C</span>`;
    if (elDO) elDO.innerHTML = `${data.dO.toFixed(1)}<span class="unit">mg/L</span>`;
    if (elPH) elPH.innerHTML = `${data.ph.toFixed(2)}<span class="unit">pH</span>`;
    if (elSalinity) elSalinity.innerHTML = `${data.salinity.toFixed(1)}<span class="unit">PSU</span>`;
    if (elTurbidity) elTurbidity.innerHTML = `${data.turbidity.toFixed(1)}<span class="unit">NTU</span>`;
    if (elMHI) {
      elMHI.innerHTML = `${data.mhi.toFixed(1)}<span class="unit">/100</span>`;
      elMHI.style.color = isAnomalyMode ? 'var(--neon-alert)' : 'var(--neon-emerald)';
    }

    const indDO = document.getElementById('indDO');
    const indMHI = document.getElementById('indMHI');

    if (isAnomalyMode) {
      if (indDO) {
        indDO.className = "indicator danger";
        indDO.textContent = "⚠ CRITICAL HYPOXIA (<4.0 mg/L)";
      }
      if (indMHI) {
        indMHI.className = "indicator danger";
        indMHI.textContent = "🚨 Severe Ecosystem Threat";
      }
    } else {
      if (indDO) {
        indDO.className = "indicator normal";
        indDO.textContent = "● Healthy Aerobic (>5.0)";
      }
      if (indMHI) {
        indMHI.className = "indicator normal";
        indMHI.textContent = "● Ecosystem Thriving";
      }
    }
  }

  // Real-Time Micro Fluctuation Engine
  function startLiveTelemetryEngine() {
    if (simulationInterval) clearInterval(simulationInterval);

    simulationInterval = setInterval(() => {
      if (isAnomalyMode) return; // don't fluctuate during simulated test

      const base = stations[activeStationKey];
      // Micro variations
      const current = {
        temp: base.temp + (Math.random() - 0.5) * 0.15,
        dO: base.dO + (Math.random() - 0.5) * 0.08,
        ph: base.ph + (Math.random() - 0.5) * 0.03,
        salinity: base.salinity + (Math.random() - 0.5) * 0.1,
        turbidity: Math.max(1.2, base.turbidity + (Math.random() - 0.5) * 0.2),
        mhi: Math.min(99.5, base.mhi + (Math.random() - 0.5) * 0.4)
      };

      updateGaugeDisplays(current);
    }, 2400);
  }

  // Anomaly Simulation Trigger
  if (anomalyBtn) {
    anomalyBtn.addEventListener('click', () => {
      isAnomalyMode = !isAnomalyMode;

      if (isAnomalyMode) {
        anomalyBtn.textContent = "✓ Reset Telemetry to Nominal";
        anomalyBtn.style.background = "var(--neon-alert)";
        anomalyBtn.style.color = "#fff";

        const anomalyData = {
          temp: 31.8,
          dO: 3.1, // dangerous hypoxia
          ph: 7.22,
          salinity: 38.9,
          turbidity: 24.8, // heavy particulate / spill
          mhi: 36.5 // critical
        };

        updateGaugeDisplays(anomalyData);
        appendLog(`[ALERT-RED] Chemical discharge & thermal plume detected at ${stations[activeStationKey].name}!`, "alert");
        appendLog(`[DISPATCH] Automated WebSocket alert beacon transmitted to Indian Coast Guard Sector Commander.`, "alert");
      } else {
        anomalyBtn.textContent = "⚡ Simulate Chemical Spill Anomaly";
        anomalyBtn.style.background = "rgba(255, 51, 102, 0.15)";
        anomalyBtn.style.color = "#ff8099";

        updateGaugeDisplays(stations[activeStationKey]);
        appendLog(`Threat neutralized or test reset. System returned to nominal monitoring.`, "success");
      }
    });
  }

  function appendLog(message, type = "info") {
    if (!logContainer) return;
    const now = new Date();
    const timeStr = now.toISOString().substring(11, 19) + " UTC";

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="time">[${timeStr}]</span>
      <span class="msg ${type}">${message}</span>
    `;

    logContainer.prepend(entry);
    // Keep max 20 entries
    while (logContainer.children.length > 20) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }
}
