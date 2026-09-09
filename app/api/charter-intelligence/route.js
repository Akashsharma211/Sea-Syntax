import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Comprehensive East Coast Ports Database with engineering & operational constraints
const EAST_COAST_PORTS = {
  INVTZ: {
    code: 'INVTZ',
    name: 'Visakhapatnam Port',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lon: 83.2185,
    outerHarbour: {
      maxDraftMeters: 18.1,
      maxLOAMeters: 300,
      maxBeamMeters: 50,
      allowedClasses: ['Capesize', 'Panamax', 'Supramax', 'Handysize'],
      handlingRateMTPD: 70000, // MT per day (automated mechanical)
      berthTurnaroundDays: 2.2,
    },
    innerHarbour: {
      maxDraftMeters: 14.5,
      maxLOAMeters: 230,
      maxBeamMeters: 32.5,
      allowedClasses: ['Panamax', 'Supramax', 'Handysize'],
      handlingRateMTPD: 35000,
      berthTurnaroundDays: 3.5,
    },
    congestionIndex: 'Moderate', // Low, Moderate, High, Severe
    avgWaitingDays: 2.4,
    monsoonRisk: 'Medium', // Bay of Bengal pre/post monsoon
    demurrageDailyRateUSD: 22000,
  },
  INPRT: {
    code: 'INPRT',
    name: 'Paradip Port',
    state: 'Odisha',
    lat: 20.2644,
    lon: 86.6710,
    outerHarbour: {
      maxDraftMeters: 14.5,
      maxLOAMeters: 230,
      maxBeamMeters: 32.6,
      allowedClasses: ['Panamax', 'Supramax', 'Handysize'],
      handlingRateMTPD: 45000,
      berthTurnaroundDays: 2.8,
    },
    innerHarbour: null,
    congestionIndex: 'High',
    avgWaitingDays: 4.1,
    monsoonRisk: 'High', // High cyclone exposure
    demurrageDailyRateUSD: 24000,
  },
  INCCU: {
    code: 'INCCU',
    name: 'Haldia / Kolkata Port',
    state: 'West Bengal',
    lat: 22.0250,
    lon: 88.0667,
    outerHarbour: {
      maxDraftMeters: 8.2, // Shallow riverine tidal restriction
      maxLOAMeters: 190,
      maxBeamMeters: 30.5,
      allowedClasses: ['Handysize'], // Requires lighterage/transshipment for larger
      handlingRateMTPD: 20000,
      berthTurnaroundDays: 4.5,
    },
    innerHarbour: null,
    congestionIndex: 'High',
    avgWaitingDays: 3.8,
    monsoonRisk: 'Medium',
    demurrageDailyRateUSD: 18000,
  },
  INMAA: {
    code: 'INMAA',
    name: 'Chennai Port',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lon: 80.2707,
    outerHarbour: {
      maxDraftMeters: 15.5,
      maxLOAMeters: 290,
      maxBeamMeters: 45,
      allowedClasses: ['Panamax', 'Supramax', 'Handysize'],
      handlingRateMTPD: 40000,
      berthTurnaroundDays: 2.5,
    },
    innerHarbour: null,
    congestionIndex: 'Low',
    avgWaitingDays: 1.5,
    monsoonRisk: 'Low',
    demurrageDailyRateUSD: 20000,
  },
  INENR: {
    code: 'INENR',
    name: 'Kamarajar Port (Ennore)',
    state: 'Tamil Nadu',
    lat: 13.2612,
    lon: 80.3323,
    outerHarbour: {
      maxDraftMeters: 16.0,
      maxLOAMeters: 295,
      maxBeamMeters: 46,
      allowedClasses: ['Capesize', 'Panamax', 'Supramax', 'Handysize'],
      handlingRateMTPD: 55000,
      berthTurnaroundDays: 2.0,
    },
    innerHarbour: null,
    congestionIndex: 'Low',
    avgWaitingDays: 1.2,
    monsoonRisk: 'Low',
    demurrageDailyRateUSD: 21000,
  },
  INKRI: {
    code: 'INKRI',
    name: 'Krishnapatnam Port',
    state: 'Andhra Pradesh',
    lat: 14.2500,
    lon: 80.1200,
    outerHarbour: {
      maxDraftMeters: 18.0,
      maxLOAMeters: 300,
      maxBeamMeters: 50,
      allowedClasses: ['Capesize', 'Panamax', 'Supramax', 'Handysize'],
      handlingRateMTPD: 65000,
      berthTurnaroundDays: 1.8,
    },
    innerHarbour: null,
    congestionIndex: 'Low',
    avgWaitingDays: 1.0,
    monsoonRisk: 'Medium',
    demurrageDailyRateUSD: 23000,
  },
};

