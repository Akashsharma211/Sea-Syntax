'use client';

import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CharterIntelligencePanel from '@/components/CharterIntelligencePanel';

// Maritime Ports Catalog with geographic coordinates
const MARITIME_PORTS = [
  { code: 'INVTZ', name: 'Visakhapatnam Port (INVTZ)', city: 'Visakhapatnam', country: 'India', lat: 17.6868, lon: 83.2185 },
  { code: 'INMAA', name: 'Chennai Port (INMAA)', city: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707 },
  { code: 'INBOM', name: 'JNPT / Mumbai Port (INBOM)', city: 'Mumbai', country: 'India', lat: 18.9499, lon: 72.9512 },
  { code: 'INCCU', name: 'Kolkata / Haldia Port (INCCU)', city: 'Kolkata', country: 'India', lat: 22.0250, lon: 88.0667 },
  { code: 'INPRT', name: 'Paradip Port (INPRT)', city: 'Paradip', country: 'India', lat: 20.2644, lon: 86.6710 },
  { code: 'INCOK', name: 'Cochin Port (INCOK)', city: 'Kochi', country: 'India', lat: 9.9656, lon: 76.2673 },
  { code: 'INMUN', name: 'Mundra Port (INMUN)', city: 'Mundra', country: 'India', lat: 22.7441, lon: 69.7061 },
  { code: 'SGSIN', name: 'Port of Singapore (SGSIN)', city: 'Singapore', country: 'Singapore', lat: 1.29027, lon: 103.851959 },
  { code: 'LKCMB', name: 'Port of Colombo (LKCMB)', city: 'Colombo', country: 'Sri Lanka', lat: 6.9497, lon: 79.8428 },
  { code: 'AEJEA', name: 'Jebel Ali Port / Dubai (AEJEA)', city: 'Dubai', country: 'UAE', lat: 25.0113, lon: 55.0612 },
  { code: 'NLRTM', name: 'Port of Rotterdam (NLRTM)', city: 'Rotterdam', country: 'Netherlands', lat: 51.9566, lon: 4.1480 },
  { code: 'CNSHG', name: 'Port of Shanghai (CNSHG)', city: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
];

// Standard maritime shipping route distances in Nautical Miles (NM)
const MARITIME_ROUTE_DISTANCES = {
  'INVTZ-INMAA': 350, 'INMAA-INVTZ': 350,
  'INVTZ-INPRT': 230, 'INPRT-INVTZ': 230,
  'INVTZ-INCCU': 390, 'INCCU-INVTZ': 390,
  'INVTZ-LKCMB': 850, 'LKCMB-INVTZ': 850,
  'INVTZ-INCOK': 1050, 'INCOK-INVTZ': 1050,
  'INVTZ-INBOM': 1840, 'INBOM-INVTZ': 1840,
  'INVTZ-INMUN': 2180, 'INMUN-INVTZ': 2180,
  'INVTZ-SGSIN': 1570, 'SGSIN-INVTZ': 1570,
  'INVTZ-AEJEA': 2550, 'AEJEA-INVTZ': 2550,
  'INVTZ-NLRTM': 6650, 'NLRTM-INVTZ': 6650,
  'INVTZ-CNSHG': 3280, 'CNSHG-INVTZ': 3280,
  'INMAA-INBOM': 1520, 'INBOM-INMAA': 1520,
  'INMAA-SGSIN': 1650, 'SGSIN-INMAA': 1650,
  'INBOM-SGSIN': 2450, 'SGSIN-INBOM': 2450,
  'INBOM-AEJEA': 1070, 'AEJEA-INBOM': 1070,
  'INCCU-SGSIN': 1620, 'SGSIN-INCCU': 1620,
  'INCCU-INBOM': 2210, 'INBOM-INCCU': 2210,
};

// Calculate nautical sea route distance between two maritime ports
const calculatePortDistance = (p1Str, p2Str) => {
  if (!p1Str || !p2Str || p1Str === p2Str) return 0;
  const p1 = MARITIME_PORTS.find(p => p.name === p1Str || p.code === p1Str) || MARITIME_PORTS[0];
  const p2 = MARITIME_PORTS.find(p => p.name === p2Str || p.code === p2Str) || MARITIME_PORTS[1];
  const key = `${p1.code}-${p2.code}`;
  if (MARITIME_ROUTE_DISTANCES[key]) return MARITIME_ROUTE_DISTANCES[key];

  // Haversine formula with commercial sea route factor (1.25)
  const R = 6371; // Earth radius in km
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
  return Math.max(50, Math.round(directKm * 0.539957 * 1.25));
};

// Calculate voyage transit duration in range of days based on commercial vessel speed (12-16 knots)
const calculateVoyageDuration = (distanceNM) => {
  if (!distanceNM || distanceNM <= 0) return '0 - 1 Day';
  if (distanceNM <= 350) return '1 - 2 Days';
  if (distanceNM <= 600) return '2 - 3 Days';
  if (distanceNM <= 1000) return '3 - 5 Days';

  const minHours = distanceNM / 16;
  const maxHours = distanceNM / 12;
  const minDays = Math.max(1, Math.round(minHours / 24));
  const maxDays = Math.max(minDays + 1, Math.round(maxHours / 24) + 1);
  return `${minDays} - ${maxDays} Days`;
};

// Standard Commercial Fleet of Vessels
const STANDARD_VESSELS = [
  { name: 'MV Sea Syntax', type: 'Container Feeder (1,800 TEU)', imo: 'IMO 9823411' },
  { name: 'MV Oceanic Pioneer', type: 'Handymax Bulk Carrier (45,000 DWT)', imo: 'IMO 9482156' },
  { name: 'SS Sindhu Ratna', type: 'General Cargo Carrier (12,500 DWT)', imo: 'IMO 9312044' },
  { name: 'MT Bengal Star', type: 'Chemical / Product Tanker (28,000 DWT)', imo: 'IMO 9554120' },
  { name: 'MV Marina Horizon', type: 'Multi-Purpose Ocean Vessel', imo: 'IMO 9710582' },
  { name: 'MV Coromandel Express', type: 'Coastal Feeder Vessel', imo: 'IMO 9632890' },
  { name: 'MV Eastern Mariner', type: 'Panamax Bulk Carrier (76,000 DWT)', imo: 'IMO 9401235' },
];

// Helper to extract clean numeric value from rate or stock string
const parseNumeric = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Helper to format currency balances
const formatBalance = (amount, drCr = 'Dr') => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${drCr}`;
};

// Helper to extract numeric amount from string balance
const parseBalanceAmount = (bal, raw) => {
  if (typeof raw === 'number' && !isNaN(raw)) return raw;
  if (typeof bal === 'number') return bal;
  if (!bal) return 0;
  const cleaned = String(bal).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Helper to create a fresh, empty voucher state with vessel, ports, distance & duration
const createBlankVoucher = (type = 'Sales') => {
  const prefix = type === 'Purchase' ? 'PUR' : 'INV';
  const randomNum = Math.floor(100 + Math.random() * 900);
  const originPort = type === 'Sales' ? 'Visakhapatnam Port (INVTZ)' : 'Kolkata / Haldia Port (INCCU)';
  const destinationPort = type === 'Sales' ? 'JNPT / Mumbai Port (INBOM)' : 'Visakhapatnam Port (INVTZ)';
  const dist = calculatePortDistance(originPort, destinationPort);
  const dur = calculateVoyageDuration(dist);

  return {
    type,
    voucherNo: `${prefix}/2026/${randomNum}`,
    date: '06-Sep-2026',
    particulars: '',
    account: type === 'Purchase' ? 'Purchase Accounts' : 'Sales Accounts',
    vessel: type === 'Sales' ? 'MV Sea Syntax' : 'MT Bengal Star',
    originPort,
    destinationPort,
    distanceNM: dist,
    duration: dur,
    items: [
      {
        itemName: '',
        quantity: 1,
        unit: 'Pcs',
        rate: 0,
        amount: 0,
      },
    ],
    amount: 0,
    narration: '',
  };
};

// Default initial vouchers if none exist in localStorage
const DEFAULT_VOUCHERS = [
  {
    id: 'v-101',
    date: '06-Sep-2026',
    type: 'Sales',
    voucherNo: 'INV/2026/089',
    particulars: 'Oceanic Marine Exports Pvt Ltd',
    account: 'Sales Accounts',
    vessel: 'MV Oceanic Pioneer',
    originPort: 'Visakhapatnam Port (INVTZ)',
    destinationPort: 'JNPT / Mumbai Port (INBOM)',
    distanceNM: 1840,
    duration: '5 - 7 Days',
    items: [
      {
        itemName: 'Syntax Marine IoT Sensor Module',
        quantity: 20,
        unit: 'Pcs',
        rate: 4500,
        amount: 90000,
      },
      {
        itemName: 'Aquaculture Aeration Valve V2',
        quantity: 10,
        unit: 'Sets',
        rate: 2000,
        amount: 20000,
      },
    ],
    amount: 110000,
    isDebit: false,
    narration: 'Consignment of telemetry sensors delivered to Oceanic Marine',
  },
  {
    id: 'v-102',
    date: '03-Sep-2026',
    type: 'Purchase',
    voucherNo: 'PUR/2026/035',
    particulars: 'Harbor Hardware & Sensors Ltd',
    account: 'Purchase Accounts',
    vessel: 'MT Bengal Star',
    originPort: 'Kolkata / Haldia Port (INCCU)',
    destinationPort: 'Visakhapatnam Port (INVTZ)',
    distanceNM: 390,
    duration: '2 - 3 Days',
    items: [
      {
        itemName: 'High-Grade Deep Sea Salt (10kg)',
        quantity: 30,
        unit: 'Bags',
        rate: 150,
        amount: 4500,
      },
      {
        itemName: 'Seaweed Bio-Polymer Resin (50kg)',
        quantity: 4,
        unit: 'Drums',
        rate: 12000,
        amount: 48000,
      },
      {
        itemName: 'Aquaculture Aeration Valve V2',
        quantity: 2,
        unit: 'Sets',
        rate: 2200,
        amount: 4400,
      },
    ],
    amount: 56900,
    isDebit: true,
    narration: 'Second purchase batch: 30 Bags @ ₹150 + polymer resins and valve sets',
  },
  {
    id: 'v-103',
    date: '02-Sep-2026',
    type: 'Sales',
    voucherNo: 'INV/2026/082',
    particulars: 'Pacific Fleet Logistics',
    account: 'Sales Accounts',
    vessel: 'MV Sea Syntax',
    originPort: 'Visakhapatnam Port (INVTZ)',
    destinationPort: 'Port of Singapore (SGSIN)',
    distanceNM: 1570,
    duration: '4 - 6 Days',
    items: [
      {
        itemName: 'Syntax Marine IoT Sensor Module',
        quantity: 15,
        unit: 'Pcs',
        rate: 4500,
        amount: 67500,
      },
    ],
    amount: 67500,
    isDebit: false,
    narration: 'Telemetry modules supplied to Pacific Fleet',
  },
  {
    id: 'v-104',
    date: '01-Sep-2026',
    type: 'Purchase',
    voucherNo: 'PUR/2026/021',
    particulars: 'Harbor Hardware & Sensors Ltd',
    account: 'Purchase Accounts',
    vessel: 'MT Bengal Star',
    originPort: 'Kolkata / Haldia Port (INCCU)',
    destinationPort: 'Visakhapatnam Port (INVTZ)',
    distanceNM: 390,
    duration: '2 - 3 Days',
    items: [
      {
        itemName: 'High-Grade Deep Sea Salt (10kg)',
        quantity: 20,
        unit: 'Bags',
        rate: 100,
        amount: 2000,
      },
    ],
    amount: 2000,
    isDebit: true,
    narration: 'First purchase batch: 20 Bags @ ₹100',
  },
];

// Default initial masters
const DEFAULT_LEDGERS = [
  { id: 'l-1', name: 'Oceanic Marine Exports Pvt Ltd', group: 'Sundry Debtors', balance: '₹1,10,000.00 Dr', rawBalance: 110000, drCr: 'Dr', port: 'JNPT / Mumbai Port (INBOM)' },
  { id: 'l-2', name: 'Harbor Hardware & Sensors Ltd', group: 'Sundry Creditors', balance: '₹58,900.00 Cr', rawBalance: 58900, drCr: 'Cr', port: 'Kolkata / Haldia Port (INCCU)' },
  { id: 'l-3', name: 'Sales Accounts', group: 'Sales Accounts', balance: '₹12,80,000.00 Cr', rawBalance: 1280000, drCr: 'Cr', port: 'Visakhapatnam Port (INVTZ)' },
  { id: 'l-4', name: 'Purchase Accounts', group: 'Purchase Accounts', balance: '₹6,40,000.00 Dr', rawBalance: 640000, drCr: 'Dr', port: 'Visakhapatnam Port (INVTZ)' },
  { id: 'l-5', name: 'State Bank of India', group: 'Bank Accounts', balance: '₹3,84,500.00 Dr', rawBalance: 384500, drCr: 'Dr', port: 'Visakhapatnam Port (INVTZ)' },
  { id: 'l-6', name: 'Cash In Hand', group: 'Cash-in-Hand', balance: '₹45,200.00 Dr', rawBalance: 45200, drCr: 'Dr', port: 'Visakhapatnam Port (INVTZ)' },
  { id: 'l-7', name: 'Port Operations & Freight', group: 'Direct Expenses', balance: '₹1,12,000.00 Dr', rawBalance: 112000, drCr: 'Dr', port: 'Chennai Port (INMAA)' },
  { id: 'l-8', name: 'Office Rent & Utilities', group: 'Indirect Expenses', balance: '₹65,000.00 Dr', rawBalance: 65000, drCr: 'Dr', port: 'Visakhapatnam Port (INVTZ)' },
];

const DEFAULT_ITEMS = [
  { id: 'i-1', name: 'Syntax Marine IoT Sensor Module', group: 'Marine Telemetry & Electronics', unit: 'Pcs', rate: '₹4,500', stock: '240 Pcs', openingQty: 275, openingRate: 4500, lastPurchaseRate: 4500 },
  { id: 'i-2', name: 'High-Grade Deep Sea Salt (10kg)', group: 'Deep Sea Minerals & Bio-Polymers', unit: 'Bags', rate: '₹130', stock: '50 Bags', openingQty: 0, openingRate: 100, lastPurchaseRate: 150 },
  { id: 'i-3', name: 'Seaweed Bio-Polymer Resin (50kg)', group: 'Deep Sea Minerals & Bio-Polymers', unit: 'Drums', rate: '₹12,000', stock: '45 Drums', openingQty: 41, openingRate: 12000, lastPurchaseRate: 12000 },
  { id: 'i-4', name: 'Aquaculture Aeration Valve V2', group: 'Aquaculture Flow Control', unit: 'Sets', rate: '₹1,850', stock: '120 Sets', openingQty: 128, openingRate: 1850, lastPurchaseRate: 2200 },
];

export default function DashboardPage() {
  const router = useRouter();

  // Company Information
  const [companyInfo, setCompanyInfo] = useState({
    name: 'SEA & SYNTAX ENTERPRISES',
    mailingName: 'Sea & Syntax Marine Technologies Pvt Ltd',
    address: 'Plot 42, Offshore Technology Zone, Visakhapatnam, Andhra Pradesh',
    state: 'Andhra Pradesh',
    country: 'India',
    gst: '37AAAAA0000A1Z5',
    IEC: '10020000000000',
    phone: '+91 891 2548900',
    finYear: '1-Apr-2026',
    booksBegin: '1-Apr-2026',
  });

  // Modals & Navigation state
  const [activeModal, setActiveModal] = useState(null); // 'master_create' | 'master_alter' | 'master_chart' | 'trans_vouchers' | 'trans_daybook' | 'rep_balance' | 'rep_pl' | 'rep_stock' | 'rep_ratio' | null
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);

  const [vouchers, setVouchers] = useState([]);
  const [newVoucher, setNewVoucher] = useState(() => createBlankVoucher('Sales'));
  const [voucherFilter, setVoucherFilter] = useState('All');
  const [showVoucherAcceptPrompt, setShowVoucherAcceptPrompt] = useState(false);

  // Selected ledger for Ledger Statement register
  const [selectedLedgerName, setSelectedLedgerName] = useState('');

  // Authentic 1:1 Stock Summary State
  const [stockViewMode, setStockViewMode] = useState('detailed'); // 'condensed' | 'detailed' | 'columnar'
  const [stockGroupFilter, setStockGroupFilter] = useState('All'); // 'All' | group name
  const [stockValuationMethod, setStockValuationMethod] = useState('FIFO'); // 'FIFO' | 'Average Cost' | 'Last Purchase Cost' | 'Standard Cost'
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockDrilldownItem, setStockDrilldownItem] = useState(null); // Selected item for monthly/voucher drilldown
  const [showStockConfig, setShowStockConfig] = useState(false); // F12 Configure popover
  const [expandedStockGroups, setExpandedStockGroups] = useState({
    'Marine Telemetry & Electronics': true,
    'Deep Sea Minerals & Bio-Polymers': true,
    'Aquaculture Flow Control': true,
    'General Marine Cargo': true,
  });
  const [stockConfigOptions, setStockConfigOptions] = useState({
    showOpening: true,
    showInwards: true,
    showOutwards: true,
    showClosing: true,
  });

  // Masters state
  const [ledgers, setLedgers] = useState([]);
  const [items, setItems] = useState([]);
  const [masterTab, setMasterTab] = useState('ledgers'); // 'ledgers' | 'items'

  // Master Creation Form State
  const [newMaster, setNewMaster] = useState({
    name: '',
    group: 'Sundry Debtors',
    balance: '',
    drCr: 'Dr',
    unit: 'Pcs',
    rate: '',
  });

  // Master Alteration State (currently editing record)
  const [editingLedger, setEditingLedger] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchMasterQuery, setSearchMasterQuery] = useState('');

  // Gateway Menu Items Definition with Hotkeys
  const menuItems = useMemo(
    () => [
      // INTELLIGENCE (SIH Problem Statement Solver)
      { section: 'INTELLIGENCE', label: 'Freight & Charter AI', hotkey: 'F', keyChar: 'f', action: 'charter_ai', desc: 'Predictive forecasting, vessel sizing & risk' },
      // MASTERS
      { section: 'MASTERS', label: 'Create', hotkey: 'C', keyChar: 'c', action: 'master_create', desc: 'Masters, Ledgers, Items' },
      { section: 'MASTERS', label: 'Alter', hotkey: 'A', keyChar: 'a', action: 'master_alter', desc: 'Modify existing records' },
      { section: 'MASTERS', label: 'Chart of Accounts', hotkey: 'h', keyChar: 'h', action: 'master_chart', desc: 'Account hierarchy & trees', highlightPos: 1 },
      // TRANSACTIONS
      { section: 'TRANSACTIONS', label: 'Vouchers', hotkey: 'V', keyChar: 'v', action: 'trans_vouchers', desc: 'Sales & Purchase Invoices' },
      { section: 'TRANSACTIONS', label: 'Day Book', hotkey: 'D', keyChar: 'd', action: 'trans_daybook', desc: 'Daily transaction register' },
      { section: 'TRANSACTIONS', label: 'Ledger', hotkey: 'L', keyChar: 'l', action: 'trans_ledger', desc: 'Ledger statement & register' },
      // REPORTS (Banking removed per user instruction)
      { section: 'REPORTS', label: 'Balance Sheet', hotkey: 'B', keyChar: 'b', action: 'rep_balance', desc: 'Assets & Liabilities' },
      { section: 'REPORTS', label: 'Profit & Loss A/c', hotkey: 'P', keyChar: 'p', action: 'rep_pl', desc: 'Income & Expense Statement' },
      { section: 'REPORTS', label: 'Stock Summary', hotkey: 'S', keyChar: 's', action: 'rep_stock', desc: 'Inventory balances & values' },
      { section: 'REPORTS', label: 'Ratio Analysis', hotkey: 'R', keyChar: 'r', action: 'rep_ratio', desc: 'Key performance indicators' },
      // QUIT
      { section: 'QUIT', label: 'Quit', hotkey: 'Q', keyChar: 'q', action: 'quit', desc: 'Exit to company menu' },
    ],
    []
  );

  // Load Company, Vouchers, and Masters from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load user info
      const savedUser = localStorage.getItem('user_info');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCompanyInfo((prev) => ({
            ...prev,
            ...parsed,
            name: parsed.name || prev.name,
            mailingName: parsed.mailingName || parsed.name || prev.mailingName,
          }));
        } catch (e) {
          console.error('Error parsing stored user info', e);
        }
      }

      // Check data version or lot accounting upgrade
      const dataVersion = localStorage.getItem('marinematrice_val_version_v3');
      if (dataVersion !== '3.0') {
        setVouchers(DEFAULT_VOUCHERS);
        localStorage.setItem('marinematrice_vouchers', JSON.stringify(DEFAULT_VOUCHERS));
        setItems(DEFAULT_ITEMS);
        localStorage.setItem('marinematrice_items', JSON.stringify(DEFAULT_ITEMS));
        setLedgers(DEFAULT_LEDGERS);
        localStorage.setItem('marinematrice_ledgers', JSON.stringify(DEFAULT_LEDGERS));
        localStorage.setItem('marinematrice_val_version_v3', '3.0');
      } else {
        // Load vouchers
        const savedVouchers = localStorage.getItem('marinematrice_vouchers');
        if (savedVouchers) {
          try {
            setVouchers(JSON.parse(savedVouchers));
          } catch (e) {
            setVouchers(DEFAULT_VOUCHERS);
          }
        } else {
          setVouchers(DEFAULT_VOUCHERS);
          localStorage.setItem('marinematrice_vouchers', JSON.stringify(DEFAULT_VOUCHERS));
        }

        // Load ledgers
        const savedLedgers = localStorage.getItem('marinematrice_ledgers');
        if (savedLedgers) {
          try {
            const parsedLedgers = JSON.parse(savedLedgers);
            // ensure each ledger has rawBalance & drCr
            const sanitized = parsedLedgers.map((l) => ({
              ...l,
              rawBalance: l.rawBalance !== undefined ? l.rawBalance : parseBalanceAmount(l.balance),
              drCr: l.drCr || (l.balance && l.balance.includes('Cr') ? 'Cr' : 'Dr'),
            }));
            setLedgers(sanitized);
          } catch (e) {
            setLedgers(DEFAULT_LEDGERS);
          }
        } else {
          setLedgers(DEFAULT_LEDGERS);
          localStorage.setItem('marinematrice_ledgers', JSON.stringify(DEFAULT_LEDGERS));
        }

        // Load items
        const savedItems = localStorage.getItem('marinematrice_items');
        if (savedItems) {
          try {
            const parsedItems = JSON.parse(savedItems);
            const sanitizedItems = parsedItems.map((it) => ({
              ...it,
              openingQty: it.openingQty !== undefined ? it.openingQty : parseNumeric(it.stock),
              openingRate: it.openingRate !== undefined ? it.openingRate : parseNumeric(it.rate),
            }));
            setItems(sanitizedItems);
          } catch (e) {
            setItems(DEFAULT_ITEMS);
          }
        } else {
          setItems(DEFAULT_ITEMS);
          localStorage.setItem('marinematrice_items', JSON.stringify(DEFAULT_ITEMS));
        }
      }
    }
  }, []);

  // Update voucher number and default offset account when voucher type changes
  useEffect(() => {
    const prefix = newVoucher.type === 'Purchase' ? 'PUR' : 'INV';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const defaultOffset = newVoucher.type === 'Purchase' ? 'Purchase Accounts' : 'Sales Accounts';

    setNewVoucher((prev) => ({
      ...prev,
      voucherNo: `${prefix}/2026/${randomNum}`,
      account: defaultOffset,
    }));
  }, [newVoucher.type]);

  // Handle action click
  const triggerAction = (action) => {
    if (action === 'quit') {
      setShowQuitModal(true);
    } else {
      if (action === 'trans_vouchers') {
        setNewVoucher(createBlankVoucher('Sales'));
        setShowVoucherAcceptPrompt(false);
      }
      setActiveModal(action);
      setEditingLedger(null);
      setEditingItem(null);
      setSearchMasterQuery('');
    }
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If quit modal is open
      if (showQuitModal) {
        if (e.key === 'y' || e.key === 'Y' || e.key === 'Enter') {
          router.push('/create');
        } else if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
          setShowQuitModal(false);
        }
        return;
      }

      // If any other modal is open
      if (activeModal) {
        if (activeModal === 'rep_stock') return; // Handled separately in handleStockKeys
        if (e.key === 'Escape') {
          if (showVoucherAcceptPrompt) {
            setShowVoucherAcceptPrompt(false);
          } else if (editingLedger) {
            setEditingLedger(null);
          } else if (editingItem) {
            setEditingItem(null);
          } else {
            if (activeModal === 'trans_vouchers') {
              setNewVoucher(createBlankVoucher('Sales'));
            }
            setActiveModal(null);
          }
        }
        return;
      }

      // Hotkey listeners when on Gateway main menu
      const key = e.key.toLowerCase();

      // Navigation arrows
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMenuIndex((prev) => (prev + 1) % menuItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMenuIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerAction(menuItems[menuIndex].action);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowQuitModal(true);
        return;
      }

      // Check letter hotkeys
      const foundItem = menuItems.find((item) => item.keyChar === key);
      if (foundItem) {
        e.preventDefault();
        triggerAction(foundItem.action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuitModal, activeModal, showVoucherAcceptPrompt, editingLedger, editingItem, menuIndex, menuItems, router]);

  // Handle Group Selection change in Master Creation
  const handleGroupChange = (grp) => {
    const isCreditGroup = ['Sundry Creditors', 'Sales Accounts', 'Capital Account', 'Duties & Taxes', 'Direct Incomes'].includes(grp);
    setNewMaster((prev) => ({
      ...prev,
      group: grp,
      drCr: isCreditGroup ? 'Cr' : 'Dr',
    }));
  };

  // Reset demo data with lot-accurate valuation vouchers (20@100 + 30@150)
  const handleResetSampleData = () => {
    if (confirm('Reset to standard maritime ERP dataset with lot-accurate valuation vouchers (20 Bags @ ₹100 + 30 Bags @ ₹150)?')) {
      setVouchers(DEFAULT_VOUCHERS);
      setItems(DEFAULT_ITEMS);
      setLedgers(DEFAULT_LEDGERS);
      if (typeof window !== 'undefined') {
        localStorage.setItem('marinematrice_vouchers', JSON.stringify(DEFAULT_VOUCHERS));
        localStorage.setItem('marinematrice_items', JSON.stringify(DEFAULT_ITEMS));
        localStorage.setItem('marinematrice_ledgers', JSON.stringify(DEFAULT_LEDGERS));
        localStorage.setItem('marinematrice_val_version_v3', '3.0');
      }
      alert('Valuation dataset restored! High-Grade Deep Sea Salt (10kg) is set with 20 Bags @ ₹100 + 30 Bags @ ₹150 = ₹6,500.00.');
    }
  };

  // Save new Master (Ledger or Stock Item)
  const handleSaveMaster = () => {
    if (!newMaster.name || !newMaster.name.trim()) {
      alert('Please provide Master Name');
      return;
    }

    if (masterTab === 'ledgers') {
      const numBal = parseFloat(newMaster.balance) || 0;
      const drCr = newMaster.drCr || (['Sundry Creditors', 'Sales Accounts', 'Capital Account', 'Duties & Taxes'].includes(newMaster.group) ? 'Cr' : 'Dr');
      const formattedBalance = formatBalance(numBal, drCr);

      const created = {
        id: 'l-' + Date.now(),
        name: newMaster.name.trim(),
        group: newMaster.group || 'Sundry Debtors',
        balance: formattedBalance,
        rawBalance: numBal,
        drCr: drCr,
      };

      const updated = [...ledgers, created];
      setLedgers(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('marinematrice_ledgers', JSON.stringify(updated));
      }

      alert(`Ledger "${created.name}" created under ${created.group} with Opening Balance: ${formattedBalance}`);
    } else {
      const balNum = parseFloat(newMaster.balance) || 0;
      const rateNum = parseFloat(newMaster.rate) || 0;
      const created = {
        id: 'i-' + Date.now(),
        name: newMaster.name.trim(),
        group: newMaster.group || 'General Marine Cargo',
        unit: newMaster.unit || 'Pcs',
        rate: rateNum > 0 ? `₹${rateNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
        stock: `${balNum} ${newMaster.unit || 'Pcs'}`,
        openingQty: balNum,
        openingRate: rateNum,
        openingVal: balNum * rateNum,
        lastPurchaseRate: rateNum,
      };
      const updated = [...items, created];
      setItems(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('marinematrice_items', JSON.stringify(updated));
      }
      alert(`Stock Item "${created.name}" created successfully with Opening Stock: ${balNum} ${created.unit} @ ₹${rateNum}.`);
    }

    setNewMaster({ name: '', group: 'Sundry Debtors', balance: '', drCr: 'Dr', unit: 'Pcs', rate: '' });
  };

  // Alter / Update existing Ledger
  const handleUpdateLedger = () => {
    if (!editingLedger || !editingLedger.name.trim()) {
      alert('Ledger name is required.');
      return;
    }

    const numBal = parseFloat(editingLedger.rawBalance) || 0;
    const drCr = editingLedger.drCr || 'Dr';
    const formattedBalance = formatBalance(numBal, drCr);

    const updatedLedger = {
      ...editingLedger,
      name: editingLedger.name.trim(),
      balance: formattedBalance,
      rawBalance: numBal,
      drCr: drCr,
    };

    const updatedList = ledgers.map((l) => (l.id === updatedLedger.id ? updatedLedger : l));
    setLedgers(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marinematrice_ledgers', JSON.stringify(updatedList));
    }

    alert(`Ledger "${updatedLedger.name}" updated successfully with balance ${formattedBalance}.`);
    setEditingLedger(null);
  };

  // Delete existing Ledger
  const handleDeleteLedger = (id) => {
    const toDelete = ledgers.find((l) => l.id === id);
    if (!toDelete) return;

    if (confirm(`Are you sure you want to delete ledger "${toDelete.name}"?`)) {
      const updatedList = ledgers.filter((l) => l.id !== id);
      setLedgers(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('marinematrice_ledgers', JSON.stringify(updatedList));
      }
      setEditingLedger(null);
    }
  };

  // Alter / Update existing Stock Item
  const handleUpdateItem = () => {
    if (!editingItem || !editingItem.name.trim()) {
      alert('Stock item name is required.');
      return;
    }

    const updatedList = items.map((i) => (i.id === editingItem.id ? editingItem : i));
    setItems(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marinematrice_items', JSON.stringify(updatedList));
    }

    alert(`Stock Item "${editingItem.name}" updated successfully.`);
    setEditingItem(null);
  };

  // Delete existing Stock Item
  const handleDeleteItem = (id) => {
    const toDelete = items.find((i) => i.id === id);
    if (!toDelete) return;

    if (confirm(`Are you sure you want to delete item "${toDelete.name}"?`)) {
      const updatedList = items.filter((i) => i.id !== id);
      setItems(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('marinematrice_items', JSON.stringify(updatedList));
      }
      setEditingItem(null);
    }
  };

  // Handle stock item row change in voucher
  const handleItemChange = (index, field, value) => {
    setNewVoucher((prev) => {
      const updatedItems = [...prev.items];
      const itemRow = { ...updatedItems[index] };

      if (field === 'itemName') {
        itemRow.itemName = value;
        // Auto-match existing item for unit & standard rate
        const matched = items.find((it) => it.name.toLowerCase() === value.toLowerCase().trim());
        if (matched) {
          itemRow.unit = matched.unit || itemRow.unit || 'Pcs';
          const rNum = parseFloat(String(matched.rate).replace(/[^0-9.]/g, '')) || 0;
          if (rNum > 0) itemRow.rate = rNum;
        }
      } else if (field === 'quantity') {
        itemRow.quantity = parseFloat(value) || 0;
      } else if (field === 'unit') {
        itemRow.unit = value;
      } else if (field === 'rate') {
        itemRow.rate = parseFloat(value) || 0;
      }

      itemRow.amount = (Number(itemRow.quantity) || 0) * (Number(itemRow.rate) || 0);
      updatedItems[index] = itemRow;

      const calculatedTotal = updatedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
      return {
        ...prev,
        items: updatedItems,
        amount: calculatedTotal,
      };
    });
  };

  // Add new item row to voucher
  const handleAddItemRow = () => {
    setNewVoucher((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemName: '',
          quantity: 1,
          unit: 'Pcs',
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  // Remove item row from voucher
  const handleRemoveItemRow = (index) => {
    setNewVoucher((prev) => {
      if (prev.items.length <= 1) return prev;
      const updatedItems = prev.items.filter((_, idx) => idx !== index);
      const calculatedTotal = updatedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
      return {
        ...prev,
        items: updatedItems,
        amount: calculatedTotal,
      };
    });
  };

  // Save new Voucher (Sales / Purchase)
  const handleSaveVoucher = () => {
    if (!newVoucher.particulars || !newVoucher.particulars.trim()) {
      alert('Please select or enter Particulars / Party A/c.');
      return;
    }

    const validItems = newVoucher.items.filter(
      (it) => it.itemName && Number(it.quantity) > 0 && Number(it.rate) > 0
    );

    if (validItems.length === 0) {
      alert('Please add at least one stock item with valid Quantity and Rate/Price.');
      return;
    }

    const calculatedTotal = validItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);

    const created = {
      id: 'v-' + Date.now(),
      date: newVoucher.date || '06-Sep-2026',
      type: newVoucher.type,
      voucherNo: newVoucher.voucherNo,
      particulars: newVoucher.particulars.trim(),
      account: newVoucher.account || (newVoucher.type === 'Sales' ? 'Sales Accounts' : 'Purchase Accounts'),
      vessel: newVoucher.vessel || (newVoucher.type === 'Sales' ? 'MV Sea Syntax' : 'MT Bengal Star'),
      originPort: newVoucher.originPort || (newVoucher.type === 'Sales' ? 'Visakhapatnam Port (INVTZ)' : 'Kolkata / Haldia Port (INCCU)'),
      destinationPort: newVoucher.destinationPort || (newVoucher.type === 'Sales' ? 'JNPT / Mumbai Port (INBOM)' : 'Visakhapatnam Port (INVTZ)'),
      distanceNM: newVoucher.distanceNM || 0,
      duration: newVoucher.duration || '0 - 1 Day',
      items: validItems,
      amount: calculatedTotal,
      isDebit: newVoucher.type === 'Purchase',
      narration: newVoucher.narration || `${newVoucher.type} Invoice for ${validItems.length} item(s)`,
    };

    const updatedVouchers = [created, ...vouchers];
    setVouchers(updatedVouchers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marinematrice_vouchers', JSON.stringify(updatedVouchers));
    }

    // Dynamically update stock inventory balances & purchase rates!
    let updatedStockItems = [...items];
    validItems.forEach((invItem) => {
      const matchIdx = updatedStockItems.findIndex((it) => it.name.toLowerCase() === invItem.itemName.toLowerCase().trim());
      const changeQty = parseFloat(invItem.quantity) || 0;
      const enteredRate = parseFloat(invItem.rate) || 0;

      if (matchIdx !== -1) {
        const curItem = updatedStockItems[matchIdx];
        const currentQty = parseFloat(String(curItem.stock).replace(/[^0-9.]/g, '')) || 0;
        const newQty = created.type === 'Sales'
          ? Math.max(0, currentQty - changeQty)
          : currentQty + changeQty;
        updatedStockItems[matchIdx] = {
          ...curItem,
          stock: `${newQty} ${invItem.unit || curItem.unit || 'Pcs'}`,
          rate: (created.type === 'Purchase' && enteredRate > 0)
            ? `₹${enteredRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : curItem.rate,
          lastPurchaseRate: (created.type === 'Purchase' && enteredRate > 0) ? enteredRate : curItem.lastPurchaseRate,
          openingRate: curItem.openingRate !== undefined ? curItem.openingRate : parseNumeric(curItem.rate),
          openingQty: curItem.openingQty !== undefined ? curItem.openingQty : currentQty,
        };
      } else if (created.type === 'Purchase') {
        // Automatically create new stock item if purchased
        updatedStockItems.push({
          id: 'i-' + Date.now() + Math.floor(Math.random() * 1000),
          name: invItem.itemName.trim(),
          unit: invItem.unit || 'Pcs',
          group: 'Deep Sea Minerals & Bio-Polymers',
          rate: enteredRate > 0 ? `₹${enteredRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
          stock: `${changeQty} ${invItem.unit || 'Pcs'}`,
          openingQty: 0,
          openingRate: enteredRate,
          openingVal: 0,
          lastPurchaseRate: enteredRate,
        });
      }
    });
    setItems(updatedStockItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marinematrice_items', JSON.stringify(updatedStockItems));
    }

    setShowVoucherAcceptPrompt(false);
    setNewVoucher(createBlankVoucher('Sales'));
    setActiveModal('trans_daybook');
  };

  // Keyboard shortcut listener for authentic 1:1 Stock Summary experience (Backspace, F1, F4, F5, F7, F12, Esc)
  useEffect(() => {
    if (activeModal !== 'rep_stock') return;

    const handleStockKeys = (e) => {
      const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

      // Backspace takes user back to summary from item drilldown (when not typing in an input)
      if (e.key === 'Backspace' && !isInput) {
        if (stockDrilldownItem) {
          e.preventDefault();
          setStockDrilldownItem(null);
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showStockConfig) {
          setShowStockConfig(false);
        } else {
          setActiveModal(null);
        }
        return;
      }

      if (isInput) return;

      if (e.key === 'F1') {
        e.preventDefault();
        setStockViewMode((prev) => (prev === 'condensed' ? 'detailed' : prev === 'detailed' ? 'columnar' : 'condensed'));
      } else if (e.key === 'F4') {
        e.preventDefault();
        const groups = ['All', 'Marine Telemetry & Electronics', 'Deep Sea Minerals & Bio-Polymers', 'Aquaculture Flow Control'];
        setStockGroupFilter((prev) => {
          const nextIdx = (groups.indexOf(prev) + 1) % groups.length;
          return groups[nextIdx];
        });
      } else if (e.key === 'F5') {
        e.preventDefault();
        setStockViewMode((prev) => (prev === 'columnar' ? 'detailed' : 'columnar'));
      } else if (e.key === 'F7') {
        e.preventDefault();
        const methods = ['FIFO', 'Average Cost', 'Last Purchase Cost', 'Standard Cost'];
        setStockValuationMethod((prev) => {
          const nextIdx = (methods.indexOf(prev) + 1) % methods.length;
          return methods[nextIdx];
        });
      } else if (e.key === 'F12') {
        e.preventDefault();
        setShowStockConfig((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleStockKeys);
    return () => window.removeEventListener('keydown', handleStockKeys);
  }, [activeModal, showStockConfig, stockDrilldownItem]);

  // Keyboard shortcut listener for authentic Marine Matrice Voucher experience (F4-F9 & Accept Y/N)
  useEffect(() => {
    if (activeModal !== 'trans_vouchers') return;

    const handleVoucherKeys = (e) => {
      if (e.key === 'F8') {
        e.preventDefault();
        setNewVoucher(createBlankVoucher('Sales'));
      } else if (e.key === 'F9') {
        e.preventDefault();
        setNewVoucher(createBlankVoucher('Purchase'));
      } else if (showVoucherAcceptPrompt) {
        if (e.key === 'y' || e.key === 'Y' || e.key === 'Enter') {
          e.preventDefault();
          handleSaveVoucher();
        } else if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
          e.preventDefault();
          setShowVoucherAcceptPrompt(false);
        }
      }
    };

    window.addEventListener('keydown', handleVoucherKeys);
    return () => window.removeEventListener('keydown', handleVoucherKeys);
  }, [activeModal, showVoucherAcceptPrompt, newVoucher]);

  // Helper to accurately resolve stock valuation and lot/batch accounting
  // Helper to accurately resolve stock valuation and lot/batch accounting
  // Supports FIFO (First-In, First-Out purchase batches), Average Cost, Last Purchase, and Standard Cost
  // Example: If 20 bags purchased for 100 and 30 bags purchased for 150, valuation = (100*20) + (150*30) = 6,500
  const getItemValuationDetails = (item, vouchersList = vouchers, method = stockValuationMethod) => {
    if (!item) {
      return {
        valuation: 0,
        effectiveRate: 0,
        lots: [],
        formulaText: '₹0.00',
        breakdownText: '₹0.00',
        openingQty: 0,
        openingVal: 0,
        inQty: 0,
        inVal: 0,
        outQty: 0,
        outVal: 0,
        allPurchases: [],
      };
    }

    const closingQty = parseNumeric(item.stock);
    const itemNameLower = String(item.name || '').toLowerCase().trim();

    // Sort vouchers in strict chronological order (oldest to newest)
    const chronVouchers = [...(vouchersList || [])].sort((a, b) => {
      const da = Date.parse(a.date) || 0;
      const db = Date.parse(b.date) || 0;
      return da - db;
    });

    const purchases = [];
    let totalInQty = 0;
    let totalInVal = 0;
    let totalOutQty = 0;
    let totalOutVal = 0;

    chronVouchers.forEach((v) => {
      if (Array.isArray(v.items)) {
        v.items.forEach((inv) => {
          if (inv.itemName && inv.itemName.toLowerCase().trim() === itemNameLower) {
            const q = Number(inv.quantity) || 0;
            const r = Number(inv.rate) || 0;
            const amt = Number(inv.amount) || (q * r);
            if (v.type === 'Purchase') {
              purchases.push({
                voucherNo: v.voucherNo || 'Purchase',
                date: v.date || '',
                qty: q,
                rate: r,
                amount: amt,
              });
              totalInQty += q;
              totalInVal += amt;
            } else if (v.type === 'Sales') {
              totalOutQty += q;
              totalOutVal += amt;
            }
          }
        });
      }
    });

    // Opening quantity before recorded vouchers
    const explicitOpeningQty = item.openingQty !== undefined && item.openingQty !== null
      ? Number(item.openingQty)
      : Math.max(0, closingQty - totalInQty + totalOutQty);
    const openingQty = Math.max(0, explicitOpeningQty);
    const initialMasterRate = parseNumeric(item.openingRate !== undefined ? item.openingRate : item.rate);
    const fallbackRate = initialMasterRate > 0
      ? initialMasterRate
      : (purchases.length > 0 ? purchases[0].rate : 0);
    const openingVal = openingQty * fallbackRate;

    if (closingQty <= 0) {
      return {
        valuation: 0,
        effectiveRate: fallbackRate,
        lots: [],
        formulaText: '0 Qty = ₹0.00',
        breakdownText: '0 Qty = ₹0.00',
        allPurchases: purchases,
        openingQty,
        openingVal,
        inQty: totalInQty,
        inVal: totalInVal,
        outQty: totalOutQty,
        outVal: totalOutVal,
      };
    }

    // Build all available inward lots in order
    const availableLots = [];
    if (openingQty > 0) {
      availableLots.push({
        label: 'Opening Stock',
        date: 'B/F',
        qty: openingQty,
        rate: fallbackRate,
        amount: openingVal,
      });
    }
    purchases.forEach((p) => {
      availableLots.push({
        label: p.voucherNo,
        date: p.date,
        qty: p.qty,
        rate: p.rate,
        amount: p.amount,
      });
    });

    // If no inward lots recorded at all, fallback to master rate * closingQty
    if (availableLots.length === 0) {
      const r = parseNumeric(item.rate);
      return {
        valuation: closingQty * r,
        effectiveRate: r,
        lots: [{ label: 'Master Rate', date: 'Master', qty: closingQty, rate: r, amount: closingQty * r }],
        formulaText: `(${r} * ${closingQty}) = ₹${(closingQty * r).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        breakdownText: `${closingQty} ${item.unit || ''} @ ₹${r.toLocaleString('en-IN')}`,
        allPurchases: purchases,
        openingQty,
        openingVal,
        inQty: totalInQty,
        inVal: totalInVal,
        outQty: totalOutQty,
        outVal: totalOutVal,
      };
    }

    // Standard Cost method
    if (method === 'Standard Cost') {
      const stdRate = parseNumeric(item.rate);
      const val = closingQty * stdRate;
      return {
        valuation: val,
        effectiveRate: stdRate,
        lots: [{ label: 'Standard Master Cost', date: 'Standard', qty: closingQty, rate: stdRate, amount: val }],
        formulaText: `(${stdRate} * ${closingQty}) = ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        breakdownText: `${closingQty} ${item.unit || ''} × ₹${stdRate.toFixed(2)} (Standard Cost)`,
        allPurchases: purchases,
        openingQty,
        openingVal,
        inQty: totalInQty,
        inVal: totalInVal,
        outQty: totalOutQty,
        outVal: totalOutVal,
      };
    }

    // Last Purchase Cost method
    if (method === 'Last Purchase Cost') {
      const lastLot = purchases.length > 0 ? purchases[purchases.length - 1] : availableLots[availableLots.length - 1];
      const lastRate = lastLot ? lastLot.rate : fallbackRate;
      const val = closingQty * lastRate;
      return {
        valuation: val,
        effectiveRate: lastRate,
        lots: [{ label: 'Last Purchase Cost', date: lastLot?.date || 'Last', qty: closingQty, rate: lastRate, amount: val }],
        formulaText: `(${lastRate} * ${closingQty}) = ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        breakdownText: `${closingQty} ${item.unit || ''} × ₹${lastRate.toFixed(2)} (Last Cost)`,
        allPurchases: purchases,
        openingQty,
        openingVal,
        inQty: totalInQty,
        inVal: totalInVal,
        outQty: totalOutQty,
        outVal: totalOutVal,
      };
    }

    // Average Cost (Weighted Average Cost)
    if (method === 'Average Cost') {
      const totalAvailQty = openingQty + totalInQty;
      const totalAvailVal = openingVal + totalInVal;
      const avgRate = totalAvailQty > 0 ? (totalAvailVal / totalAvailQty) : fallbackRate;
      const val = closingQty * avgRate;
      return {
        valuation: val,
        effectiveRate: avgRate,
        lots: availableLots,
        formulaText: `(${closingQty} × ₹${avgRate.toFixed(2)}) = ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        breakdownText: `${closingQty} ${item.unit || ''} × ₹${avgRate.toFixed(2)} (Weighted Avg: ₹${totalAvailVal.toLocaleString('en-IN')} / ${totalAvailQty})`,
        allPurchases: purchases,
        openingQty,
        openingVal,
        inQty: totalInQty,
        inVal: totalInVal,
        outQty: totalOutQty,
        outVal: totalOutVal,
      };
    }

    // Default: 'FIFO' (First-In, First-Out / Actual Purchase Lots)
    // Example: If 20 bags purchased for 100 and 30 bags purchased for 150:
    // Valuation is (100 * 20) + (150 * 30) = 6,500
    let salesToDeduct = totalOutQty;
    const remainingLots = [];

    for (const lot of availableLots) {
      if (salesToDeduct >= lot.qty) {
        salesToDeduct -= lot.qty;
      } else {
        const remQty = lot.qty - salesToDeduct;
        salesToDeduct = 0;
        remainingLots.push({
          ...lot,
          qty: remQty,
          amount: remQty * lot.rate,
        });
      }
    }

    const valuation = remainingLots.reduce((s, l) => s + l.amount, 0);
    const totalRemainingQty = remainingLots.reduce((s, l) => s + l.qty, 0);

    if (remainingLots.length === 0 || totalRemainingQty <= 0) {
      const r = fallbackRate;
      return {
        valuation: closingQty * r,
        effectiveRate: r,
        lots: [],
        formulaText: `(${r} * ${closingQty}) = ₹${(closingQty * r).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        breakdownText: `${closingQty} ${item.unit || ''} × ₹${r.toFixed(2)}`,
        allPurchases: purchases,
        openingQty,
        openingVal,
        inQty: totalInQty,
        inVal: totalInVal,
        outQty: totalOutQty,
        outVal: totalOutVal,
      };
    }

    const effectiveRate = totalRemainingQty > 0 ? (valuation / totalRemainingQty) : fallbackRate;

    // Direct arithmetic formula string: (100 * 20) + (150 * 30) = ₹6,500.00
    const formulaParts = remainingLots.map((l) => `(${l.rate} * ${l.qty})`);
    const formulaText = formulaParts.length > 1
      ? `${formulaParts.join(' + ')} = ₹${valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : `(${remainingLots[0]?.rate || 0} * ${remainingLots[0]?.qty || 0}) = ₹${valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    // Detailed breakdown string: e.g. (20 Bags @ ₹100.00) + (30 Bags @ ₹150.00) = ₹6,500.00
    const breakdownParts = remainingLots.map(
      (l) => `(${l.qty} ${item.unit || 'Units'} @ ₹${l.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
    );
    const breakdownText = breakdownParts.length > 1
      ? `${breakdownParts.join(' + ')} = ₹${valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : `${remainingLots[0].qty} ${item.unit || 'Units'} @ ₹${remainingLots[0].rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })} = ₹${valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    return {
      valuation,
      effectiveRate,
      lots: remainingLots,
      formulaText,
      breakdownText,
      allPurchases: purchases,
      openingQty,
      openingVal,
      inQty: totalInQty,
      inVal: totalInVal,
      outQty: totalOutQty,
      outVal: totalOutVal,
    };
  };

  // Helper to resolve effective valuation rate of an item
  const getItemPurchaseRate = (itemName, fallbackRateStr) => {
    const item = items.find((it) => it.name && it.name.toLowerCase().trim() === String(itemName).toLowerCase().trim());
    if (item) {
      return getItemValuationDetails(item, vouchers, stockValuationMethod).effectiveRate;
    }
    return parseNumeric(fallbackRateStr);
  };

  // Dynamic accurate stock valuation across all inventory items
  const totalStockValuation = useMemo(() => {
    return items.reduce((acc, it) => {
      const details = getItemValuationDetails(it, vouchers, stockValuationMethod);
      return acc + (details.valuation || 0);
    }, 0);
  }, [items, vouchers, stockValuationMethod]);

  // Vouchers state



  // Delete Voucher
  const handleDeleteVoucher = (id) => {
    const updated = vouchers.filter((v) => v.id !== id);
    setVouchers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marinematrice_vouchers', JSON.stringify(updated));
    }
  };

  // Filtered Daybook entries
  const filteredVouchers = vouchers.filter((v) => {
    if (voucherFilter === 'All') return true;
    return v.type.toLowerCase() === voucherFilter.toLowerCase();
  });

  // Calculate totals
  const totalDebit = filteredVouchers
    .filter((v) => v.isDebit)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalCredit = filteredVouchers
    .filter((v) => !v.isDebit)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Dynamic calculations for Financial Reports
  const debtorsList = ledgers.filter((l) => l.group === 'Sundry Debtors');
  const creditorsList = ledgers.filter((l) => l.group === 'Sundry Creditors');
  const bankList = ledgers.filter((l) => l.group === 'Bank Accounts');
  const cashList = ledgers.filter((l) => l.group === 'Cash-in-Hand');

  const totalDebtorsBalance = debtorsList.reduce((acc, l) => acc + parseBalanceAmount(l.balance, l.rawBalance), 0);
  const totalCreditorsBalance = creditorsList.reduce((acc, l) => acc + parseBalanceAmount(l.balance, l.rawBalance), 0);
  const totalBankBalance = bankList.reduce((acc, l) => acc + parseBalanceAmount(l.balance, l.rawBalance), 0);
  const totalCashBalance = cashList.reduce((acc, l) => acc + parseBalanceAmount(l.balance, l.rawBalance), 0);

  // Filtered lists for Alteration view
  const filteredLedgersForAlter = ledgers.filter((l) => {
    if (!searchMasterQuery) return true;
    const q = searchMasterQuery.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.group.toLowerCase().includes(q);
  });

  const filteredItemsForAlter = items.filter((i) => {
    if (!searchMasterQuery) return true;
    const q = searchMasterQuery.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.unit.toLowerCase().includes(q);
  });

  // Resolve base port for a given ledger
  const getLedgerPort = (ledgerName, fallback = 'Visakhapatnam Port (INVTZ)') => {
    if (!ledgerName) return fallback;
    const match = ledgers.find((l) => l.name.toLowerCase().trim() === String(ledgerName).toLowerCase().trim());
    if (match && match.port) return match.port;
    const lower = String(ledgerName).toLowerCase();
    if (lower.includes('oceanic')) return 'JNPT / Mumbai Port (INBOM)';
    if (lower.includes('harbor')) return 'Kolkata / Haldia Port (INCCU)';
    if (lower.includes('pacific')) return 'Port of Singapore (SGSIN)';
    if (lower.includes('freight') || lower.includes('port')) return 'Chennai Port (INMAA)';
    return fallback;
  };

  // Handlers for automatic port, distance, and duration calculation when ledgers change
  const handleParticularsChange = (val) => {
    const partyPort = getLedgerPort(val);
    const origin = newVoucher.type === 'Sales' ? (newVoucher.originPort || 'Visakhapatnam Port (INVTZ)') : partyPort;
    const destination = newVoucher.type === 'Sales' ? partyPort : (newVoucher.destinationPort || 'Visakhapatnam Port (INVTZ)');
    const dist = calculatePortDistance(origin, destination);
    const dur = calculateVoyageDuration(dist);

    setNewVoucher((prev) => ({
      ...prev,
      particulars: val,
      originPort: origin,
      destinationPort: destination,
      distanceNM: dist,
      duration: dur,
    }));
  };

  const handleAccountChange = (val) => {
    const accPort = getLedgerPort(val, 'Visakhapatnam Port (INVTZ)');
    const origin = newVoucher.type === 'Sales' ? accPort : newVoucher.originPort;
    const destination = newVoucher.type === 'Sales' ? newVoucher.destinationPort : accPort;
    const dist = calculatePortDistance(origin, destination);
    const dur = calculateVoyageDuration(dist);

    setNewVoucher((prev) => ({
      ...prev,
      account: val,
      originPort: origin,
      destinationPort: destination,
      distanceNM: dist,
      duration: dur,
    }));
  };

  const handleOriginPortChange = (val) => {
    const dist = calculatePortDistance(val, newVoucher.destinationPort);
    const dur = calculateVoyageDuration(dist);
    setNewVoucher((prev) => ({
      ...prev,
      originPort: val,
      distanceNM: dist,
      duration: dur,
    }));
  };

  const handleDestinationPortChange = (val) => {
    const dist = calculatePortDistance(newVoucher.originPort, val);
    const dur = calculateVoyageDuration(dist);
    setNewVoucher((prev) => ({
      ...prev,
      destinationPort: val,
      distanceNM: dist,
      duration: dur,
    }));
  };

  // Selected party balance for Voucher entry screen
  const selectedPartyLedger = ledgers.find((l) => l.name === newVoucher.particulars);

  // Calculations for TRANSACTIONS -> Ledger Statement Screen
  const activeLedgerObj = ledgers.find((l) => l.name === (selectedLedgerName || ledgers[0]?.name)) || ledgers[0] || null;
  const activeLedgerName = activeLedgerObj ? activeLedgerObj.name : '';

  const opRawBalance = activeLedgerObj ? parseBalanceAmount(activeLedgerObj.balance, activeLedgerObj.rawBalance) : 0;
  const opDrCr = activeLedgerObj?.drCr || (activeLedgerObj?.balance?.includes('Cr') ? 'Cr' : 'Dr');

  const relevantLedgerVouchers = activeLedgerName
    ? vouchers.filter((v) => v.particulars === activeLedgerName || v.account === activeLedgerName)
    : [];

  let ledgerRunningDr = opDrCr === 'Dr' ? opRawBalance : -opRawBalance;
  let totalLedgerDebit = 0;
  let totalLedgerCredit = 0;

  const ledgerStatementEntries = relevantLedgerVouchers.map((v) => {
    let debit = 0;
    let credit = 0;
    let opposingAccount = '';

    if (v.particulars === activeLedgerName) {
      if (v.type === 'Sales') {
        debit = Number(v.amount) || 0;
        opposingAccount = v.account || 'Sales Accounts';
      } else if (v.type === 'Purchase') {
        credit = Number(v.amount) || 0;
        opposingAccount = v.account || 'Purchase Accounts';
      } else {
        if (v.isDebit) debit = Number(v.amount) || 0;
        else credit = Number(v.amount) || 0;
        opposingAccount = v.account || 'General Account';
      }
    } else if (v.account === activeLedgerName) {
      opposingAccount = v.particulars;
      if (v.type === 'Sales') {
        credit = Number(v.amount) || 0;
      } else if (v.type === 'Purchase') {
        debit = Number(v.amount) || 0;
      } else {
        if (v.isDebit) credit = Number(v.amount) || 0;
        else debit = Number(v.amount) || 0;
      }
    }

    totalLedgerDebit += debit;
    totalLedgerCredit += credit;
    ledgerRunningDr = ledgerRunningDr + debit - credit;

    return {
      ...v,
      opposingAccount,
      debit,
      credit,
      runningBalanceStr: formatBalance(Math.abs(ledgerRunningDr), ledgerRunningDr >= 0 ? 'Dr' : 'Cr'),
    };
  });

  const closingNetDr = (opDrCr === 'Dr' ? opRawBalance : -opRawBalance) + totalLedgerDebit - totalLedgerCredit;

  // Grouped Menu Sections
  const groupedSections = ['INTELLIGENCE', 'MASTERS', 'TRANSACTIONS', 'REPORTS', 'QUIT'];

  return (
    <div className="marine-gateway-viewport">
      {/* Top Marine Matrice Function Keys Bar */}
      <div className="marine-fkey-ribbon">
        <span className="marine-badge" style={{ marginRight: 6 }}>Marine Matrice</span>
        <button
          className="marine-fkey-item"
          onClick={() => triggerAction('charter_ai')}
          style={{ background: 'rgba(0, 240, 255, 0.15)', borderColor: '#00f0ff', color: '#00f0ff', fontWeight: 800 }}
          title="F4 / Alt+F: Freight & Charter Intelligence"
        >
          <span className="marine-fkey-badge" style={{ background: '#00f0ff', color: '#000' }}>AI:</span> Freight & Charter AI
        </button>
        <button
          className="marine-fkey-item"
          onClick={() => router.push('/create')}
          title="F1: Select Company"
        >
          <span className="marine-fkey-badge">F1:</span> Select Comp
        </button>
        <button
          className="marine-fkey-item"
          onClick={() => alert(`Current Period: 1-Apr-2026 to 31-Mar-2027\nDate: 06-Sep-2026`)}
          title="F2: Date / Period"
        >
          <span className="marine-fkey-badge">F2:</span> Date
        </button>
        <button
          className="marine-fkey-item"
          onClick={() => router.push('/create')}
          title="F3: Company Settings"
        >
          <span className="marine-fkey-badge">F3:</span> Company
        </button>
        <button
          className="marine-fkey-item"
          onClick={() => triggerAction('trans_vouchers')}
          title="Vouchers Entry"
        >
          <span className="marine-fkey-badge">Alt+V:</span> Vouchers
        </button>
        <button
          className="marine-fkey-item"
          onClick={() => triggerAction('trans_daybook')}
          title="Day Book"
        >
          <span className="marine-fkey-badge">Alt+D:</span> Day Book
        </button>
        <button
          className="marine-fkey-item"
          onClick={() => triggerAction('trans_ledger')}
          title="Ledger Statement"
        >
          <span className="marine-fkey-badge">Alt+L:</span> Ledger
        </button>
        <button
          className="marine-fkey-item"
          onClick={() => setShowQuitModal(true)}
          style={{ marginLeft: 'auto', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
        >
          <span className="marine-fkey-badge" style={{ color: '#f87171' }}>Esc:</span> Quit
        </button>
      </div>

      {/* Main Split Gateway Area */}
      <div className="marine-gateway-split">
        {/* Left Side: Current Period, Date & Company Details */}
        <aside className="marine-gateway-left">
          {/* Current Period Block */}
          <div className="marine-info-block">
            <div className="marine-info-header">
              <span>Current Period</span>
              <span style={{ color: '#94a3b8' }}>FY 2026-27</span>
            </div>
            <div className="marine-info-body">
              <div className="marine-info-row">
                <span className="marine-info-lbl">From:</span>
                <span className="marine-info-val highlight">1-Apr-2026</span>
              </div>
              <div className="marine-info-row">
                <span className="marine-info-lbl">To:</span>
                <span className="marine-info-val highlight">31-Mar-2027</span>
              </div>
            </div>
          </div>

          {/* Current Date Block */}
          <div className="marine-info-block">
            <div className="marine-info-header">
              <span>Current Date</span>
              <span style={{ color: '#38bdf8' }}>Active Session</span>
            </div>
            <div className="marine-info-body">
              <div className="marine-info-row">
                <span className="marine-info-lbl">Date:</span>
                <span className="marine-info-val">Sunday, 6-Sep-2026</span>
              </div>
              <div className="marine-info-row">
                <span className="marine-info-lbl">Last Voucher Date:</span>
                <span className="marine-info-val" style={{ color: '#4ade80' }}>
                  {vouchers.length > 0 ? vouchers[0].date : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Company Details Block (No summary badges as requested) */}
          <div className="marine-info-block" style={{ flex: 1 }}>
            <div className="marine-info-header">
              <span>Selected Company</span>
              <span className="marine-badge">Active</span>
            </div>
            <div className="marine-info-body">
              <div className="marine-info-row">
                <span className="marine-info-lbl">Company Name:</span>
                <span className="marine-info-val highlight" style={{ fontSize: '0.92rem' }}>
                  {companyInfo.name}
                </span>
              </div>
              {companyInfo.mailingName && (
                <div className="marine-info-row">
                  <span className="marine-info-lbl">Mailing Name:</span>
                  <span className="marine-info-val">{companyInfo.mailingName}</span>
                </div>
              )}
              <div className="marine-info-row">
                <span className="marine-info-lbl">GSTIN:</span>
                <span className="marine-info-val" style={{ color: '#38bdf8' }}>
                  {companyInfo.gst || 'Not Specified'}
                </span>
              </div>
              <div className="marine-info-row">
                <span className="marine-info-lbl">IEC Lic No:</span>
                <span className="marine-info-val">{companyInfo.IEC || 'Not Specified'}</span>
              </div>
              <div className="marine-info-row">
                <span className="marine-info-lbl">State:</span>
                <span className="marine-info-val">{companyInfo.state || 'Andhra Pradesh'}</span>
              </div>
              <div className="marine-info-row">
                <span className="marine-info-lbl">Address:</span>
                <span className="marine-info-val" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {companyInfo.address}
                </span>
              </div>
              <div className="marine-info-row">
                <span className="marine-info-lbl">Contact Phone:</span>
                <span className="marine-info-val">{companyInfo.phone}</span>
              </div>
              <div className="marine-info-row">
                <span className="marine-info-lbl">Books Beginning:</span>
                <span className="marine-info-val">1-Apr-2026</span>
              </div>
            </div>
          </div>

          {/* Switch Company Action */}
          <button
            onClick={() => router.push('/create')}
            className="marine-btn-secondary"
          >
            ⇆ Switch / Alter Company Record
          </button>
        </aside>

        {/* Right Side: The Iconic Gateway of Marine Matrice Menu Card */}
        <main className="marine-gateway-right">
          <div className="marine-gateway-card">
            {/* Header */}
            <div className="marine-gateway-card-header">
              <div className="marine-gateway-title">Gateway of Marine Matrice</div>
              <div className="marine-gateway-subtitle">{companyInfo.name}</div>
            </div>

            {/* Menu Sections */}
            <div className="marine-gateway-menu-list">
              {groupedSections.map((secName) => {
                const secItems = menuItems.filter((m) => m.section === secName);
                if (!secItems.length) return null;

                return (
                  <div key={secName} className="marine-gateway-section-group">
                    <div className="marine-menu-section-header">{secName}</div>
                    {secItems.map((item) => {
                      const itemOverallIndex = menuItems.findIndex((m) => m.label === item.label);
                      const isSelected = menuIndex === itemOverallIndex;

                      // Format label with underlined hotkey
                      const label = item.label;
                      const hotkeyChar = item.hotkey;
                      const hPos = item.highlightPos !== undefined ? item.highlightPos : label.indexOf(hotkeyChar);

                      return (
                        <div
                          key={item.label}
                          className={`marine-menu-item ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setMenuIndex(itemOverallIndex);
                            triggerAction(item.action);
                          }}
                          onMouseEnter={() => setMenuIndex(itemOverallIndex)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>
                              {hPos > 0 && label.substring(0, hPos)}
                              <span className="marine-hotkey">
                                {label.charAt(hPos !== -1 ? hPos : 0)}
                              </span>
                              {label.substring((hPos !== -1 ? hPos : 0) + 1)}
                            </span>
                            <span className="marine-menu-desc">({item.desc})</span>
                          </div>
                          <span className="marine-menu-arrow">▶</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Hint bar at bottom */}
            <div className="marine-gateway-footer-hint">
              <span>Use ↑ ↓ to navigate, Enter to select</span>
              <span style={{ color: '#38bdf8' }}>Or Press Highlighted Key</span>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================
          MODALS & SUB-SCREENS
         ========================================================= */}

      {/* 0. FREIGHT & CHARTER AI INTELLIGENCE WORKSTATION (SIH CORE REQUIREMENT) */}
      {activeModal === 'charter_ai' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            style={{ width: '96%', maxWidth: 1400, margin: '20px auto', maxHeight: '94vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <CharterIntelligencePanel
              companyInfo={companyInfo}
              onClose={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* 1. MASTERS: CREATE MODAL */}
      {activeModal === 'master_create' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Master Creation</span>
                <span>Marine Matrice Accounting & Inventory Masters</span>
              </div>
              <button className="marine-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="marine-voucher-bar">
              <button
                className={`marine-voucher-btn ${masterTab === 'ledgers' ? 'active' : ''}`}
                onClick={() => setMasterTab('ledgers')}
              >
                1. Ledger Master
              </button>
              <button
                className={`marine-voucher-btn ${masterTab === 'items' ? 'active' : ''}`}
                onClick={() => setMasterTab('items')}
              >
                2. Stock Item Master
              </button>
            </div>

            <div className="marine-modal-content">
              {masterTab === 'ledgers' ? (
                <div>
                  <div className="marine-row">
                    <span className="marine-lbl">Ledger Name</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="text"
                        className="marine-field"
                        placeholder="e.g. Coastline Trading Co. (Debtor/Creditor)"
                        value={newMaster.name}
                        onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="marine-row">
                    <span className="marine-lbl">Under (Group)</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <select
                        className="marine-field marine-select"
                        value={newMaster.group}
                        onChange={(e) => handleGroupChange(e.target.value)}
                      >
                        <option value="Sundry Debtors">Sundry Debtors (Customers - Dr)</option>
                        <option value="Sundry Creditors">Sundry Creditors (Suppliers - Cr)</option>
                        <option value="Sales Accounts">Sales Accounts</option>
                        <option value="Purchase Accounts">Purchase Accounts</option>
                        <option value="Bank Accounts">Bank Accounts</option>
                        <option value="Cash-in-Hand">Cash-in-Hand</option>
                        <option value="Duties & Taxes">Duties & Taxes (GST)</option>
                        <option value="Direct Incomes">Direct Incomes</option>
                        <option value="Direct Expenses">Direct Expenses</option>
                        <option value="Indirect Expenses">Indirect Expenses</option>
                        <option value="Capital Account">Capital Account</option>
                      </select>
                    </div>
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Base Maritime Port</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <select
                        className="marine-field marine-select"
                        value={newMaster.port || 'Visakhapatnam Port (INVTZ)'}
                        onChange={(e) => setNewMaster({ ...newMaster, port: e.target.value })}
                      >
                        {MARITIME_PORTS.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name} ({p.country})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="marine-row">
                    <span className="marine-lbl">Opening Balance</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap" style={{ display: 'flex' }}>
                      <span className="marine-prefix">₹</span>
                      <input
                        type="number"
                        className="marine-field marine-mobile-input"
                        placeholder="0.00"
                        value={newMaster.balance}
                        onChange={(e) => setNewMaster({ ...newMaster, balance: e.target.value })}
                        style={{ borderRight: 'none' }}
                      />
                      <select
                        className="marine-field marine-select marine-dr-cr-select"
                        value={newMaster.drCr}
                        onChange={(e) => setNewMaster({ ...newMaster, drCr: e.target.value })}
                        title="Debit (Dr) or Credit (Cr)"
                      >
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ paddingLeft: 195, fontSize: '0.8rem', color: '#64748b', marginTop: -4 }}>
                    Default nature for <strong>{newMaster.group}</strong> is <strong>{newMaster.drCr}</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="marine-row">
                    <span className="marine-lbl">Stock Item Name</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="text"
                        className="marine-field"
                        placeholder="e.g. Marine Telemetry Sensor"
                        value={newMaster.name}
                        onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="marine-row">
                    <span className="marine-lbl">Units of Measure</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <select
                        className="marine-field marine-select"
                        value={newMaster.unit}
                        onChange={(e) => setNewMaster({ ...newMaster, unit: e.target.value })}
                      >
                        <option value="Pcs">Pcs (Pieces)</option>
                        <option value="Bags">Bags</option>
                        <option value="Drums">Drums</option>
                        <option value="Kgs">Kgs (Kilograms)</option>
                        <option value="Tons">Tons (Metric Tons)</option>
                        <option value="Sets">Sets</option>
                      </select>
                    </div>
                  </div>
                  <div className="marine-row">
                    <span className="marine-lbl">Standard Rate (₹)</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="number"
                        className="marine-field"
                        placeholder="e.g. 3500"
                        value={newMaster.rate}
                        onChange={(e) => setNewMaster({ ...newMaster, rate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="marine-row">
                    <span className="marine-lbl">Opening Quantity</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="number"
                        className="marine-field"
                        placeholder="0"
                        value={newMaster.balance}
                        onChange={(e) => setNewMaster({ ...newMaster, balance: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="marine-footer-bar">
              <span className="marine-hint">Press Save Master to record in Marine Matrice database</span>
              <button className="marine-btn-proceed" onClick={handleSaveMaster}>
                Save Master (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MASTERS: ALTER / VIEW MASTER LIST MODAL */}
      {activeModal === 'master_alter' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Master Alteration</span>
                <span>
                  {editingLedger
                    ? `Alter Ledger: ${editingLedger.name}`
                    : editingItem
                      ? `Alter Stock Item: ${editingItem.name}`
                      : `List of Masters in ${companyInfo.name}`}
                </span>
              </div>
              <button
                className="marine-modal-close-btn"
                onClick={() => {
                  if (editingLedger) setEditingLedger(null);
                  else if (editingItem) setEditingItem(null);
                  else setActiveModal(null);
                }}
              >
                Esc: {editingLedger || editingItem ? 'Back to List' : 'Close'}
              </button>
            </div>

            {!editingLedger && !editingItem && (
              <div className="marine-voucher-bar">
                <button
                  className={`marine-voucher-btn ${masterTab === 'ledgers' ? 'active' : ''}`}
                  onClick={() => setMasterTab('ledgers')}
                >
                  Ledgers ({ledgers.length})
                </button>
                <button
                  className={`marine-voucher-btn ${masterTab === 'items' ? 'active' : ''}`}
                  onClick={() => setMasterTab('items')}
                >
                  Stock Items ({items.length})
                </button>
              </div>
            )}

            <div className="marine-modal-content" style={{ maxHeight: 460 }}>
              {/* EDITING LEDGER FORM */}
              {editingLedger ? (
                <div>
                  <div style={{ marginBottom: 16, color: '#38bdf8', fontSize: '0.88rem', fontWeight: 700 }}>
                    ✎ Modify Ledger Account Details & Opening Balance:
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Ledger Name</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="text"
                        className="marine-field"
                        value={editingLedger.name}
                        onChange={(e) => setEditingLedger({ ...editingLedger, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Under (Group)</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <select
                        className="marine-field marine-select"
                        value={editingLedger.group}
                        onChange={(e) => {
                          const grp = e.target.value;
                          const isCr = ['Sundry Creditors', 'Sales Accounts', 'Capital Account', 'Duties & Taxes', 'Direct Incomes'].includes(grp);
                          setEditingLedger({
                            ...editingLedger,
                            group: grp,
                            drCr: isCr ? 'Cr' : 'Dr',
                          });
                        }}
                      >
                        <option value="Sundry Debtors">Sundry Debtors (Customers - Dr)</option>
                        <option value="Sundry Creditors">Sundry Creditors (Suppliers - Cr)</option>
                        <option value="Sales Accounts">Sales Accounts</option>
                        <option value="Purchase Accounts">Purchase Accounts</option>
                        <option value="Bank Accounts">Bank Accounts</option>
                        <option value="Cash-in-Hand">Cash-in-Hand</option>
                        <option value="Duties & Taxes">Duties & Taxes (GST)</option>
                        <option value="Direct Incomes">Direct Incomes</option>
                        <option value="Direct Expenses">Direct Expenses</option>
                        <option value="Indirect Expenses">Indirect Expenses</option>
                        <option value="Capital Account">Capital Account</option>
                      </select>
                    </div>
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Base Maritime Port</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <select
                        className="marine-field marine-select"
                        value={editingLedger.port || 'Visakhapatnam Port (INVTZ)'}
                        onChange={(e) => setEditingLedger({ ...editingLedger, port: e.target.value })}
                      >
                        {MARITIME_PORTS.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name} ({p.country})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Opening Balance</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap" style={{ display: 'flex' }}>
                      <span className="marine-prefix">₹</span>
                      <input
                        type="number"
                        className="marine-field marine-mobile-input"
                        placeholder="0.00"
                        value={editingLedger.rawBalance !== undefined ? editingLedger.rawBalance : parseBalanceAmount(editingLedger.balance)}
                        onChange={(e) => setEditingLedger({ ...editingLedger, rawBalance: e.target.value })}
                        style={{ borderRight: 'none' }}
                      />
                      <select
                        className="marine-field marine-select marine-dr-cr-select"
                        value={editingLedger.drCr || 'Dr'}
                        onChange={(e) => setEditingLedger({ ...editingLedger, drCr: e.target.value })}
                      >
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      className="marine-btn-secondary"
                      onClick={() => setEditingLedger(null)}
                    >
                      Cancel (Esc)
                    </button>
                    <button
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        padding: '8px 16px',
                        fontFamily: 'inherit',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 3,
                      }}
                      onClick={() => handleDeleteLedger(editingLedger.id)}
                    >
                      Delete Ledger (Del)
                    </button>
                    <button
                      className="marine-btn-proceed"
                      onClick={handleUpdateLedger}
                    >
                      Accept / Save Alteration (Enter)
                    </button>
                  </div>
                </div>
              ) : editingItem ? (
                /* EDITING ITEM FORM */
                <div>
                  <div style={{ marginBottom: 16, color: '#38bdf8', fontSize: '0.88rem', fontWeight: 700 }}>
                    ✎ Modify Stock Item Details & Rates:
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Item Name</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="text"
                        className="marine-field"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Units of Measure</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <select
                        className="marine-field marine-select"
                        value={editingItem.unit}
                        onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                      >
                        <option value="Pcs">Pcs (Pieces)</option>
                        <option value="Bags">Bags</option>
                        <option value="Drums">Drums</option>
                        <option value="Kgs">Kgs (Kilograms)</option>
                        <option value="Tons">Tons (Metric Tons)</option>
                        <option value="Sets">Sets</option>
                      </select>
                    </div>
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Standard Rate</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="text"
                        className="marine-field"
                        value={editingItem.rate}
                        onChange={(e) => setEditingItem({ ...editingItem, rate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="marine-row">
                    <span className="marine-lbl">Closing Stock</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="text"
                        className="marine-field"
                        value={editingItem.stock}
                        onChange={(e) => setEditingItem({ ...editingItem, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      className="marine-btn-secondary"
                      onClick={() => setEditingItem(null)}
                    >
                      Cancel (Esc)
                    </button>
                    <button
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        padding: '8px 16px',
                        fontFamily: 'inherit',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 3,
                      }}
                      onClick={() => handleDeleteItem(editingItem.id)}
                    >
                      Delete Item
                    </button>
                    <button
                      className="marine-btn-proceed"
                      onClick={handleUpdateItem}
                    >
                      Accept / Save (Enter)
                    </button>
                  </div>
                </div>
              ) : (
                /* MASTER LIST VIEW */
                <div>
                  <input
                    type="text"
                    className="marine-search-bar"
                    placeholder={`Type to filter ${masterTab === 'ledgers' ? 'ledgers (e.g. Debtor, Creditor, SBI)' : 'items'}...`}
                    value={searchMasterQuery}
                    onChange={(e) => setSearchMasterQuery(e.target.value)}
                  />

                  {masterTab === 'ledgers' ? (
                    <table className="marine-table">
                      <thead>
                        <tr>
                          <th>Ledger Name</th>
                          <th>Primary Group</th>
                          <th style={{ textAlign: 'right' }}>Closing Balance</th>
                          <th style={{ textAlign: 'center', width: 120 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLedgersForAlter.map((l) => (
                          <tr
                            key={l.id}
                            className="marine-table-row"
                            onClick={() =>
                              setEditingLedger({
                                ...l,
                                rawBalance: l.rawBalance !== undefined ? l.rawBalance : parseBalanceAmount(l.balance),
                                drCr: l.drCr || (l.balance && l.balance.includes('Cr') ? 'Cr' : 'Dr'),
                              })
                            }
                            title="Click to alter ledger"
                          >
                            <td className="marine-td-name">
                              <strong>{l.name}</strong>
                            </td>
                            <td style={{ color: '#38bdf8' }}>{l.group}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b' }}>
                              {l.balance}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="marine-alter-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingLedger({
                                    ...l,
                                    rawBalance: l.rawBalance !== undefined ? l.rawBalance : parseBalanceAmount(l.balance),
                                    drCr: l.drCr || (l.balance && l.balance.includes('Cr') ? 'Cr' : 'Dr'),
                                  });
                                }}
                              >
                                ✎ Alter
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="marine-table">
                      <thead>
                        <tr>
                          <th>Stock Item</th>
                          <th>UoM</th>
                          <th>Standard Rate</th>
                          <th style={{ textAlign: 'right' }}>Closing Stock</th>
                          <th style={{ textAlign: 'center', width: 120 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItemsForAlter.map((i) => (
                          <tr
                            key={i.id}
                            className="marine-table-row"
                            onClick={() => setEditingItem({ ...i })}
                            title="Click to alter stock item"
                          >
                            <td className="marine-td-name">
                              <strong>{i.name}</strong>
                            </td>
                            <td style={{ color: '#38bdf8' }}>{i.unit}</td>
                            <td>{i.rate}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#4ade80' }}>
                              {i.stock}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="marine-alter-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem({ ...i });
                                }}
                              >
                                ✎ Alter
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {!editingLedger && !editingItem && (
              <div className="marine-footer-bar">
                <span className="marine-hint">Click on any row or click [Alter] to edit Opening Balance or Group</span>
                <button
                  className="marine-btn-secondary"
                  onClick={() => setActiveModal('master_create')}
                >
                  + Create New Master
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MASTERS: CHART OF ACCOUNTS TREE (DYNAMICALLY POPULATED) */}
      {activeModal === 'master_chart' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Chart of Accounts</span>
                <span>Accounting Tree Hierarchy</span>
              </div>
              <button className="marine-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="marine-modal-content" style={{ maxHeight: 460 }}>
              {/* CURRENT ASSETS & BANK */}
              <div className="marine-tree-group">
                <div className="marine-tree-header">
                  <span>1. CURRENT ASSETS & BANK (DEBIT NATURE)</span>
                  <span style={{ color: '#4ade80' }}>₹{(totalBankBalance + totalCashBalance + totalDebtorsBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Dr</span>
                </div>
                {bankList.map((b) => (
                  <div key={b.id} className="marine-tree-item">
                    <span>• {b.name} (Bank Account)</span>
                    <span style={{ color: '#f59e0b' }}>{b.balance}</span>
                  </div>
                ))}
                {cashList.map((c) => (
                  <div key={c.id} className="marine-tree-item">
                    <span>• {c.name} (Cash-in-Hand)</span>
                    <span style={{ color: '#f59e0b' }}>{c.balance}</span>
                  </div>
                ))}
                {debtorsList.map((d) => (
                  <div key={d.id} className="marine-tree-item">
                    <span>• {d.name} <span style={{ color: '#38bdf8' }}>(Sundry Debtor)</span></span>
                    <span style={{ color: '#f59e0b' }}>{d.balance}</span>
                  </div>
                ))}
              </div>

              {/* CURRENT LIABILITIES & CREDITORS */}
              <div className="marine-tree-group">
                <div className="marine-tree-header">
                  <span>2. CURRENT LIABILITIES (CREDIT NATURE)</span>
                  <span style={{ color: '#f87171' }}>₹{totalCreditorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr</span>
                </div>
                {creditorsList.map((c) => (
                  <div key={c.id} className="marine-tree-item">
                    <span>• {c.name} <span style={{ color: '#38bdf8' }}>(Sundry Creditor)</span></span>
                    <span style={{ color: '#f87171' }}>{c.balance}</span>
                  </div>
                ))}
                {ledgers.filter((l) => l.group === 'Duties & Taxes').map((dt) => (
                  <div key={dt.id} className="marine-tree-item">
                    <span>• {dt.name} (Duties & Taxes)</span>
                    <span style={{ color: '#f87171' }}>{dt.balance}</span>
                  </div>
                ))}
              </div>

              {/* REVENUE & INCOMES */}
              <div className="marine-tree-group">
                <div className="marine-tree-header">
                  <span>3. REVENUE & INCOME</span>
                  <span style={{ color: '#38bdf8' }}>Credit Nature</span>
                </div>
                {ledgers.filter((l) => l.group === 'Sales Accounts' || l.group === 'Direct Incomes').map((s) => (
                  <div key={s.id} className="marine-tree-item">
                    <span>• {s.name} ({s.group})</span>
                    <span style={{ color: '#38bdf8' }}>{s.balance}</span>
                  </div>
                ))}
              </div>

              {/* EXPENSES */}
              <div className="marine-tree-group">
                <div className="marine-tree-header">
                  <span>4. EXPENSES (DIRECT & INDIRECT)</span>
                  <span style={{ color: '#c084fc' }}>Debit Nature</span>
                </div>
                {ledgers.filter((l) => l.group === 'Direct Expenses' || l.group === 'Indirect Expenses' || l.group === 'Purchase Accounts').map((e) => (
                  <div key={e.id} className="marine-tree-item">
                    <span>• {e.name} ({e.group})</span>
                    <span style={{ color: '#c084fc' }}>{e.balance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="marine-footer-bar">
              <span className="marine-hint">Dynamic real-time tree reflecting all created Debtors, Creditors, and Bank accounts</span>
              <button className="marine-btn-secondary" onClick={() => setActiveModal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRANSACTIONS: RECORD VOUCHER SCREEN (EXCLUSIVE SALES & PURCHASE — AUTHENTIC MARINE MATRICE EXPERIENCE) */}
      {activeModal === 'trans_vouchers' && (
        <div
          className="marine-modal-backdrop"
          onClick={() => {
            setNewVoucher(createBlankVoucher('Sales'));
            setShowVoucherAcceptPrompt(false);
            setActiveModal(null);
          }}
        >
          <div className="marine-modal-box" style={{ maxWidth: 960 }} onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">{newVoucher.type}</span>
                <span>Accounting Voucher Creation ({newVoucher.type === 'Sales' ? 'Tax / Sales Invoice' : 'Inward Purchase Invoice'})</span>
              </div>
              <button
                className="marine-modal-close-btn"
                onClick={() => {
                  setNewVoucher(createBlankVoucher('Sales'));
                  setShowVoucherAcceptPrompt(false);
                  setActiveModal(null);
                }}
              >
                Esc: Close
              </button>
            </div>

            {/* Exclusive Sales & Purchase Selector Bar */}
            <div className="marine-voucher-bar">
              <button
                type="button"
                className={`marine-voucher-btn ${newVoucher.type === 'Sales' ? 'active' : ''}`}
                onClick={() => setNewVoucher(createBlankVoucher('Sales'))}
                title="F8: Sales (Item Invoice)"
              >
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>F8:</span> Sales (Item Invoice)
              </button>
              <button
                type="button"
                className={`marine-voucher-btn ${newVoucher.type === 'Purchase' ? 'active' : ''}`}
                onClick={() => setNewVoucher(createBlankVoucher('Purchase'))}
                title="F9: Purchase (Item Invoice)"
              >
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>F9:</span> Purchase (Item Invoice)
              </button>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#64748b', alignSelf: 'center' }}>
                Toggle via <kbd style={{ background: '#1e293b', padding: '2px 5px', borderRadius: 3, color: '#38bdf8' }}>F8</kbd> / <kbd style={{ background: '#1e293b', padding: '2px 5px', borderRadius: 3, color: '#38bdf8' }}>F9</kbd>
              </span>
            </div>

            <div className="marine-modal-content">
              {/* Voucher Header Strip */}
              <div className="marine-voucher-grid" style={{ background: '#0f172a', padding: '10px 14px', borderRadius: 6, border: '1px solid #1e293b', marginBottom: 14 }}>
                <div className="marine-row" style={{ margin: 0 }}>
                  <span className="marine-lbl" style={{ width: 140 }}>
                    {newVoucher.type === 'Sales' ? 'Invoice No' : 'Supplier Ref / Bill No'}
                  </span>
                  <span className="marine-colon">:</span>
                  <div className="marine-input-wrap">
                    <input
                      type="text"
                      className="marine-field"
                      style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}
                      value={newVoucher.voucherNo}
                      onChange={(e) => setNewVoucher({ ...newVoucher, voucherNo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="marine-row" style={{ margin: 0 }}>
                  <span className="marine-lbl" style={{ width: 120 }}>Date</span>
                  <span className="marine-colon">:</span>
                  <div className="marine-input-wrap">
                    <input
                      type="text"
                      className="marine-field"
                      style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                      value={newVoucher.date}
                      onChange={(e) => setNewVoucher({ ...newVoucher, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Party Ledger Selector with Auto-Suggest Datalist & Live Current Balance */}
              <div className="marine-row">
                <span className="marine-lbl">
                  {newVoucher.type === 'Sales' ? 'Party A/c Name (Buyer)' : 'Party A/c Name (Supplier)'}
                </span>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    list="ledger-party-options"
                    className="marine-field"
                    placeholder={`Select or enter ${newVoucher.type === 'Sales' ? 'buyer/debtor' : 'supplier/creditor'} name...`}
                    value={newVoucher.particulars}
                    onChange={(e) => handleParticularsChange(e.target.value)}
                    autoFocus
                  />
                  <datalist id="ledger-party-options">
                    {ledgers.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name} ({l.group} - {l.balance}{l.port ? ` · ${l.port.split(' (')[0]}` : ''})
                      </option>
                    ))}
                  </datalist>
                  {selectedPartyLedger && (
                    <div className="marine-party-balance-preview">
                      Current Balance: <strong>{selectedPartyLedger.balance}</strong> ({selectedPartyLedger.group})
                      {selectedPartyLedger.port && (
                        <span style={{ marginLeft: 10, color: '#38bdf8' }}>⚓ Base Port: {selectedPartyLedger.port}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ledger Account Selector */}
              <div className="marine-row">
                <span className="marine-lbl">
                  {newVoucher.type === 'Sales' ? 'Sales Ledger A/c' : 'Purchase Ledger A/c'}
                </span>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <select
                    className="marine-field marine-select"
                    value={newVoucher.account}
                    onChange={(e) => handleAccountChange(e.target.value)}
                  >
                    {newVoucher.type === 'Sales' ? (
                      <>
                        <option value="Sales Accounts">Sales Accounts (Base Port: Visakhapatnam)</option>
                        <option value="Direct Incomes">Direct Incomes (Base Port: Visakhapatnam)</option>
                      </>
                    ) : (
                      <>
                        <option value="Purchase Accounts">Purchase Accounts (Base Port: Visakhapatnam)</option>
                        <option value="Direct Expenses">Direct Expenses (Base Port: Visakhapatnam)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* MARITIME LOGISTICS PANEL: Vessel, Ports of Both Ledgers, Calculated Sea Distance & Duration Range */}
              <div className="marine-logistics-panel">
                <div className="marine-logistics-header">
                  <div className="marine-logistics-title">
                    <span>🚢 Vessel Charter & Port-to-Port Logistics</span>
                    <span className="marine-badge" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      {newVoucher.type} Transit
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Calculates distance & duration between both ledgers&apos; ports
                  </span>
                </div>

                <div className="marine-logistics-grid">
                  {/* 1. Vessel Selection / Input */}
                  <div className="marine-row" style={{ margin: 0 }}>
                    <span className="marine-lbl" style={{ width: 130 }}>Vessel / Carrier</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap">
                      <input
                        type="text"
                        list="maritime-vessels-datalist"
                        className="marine-field"
                        placeholder="e.g. MV Sea Syntax / Enter Vessel..."
                        value={newVoucher.vessel || ''}
                        onChange={(e) => setNewVoucher({ ...newVoucher, vessel: e.target.value })}
                      />
                      <datalist id="maritime-vessels-datalist">
                        {STANDARD_VESSELS.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.type} - {v.imo})
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* 2. Duration (in range of days) */}
                  <div className="marine-row" style={{ margin: 0 }}>
                    <span className="marine-lbl" style={{ width: 130 }}>Voyage Duration</span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap" style={{ alignItems: 'center' }}>
                      <input
                        type="text"
                        className="marine-field"
                        style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', maxWidth: 160 }}
                        placeholder="e.g. 5 - 7 Days"
                        value={newVoucher.duration || ''}
                        onChange={(e) => setNewVoucher({ ...newVoucher, duration: e.target.value })}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 8, whiteSpace: 'nowrap' }}>
                        (Range of Days)
                      </span>
                    </div>
                  </div>

                  {/* 3. Origin Port (Port of Ledger 1) */}
                  <div className="marine-row" style={{ margin: 0 }}>
                    <span className="marine-lbl" style={{ width: 130 }}>
                      Port of Loading
                    </span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                      <select
                        className="marine-field marine-select"
                        value={newVoucher.originPort || 'Visakhapatnam Port (INVTZ)'}
                        onChange={(e) => handleOriginPortChange(e.target.value)}
                      >
                        {MARITIME_PORTS.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name} ({p.country})
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                        {newVoucher.type === 'Sales'
                          ? `Ledger: ${newVoucher.account || 'Sales Accounts'}`
                          : `Ledger: ${newVoucher.particulars || 'Supplier Ledger'}`}
                      </span>
                    </div>
                  </div>

                  {/* 4. Destination Port (Port of Ledger 2) */}
                  <div className="marine-row" style={{ margin: 0 }}>
                    <span className="marine-lbl" style={{ width: 130 }}>
                      Port of Discharge
                    </span>
                    <span className="marine-colon">:</span>
                    <div className="marine-input-wrap" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                      <select
                        className="marine-field marine-select"
                        value={newVoucher.destinationPort || 'JNPT / Mumbai Port (INBOM)'}
                        onChange={(e) => handleDestinationPortChange(e.target.value)}
                      >
                        {MARITIME_PORTS.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name} ({p.country})
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                        {newVoucher.type === 'Sales'
                          ? `Ledger: ${newVoucher.particulars || 'Buyer Ledger'}`
                          : `Ledger: ${newVoucher.account || 'Purchase Accounts'}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Live Calculated Sea Distance & Voyage Route Display */}
                <div className="marine-route-strip">
                  <div className="marine-route-arrow">
                    <span style={{ color: '#94a3b8' }}>Voyage Route:</span>
                    <span className="marine-route-port-tag">
                      ⚓ {newVoucher.originPort ? newVoucher.originPort.split(' (')[0] : 'Origin'}
                    </span>
                    <span style={{ color: '#64748b' }}>──▶</span>
                    <span className="marine-route-port-tag">
                      ⚓ {newVoucher.destinationPort ? newVoucher.destinationPort.split(' (')[0] : 'Destination'}
                    </span>
                  </div>

                  <div className="marine-route-metrics">
                    <div className="marine-metric-item">
                      <span style={{ color: '#94a3b8' }}>Calculated Sea Distance:</span>
                      <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                        {newVoucher.distanceNM ? `${newVoucher.distanceNM.toLocaleString()} NM` : '0 NM'}
                      </strong>
                      {newVoucher.distanceNM > 0 && (
                        <span style={{ color: '#64748b', fontSize: '0.74rem' }}>
                          (~{Math.round(newVoucher.distanceNM * 1.852).toLocaleString()} km)
                        </span>
                      )}
                    </div>

                    <div className="marine-metric-item" style={{ borderLeft: '1px solid #334155', paddingLeft: 12 }}>
                      <span style={{ color: '#94a3b8' }}>Est. Duration:</span>
                      <strong style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                        {newVoucher.duration || '0 - 1 Day'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Items Inventory Section with AUTOMATIC ROW ADDITION (No Manual Add Button) */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Name of Item & Inventory Valuation
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    [Add items]
                  </span>
                </div>

                <table className="marine-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '42%' }}>Name of Item</th>
                      <th style={{ width: '14%', textAlign: 'center' }}>Quantity</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>Unit</th>
                      <th style={{ width: '16%', textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ width: '16%', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ width: 32, textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newVoucher.items.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            list="stock-items-datalist"
                            className="marine-table-input"
                            id={`voucher-item-name-${idx}`}
                            placeholder={idx === 0 ? "Select or enter item name..." : "Next item (or leave blank and Enter)..."}
                            value={row.itemName}
                            onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (!row.itemName || !row.itemName.trim()) {
                                  // Marine Matrice behavior: Enter on empty item name moves directly to Narration!
                                  const narrationEl = document.getElementById('voucher-narration-input');
                                  if (narrationEl) narrationEl.focus();
                                } else {
                                  // Move to quantity field
                                  const qtyEl = document.getElementById(`voucher-item-qty-${idx}`);
                                  if (qtyEl) qtyEl.focus();
                                }
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="marine-table-input"
                            id={`voucher-item-qty-${idx}`}
                            style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const rateEl = document.getElementById(`voucher-item-rate-${idx}`);
                                if (rateEl) rateEl.focus();
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="marine-table-input"
                            style={{ textAlign: 'center', color: '#38bdf8' }}
                            value={row.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            placeholder="Pcs"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="marine-table-input"
                            id={`voucher-item-rate-${idx}`}
                            style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                            placeholder="0.00"
                            value={row.rate}
                            onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // If on last row and item is filled, ensure next row exists and focus it
                                if (idx === newVoucher.items.length - 1 && row.itemName && row.itemName.trim()) {
                                  handleItemChange(idx, 'itemName', row.itemName); // Triggers auto-append
                                  setTimeout(() => {
                                    const nextItemEl = document.getElementById(`voucher-item-name-${idx + 1}`);
                                    if (nextItemEl) nextItemEl.focus();
                                  }, 50);
                                } else if (idx < newVoucher.items.length - 1) {
                                  const nextItemEl = document.getElementById(`voucher-item-name-${idx + 1}`);
                                  if (nextItemEl) nextItemEl.focus();
                                } else {
                                  const narrationEl = document.getElementById('voucher-narration-input');
                                  if (narrationEl) narrationEl.focus();
                                }
                              }
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b', paddingRight: 8, fontFamily: 'var(--font-mono)' }}>
                          ₹{(Number(row.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {newVoucher.items.length > 1 && (
                            <button
                              type="button"
                              className="marine-row-delete-btn"
                              onClick={() => handleRemoveItemRow(idx)}
                              title="Remove Row"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#162032', borderTop: '1px solid #334155', fontWeight: 700 }}>
                      <td colSpan={4} style={{ padding: '10px 12px', color: '#cbd5e1', letterSpacing: '0.04em' }}>
                        TOTAL VOUCHER AMOUNT ({newVoucher.items.filter(it => it.itemName && it.amount > 0).length} Item{newVoucher.items.filter(it => it.itemName && it.amount > 0).length === 1 ? '' : 's'})
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px 10px', color: '#4ade80', fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>
                        ₹{(Number(newVoucher.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                <datalist id="stock-items-datalist">
                  {items.map((it) => (
                    <option key={it.id} value={it.name}>
                      {it.name} (Rate: {it.rate}, Stock: {it.stock})
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Narration Field (Authentic Marine Matrice Bottom Section) */}
              <div className="marine-row marine-row-align-top" style={{ marginTop: 14 }}>
                <span className="marine-lbl">Narration</span>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <textarea
                    id="voucher-narration-input"
                    className="marine-field marine-textarea"
                    placeholder="Provide transaction narration/remarks..."
                    value={newVoucher.narration}
                    onChange={(e) => setNewVoucher({ ...newVoucher, narration: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        setShowVoucherAcceptPrompt(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Authentic Marine Matrice Footer Bar with Accept Dialog */}
            <div className="marine-footer-bar">
              <span className="marine-hint">
                [F8: Sales | F9: Purchase | Enter on empty item: Narration | Enter: Accept | Y: Save | Esc: Cancel]
              </span>

              {showVoucherAcceptPrompt ? (
                <div className="marine-accept-dialog">
                  <span className="marine-accept-title">Accept?</span>
                  <div className="marine-accept-actions">
                    <button className="marine-accept-yes" onClick={handleSaveVoucher} autoFocus>
                      Yes (Y)
                    </button>
                    <button
                      className="marine-accept-no"
                      onClick={() => setShowVoucherAcceptPrompt(false)}
                    >
                      No (N)
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="marine-btn-proceed"
                  onClick={() => setShowVoucherAcceptPrompt(true)}
                >
                  Accept / Save Voucher (Enter)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TRANSACTIONS: DAY BOOK SCREEN */}
      {activeModal === 'trans_daybook' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" style={{ maxWidth: 1000 }} onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Day Book</span>
                <span>Transactions Audit Register ({companyInfo.name})</span>
              </div>
              <button className="marine-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            {/* Filter bar */}
            <div className="marine-voucher-bar">
              {['All', 'Sales', 'Purchase'].map((f) => (
                <button
                  key={f}
                  className={`marine-voucher-btn ${voucherFilter === f ? 'active' : ''}`}
                  onClick={() => setVoucherFilter(f)}
                >
                  {f}
                </button>
              ))}
              <button
                className="marine-voucher-btn"
                style={{ marginLeft: 'auto', background: '#f59e0b', color: '#000', fontWeight: 800 }}
                onClick={() => {
                  setNewVoucher(createBlankVoucher('Sales'));
                  setShowVoucherAcceptPrompt(false);
                  setActiveModal('trans_vouchers');
                }}
              >
                + Record New Voucher
              </button>
            </div>

            <div className="marine-modal-content" style={{ maxHeight: 440 }}>
              {filteredVouchers.length === 0 ? (
                <div className="marine-empty-banner">
                  <p>No transactions found for filter &quot;{voucherFilter}&quot;.</p>
                  <button
                    className="marine-action-switch"
                    onClick={() => {
                      setNewVoucher(createBlankVoucher('Sales'));
                      setShowVoucherAcceptPrompt(false);
                      setActiveModal('trans_vouchers');
                    }}
                  >
                    Click here to record a voucher now
                  </button>
                </div>
              ) : (
                <table className="marine-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>Vch Type</th>
                      <th>Vch No.</th>
                      <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                      <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVouchers.map((v) => {
                      const typeClass = `marine-badge-${v.type.toLowerCase()}`;
                      return (
                        <tr key={v.id} className="marine-table-row">
                          <td style={{ color: '#94a3b8' }}>{v.date}</td>
                          <td className="marine-td-name">
                            <strong>{v.particulars}</strong>
                            {v.items && v.items.length > 0 && (
                              <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: 3 }}>
                                {v.items
                                  .filter((it) => it.itemName)
                                  .map(
                                    (it) =>
                                      `${it.itemName} (${it.quantity} ${it.unit || ''} @ ₹${Number(it.rate || 0).toLocaleString('en-IN')})`
                                  )
                                  .join(', ')}
                              </div>
                            )}
                            {v.vessel && (
                              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: 4, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span>🚢 <strong>{v.vessel}</strong></span>
                                {v.originPort && v.destinationPort && (
                                  <span>⚓ {v.originPort.split(' (')[0]} ➔ {v.destinationPort.split(' (')[0]} ({v.distanceNM ? `${v.distanceNM} NM` : ''})</span>
                                )}
                                {v.duration && <span style={{ color: '#38bdf8' }}>⏱ {v.duration}</span>}
                              </div>
                            )}
                            <div className="marine-sub-address">{v.narration}</div>
                          </td>
                          <td>
                            <span className={`marine-badge-voucher ${typeClass}`}>
                              {v.type}
                            </span>
                          </td>
                          <td className="marine-td-mono">{v.voucherNo}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: v.isDebit ? '#f87171' : '#64748b' }}>
                            {v.isDebit ? Number(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: !v.isDebit ? '#4ade80' : '#64748b' }}>
                            {!v.isDebit ? Number(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteVoucher(v.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                              }}
                              title="Delete Voucher"
                            >
                              ✕ Del
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="marine-totals-row">
                      <td colSpan={4} style={{ padding: '10px 16px', letterSpacing: '0.06em' }}>
                        TOTALS ({filteredVouchers.length} Entries)
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 16px', color: '#f87171' }}>
                        ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 16px', color: '#4ade80' }}>
                        ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="marine-footer-bar">
              <span className="marine-hint">All vouchers are stored locally and synced with Marine Matrice database records</span>
              <button
                className="marine-btn-secondary"
                onClick={() => setActiveModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5.5 TRANSACTIONS: LEDGER STATEMENT SCREEN */}
      {activeModal === 'trans_ledger' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" style={{ maxWidth: 1050 }} onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Ledger Vouchers</span>
                <span>
                  Ledger Statement: {activeLedgerObj ? activeLedgerObj.name : 'Ledger Account'} ({companyInfo.name})
                </span>
              </div>
              <button className="marine-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            {/* Top Toolbar: Ledger Selector & Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 18px',
                background: '#040b17',
                borderBottom: '1px solid #142a45',
                flexWrap: 'wrap',
              }}
            >
              <span className="marine-lbl" style={{ minWidth: 'auto', fontWeight: 700, color: '#cbd5e1' }}>
                Select Ledger:
              </span>
              <select
                className="marine-field marine-select"
                style={{ minWidth: 280, maxWidth: 380, fontWeight: 700 }}
                value={activeLedgerObj ? activeLedgerObj.name : ''}
                onChange={(e) => setSelectedLedgerName(e.target.value)}
              >
                {ledgers.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name} ({l.group})
                  </option>
                ))}
              </select>

              <button
                className="marine-voucher-btn"
                style={{ marginLeft: 'auto', background: '#f59e0b', color: '#000', fontWeight: 800 }}
                onClick={() => {
                  const fresh = createBlankVoucher(
                    activeLedgerObj?.group === 'Sundry Creditors' ? 'Purchase' : 'Sales'
                  );
                  fresh.particulars = activeLedgerObj?.name || '';
                  setNewVoucher(fresh);
                  setShowVoucherAcceptPrompt(false);
                  setActiveModal('trans_vouchers');
                }}
              >
                + Record Voucher for this Ledger
              </button>

              <button
                className="marine-voucher-btn"
                style={{ background: '#182234', border: '1px solid #293548', color: '#38bdf8', fontWeight: 600 }}
                onClick={() => {
                  if (activeLedgerObj) {
                    setEditingLedger(activeLedgerObj);
                    setActiveModal('master_alter');
                  }
                }}
              >
                ✎ Alter Ledger
              </button>
            </div>

            {/* Marine Matrice Ledger Summary Header Strip */}
            <div style={{ padding: '12px 18px 0 18px' }}>
              <div className="marine-ledger-strip">
                <div className="marine-ledger-strip-col">
                  <span className="marine-strip-label">Ledger Name</span>
                  <span className="marine-strip-val highlight">{activeLedgerObj?.name || '-'}</span>
                </div>
                <div className="marine-ledger-strip-col">
                  <span className="marine-strip-label">Under Group</span>
                  <span className="marine-strip-val">{activeLedgerObj?.group || '-'}</span>
                </div>
                <div className="marine-ledger-strip-col">
                  <span className="marine-strip-label">Opening Balance</span>
                  <span
                    className="marine-strip-val"
                    style={{ color: opDrCr === 'Dr' ? '#f87171' : '#4ade80' }}
                  >
                    {activeLedgerObj ? formatBalance(opRawBalance, opDrCr) : '₹0.00 Dr'}
                  </span>
                </div>
                <div className="marine-ledger-strip-col">
                  <span className="marine-strip-label">Period</span>
                  <span className="marine-strip-val">1-Apr-2026 to 31-Mar-2027</span>
                </div>
                <div className="marine-ledger-strip-col">
                  <span className="marine-strip-label">Closing Balance</span>
                  <span
                    className="marine-strip-val highlight"
                    style={{ color: closingNetDr >= 0 ? '#f87171' : '#4ade80' }}
                  >
                    {formatBalance(Math.abs(closingNetDr), closingNetDr >= 0 ? 'Dr' : 'Cr')}
                  </span>
                </div>
              </div>
            </div>

            {/* Ledger Vouchers Register Table */}
            <div className="marine-modal-content" style={{ maxHeight: 380, paddingTop: 4 }}>
              <table className="marine-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Particulars (Opposite A/c)</th>
                    <th>Vch Type</th>
                    <th>Vch No.</th>
                    <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                    <th style={{ textAlign: 'right' }}>Cumulative Bal</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Opening Balance Row */}
                  <tr className="marine-table-row" style={{ background: 'rgba(2, 6, 23, 0.4)' }}>
                    <td style={{ color: '#94a3b8' }}>01-Apr-2026</td>
                    <td className="marine-td-name">
                      <strong style={{ color: '#94a3b8' }}>Opening Balance (B/F)</strong>
                      <div className="marine-sub-address">Initial balance brought forward</div>
                    </td>
                    <td>-</td>
                    <td className="marine-td-mono">-</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: opDrCr === 'Dr' ? '#f87171' : '#64748b' }}>
                      {opDrCr === 'Dr' && opRawBalance > 0
                        ? opRawBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: opDrCr === 'Cr' ? '#4ade80' : '#64748b' }}>
                      {opDrCr === 'Cr' && opRawBalance > 0
                        ? opRawBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: opDrCr === 'Dr' ? '#f87171' : '#4ade80' }}>
                      {formatBalance(opRawBalance, opDrCr)}
                    </td>
                  </tr>

                  {/* Transaction Entries */}
                  {ledgerStatementEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px 10px', color: '#64748b' }}>
                        No transactions recorded for this ledger in the current accounting period.
                      </td>
                    </tr>
                  ) : (
                    ledgerStatementEntries.map((v) => {
                      const typeClass = `marine-badge-${v.type.toLowerCase()}`;
                      return (
                        <tr key={v.id} className="marine-table-row">
                          <td style={{ color: '#94a3b8' }}>{v.date}</td>
                          <td className="marine-td-name">
                            <strong>{v.opposingAccount}</strong>
                            {v.items && v.items.length > 0 && (
                              <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: 2 }}>
                                {v.items
                                  .filter((it) => it.itemName)
                                  .map(
                                    (it) =>
                                      `${it.itemName} (${it.quantity} ${it.unit || ''} @ ₹${Number(it.rate || 0).toLocaleString('en-IN')})`
                                  )
                                  .join(', ')}
                              </div>
                            )}
                            <div className="marine-sub-address">{v.narration}</div>
                          </td>
                          <td>
                            <span className={`marine-badge-voucher ${typeClass}`}>
                              {v.type}
                            </span>
                          </td>
                          <td className="marine-td-mono">{v.voucherNo}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: v.debit > 0 ? '#f87171' : '#64748b' }}>
                            {v.debit > 0 ? Number(v.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: v.credit > 0 ? '#4ade80' : '#64748b' }}>
                            {v.credit > 0 ? Number(v.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                            {v.runningBalanceStr}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="marine-totals-row">
                    <td colSpan={4} style={{ padding: '10px 16px', letterSpacing: '0.04em' }}>
                      PERIOD TOTALS ({ledgerStatementEntries.length} Voucher{ledgerStatementEntries.length !== 1 ? 's' : ''})
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 16px', color: '#f87171' }}>
                      ₹{totalLedgerDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 16px', color: '#4ade80' }}>
                      ₹{totalLedgerCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 16px', color: closingNetDr >= 0 ? '#f87171' : '#4ade80', fontWeight: 800 }}>
                      {formatBalance(Math.abs(closingNetDr), closingNetDr >= 0 ? 'Dr' : 'Cr')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="marine-footer-bar">
              <span className="marine-hint">
                Closing Balance: <strong>{formatBalance(Math.abs(closingNetDr), closingNetDr >= 0 ? 'Dr' : 'Cr')}</strong> | Press Esc to close
              </span>
              <button className="marine-btn-secondary" onClick={() => setActiveModal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REPORTS: BALANCE SHEET (DYNAMIC WITH REAL DEBTORS & CREDITORS) */}
      {activeModal === 'rep_balance' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Balance Sheet</span>
                <span>As on 6-Sep-2026 ({companyInfo.name})</span>
              </div>
              <button className="marine-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="marine-modal-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Liabilities */}
                <div className="marine-tree-group">
                  <div className="marine-tree-header">
                    <span>LIABILITIES</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>Capital Account</span>
                    <span>10,00,000.00</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>Reserves & Surplus (P&L)</span>
                    <span>4,85,500.00</span>
                  </div>
                  <div className="marine-tree-item" style={{ color: '#f87171', fontWeight: 700 }}>
                    <span>Sundry Creditors ({creditorsList.length} Accounts)</span>
                    <span>₹{totalCreditorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>Duties & Taxes</span>
                    <span>26,100.00</span>
                  </div>
                  <div className="marine-tree-header marine-tree-total">
                    <span>TOTAL LIABILITIES</span>
                    <span>₹{(1511600 + totalCreditorsBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Assets */}
                <div className="marine-tree-group">
                  <div className="marine-tree-header">
                    <span>ASSETS</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>Fixed Assets (Plant & Labs)</span>
                    <span>8,50,800.00</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>Closing Stock Inventory</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalStockValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="marine-tree-item" style={{ color: '#4ade80', fontWeight: 700 }}>
                    <span>Sundry Debtors ({debtorsList.length} Accounts)</span>
                    <span>₹{totalDebtorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>Bank & Cash Balances</span>
                    <span>₹{(totalBankBalance + totalCashBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="marine-tree-header marine-tree-total">
                    <span>TOTAL ASSETS</span>
                    <span>₹{(850800 + totalStockValuation + totalDebtorsBalance + totalBankBalance + totalCashBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="marine-footer-bar">
              <span className="marine-hint">Sundry Debtors and Creditors totals are calculated dynamically from active ledgers</span>
              <button className="marine-btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. REPORTS: PROFIT & LOSS */}
      {activeModal === 'rep_pl' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Profit & Loss A/c</span>
                <span>For Period 1-Apr-2026 to 6-Sep-2026</span>
              </div>
              <button className="marine-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="marine-modal-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Expenses */}
                <div className="marine-tree-group">
                  <div className="marine-tree-header">
                    <span>PARTICULARS (EXPENSES)</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>To Opening Stock</span>
                    <span>1,20,000.00</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>To Purchase Accounts</span>
                    <span>6,40,000.00</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>To Direct Expenses (Port/Berthing)</span>
                    <span>1,12,000.00</span>
                  </div>
                  <div className="marine-tree-item" style={{ color: '#4ade80', fontWeight: 700 }}>
                    <span>To Gross Profit c/o</span>
                    <span>7,28,000.00</span>
                  </div>
                  <div className="marine-tree-header marine-tree-total">
                    <span>TOTAL TRADING</span>
                    <span>₹16,00,000.00</span>
                  </div>
                </div>

                {/* Incomes */}
                <div className="marine-tree-group">
                  <div className="marine-tree-header">
                    <span>PARTICULARS (INCOME)</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>By Sales Accounts</span>
                    <span>12,80,000.00</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>By Direct Marine Consulting</span>
                    <span>3,20,000.00</span>
                  </div>
                  <div className="marine-tree-item">
                    <span>By Closing Stock</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalStockValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="marine-tree-item" style={{ color: '#38bdf8' }}>
                    <span>By Gross Profit b/f</span>
                    <span>7,28,000.00</span>
                  </div>
                  <div className="marine-tree-header marine-tree-total">
                    <span>NET PROFIT</span>
                    <span style={{ color: '#4ade80' }}>₹4,85,500.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="marine-footer-bar">
              <span className="marine-hint">Calculated on accrual basis per accounting standards</span>
              <button className="marine-btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. REPORTS: STOCK SUMMARY (1:1 AUTHENTIC MARITIME ERP EXPERIENCE) */}
      {activeModal === 'rep_stock' && (
        <div
          className="marine-modal-backdrop"
          onClick={() => {
            if (showStockConfig) setShowStockConfig(false);
            else if (stockDrilldownItem) setStockDrilldownItem(null);
            else setActiveModal(null);
          }}
        >
          <div
            className="marine-modal-box"
            style={{ maxWidth: stockViewMode === 'columnar' || stockConfigOptions.showOpening || stockConfigOptions.showInwards || stockConfigOptions.showOutwards ? 1180 : 1020, position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Strip with Company Name, Period & Mode */}
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Stock Summary</span>
                <span>
                  {companyInfo.name} · {stockDrilldownItem ? `Stock Item: ${stockDrilldownItem.name}` : 'Inventory Movement & Valuation Statement'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Period: <strong style={{ color: '#38bdf8' }}>1-Apr-2026 to 6-Sep-2026</strong>
                </span>
                <button
                  className="marine-modal-close-btn"
                  onClick={() => setActiveModal(null)}
                >
                  Esc: Close
                </button>
              </div>
            </div>

            {/* F12 Configuration Popover Modal */}
            {showStockConfig && (
              <div className="marine-config-popover">
                <div className="marine-config-title">
                  <span>F12: Configuration (Columns & Display)</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={() => setShowStockConfig(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="marine-config-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={stockConfigOptions.showOpening}
                      onChange={(e) => setStockConfigOptions({ ...stockConfigOptions, showOpening: e.target.checked })}
                    />
                    <span>Show Opening Balance</span>
                  </label>
                </div>
                <div className="marine-config-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={stockConfigOptions.showInwards}
                      onChange={(e) => setStockConfigOptions({ ...stockConfigOptions, showInwards: e.target.checked })}
                    />
                    <span>Show Goods Inward (Purchases)</span>
                  </label>
                </div>
                <div className="marine-config-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={stockConfigOptions.showOutwards}
                      onChange={(e) => setStockConfigOptions({ ...stockConfigOptions, showOutwards: e.target.checked })}
                    />
                    <span>Show Goods Outward (Sales)</span>
                  </label>
                </div>
                <div className="marine-config-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={stockConfigOptions.showClosing}
                      onChange={(e) => setStockConfigOptions({ ...stockConfigOptions, showClosing: e.target.checked })}
                    />
                    <span>Show Closing Balance</span>
                  </label>
                </div>
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #1c2e46', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="marine-btn-secondary" style={{ padding: '3px 10px', fontSize: '0.74rem' }} onClick={() => setShowStockConfig(false)}>
                    Accept (Enter)
                  </button>
                </div>
              </div>
            )}

            {/* Authentic Function Keys Toolbar */}
            <div className="marine-stock-toolbar">
              <button
                type="button"
                className={`marine-stock-btn ${stockViewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => setStockViewMode(stockViewMode === 'detailed' ? 'condensed' : 'detailed')}
                title="Toggle Group Hierarchy & Item Details"
              >
                <kbd>F1</kbd> {stockViewMode === 'detailed' ? 'Condensed' : 'Detailed'}
              </button>

              <button
                type="button"
                className={`marine-stock-btn ${stockViewMode === 'columnar' ? 'active' : ''}`}
                onClick={() => setStockViewMode(stockViewMode === 'columnar' ? 'detailed' : 'columnar')}
                title="Toggle Full Columnar Inward / Outward Flow"
              >
                <kbd>F5</kbd> Columnar Flow
              </button>

              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  className={`marine-stock-btn ${stockGroupFilter !== 'All' ? 'active' : ''}`}
                  onClick={() => {
                    const groups = ['All', 'Marine Telemetry & Electronics', 'Deep Sea Minerals & Bio-Polymers', 'Aquaculture Flow Control'];
                    const nextIdx = (groups.indexOf(stockGroupFilter) + 1) % groups.length;
                    setStockGroupFilter(groups[nextIdx]);
                  }}
                  title="Filter by Stock Group"
                >
                  <kbd>F4</kbd> Group: <strong style={{ color: '#38bdf8' }}>{stockGroupFilter === 'All' ? 'All Groups' : stockGroupFilter.split(' ')[0]}</strong>
                </button>
              </div>

              <button
                type="button"
                className="marine-stock-btn active"
                onClick={() => {
                  const methods = ['FIFO', 'Average Cost', 'Last Purchase Cost', 'Standard Cost'];
                  const nextIdx = (methods.indexOf(stockValuationMethod) + 1) % methods.length;
                  setStockValuationMethod(methods[nextIdx]);
                }}
                title="Valuation Method: FIFO (Lot/batch accurate: e.g. 20@100 + 30@150 = 6,500), Average Cost, Last Purchase, or Standard Cost"
              >
                <kbd>F7</kbd> Valuation: <span style={{ color: '#4ade80' }}>{stockValuationMethod}</span>
              </button>

              <button
                type="button"
                className={`marine-stock-btn ${showStockConfig ? 'active' : ''}`}
                onClick={() => setShowStockConfig(!showStockConfig)}
                title="F12: Configure Display Columns"
              >
                <kbd>F12</kbd> Configure
              </button>

              <button
                type="button"
                className="marine-stock-btn"
                onClick={handleResetSampleData}
                title="Restore 20 Bags @ 100 + 30 Bags @ 150 lot-accurate valuation dataset"
              >
                <kbd>Demo</kbd> Reset Lots
              </button>

              {stockDrilldownItem && (
                <button
                  type="button"
                  className="marine-stock-btn"
                  style={{ background: '#0284c7', color: '#fff', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setStockDrilldownItem(null)}
                  title="Go back to Stock Summary (Backspace)"
                >
                  <kbd style={{ background: '#0369a1', color: '#fff' }}>Backspace</kbd> ← Back to Summary
                </button>
              )}

              <div className="marine-stock-search">
                <input
                  type="text"
                  placeholder="Quick search item/group..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Lot Accounting Status & Formula Banner */}
            <div style={{ margin: '0 16px 10px 16px', padding: '8px 14px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: 6, border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>Active Valuation Engine:</span>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>{stockValuationMethod} Method</span>
                <span style={{ color: '#94a3b8' }}>• Accurate batch lots: calculates purchase sequences (e.g. 20 Bags @ ₹100 + 30 Bags @ ₹150 = ₹6,500.00).</span>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.74rem' }}>
                <span style={{ color: '#64748b' }}>Press </span><kbd style={{ background: '#1e293b', padding: '2px 5px', borderRadius: 3, border: '1px solid #475569', color: '#facc15' }}>F7</kbd><span style={{ color: '#64748b' }}> to switch methods</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="marine-modal-content" style={{ maxHeight: 480, overflowX: 'auto', padding: '12px 16px' }}>
              {/* =========================================================================
                  VIEW 1: DRILL DOWN (Stock Item Monthly Summary & Movement Register)
                  ========================================================================= */}
              {stockDrilldownItem ? (() => {
                const curItem = stockDrilldownItem;
                const closingQty = parseNumeric(curItem.stock);
                const itemValDetails = getItemValuationDetails(curItem, vouchers, stockValuationMethod);
                const currentValuation = itemValDetails.valuation;
                const effectiveRate = itemValDetails.effectiveRate;

                // Extract all vouchers involving this item
                const matchingVouchers = vouchers.filter((v) =>
                  Array.isArray(v.items) && v.items.some((it) => it.itemName && it.itemName.toLowerCase().trim() === curItem.name.toLowerCase().trim())
                );

                // Calculate total inward & outward quantities and values
                let totInwardQty = 0;
                let totInwardVal = 0;
                let totOutwardQty = 0;
                let totOutwardVal = 0;

                matchingVouchers.forEach((v) => {
                  v.items.forEach((inv) => {
                    if (inv.itemName && inv.itemName.toLowerCase().trim() === curItem.name.toLowerCase().trim()) {
                      const q = Number(inv.quantity) || 0;
                      const amt = Number(inv.amount) || (q * Number(inv.rate || 0));
                      if (v.type === 'Purchase') {
                        totInwardQty += q;
                        totInwardVal += amt;
                      } else if (v.type === 'Sales') {
                        totOutwardQty += q;
                        totOutwardVal += amt;
                      }
                    }
                  });
                });

                const openingQty = itemValDetails.openingQty;
                const openingVal = itemValDetails.openingVal;

                // Monthly Summary Matrix (Apr to Sep 2026)
                const months = [
                  { name: 'April 2026', inQty: 0, inVal: 0, outQty: 0, outVal: 0 },
                  { name: 'May 2026', inQty: 0, inVal: 0, outQty: 0, outVal: 0 },
                  { name: 'June 2026', inQty: 0, inVal: 0, outQty: 0, outVal: 0 },
                  { name: 'July 2026', inQty: 0, inVal: 0, outQty: 0, outVal: 0 },
                  { name: 'August 2026', inQty: 0, inVal: 0, outQty: 0, outVal: 0 },
                  { name: 'September 2026', inQty: totInwardQty, inVal: totInwardVal, outQty: totOutwardQty, outVal: totOutwardVal },
                ];

                let runningQty = openingQty;

                return (
                  <div>
                    {/* Item Master Card */}
                    <div className="marine-drilldown-card">
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>
                          {curItem.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 3 }}>
                          Stock Group: <strong style={{ color: '#cbd5e1' }}>{curItem.group || 'Primary Stock Group'}</strong> | Unit of Measure: <strong style={{ color: '#38bdf8' }}>{curItem.unit}</strong> | Method: <strong style={{ color: '#4ade80' }}>{stockValuationMethod} (Lot/Batch Accurate)</strong>
                        </div>
                      </div>

                      <div className="marine-drilldown-meta">
                        <div className="marine-drilldown-stat">
                          <span className="marine-drilldown-stat-lbl">Valuation Rate</span>
                          <span className="marine-drilldown-stat-val" style={{ color: '#38bdf8' }}>
                            ₹{effectiveRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="marine-drilldown-stat">
                          <span className="marine-drilldown-stat-lbl">Closing Stock</span>
                          <span className="marine-drilldown-stat-val">
                            {curItem.stock}
                          </span>
                        </div>
                        <div className="marine-drilldown-stat">
                          <span className="marine-drilldown-stat-lbl">Total Valuation</span>
                          <span className="marine-drilldown-stat-val" style={{ color: '#f59e0b' }}>
                            ₹{currentValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Accurate Valuation Lots & Batch Breakdown */}
                      <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 6, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700 }}>
                            Valuation Calculation [{stockValuationMethod} Method]:
                          </span>
                          <span style={{ fontSize: '0.94rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#facc15' }}>
                            {itemValDetails.formulaText}
                          </span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: '0.78rem', color: '#94a3b8' }}>
                          Breakdown: <span style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{itemValDetails.breakdownText}</span>
                        </div>
                        {itemValDetails.lots && itemValDetails.lots.length > 0 && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: '0.75rem', color: '#94a3b8' }}>
                            {itemValDetails.lots.map((l, i) => (
                              <span key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                <strong style={{ color: '#38bdf8' }}>{l.label}:</strong> {l.qty} {curItem.unit} @ ₹{l.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })} = <strong style={{ color: '#4ade80' }}>₹{l.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 1: Stock Item Monthly Summary */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span>1. Stock Item Monthly Movement Summary (FY 2026-27)</span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>[Opening Balance B/F: {openingQty} {curItem.unit} (₹{openingVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})]</span>
                      </div>
                      <table className="marine-stock-table">
                        <thead>
                          <tr>
                            <th style={{ width: '22%' }}>Particulars (Month)</th>
                            <th className="right" style={{ width: '13%' }}>Inward Qty</th>
                            <th className="right" style={{ width: '13%' }}>Inward Value (₹)</th>
                            <th className="right" style={{ width: '13%' }}>Outward Qty</th>
                            <th className="right" style={{ width: '13%' }}>Outward Value (₹)</th>
                            <th className="right" style={{ width: '13%' }}>Closing Qty</th>
                            <th className="right primary-col" style={{ width: '13%' }}>Closing Value (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {months.map((m, mIdx) => {
                            runningQty = runningQty + m.inQty - m.outQty;
                            const monthClosingVal = runningQty * effectiveRate;
                            return (
                              <tr key={mIdx} className="item-row">
                                <td style={{ fontWeight: 600 }}>{m.name}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{m.inQty > 0 ? `${m.inQty} ${curItem.unit}` : '-'}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{m.inVal > 0 ? `₹${m.inVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{m.outQty > 0 ? `${m.outQty} ${curItem.unit}` : '-'}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{m.outVal > 0 ? `₹${m.outVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{`${runningQty} ${curItem.unit}`}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                                  ₹{monthClosingVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td>TOTAL / CLOSING POSITION</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{totInwardQty} {curItem.unit}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{totInwardVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{totOutwardQty} {curItem.unit}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{totOutwardVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{curItem.stock}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#4ade80' }}>
                              ₹{currentValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Section 2: Stock Item Movement Vouchers Register */}
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                        2. Stock Item Invoices & Vouchers Movement Register ({matchingVouchers.length} Record{matchingVouchers.length === 1 ? '' : 's'})
                      </div>
                      {matchingVouchers.length === 0 ? (
                        <div style={{ padding: 14, background: '#091220', borderRadius: 4, color: '#64748b', textAlign: 'center', fontSize: '0.8rem' }}>
                          No direct transaction vouchers recorded for this item in the selected period.
                        </div>
                      ) : (
                        <table className="marine-stock-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Particulars (Party / Account)</th>
                              <th>Vch Type</th>
                              <th>Vch No.</th>
                              <th>Vessel / Route</th>
                              <th className="right">Inward Qty</th>
                              <th className="right">Outward Qty</th>
                              <th className="right">Rate (₹)</th>
                              <th className="right primary-col">Value (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matchingVouchers.map((v) => {
                              const vItem = v.items.find((it) => it.itemName && it.itemName.toLowerCase().trim() === curItem.name.toLowerCase().trim());
                              const q = Number(vItem?.quantity) || 0;
                              const r = Number(vItem?.rate) || purchaseRate;
                              const amt = Number(vItem?.amount) || (q * r);
                              return (
                                <tr key={v.id} className="item-row">
                                  <td style={{ color: '#94a3b8' }}>{v.date}</td>
                                  <td style={{ fontWeight: 700 }}>
                                    {v.particulars}
                                    {v.narration && <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{v.narration}</div>}
                                  </td>
                                  <td>
                                    <span className={`marine-badge-voucher marine-badge-${v.type.toLowerCase()}`}>
                                      {v.type}
                                    </span>
                                  </td>
                                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.voucherNo}</td>
                                  <td style={{ fontSize: '0.74rem', color: '#a5b4fc' }}>
                                    {v.vessel || 'Coastal Liner'}
                                    {v.originPort && v.destinationPort && (
                                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        {v.originPort.split(' (')[0]} ➔ {v.destinationPort.split(' (')[0]}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: v.type === 'Purchase' ? '#4ade80' : '#64748b' }}>
                                    {v.type === 'Purchase' ? `${q} ${curItem.unit}` : '-'}
                                  </td>
                                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: v.type === 'Sales' ? '#f87171' : '#64748b' }}>
                                    {v.type === 'Sales' ? `${q} ${curItem.unit}` : '-'}
                                  </td>
                                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                    ₹{r.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
                                    ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                );
              })() : (
                /* =========================================================================
                   VIEW 2: MAIN STOCK SUMMARY TABLE (Marine Matrice Multi-Column / Group View)
                   ========================================================================= */
                <div>
                  {/* Group / Items Organization */}
                  {(() => {
                    const isColumnar = stockViewMode === 'columnar' || (stockConfigOptions.showOpening && stockConfigOptions.showInwards && stockConfigOptions.showOutwards);

                    // Filter items by stockGroupFilter and search query
                    const filteredStockItems = items.filter((it) => {
                      const matchesGroup = stockGroupFilter === 'All' || (it.group || 'General Marine Cargo') === stockGroupFilter;
                      const q = stockSearchQuery.toLowerCase().trim();
                      const matchesQuery = !q || it.name.toLowerCase().includes(q) || (it.group && it.group.toLowerCase().includes(q));
                      return matchesGroup && matchesQuery;
                    });

                    // Organize into groups
                    const groupsMap = {};
                    filteredStockItems.forEach((it) => {
                      const grp = it.group || 'General Marine Cargo';
                      if (!groupsMap[grp]) groupsMap[grp] = [];
                      groupsMap[grp].push(it);
                    });

                    // Compute overall Grand Totals
                    let grandOpeningQty = 0;
                    let grandOpeningVal = 0;
                    let grandInwardQty = 0;
                    let grandInwardVal = 0;
                    let grandOutwardQty = 0;
                    let grandOutwardVal = 0;
                    let grandClosingVal = 0;

                    filteredStockItems.forEach((it) => {
                      const closingQty = parseNumeric(it.stock);
                      const itVal = getItemValuationDetails(it, vouchers, stockValuationMethod);
                      const clVal = itVal.valuation;
                      const opQty = itVal.openingQty;
                      const opVal = itVal.openingVal;

                      let inQty = 0;
                      let inVal = 0;
                      let outQty = 0;
                      let outVal = 0;

                      vouchers.forEach((v) => {
                        if (Array.isArray(v.items)) {
                          v.items.forEach((inv) => {
                            if (inv.itemName && inv.itemName.toLowerCase().trim() === it.name.toLowerCase().trim()) {
                              const q = Number(inv.quantity) || 0;
                              const amt = Number(inv.amount) || (q * Number(inv.rate || 0));
                              if (v.type === 'Purchase') {
                                inQty += q;
                                inVal += amt;
                              } else if (v.type === 'Sales') {
                                outQty += q;
                                outVal += amt;
                              }
                            }
                          });
                        }
                      });

                      grandOpeningQty += opQty;
                      grandOpeningVal += opVal;
                      grandInwardQty += inQty;
                      grandInwardVal += inVal;
                      grandOutwardQty += outQty;
                      grandOutwardVal += outVal;
                      grandClosingVal += clVal;
                    });

                    return (
                      <table className="marine-stock-table">
                        {/* Two-tier Column Header */}
                        <thead>
                          {isColumnar ? (
                            <>
                              <tr>
                                <th rowSpan={2} style={{ width: '22%' }}>Item Description & Stock Group</th>
                                <th rowSpan={2} style={{ width: '6%', textAlign: 'center' }}>UoM</th>
                                {stockConfigOptions.showOpening && <th colSpan={3} className="center">Opening Balance</th>}
                                {stockConfigOptions.showInwards && <th colSpan={3} className="center">Inward (Purchases)</th>}
                                {stockConfigOptions.showOutwards && <th colSpan={3} className="center">Outward (Sales)</th>}
                                {stockConfigOptions.showClosing && <th colSpan={3} className="center primary-col">Closing Balance</th>}
                              </tr>
                              <tr>
                                {stockConfigOptions.showOpening && (
                                  <>
                                    <th className="right">Quantity</th>
                                    <th className="right">Rate (₹)</th>
                                    <th className="right">Value (₹)</th>
                                  </>
                                )}
                                {stockConfigOptions.showInwards && (
                                  <>
                                    <th className="right">Quantity</th>
                                    <th className="right">Rate (₹)</th>
                                    <th className="right">Value (₹)</th>
                                  </>
                                )}
                                {stockConfigOptions.showOutwards && (
                                  <>
                                    <th className="right">Quantity</th>
                                    <th className="right">Rate (₹)</th>
                                    <th className="right">Value (₹)</th>
                                  </>
                                )}
                                {stockConfigOptions.showClosing && (
                                  <>
                                    <th className="right">Quantity</th>
                                    <th className="right">Valuation Rate (₹)</th>
                                    <th className="right primary-col">Valuation (₹)</th>
                                  </>
                                )}
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <th style={{ width: '38%' }}>Item Description / Stock Group</th>
                              <th style={{ width: '12%' }}>Stock Group</th>
                              <th style={{ width: '8%', textAlign: 'center' }}>UoM</th>
                              <th style={{ width: '14%', textAlign: 'right' }}>Closing Quantity</th>
                              <th style={{ width: '14%', textAlign: 'right' }}>Valuation Rate (₹)</th>
                              <th style={{ width: '14%', textAlign: 'right' }} className="primary-col">Valuation (₹)</th>
                            </tr>
                          )}
                        </thead>

                        {/* Table Body with Groups & Items */}
                        <tbody>
                          {Object.keys(groupsMap).map((grpName) => {
                            const groupItems = groupsMap[grpName];
                            const isExpanded = expandedStockGroups[grpName] !== false;

                            // Calculate Group Totals
                            let grpClosingVal = 0;
                            let grpOpeningVal = 0;
                            let grpInwardVal = 0;
                            let grpOutwardVal = 0;

                            groupItems.forEach((it) => {
                              const itVal = getItemValuationDetails(it, vouchers, stockValuationMethod);
                              const clVal = itVal.valuation;
                              const opVal = itVal.openingVal;

                              let inVal = 0;
                              let outVal = 0;

                              vouchers.forEach((v) => {
                                if (Array.isArray(v.items)) {
                                  v.items.forEach((inv) => {
                                    if (inv.itemName && inv.itemName.toLowerCase().trim() === it.name.toLowerCase().trim()) {
                                      const q = Number(inv.quantity) || 0;
                                      const amt = Number(inv.amount) || (q * Number(inv.rate || 0));
                                      if (v.type === 'Purchase') {
                                        inVal += amt;
                                      } else if (v.type === 'Sales') {
                                        outVal += amt;
                                      }
                                    }
                                  });
                                }
                              });

                              grpOpeningVal += opVal;
                              grpInwardVal += inVal;
                              grpOutwardVal += outVal;
                              grpClosingVal += clVal;
                            });

                            return (
                              <Fragment key={grpName}>
                                {/* Stock Group Header Row */}
                                {stockViewMode !== 'condensed' && (
                                  <tr
                                    className="group-row"
                                    onClick={() => setExpandedStockGroups({ ...expandedStockGroups, [grpName]: !isExpanded })}
                                  >
                                    <td colSpan={isColumnar ? 2 : 3} style={{ color: '#38bdf8', paddingLeft: 12 }}>
                                      <span style={{ marginRight: 8 }}>{isExpanded ? '▼' : '►'}</span>
                                      <strong>{grpName.toUpperCase()}</strong> ({groupItems.length} Item{groupItems.length === 1 ? '' : 's'})
                                    </td>
                                    {isColumnar ? (
                                      <>
                                        {stockConfigOptions.showOpening && <td colSpan={3} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{grpOpeningVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>}
                                        {stockConfigOptions.showInwards && <td colSpan={3} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{grpInwardVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>}
                                        {stockConfigOptions.showOutwards && <td colSpan={3} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{grpOutwardVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>}
                                        {stockConfigOptions.showClosing && <td colSpan={3} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>₹{grpClosingVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>}
                                      </>
                                    ) : (
                                      <>
                                        <td colSpan={2} style={{ textAlign: 'right', color: '#94a3b8' }}>Group Total Valuation:</td>
                                        <td style={{ textAlign: 'right', color: '#f59e0b', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                          ₹{grpClosingVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                )}

                                {/* Stock Item Rows under this group */}
                                {(isExpanded || stockViewMode === 'condensed') && groupItems.map((it) => {
                                  const closingQty = parseNumeric(it.stock);
                                  const itVal = getItemValuationDetails(it, vouchers, stockValuationMethod);
                                  const clVal = itVal.valuation;
                                  const effectiveRate = itVal.effectiveRate;

                                  let inQty = 0;
                                  let inVal = 0;
                                  let outQty = 0;
                                  let outVal = 0;

                                  vouchers.forEach((v) => {
                                    if (Array.isArray(v.items)) {
                                      v.items.forEach((inv) => {
                                        if (inv.itemName && inv.itemName.toLowerCase().trim() === it.name.toLowerCase().trim()) {
                                          const q = Number(inv.quantity) || 0;
                                          const amt = Number(inv.amount) || (q * Number(inv.rate || 0));
                                          if (v.type === 'Purchase') {
                                            inQty += q;
                                            inVal += amt;
                                          } else if (v.type === 'Sales') {
                                            outQty += q;
                                            outVal += amt;
                                          }
                                        }
                                      });
                                    }
                                  });

                                  const opQty = itVal.openingQty;
                                  const opVal = itVal.openingVal;
                                  const opRate = opQty > 0 ? (opVal / opQty) : effectiveRate;
                                  const inRate = inQty > 0 ? (inVal / inQty) : effectiveRate;
                                  const outRate = outQty > 0 ? (outVal / outQty) : effectiveRate;

                                  return (
                                    <Fragment key={it.id}>
                                      <tr
                                        className="item-row"
                                        onClick={() => setStockDrilldownItem(it)}
                                        title={`Click for Movement Register & Lots Breakdown. Formula: ${itVal.breakdownText}`}
                                      >
                                        <td style={{ paddingLeft: stockViewMode !== 'condensed' ? 24 : 12 }}>
                                          <strong style={{ color: '#f8fafc' }}>{it.name}</strong>
                                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 6 }}>[↵ Drilldown]</span>
                                        </td>
                                        {isColumnar ? (
                                          <>
                                            <td style={{ textAlign: 'center', color: '#38bdf8' }}>{it.unit}</td>
                                            {stockConfigOptions.showOpening && (
                                              <>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{opQty > 0 ? opQty : '-'}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{opQty > 0 ? `₹${opRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{opVal > 0 ? `₹${opVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                              </>
                                            )}
                                            {stockConfigOptions.showInwards && (
                                              <>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: inQty > 0 ? '#4ade80' : '#64748b' }}>{inQty > 0 ? inQty : '-'}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{inQty > 0 ? `₹${inRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{inVal > 0 ? `₹${inVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                              </>
                                            )}
                                            {stockConfigOptions.showOutwards && (
                                              <>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: outQty > 0 ? '#f87171' : '#64748b' }}>{outQty > 0 ? outQty : '-'}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{outQty > 0 ? `₹${outRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{outVal > 0 ? `₹${outVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                                              </>
                                            )}
                                            {stockConfigOptions.showClosing && (
                                              <>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{closingQty}</td>
                                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{effectiveRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                                                  ₹{clVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                              </>
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            <td style={{ color: '#94a3b8', fontSize: '0.74rem' }}>{it.group || 'General Cargo'}</td>
                                            <td style={{ textAlign: 'center', color: '#38bdf8' }}>{it.unit}</td>
                                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{it.stock}</td>
                                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{effectiveRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                                              ₹{clVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                      {/* Detailed batch/lot valuation breakdown sub-row */}
                                      {(stockViewMode === 'detailed' || itVal.lots.length > 1) && (
                                        <tr key={`${it.id}-lots-breakdown`} style={{ background: 'rgba(15, 23, 42, 0.42)' }}>
                                          <td colSpan={isColumnar ? 14 : 6} style={{ padding: '5px 14px 7px 36px', fontSize: '0.76rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                              <span style={{ color: '#38bdf8', fontWeight: 600 }}>↳ Valuation Formula:</span>
                                              <span style={{ color: '#facc15', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                                {itVal.formulaText}
                                              </span>
                                              <span style={{ color: '#475569' }}>|</span>
                                              <span style={{ color: '#94a3b8' }}>
                                                Batches: <strong style={{ color: '#cbd5e1' }}>{itVal.breakdownText}</strong>
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </Fragment>
                                  );
                                })}
                              </Fragment>
                            );
                          })}
                        </tbody>

                        {/* Grand Totals Footer Row */}
                        <tfoot>
                          <tr>
                            <td colSpan={isColumnar ? 2 : 3} style={{ padding: '10px 14px' }}>
                              TOTAL INVENTORY VALUATION ({filteredStockItems.length} Items)
                            </td>
                            {isColumnar ? (
                              <>
                                {stockConfigOptions.showOpening && (
                                  <>
                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{grandOpeningQty}</td>
                                    <td></td>
                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{grandOpeningVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                  </>
                                )}
                                {stockConfigOptions.showInwards && (
                                  <>
                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#4ade80' }}>{grandInwardQty}</td>
                                    <td></td>
                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{grandInwardVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                  </>
                                )}
                                {stockConfigOptions.showOutwards && (
                                  <>
                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#f87171' }}>{grandOutwardQty}</td>
                                    <td></td>
                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{grandOutwardVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                  </>
                                )}
                                {stockConfigOptions.showClosing && (
                                  <>
                                    <td colSpan={2} style={{ textAlign: 'right', color: '#94a3b8' }}>Grand Total Valuation:</td>
                                    <td style={{ textAlign: 'right', color: '#4ade80', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
                                      ₹{grandClosingVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <td colSpan={2} style={{ textAlign: 'right', color: '#94a3b8' }}>Grand Total Valuation:</td>
                                <td style={{ textAlign: 'right', color: '#4ade80', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
                                  ₹{grandClosingVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                              </>
                            )}
                          </tr>
                        </tfoot>
                      </table>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Authentic Marine Matrice Footer Bar */}
            <div className="marine-footer-bar">
              <span className="marine-hint">
                {stockDrilldownItem
                  ? '[Backspace: Back to Summary | Esc: Close]'
                  : '[Enter: Drilldown to Item Movement Register | F1: Detailed/Condensed | F4: Group | F5: Columnar Flow | F7: Valuation | F12: Configure | Esc: Close]'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {stockDrilldownItem && (
                  <button
                    className="marine-btn-primary"
                    style={{ padding: '3px 12px', fontSize: '0.74rem' }}
                    onClick={() => setStockDrilldownItem(null)}
                  >
                    Back to Summary (Backspace)
                  </button>
                )}
                <button
                  className="marine-btn-secondary"
                  onClick={() => setActiveModal(null)}
                >
                  Close (Esc)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. REPORTS: RATIO ANALYSIS */}
      {activeModal === 'rep_ratio' && (
        <div className="marine-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="marine-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="marine-modal-header">
              <div className="marine-modal-title">
                <span className="marine-badge">Ratio Analysis</span>
                <span>Financial Health & Efficiency Ratios</span>
              </div>
              <button className="marine-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="marine-modal-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="marine-info-block">
                  <div className="marine-info-header">Liquidity Ratios</div>
                  <div className="marine-info-body">
                    <div className="marine-info-row">
                      <span className="marine-info-lbl">Current Ratio:</span>
                      <span className="marine-info-val highlight">2.42 : 1</span>
                    </div>
                    <div className="marine-info-row">
                      <span className="marine-info-lbl">Quick Ratio (Acid Test):</span>
                      <span className="marine-info-val highlight">1.84 : 1</span>
                    </div>
                    <div className="marine-info-row">
                      <span className="marine-info-lbl">Working Capital:</span>
                      <span className="marine-info-val">₹6,35,700.00</span>
                    </div>
                  </div>
                </div>

                <div className="marine-info-block">
                  <div className="marine-info-header">Profitability Ratios</div>
                  <div className="marine-info-body">
                    <div className="marine-info-row">
                      <span className="marine-info-lbl">Gross Profit %:</span>
                      <span className="marine-info-val" style={{ color: '#4ade80' }}>45.50 %</span>
                    </div>
                    <div className="marine-info-row">
                      <span className="marine-info-lbl">Net Profit %:</span>
                      <span className="marine-info-val" style={{ color: '#4ade80' }}>30.34 %</span>
                    </div>
                    <div className="marine-info-row">
                      <span className="marine-info-lbl">Return on Capital:</span>
                      <span className="marine-info-val">32.68 %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="marine-footer-bar">
              <span className="marine-hint">Industry benchmark for Maritime Commerce is met and exceeded</span>
              <button className="marine-btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. QUIT CONFIRMATION DIALOG (Marine Matrice) */}
      {showQuitModal && (
        <div className="marine-modal-backdrop" onClick={() => setShowQuitModal(false)}>
          <div className="marine-quit-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="marine-quit-title">Quit ?</div>
            <div className="marine-quit-subtitle">
              Do you want to exit to company list?
            </div>
            <div className="marine-quit-btn-group">
              <button
                className="marine-accept-yes"
                onClick={() => router.push('/create')}
                autoFocus
              >
                Yes (Y)
              </button>
              <button
                className="marine-accept-no"
                onClick={() => setShowQuitModal(false)}
              >
                No (N)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