// Major Overseas Loading Origin Ports for Bulk Cargo Procurement
const OVERSEAS_ORIGIN_PORTS = {
  AUNCL: { code: 'AUNCL', name: 'Port of Newcastle', country: 'Australia', cargoTypical: 'Thermal & Coking Coal', lat: -32.9267, lon: 151.7800, distanceBaseNM: 5450 },
  ZARCB: { code: 'ZARCB', name: 'Richards Bay Coal Terminal', country: 'South Africa', cargoTypical: 'Steam Coal', lat: -28.8000, lon: 32.0833, distanceBaseNM: 4120 },
  IDSRD: { code: 'IDSRD', name: 'Samarinda / Balikpapan', country: 'Indonesia', cargoTypical: 'Sub-Bituminous Coal', lat: -0.5022, lon: 117.1536, distanceBaseNM: 2240 },
  AUPHL: { code: 'AUPHL', name: 'Port Hedland', country: 'Australia', cargoTypical: 'Iron Ore', lat: -20.3167, lon: 118.5833, distanceBaseNM: 3210 },
  SGSIN: { code: 'SGSIN', name: 'Port of Singapore', country: 'Singapore', cargoTypical: 'Bunker & Transshipment', lat: 1.2903, lon: 103.8520, distanceBaseNM: 1570 },
  AEJEA: { code: 'AEJEA', name: 'Jebel Ali Port', country: 'UAE', cargoTypical: 'Sulfur & Fertilizers', lat: 25.0113, lon: 55.0612, distanceBaseNM: 2550 },
  NLRTM: { code: 'NLRTM', name: 'Port of Rotterdam', country: 'Netherlands', cargoTypical: 'Industrial Minerals & Metals', lat: 51.9566, lon: 4.1480, distanceBaseNM: 6650 },
};

// Standard Vessel Classes Specification
const VESSEL_SPECS = {
  Handysize: {
    name: 'Handysize Bulk Carrier',
    class: 'Handysize',
    dwtMin: 25000,
    dwtMax: 39999,
    optimumParcelMT: 32000,
    typicalDraftMeters: 9.8,
    typicalLOAMeters: 180,
    typicalBeamMeters: 28.5,
    hasGear: true, // Self-discharging cranes/grabs
    baseCharterRateDayUSD: 11500,
    fuelConsumptionTonsDay: 19,
    description: 'Versatile geared carrier capable of calling shallow draft river ports like Haldia without lighterage.',
  },
  Supramax: {
    name: 'Supramax / Ultramax Bulk Carrier',
    class: 'Supramax',
    dwtMin: 50000,
    dwtMax: 64999,
    optimumParcelMT: 55000,
    typicalDraftMeters: 12.8,
    typicalLOAMeters: 199,
    typicalBeamMeters: 32.2,
    hasGear: true,
    baseCharterRateDayUSD: 14800,
    fuelConsumptionTonsDay: 26,
    description: 'High-flexibility geared vessel suited for Paradip, Vizag Inner, and Chennai bulk berths.',
  },
  Panamax: {
    name: 'Panamax / Kamsarmax Bulk Carrier',
    class: 'Panamax',
    dwtMin: 65000,
    dwtMax: 84999,
    optimumParcelMT: 75000,
    typicalDraftMeters: 14.4,
    typicalLOAMeters: 229,
    typicalBeamMeters: 32.3,
    hasGear: false,
    baseCharterRateDayUSD: 16900,
    fuelConsumptionTonsDay: 31,
    description: 'Optimal for medium-to-large coal/grain parcels to deep-water berths; gearless.',
  },
  Capesize: {
    name: 'Capesize Ocean Bulk Carrier',
    class: 'Capesize',
    dwtMin: 120000,
    dwtMax: 180000,
    optimumParcelMT: 150000,
    typicalDraftMeters: 17.8,
    typicalLOAMeters: 292,
    typicalBeamMeters: 45.0,
    hasGear: false,
    baseCharterRateDayUSD: 24500,
    fuelConsumptionTonsDay: 48,
    description: 'Heavy ocean carrier for massive coal/iron ore procurement. Restricted to Vizag Outer, Ennore, and Krishnapatnam.',
  },
};

// Haversine Sea Distance helper (NM)
function calculateSeaDistance(p1, p2, baseNM) {
  if (baseNM) return baseNM;
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
    Math.cos((p2.lat * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directKm = R * c;
  return Math.max(100, Math.round(directKm * 0.539957 * 1.25));
}

// -------------------------------------------------------------
// CORE ALGORITHM ENGINES (a, b, c, d)
// -------------------------------------------------------------

// (a) Optimal Market Entry Timing & 90-Day Freight Forward Curve
function generateMarketEntryTiming(cargoType, vesselClass, contractDuration) {
  const spec = VESSEL_SPECS[vesselClass] || VESSEL_SPECS.Supramax;
  const baseRate = spec.baseCharterRateDayUSD;

  // 12-Week forward projection simulating seasonal bulk indices (BDI / BSI / BPI)
  const forwardCurve = [];
  const startDay = new Date();

  const seasonalMultipliers = [
    1.0,    // Week 1 (Current Spot)
    1.03,   // Week 2
    0.96,   // Week 3 - Dip starts
    0.91,   // Week 4 - Optimal local trough
    0.88,   // Week 5 - Seasonal Low Window (Best Entry)
    0.90,   // Week 6
    0.95,   // Week 7
    1.02,   // Week 8
    1.08,   // Week 9 - Monsoon replenishment surge
    1.14,   // Week 10
    1.19,   // Week 11 - High freight season
    1.22,   // Week 12
  ];

  let lowestRate = Infinity;
  let optimalWeekIndex = 4; // default week 5

  seasonalMultipliers.forEach((mult, i) => {
    const projectedDate = new Date(startDay);
    projectedDate.setDate(startDay.getDate() + (i + 1) * 7);

    const dateLabel = projectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const spotRate = Math.round(baseRate * mult);
    const timeCharterRate = Math.round(spotRate * 0.94); // Time charter discount

    if (spotRate < lowestRate) {
      lowestRate = spotRate;
      optimalWeekIndex = i;
    }

    forwardCurve.push({
      week: i + 1,
      dateLabel,
      spotRateUSD: spotRate,
      timeCharterRateUSD: timeCharterRate,
      variancePct: Math.round((mult - 1.0) * 100),
      isOptimal: false,
    });
  });

  forwardCurve[optimalWeekIndex].isOptimal = true;
  const currentRate = forwardCurve[0].spotRateUSD;
  const bestRate = forwardCurve[optimalWeekIndex].spotRateUSD;
  const potentialSavingsUSDPerDay = currentRate - bestRate;
  const estimatedSavingsPct = Math.round(((currentRate - bestRate) / currentRate) * 100);

  const totalVoyageSavingsUSD = potentialSavingsUSDPerDay * 25;

  let recommendationSummary = '';
  let contractStrategy = '';

  if (contractDuration.includes('Mid') || contractDuration.includes('6-12')) {
    contractStrategy = 'Secure 6-Month Index-Linked Time Charter with bunker adjustment factor (BAF) cap.';
    recommendationSummary = `Lock forward commitments in Week ${optimalWeekIndex + 1} (${forwardCurve[optimalWeekIndex].dateLabel}) before the anticipated +${forwardCurve[11].variancePct}% seasonal freight spike.`;
  } else if (contractDuration.includes('Short') || contractDuration.includes('1-3')) {
    contractStrategy = 'Secure 60-Day Period Time Charter fixing rate in the identified Week 4-5 window.';
    recommendationSummary = `Defer spot chartering by 3 weeks to enter during the seasonal freight dip (${forwardCurve[optimalWeekIndex].dateLabel}), yielding ~${estimatedSavingsPct}% ($${potentialSavingsUSDPerDay.toLocaleString()}/day) direct freight cost reduction.`;
  } else {
    contractStrategy = 'Spot Voyage Charter with Laycan negotiated for Week 4-5.';
    recommendationSummary = `Optimal laycan window is Week ${optimalWeekIndex + 1}. Estimated net voyage freight reduction is $${totalVoyageSavingsUSD.toLocaleString()} across a 25-day parcel transit.`;
  }

  return {
    forwardCurve,
    currentSpotRateUSD: currentRate,
    optimalWeek: optimalWeekIndex + 1,
    optimalDateLabel: forwardCurve[optimalWeekIndex].dateLabel,
    optimalRateUSD: bestRate,
    savingsPerDayUSD: Math.max(0, potentialSavingsUSDPerDay),
    savingsPercent: Math.max(0, estimatedSavingsPct),
    estimatedVoyageSavingsUSD: Math.max(0, totalVoyageSavingsUSD),
    contractStrategy,
    recommendationSummary,
  };
}

// (b) Vessel Type Optimization & East Coast Port Constraints Engine
function evaluateVesselAndPortCompatibility(volumeMT, destPortCode, originPortCode) {
  const destPort = EAST_COAST_PORTS[destPortCode] || EAST_COAST_PORTS.INVTZ;
  const originPort = OVERSEAS_ORIGIN_PORTS[originPortCode] || OVERSEAS_ORIGIN_PORTS.AUNCL;

  const results = [];
  let recommendedClass = 'Supramax';

  const portDraft = destPort.outerHarbour ? destPort.outerHarbour.maxDraftMeters : 12.0;
  const portLOA = destPort.outerHarbour ? destPort.outerHarbour.maxLOAMeters : 220;

  Object.values(VESSEL_SPECS).forEach((vessel) => {
    let feasible = true;
    const reasons = [];

    // Draft check
    const draftMarginMeters = portDraft - vessel.typicalDraftMeters;
    if (draftMarginMeters < 0) {
      feasible = false;
      reasons.push(`Draft clearance exceeded by ${Math.abs(draftMarginMeters).toFixed(1)}m (Port Permissible: ${portDraft}m vs Vessel Laden: ${vessel.typicalDraftMeters}m). Requires offshore lighterage/daughter vessel.`);
    } else if (draftMarginMeters < 1.0) {
      reasons.push(`Marginal under-keel clearance (${draftMarginMeters.toFixed(1)}m safety margin). High tide berthing mandatory.`);
    }

    // LOA check
    if (vessel.typicalLOAMeters > portLOA) {
      feasible = false;
      reasons.push(`Vessel LOA (${vessel.typicalLOAMeters}m) exceeds berth envelope limit (${portLOA}m).`);
    }

    // Parcel size efficiency check
    const numVoyages = Math.max(1, Math.ceil(volumeMT / vessel.optimumParcelMT));
    const deadweightUtilization = Math.min(100, Math.round((volumeMT / (numVoyages * vessel.optimumParcelMT)) * 100));

    // Haldia special constraint
    if (destPortCode === 'INCCU' && vessel.class !== 'Handysize') {
      feasible = false;
      reasons.push('Haldia Riverine Channel cannot berth vessels above Handysize due to Hooghly sandbar draft limitations.');
    }

    // Scoring formula: Draft feasibility + Volume economies of scale + Voyage efficiency
    let score = 50;
    if (feasible) {
      score += 25;
      if (deadweightUtilization >= 80) score += 15;
      if (draftMarginMeters >= 0.5) score += 5;

      // Economies of scale & single parcel efficiency
      if (volumeMT >= 110000 && vessel.class === 'Capesize') {
        score += 35; // Capesize is prime choice for 100k+ MT parcels
      } else if (volumeMT >= 60000 && volumeMT < 110000 && (vessel.class === 'Panamax' || vessel.class === 'Supramax')) {
        score += 30; // Panamax/Supramax sweet spot
      } else if (volumeMT < 60000 && (vessel.class === 'Supramax' || vessel.class === 'Handysize')) {
        score += 25;
      }

      // Penalty for excessive multi-voyage split if larger feasible vessel exists
      if (numVoyages > 1) {
        score -= (numVoyages - 1) * 8;
      }
    } else {
      score = 0;
    }

    results.push({
      vesselClass: vessel.class,
      vesselName: vessel.name,
      typicalDraft: vessel.typicalDraftMeters,
      typicalLOA: vessel.typicalLOAMeters,
      hasGear: vessel.hasGear,
      feasible,
      draftMarginMeters: Number(draftMarginMeters.toFixed(2)),
      numVoyagesRequired: numVoyages,
      dwtUtilizationPct: deadweightUtilization,
      feasibilityScore: score,
      reasons: reasons.length > 0 ? reasons : ['Fully compliant with port navigation channel and berth infrastructure.'],
      baseCharterRateUSD: vessel.baseCharterRateDayUSD,
    });
  });

  const feasibleList = results.filter((r) => r.feasible);
  if (feasibleList.length > 0) {
    feasibleList.sort((a, b) => b.feasibilityScore - a.feasibilityScore);
    recommendedClass = feasibleList[0].vesselClass;
  } else {
    recommendedClass = 'Handysize';
  }

  const bestSpec = VESSEL_SPECS[recommendedClass];
  const distanceNM = calculateSeaDistance(originPort, destPort, originPort.distanceBaseNM);
  const transitDays = Math.round(distanceNM / (13.5 * 24));
  const dischargeRate = destPort.outerHarbour ? destPort.outerHarbour.handlingRateMTPD : 35000;
  const dischargeDays = Number((Math.min(volumeMT, bestSpec.optimumParcelMT) / dischargeRate).toFixed(1));

  return {
    recommendedClass,
    recommendedVessel: bestSpec.name,
    allVesselEvaluations: results,
    portInfrastructure: {
      portCode: destPort.code,
      portName: destPort.name,
      maxDraftPermissible: portDraft,
      maxLOAPermissible: portLOA,
      berthHandlingRateMTPD: dischargeRate,
    },
    voyageEstimates: {
      seaDistanceNM: distanceNM,
      steamingDaysOneWay: transitDays,
      portDischargeDays: dischargeDays,
      totalRoundtripDays: transitDays * 2 + dischargeDays + (destPort.avgWaitingDays || 2),
    },
  };
}

// (c) Idle Scenario Management & Backhaul Repositioning
function generateIdleScenarioStrategies(destPortCode, vesselClass) {
  const destPort = EAST_COAST_PORTS[destPortCode] || EAST_COAST_PORTS.INVTZ;

  const backhaulOptions = [
    {
      opportunity: 'Vizag / Paradip Iron Ore Pellets to China (Qingdao / Rizhao)',
      route: `${destPort.name} → Singapore → Rizhao, China`,
      cargoType: 'High-Grade Iron Ore Pellets',
      demandLevel: 'High',
      ballastDaysEliminated: 11,
      estimatedBunkerSavingsUSD: 98000,
      freightRevenueUSD: 240000,
      feasibility: vesselClass === 'Panamax' || vesselClass === 'Capesize' || vesselClass === 'Supramax' ? 'Prime Match' : 'Possible',
      desc: 'Instead of deadheading empty in ballast back to Australia/South Africa, load East Coast Iron Ore pellet exports to East Asia.',
    },
    {
      opportunity: 'Coastal Coal Repositioning: Paradip / Dhamra to Ennore / Tuticorin',
      route: `${destPort.name} → Kamarajar Port (Ennore) / Tuticorin`,
      cargoType: 'Thermal Power Utility Coal (Mahanadi Coalfields)',
      demandLevel: 'Consistent',
      ballastDaysEliminated: 5,
      estimatedBunkerSavingsUSD: 42000,
      freightRevenueUSD: 115000,
      feasibility: vesselClass === 'Supramax' || vesselClass === 'Panamax' ? 'Prime Match' : 'Sub-Optimal',
      desc: 'Take coastal freight cargo southward along India’s East Coast before steaming toward Malacca Strait or Indian Ocean.',
    },
    {
      opportunity: 'Mundra / Kandla Agri-Bulk & Salt Export to Far East',
      route: `${destPort.name} → Sri Lanka (Colombo) → West Coast India / Singapore`,
      cargoType: 'Agricultural Grain & De-oiled Cakes',
      demandLevel: 'Moderate',
      ballastDaysEliminated: 7,
      estimatedBunkerSavingsUSD: 61000,
      freightRevenueUSD: 145000,
      feasibility: vesselClass === 'Handysize' || vesselClass === 'Supramax' ? 'Prime Match' : 'Limited',
      desc: 'Short repositioning leg to Colombo transshipment hub to take on breakbulk or container feeder contract.',
    },
  ];

  return {
    idleRiskForecast: destPort.congestionIndex === 'High' ? 'Elevated (Pre-discharge anchorage hold-up)' : 'Low to Moderate',
    recommendedStrategy: 'Triangular Ballast Elimination Route',
    ballastReductionSummary: 'By committing to pre-fixed backhaul cargo from the discharge port, vessel idle turnaround can be reduced by 5 to 11 days, curtailing up to $98,000 in unremunerated bunker expenditure.',
    backhaulOptions,
  };
}

// (d) Risk Mitigation & Early Warning Engine
function evaluateOperationalAndMarketRisks(destPortCode, cargoType, vesselClass) {
  const port = EAST_COAST_PORTS[destPortCode] || EAST_COAST_PORTS.INVTZ;
  const currentMonth = new Date().getMonth();

  let cycloneRiskLevel = 'Low';
  let weatherAdvisory = 'Normal seasonal sea conditions in the Bay of Bengal.';
  if (currentMonth === 4 || currentMonth === 5) {
    cycloneRiskLevel = 'Elevated (Pre-Monsoon Season)';
    weatherAdvisory = 'Pre-monsoon low-pressure depressions frequent in Bay of Bengal. Factor in +1.5 to 2.5 days weather delay allowance.';
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    cycloneRiskLevel = 'High (Post-Monsoon Northeast Cyclone Season)';
    weatherAdvisory = 'Cyclonic activity peaks along Andhra Pradesh and Odisha coast. Vessel masters must monitor IMD maritime weather bulletins.';
  }

  const waitingDays = port.avgWaitingDays;
  const dailyDemurrageRate = port.demurrageDailyRateUSD;
  const estimatedDemurrageExposureUSD = Math.round(waitingDays * dailyDemurrageRate);

  let riskScore = 30;
  if (port.congestionIndex === 'High') riskScore += 25;
  if (port.congestionIndex === 'Moderate') riskScore += 15;
  if (cycloneRiskLevel.includes('High')) riskScore += 30;
  if (cycloneRiskLevel.includes('Elevated')) riskScore += 15;
  if (vesselClass === 'Capesize' && port.code === 'INPRT') riskScore += 20;

  const alerts = [];

  if (port.congestionIndex === 'High') {
    alerts.push({
      type: 'WARNING',
      title: `Port Congestion Warning at ${port.name}`,
      message: `Average anchorage waiting duration is currently ${waitingDays} days. Potential demurrage exposure: ~$${estimatedDemurrageExposureUSD.toLocaleString()}. Recommend booking mechanical fast-discharge berths or securing guaranteed laycan windows.`,
    });
  }

  if (cycloneRiskLevel.includes('High') || cycloneRiskLevel.includes('Elevated')) {
    alerts.push({
      type: 'WEATHER',
      title: 'Bay of Bengal Cyclonic Advisory',
      message: weatherAdvisory,
    });
  }

  if (port.code === 'INCCU') {
    alerts.push({
      type: 'INFRASTRUCTURE',
      title: 'Riverine Draft Restriction (Haldia)',
      message: 'Draft is restricted to 8.2m max. Lighterage operations at Sandheads anchorage will be required if parcel exceeds 35,000 MT.',
    });
  }

  return {
    overallRiskScore: Math.min(95, riskScore),
    riskLevel: riskScore > 65 ? 'High Risk' : riskScore > 40 ? 'Moderate Risk' : 'Low Risk',
    portCongestion: {
      index: port.congestionIndex,
      avgWaitingDays: port.avgWaitingDays,
      estimatedDemurrageExposureUSD,
      dailyDemurrageRateUSD: dailyDemurrageRate,
    },
    meteorological: {
      cycloneRiskLevel,
      weatherAdvisory,
    },
    earlyWarnings: alerts,
  };
}

// -------------------------------------------------------------
// API ROUTE HANDLERS
// -------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      ports: EAST_COAST_PORTS,
      originPorts: OVERSEAS_ORIGIN_PORTS,
      vesselSpecs: VESSEL_SPECS,
      liveTelemetry: {
        timestamp: new Date().toISOString(),
        bdi: 1845,
        bdiDelta: +14,
        bci: 2790, // Capesize
        bciDelta: -18,
        bpi: 1620, // Panamax
        bpiDelta: +6,
        bsi: 1385, // Supramax
        bsiDelta: +9,
        vlsfoBunkerUSD: 614,
        vlsfoDelta: -4,
        eastCoastAnchorageQueue: 18,
        aisEvents: [
          { time: 'Just now', port: 'Visakhapatnam', vessel: 'MV Eastern Star', event: 'Anchor dropped at Outer Harbour berth OB-1 (Draft 17.8m OK)' },
          { time: '2m ago', port: 'Paradip', vessel: 'MV Oceanic Pioneer', event: 'Automated coal unloader conveyor engaged at 45,000 MT/day' },
          { time: '4m ago', port: 'Haldia', vessel: 'SS Sindhu Ratna', event: 'High tide navigation crest active (+3.4m). Channel pilot boarded' },
          { time: '6m ago', port: 'Kamarajar (Ennore)', vessel: 'MV Coromandel Express', event: 'Coastal coal discharge completed. Repositioning ballast southward' },
        ],
      },
      commodities: [
        'Thermal Coal',
        'Coking Coal',
        'Iron Ore',
        'Bauxite & Alumina',
        'Rock Phosphate & Fertilizers',
        'Industrial Limestone',
        'Manganese Ore',
      ],
      contractDurations: [
        'Spot Single Voyage',
        'Short-Term Time Charter (1 - 3 Months)',
        'Mid-Term Period Charter (6 - 12 Months)',
      ],
      presets: [
        {
          label: '🇦🇺 Australian Coking Coal to Visakhapatnam Outer Harbour (Capesize / 150,000 MT)',
          cargoType: 'Coking Coal',
          volumeMT: 150000,
          originPort: 'AUNCL',
          destPort: 'INVTZ',
          contractDuration: 'Mid-Term Period Charter (6 - 12 Months)',
        },
        {
          label: '🇮🇩 Indonesian Steam Coal to Paradip Port (Panamax / 75,000 MT)',
          cargoType: 'Thermal Coal',
          volumeMT: 75000,
          originPort: 'IDSRD',
          destPort: 'INPRT',
          contractDuration: 'Short-Term Time Charter (1 - 3 Months)',
        },
        {
          label: '🇿🇦 South African Steam Coal to Haldia (Handysize Shallow Draft / 32,000 MT)',
          cargoType: 'Thermal Coal',
          volumeMT: 32000,
          originPort: 'ZARCB',
          destPort: 'INCCU',
          contractDuration: 'Spot Single Voyage',
        },
        {
          label: '🇦🇺 Iron Ore from Port Hedland to Kamarajar Ennore (Panamax / 70,000 MT)',
          cargoType: 'Iron Ore',
          volumeMT: 70000,
          originPort: 'AUPHL',
          destPort: 'INENR',
          contractDuration: 'Short-Term Time Charter (1 - 3 Months)',
        },
      ],
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      cargoType = 'Thermal Coal',
      volumeMT = 60000,
      originPort = 'AUNCL',
      destPort = 'INVTZ',
      contractDuration = 'Short-Term Time Charter (1 - 3 Months)',
    } = body;

    const parsedVolume = Math.max(5000, Number(volumeMT) || 60000);

    // 1. Vessel Type & Port Infrastructure Optimization (Feature b)
    const vesselOptimization = evaluateVesselAndPortCompatibility(parsedVolume, destPort, originPort);

    // 2. Optimal Market Entry Timing (Feature a)
    const timingOptimization = generateMarketEntryTiming(
      cargoType,
      vesselOptimization.recommendedClass,
      contractDuration
    );

    // 3. Idle Scenario Management (Feature c)
    const idleOptimization = generateIdleScenarioStrategies(
      destPort,
      vesselOptimization.recommendedClass
    );

    // 4. Risk Mitigation & Early Warning Engine (Feature d)
    const riskMitigation = evaluateOperationalAndMarketRisks(
      destPort,
      cargoType,
      vesselOptimization.recommendedClass
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      query: {
        cargoType,
        volumeMT: parsedVolume,
        originPort,
        destPort,
        contractDuration,
      },
      results: {
        marketEntryTiming: timingOptimization,
        vesselOptimization,
        idleScenarioManagement: idleOptimization,
        riskMitigation,
      },
    });
  } catch (error) {
    console.error('Error in charter intelligence optimization API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error processing freight forecasting simulation',
      },
      { status: 500 }
    );
  }
}
