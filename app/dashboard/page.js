'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

// Default initial vouchers if none exist in localStorage
const DEFAULT_VOUCHERS = [
  {
    id: 'v-101',
    date: '06-Sep-2026',
    type: 'Sales',
    voucherNo: 'INV/2026/089',
    particulars: 'Oceanic Marine Exports Pvt Ltd',
    account: 'Sales Accounts',
    amount: 145000,
    isDebit: false,
    narration: 'Being marine grade seafood and sensor consignment delivered',
  },
  {
    id: 'v-102',
    date: '05-Sep-2026',
    type: 'Receipt',
    voucherNo: 'REC/2026/042',
    particulars: 'Pacific Fleet Logistics',
    account: 'State Bank of India',
    amount: 88500,
    isDebit: true,
    narration: 'Payment received via RTGS against bill #074',
  },
  {
    id: 'v-103',
    date: '04-Sep-2026',
    type: 'Purchase',
    voucherNo: 'PUR/2026/033',
    particulars: 'Harbor Hardware & Sensors Ltd',
    account: 'Purchase Accounts',
    amount: 52400,
    isDebit: true,
    narration: 'Purchase of raw telemetry sensors and micro-controllers',
  },
  {
    id: 'v-104',
    date: '03-Sep-2026',
    type: 'Payment',
    voucherNo: 'PAY/2026/061',
    particulars: 'Visakhapatnam Port Trust',
    account: 'State Bank of India',
    amount: 24000,
    isDebit: true,
    narration: 'Monthly dock berthing and terminal charges paid via NEFT',
  },
  {
    id: 'v-105',
    date: '02-Sep-2026',
    type: 'Contra',
    voucherNo: 'CNT/2026/015',
    particulars: 'Cash In Hand',
    account: 'State Bank of India',
    amount: 15000,
    isDebit: false,
    narration: 'Cash deposited into SBI current account',
  },
];

// Default initial masters
const DEFAULT_LEDGERS = [
  { id: 'l-1', name: 'Oceanic Marine Exports Pvt Ltd', group: 'Sundry Debtors', balance: '₹1,45,000.00 Dr', rawBalance: 145000, drCr: 'Dr' },
  { id: 'l-2', name: 'Harbor Hardware & Sensors Ltd', group: 'Sundry Creditors', balance: '₹52,400.00 Cr', rawBalance: 52400, drCr: 'Cr' },
  { id: 'l-3', name: 'Sales Accounts', group: 'Sales Accounts', balance: '₹12,80,000.00 Cr', rawBalance: 1280000, drCr: 'Cr' },
  { id: 'l-4', name: 'Purchase Accounts', group: 'Purchase Accounts', balance: '₹6,40,000.00 Dr', rawBalance: 640000, drCr: 'Dr' },
  { id: 'l-5', name: 'State Bank of India', group: 'Bank Accounts', balance: '₹3,84,500.00 Dr', rawBalance: 384500, drCr: 'Dr' },
  { id: 'l-6', name: 'Cash In Hand', group: 'Cash-in-Hand', balance: '₹45,200.00 Dr', rawBalance: 45200, drCr: 'Dr' },
  { id: 'l-7', name: 'Port Operations & Freight', group: 'Direct Expenses', balance: '₹1,12,000.00 Dr', rawBalance: 112000, drCr: 'Dr' },
  { id: 'l-8', name: 'Office Rent & Utilities', group: 'Indirect Expenses', balance: '₹65,000.00 Dr', rawBalance: 65000, drCr: 'Dr' },
];

const DEFAULT_ITEMS = [
  { id: 'i-1', name: 'Syntax Marine IoT Sensor Module', unit: 'Pcs', rate: '₹4,500', stock: '240 Pcs' },
  { id: 'i-2', name: 'High-Grade Deep Sea Salt (10kg)', unit: 'Bags', rate: '₹350', stock: '850 Bags' },
  { id: 'i-3', name: 'Seaweed Bio-Polymer Resin (50kg)', unit: 'Drums', rate: '₹12,000', stock: '45 Drums' },
  { id: 'i-4', name: 'Aquaculture Aeration Valve V2', unit: 'Sets', rate: '₹1,850', stock: '120 Sets' },
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
    fssai: '10020000000000',
    phone: '+91 891 2548900',
    finYear: '1-Apr-2026',
    booksBegin: '1-Apr-2026',
  });

  // Modals & Navigation state
  const [activeModal, setActiveModal] = useState(null); // 'master_create' | 'master_alter' | 'master_chart' | 'trans_vouchers' | 'trans_daybook' | 'rep_balance' | 'rep_pl' | 'rep_stock' | 'rep_ratio' | null
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);

  // Vouchers state
  const [vouchers, setVouchers] = useState([]);
  const [newVoucher, setNewVoucher] = useState({
    type: 'Sales',
    voucherNo: '',
    date: '06-Sep-2026',
    particulars: '',
    account: 'Sales Accounts',
    amount: '',
    narration: '',
  });
  const [voucherFilter, setVoucherFilter] = useState('All');
  const [showVoucherAcceptPrompt, setShowVoucherAcceptPrompt] = useState(false);

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
      // MASTERS
      { section: 'MASTERS', label: 'Create', hotkey: 'C', keyChar: 'c', action: 'master_create', desc: 'Masters, Ledgers, Items' },
      { section: 'MASTERS', label: 'Alter', hotkey: 'A', keyChar: 'a', action: 'master_alter', desc: 'Modify existing records' },
      { section: 'MASTERS', label: 'Chart of Accounts', hotkey: 'h', keyChar: 'h', action: 'master_chart', desc: 'Account hierarchy & trees', highlightPos: 1 },
      // TRANSACTIONS
      { section: 'TRANSACTIONS', label: 'Vouchers', hotkey: 'V', keyChar: 'v', action: 'trans_vouchers', desc: 'Sales, Purchase, Payments' },
      { section: 'TRANSACTIONS', label: 'Day Book', hotkey: 'D', keyChar: 'd', action: 'trans_daybook', desc: 'Daily transaction register' },
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

      // Load vouchers
      const savedVouchers = localStorage.getItem('tally_vouchers');
      if (savedVouchers) {
        try {
          setVouchers(JSON.parse(savedVouchers));
        } catch (e) {
          setVouchers(DEFAULT_VOUCHERS);
        }
      } else {
        setVouchers(DEFAULT_VOUCHERS);
        localStorage.setItem('tally_vouchers', JSON.stringify(DEFAULT_VOUCHERS));
      }

      // Load ledgers
      const savedLedgers = localStorage.getItem('tally_ledgers');
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
        localStorage.setItem('tally_ledgers', JSON.stringify(DEFAULT_LEDGERS));
      }

      // Load items
      const savedItems = localStorage.getItem('tally_items');
      if (savedItems) {
        try {
          setItems(JSON.parse(savedItems));
        } catch (e) {
          setItems(DEFAULT_ITEMS);
        }
      } else {
        setItems(DEFAULT_ITEMS);
        localStorage.setItem('tally_items', JSON.stringify(DEFAULT_ITEMS));
      }
    }
  }, []);

  // Update voucher number and default offset account when voucher type changes
  useEffect(() => {
    const prefixMap = {
      Sales: 'INV',
      Purchase: 'PUR',
      Payment: 'PAY',
      Receipt: 'REC',
      Contra: 'CNT',
      Journal: 'JRN',
    };
    const prefix = prefixMap[newVoucher.type] || 'VCH';
    const randomNum = Math.floor(100 + Math.random() * 900);

    let defaultOffset = 'Sales Accounts';
    if (newVoucher.type === 'Purchase') defaultOffset = 'Purchase Accounts';
    if (newVoucher.type === 'Payment' || newVoucher.type === 'Receipt' || newVoucher.type === 'Contra') {
      defaultOffset = 'State Bank of India';
    }

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
        if (e.key === 'Escape') {
          if (showVoucherAcceptPrompt) {
            setShowVoucherAcceptPrompt(false);
          } else if (editingLedger) {
            setEditingLedger(null);
          } else if (editingItem) {
            setEditingItem(null);
          } else {
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
        localStorage.setItem('tally_ledgers', JSON.stringify(updated));
      }

      alert(`Ledger "${created.name}" created under ${created.group} with Opening Balance: ${formattedBalance}`);
    } else {
      const created = {
        id: 'i-' + Date.now(),
        name: newMaster.name.trim(),
        unit: newMaster.unit || 'Pcs',
        rate: newMaster.rate ? `₹${parseFloat(newMaster.rate) || 0}` : '₹0.00',
        stock: newMaster.balance ? `${newMaster.balance} ${newMaster.unit || 'Pcs'}` : `0 ${newMaster.unit || 'Pcs'}`,
      };
      const updated = [...items, created];
      setItems(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tally_items', JSON.stringify(updated));
      }
      alert(`Stock Item "${created.name}" created successfully.`);
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
      localStorage.setItem('tally_ledgers', JSON.stringify(updatedList));
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
        localStorage.setItem('tally_ledgers', JSON.stringify(updatedList));
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
      localStorage.setItem('tally_items', JSON.stringify(updatedList));
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
        localStorage.setItem('tally_items', JSON.stringify(updatedList));
      }
      setEditingItem(null);
    }
  };

  // Save new Voucher
  const handleSaveVoucher = () => {
    if (!newVoucher.particulars || !newVoucher.amount) {
      alert('Please fill in Particulars/Party Name and Amount.');
      return;
    }

    const created = {
      id: 'v-' + Date.now(),
      date: newVoucher.date || '06-Sep-2026',
      type: newVoucher.type,
      voucherNo: newVoucher.voucherNo,
      particulars: newVoucher.particulars,
      account: newVoucher.account || (newVoucher.type === 'Sales' ? 'Sales Accounts' : 'State Bank of India'),
      amount: parseFloat(newVoucher.amount) || 0,
      isDebit: newVoucher.type === 'Purchase' || newVoucher.type === 'Payment',
      narration: newVoucher.narration || `Recorded under ${newVoucher.type}`,
    };

    const updated = [created, ...vouchers];
    setVouchers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tally_vouchers', JSON.stringify(updated));
    }

    setShowVoucherAcceptPrompt(false);
    setActiveModal('trans_daybook'); // direct to daybook to view recorded entry
  };

  // Delete Voucher
  const handleDeleteVoucher = (id) => {
    const updated = vouchers.filter((v) => v.id !== id);
    setVouchers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tally_vouchers', JSON.stringify(updated));
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

  // Selected party balance for Voucher entry screen
  const selectedPartyLedger = ledgers.find((l) => l.name === newVoucher.particulars);

  // Grouped Menu Sections
  const groupedSections = ['MASTERS', 'TRANSACTIONS', 'REPORTS', 'QUIT'];

  return (
    <div className="tally-gateway-viewport">
      {/* Top Tally Function Keys Bar */}
      <div className="tally-fkey-ribbon">
        <span className="tally-badge" style={{ marginRight: 6 }}>TallyPrime</span>
        <button
          className="tally-fkey-item"
          onClick={() => router.push('/create')}
          title="F1: Select Company"
        >
          <span className="tally-fkey-badge">F1:</span> Select Comp
        </button>
        <button
          className="tally-fkey-item"
          onClick={() => alert(`Current Period: 1-Apr-2026 to 31-Mar-2027\nDate: 06-Sep-2026`)}
          title="F2: Date / Period"
        >
          <span className="tally-fkey-badge">F2:</span> Date
        </button>
        <button
          className="tally-fkey-item"
          onClick={() => router.push('/create')}
          title="F3: Company Settings"
        >
          <span className="tally-fkey-badge">F3:</span> Company
        </button>
        <button
          className="tally-fkey-item"
          onClick={() => triggerAction('trans_vouchers')}
          title="Vouchers Entry"
        >
          <span className="tally-fkey-badge">Alt+V:</span> Vouchers
        </button>
        <button
          className="tally-fkey-item"
          onClick={() => triggerAction('trans_daybook')}
          title="Day Book"
        >
          <span className="tally-fkey-badge">Alt+D:</span> Day Book
        </button>
        <button
          className="tally-fkey-item"
          onClick={() => setShowQuitModal(true)}
          style={{ marginLeft: 'auto', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
        >
          <span className="tally-fkey-badge" style={{ color: '#f87171' }}>Esc:</span> Quit
        </button>
      </div>

      {/* Main Split Gateway Area */}
      <div className="tally-gateway-split">
        {/* Left Side: Current Period, Date & Company Details */}
        <aside className="tally-gateway-left">
          {/* Current Period Block */}
          <div className="tally-info-block">
            <div className="tally-info-header">
              <span>Current Period</span>
              <span style={{ color: '#94a3b8' }}>FY 2026-27</span>
            </div>
            <div className="tally-info-body">
              <div className="tally-info-row">
                <span className="tally-info-lbl">From:</span>
                <span className="tally-info-val highlight">1-Apr-2026</span>
              </div>
              <div className="tally-info-row">
                <span className="tally-info-lbl">To:</span>
                <span className="tally-info-val highlight">31-Mar-2027</span>
              </div>
            </div>
          </div>

          {/* Current Date Block */}
          <div className="tally-info-block">
            <div className="tally-info-header">
              <span>Current Date</span>
              <span style={{ color: '#38bdf8' }}>Active Session</span>
            </div>
            <div className="tally-info-body">
              <div className="tally-info-row">
                <span className="tally-info-lbl">Date:</span>
                <span className="tally-info-val">Sunday, 6-Sep-2026</span>
              </div>
              <div className="tally-info-row">
                <span className="tally-info-lbl">Last Voucher Date:</span>
                <span className="tally-info-val" style={{ color: '#4ade80' }}>
                  {vouchers.length > 0 ? vouchers[0].date : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Company Details Block (No summary badges as requested) */}
          <div className="tally-info-block" style={{ flex: 1 }}>
            <div className="tally-info-header">
              <span>Selected Company</span>
              <span className="tally-badge">Active</span>
            </div>
            <div className="tally-info-body">
              <div className="tally-info-row">
                <span className="tally-info-lbl">Company Name:</span>
                <span className="tally-info-val highlight" style={{ fontSize: '0.92rem' }}>
                  {companyInfo.name}
                </span>
              </div>
              {companyInfo.mailingName && (
                <div className="tally-info-row">
                  <span className="tally-info-lbl">Mailing Name:</span>
                  <span className="tally-info-val">{companyInfo.mailingName}</span>
                </div>
              )}
              <div className="tally-info-row">
                <span className="tally-info-lbl">GSTIN:</span>
                <span className="tally-info-val" style={{ color: '#00f0ff' }}>
                  {companyInfo.gst || 'Not Specified'}
                </span>
              </div>
              <div className="tally-info-row">
                <span className="tally-info-lbl">FSSAI Lic No:</span>
                <span className="tally-info-val">{companyInfo.fssai || 'Not Specified'}</span>
              </div>
              <div className="tally-info-row">
                <span className="tally-info-lbl">State:</span>
                <span className="tally-info-val">{companyInfo.state || 'Andhra Pradesh'}</span>
              </div>
              <div className="tally-info-row">
                <span className="tally-info-lbl">Address:</span>
                <span className="tally-info-val" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {companyInfo.address}
                </span>
              </div>
              <div className="tally-info-row">
                <span className="tally-info-lbl">Contact Phone:</span>
                <span className="tally-info-val">{companyInfo.phone}</span>
              </div>
              <div className="tally-info-row">
                <span className="tally-info-lbl">Books Beginning:</span>
                <span className="tally-info-val">1-Apr-2026</span>
              </div>
            </div>
          </div>

          {/* Switch Company Action */}
          <button
            onClick={() => router.push('/create')}
            className="tally-btn-secondary"
          >
            ⇆ Switch / Alter Company Record
          </button>
        </aside>

        {/* Right Side: The Iconic Gateway of Tally Menu Card */}
        <main className="tally-gateway-right">
          <div className="tally-gateway-card">
            {/* Header */}
            <div className="tally-gateway-card-header">
              <div className="tally-gateway-title">Gateway of Tally</div>
              <div className="tally-gateway-subtitle">{companyInfo.name}</div>
            </div>

            {/* Menu Sections */}
            <div className="tally-gateway-menu-list">
              {groupedSections.map((secName) => {
                const secItems = menuItems.filter((m) => m.section === secName);
                if (!secItems.length) return null;

                return (
                  <div key={secName} className="tally-gateway-section-group">
                    <div className="tally-menu-section-header">{secName}</div>
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
                          className={`tally-menu-item ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setMenuIndex(itemOverallIndex);
                            triggerAction(item.action);
                          }}
                          onMouseEnter={() => setMenuIndex(itemOverallIndex)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>
                              {hPos > 0 && label.substring(0, hPos)}
                              <span className="tally-hotkey">
                                {label.charAt(hPos !== -1 ? hPos : 0)}
                              </span>
                              {label.substring((hPos !== -1 ? hPos : 0) + 1)}
                            </span>
                            <span className="tally-menu-desc">({item.desc})</span>
                          </div>
                          <span className="tally-menu-arrow">▶</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Hint bar at bottom */}
            <div className="tally-gateway-footer-hint">
              <span>Use ↑ ↓ to navigate, Enter to select</span>
              <span style={{ color: '#00f0ff' }}>Or Press Highlighted Key</span>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================
          MODALS & SUB-SCREENS
         ========================================================= */}

      {/* 1. MASTERS: CREATE MODAL */}
      {activeModal === 'master_create' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Master Creation</span>
                <span>TallyPrime Accounting & Inventory Masters</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="tally-voucher-bar">
              <button
                className={`tally-voucher-btn ${masterTab === 'ledgers' ? 'active' : ''}`}
                onClick={() => setMasterTab('ledgers')}
              >
                1. Ledger Master
              </button>
              <button
                className={`tally-voucher-btn ${masterTab === 'items' ? 'active' : ''}`}
                onClick={() => setMasterTab('items')}
              >
                2. Stock Item Master
              </button>
            </div>

            <div className="tally-modal-content">
              {masterTab === 'ledgers' ? (
                <div>
                  <div className="tally-row">
                    <span className="tally-lbl">Ledger Name</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="text"
                        className="tally-field"
                        placeholder="e.g. Coastline Trading Co. (Debtor/Creditor)"
                        value={newMaster.name}
                        onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="tally-row">
                    <span className="tally-lbl">Under (Group)</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <select
                        className="tally-field tally-select"
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
                  <div className="tally-row">
                    <span className="tally-lbl">Opening Balance</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap" style={{ display: 'flex' }}>
                      <span className="tally-prefix">₹</span>
                      <input
                        type="number"
                        className="tally-field tally-mobile-input"
                        placeholder="0.00"
                        value={newMaster.balance}
                        onChange={(e) => setNewMaster({ ...newMaster, balance: e.target.value })}
                        style={{ borderRight: 'none' }}
                      />
                      <select
                        className="tally-field tally-select tally-dr-cr-select"
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
                  <div className="tally-row">
                    <span className="tally-lbl">Stock Item Name</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="text"
                        className="tally-field"
                        placeholder="e.g. Marine Telemetry Sensor"
                        value={newMaster.name}
                        onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="tally-row">
                    <span className="tally-lbl">Units of Measure</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <select
                        className="tally-field tally-select"
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
                  <div className="tally-row">
                    <span className="tally-lbl">Standard Rate (₹)</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="number"
                        className="tally-field"
                        placeholder="e.g. 3500"
                        value={newMaster.rate}
                        onChange={(e) => setNewMaster({ ...newMaster, rate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="tally-row">
                    <span className="tally-lbl">Opening Quantity</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="number"
                        className="tally-field"
                        placeholder="0"
                        value={newMaster.balance}
                        onChange={(e) => setNewMaster({ ...newMaster, balance: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="tally-footer-bar">
              <span className="tally-hint">Press Save Master to record in Tally database</span>
              <button className="tally-btn-proceed" onClick={handleSaveMaster}>
                Save Master (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MASTERS: ALTER / VIEW MASTER LIST MODAL */}
      {activeModal === 'master_alter' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Master Alteration</span>
                <span>
                  {editingLedger
                    ? `Alter Ledger: ${editingLedger.name}`
                    : editingItem
                    ? `Alter Stock Item: ${editingItem.name}`
                    : `List of Masters in ${companyInfo.name}`}
                </span>
              </div>
              <button
                className="tally-modal-close-btn"
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
              <div className="tally-voucher-bar">
                <button
                  className={`tally-voucher-btn ${masterTab === 'ledgers' ? 'active' : ''}`}
                  onClick={() => setMasterTab('ledgers')}
                >
                  Ledgers ({ledgers.length})
                </button>
                <button
                  className={`tally-voucher-btn ${masterTab === 'items' ? 'active' : ''}`}
                  onClick={() => setMasterTab('items')}
                >
                  Stock Items ({items.length})
                </button>
              </div>
            )}

            <div className="tally-modal-content" style={{ maxHeight: 460 }}>
              {/* EDITING LEDGER FORM */}
              {editingLedger ? (
                <div>
                  <div style={{ marginBottom: 16, color: '#38bdf8', fontSize: '0.88rem', fontWeight: 700 }}>
                    ✎ Modify Ledger Account Details & Opening Balance:
                  </div>

                  <div className="tally-row">
                    <span className="tally-lbl">Ledger Name</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="text"
                        className="tally-field"
                        value={editingLedger.name}
                        onChange={(e) => setEditingLedger({ ...editingLedger, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="tally-row">
                    <span className="tally-lbl">Under (Group)</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <select
                        className="tally-field tally-select"
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

                  <div className="tally-row">
                    <span className="tally-lbl">Opening Balance</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap" style={{ display: 'flex' }}>
                      <span className="tally-prefix">₹</span>
                      <input
                        type="number"
                        className="tally-field tally-mobile-input"
                        placeholder="0.00"
                        value={editingLedger.rawBalance !== undefined ? editingLedger.rawBalance : parseBalanceAmount(editingLedger.balance)}
                        onChange={(e) => setEditingLedger({ ...editingLedger, rawBalance: e.target.value })}
                        style={{ borderRight: 'none' }}
                      />
                      <select
                        className="tally-field tally-select tally-dr-cr-select"
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
                      className="tally-btn-secondary"
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
                      className="tally-btn-proceed"
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

                  <div className="tally-row">
                    <span className="tally-lbl">Item Name</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="text"
                        className="tally-field"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="tally-row">
                    <span className="tally-lbl">Units of Measure</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <select
                        className="tally-field tally-select"
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

                  <div className="tally-row">
                    <span className="tally-lbl">Standard Rate</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="text"
                        className="tally-field"
                        value={editingItem.rate}
                        onChange={(e) => setEditingItem({ ...editingItem, rate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="tally-row">
                    <span className="tally-lbl">Closing Stock</span>
                    <span className="tally-colon">:</span>
                    <div className="tally-input-wrap">
                      <input
                        type="text"
                        className="tally-field"
                        value={editingItem.stock}
                        onChange={(e) => setEditingItem({ ...editingItem, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      className="tally-btn-secondary"
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
                      className="tally-btn-proceed"
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
                    className="tally-search-bar"
                    placeholder={`Type to filter ${masterTab === 'ledgers' ? 'ledgers (e.g. Debtor, Creditor, SBI)' : 'items'}...`}
                    value={searchMasterQuery}
                    onChange={(e) => setSearchMasterQuery(e.target.value)}
                  />

                  {masterTab === 'ledgers' ? (
                    <table className="tally-table">
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
                            className="tally-table-row"
                            onClick={() =>
                              setEditingLedger({
                                ...l,
                                rawBalance: l.rawBalance !== undefined ? l.rawBalance : parseBalanceAmount(l.balance),
                                drCr: l.drCr || (l.balance && l.balance.includes('Cr') ? 'Cr' : 'Dr'),
                              })
                            }
                            title="Click to alter ledger"
                          >
                            <td className="tally-td-name">
                              <strong>{l.name}</strong>
                            </td>
                            <td style={{ color: '#38bdf8' }}>{l.group}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b' }}>
                              {l.balance}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="tally-alter-action-btn"
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
                    <table className="tally-table">
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
                            className="tally-table-row"
                            onClick={() => setEditingItem({ ...i })}
                            title="Click to alter stock item"
                          >
                            <td className="tally-td-name">
                              <strong>{i.name}</strong>
                            </td>
                            <td style={{ color: '#38bdf8' }}>{i.unit}</td>
                            <td>{i.rate}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#4ade80' }}>
                              {i.stock}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="tally-alter-action-btn"
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
              <div className="tally-footer-bar">
                <span className="tally-hint">Click on any row or click [Alter] to edit Opening Balance or Group</span>
                <button
                  className="tally-btn-secondary"
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
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Chart of Accounts</span>
                <span>Accounting Tree Hierarchy</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="tally-modal-content" style={{ maxHeight: 460 }}>
              {/* CURRENT ASSETS & BANK */}
              <div className="tally-tree-group">
                <div className="tally-tree-header">
                  <span>1. CURRENT ASSETS & BANK (DEBIT NATURE)</span>
                  <span style={{ color: '#4ade80' }}>₹{(totalBankBalance + totalCashBalance + totalDebtorsBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Dr</span>
                </div>
                {bankList.map((b) => (
                  <div key={b.id} className="tally-tree-item">
                    <span>• {b.name} (Bank Account)</span>
                    <span style={{ color: '#f59e0b' }}>{b.balance}</span>
                  </div>
                ))}
                {cashList.map((c) => (
                  <div key={c.id} className="tally-tree-item">
                    <span>• {c.name} (Cash-in-Hand)</span>
                    <span style={{ color: '#f59e0b' }}>{c.balance}</span>
                  </div>
                ))}
                {debtorsList.map((d) => (
                  <div key={d.id} className="tally-tree-item">
                    <span>• {d.name} <span style={{ color: '#38bdf8' }}>(Sundry Debtor)</span></span>
                    <span style={{ color: '#f59e0b' }}>{d.balance}</span>
                  </div>
                ))}
              </div>

              {/* CURRENT LIABILITIES & CREDITORS */}
              <div className="tally-tree-group">
                <div className="tally-tree-header">
                  <span>2. CURRENT LIABILITIES (CREDIT NATURE)</span>
                  <span style={{ color: '#f87171' }}>₹{totalCreditorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr</span>
                </div>
                {creditorsList.map((c) => (
                  <div key={c.id} className="tally-tree-item">
                    <span>• {c.name} <span style={{ color: '#38bdf8' }}>(Sundry Creditor)</span></span>
                    <span style={{ color: '#f87171' }}>{c.balance}</span>
                  </div>
                ))}
                {ledgers.filter((l) => l.group === 'Duties & Taxes').map((dt) => (
                  <div key={dt.id} className="tally-tree-item">
                    <span>• {dt.name} (Duties & Taxes)</span>
                    <span style={{ color: '#f87171' }}>{dt.balance}</span>
                  </div>
                ))}
              </div>

              {/* REVENUE & INCOMES */}
              <div className="tally-tree-group">
                <div className="tally-tree-header">
                  <span>3. REVENUE & INCOME</span>
                  <span style={{ color: '#38bdf8' }}>Credit Nature</span>
                </div>
                {ledgers.filter((l) => l.group === 'Sales Accounts' || l.group === 'Direct Incomes').map((s) => (
                  <div key={s.id} className="tally-tree-item">
                    <span>• {s.name} ({s.group})</span>
                    <span style={{ color: '#38bdf8' }}>{s.balance}</span>
                  </div>
                ))}
              </div>

              {/* EXPENSES */}
              <div className="tally-tree-group">
                <div className="tally-tree-header">
                  <span>4. EXPENSES (DIRECT & INDIRECT)</span>
                  <span style={{ color: '#c084fc' }}>Debit Nature</span>
                </div>
                {ledgers.filter((l) => l.group === 'Direct Expenses' || l.group === 'Indirect Expenses' || l.group === 'Purchase Accounts').map((e) => (
                  <div key={e.id} className="tally-tree-item">
                    <span>• {e.name} ({e.group})</span>
                    <span style={{ color: '#c084fc' }}>{e.balance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tally-footer-bar">
              <span className="tally-hint">Dynamic real-time tree reflecting all created Debtors, Creditors, and Bank accounts</span>
              <button className="tally-btn-secondary" onClick={() => setActiveModal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRANSACTIONS: RECORD VOUCHER SCREEN */}
      {activeModal === 'trans_vouchers' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Accounting Voucher</span>
                <span>{newVoucher.type} Voucher Recording</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            {/* Voucher Function Keys Selector */}
            <div className="tally-voucher-bar">
              <button
                className={`tally-voucher-btn ${newVoucher.type === 'Contra' ? 'active' : ''}`}
                onClick={() => setNewVoucher({ ...newVoucher, type: 'Contra' })}
              >
                F4: Contra
              </button>
              <button
                className={`tally-voucher-btn ${newVoucher.type === 'Payment' ? 'active' : ''}`}
                onClick={() => setNewVoucher({ ...newVoucher, type: 'Payment' })}
              >
                F5: Payment
              </button>
              <button
                className={`tally-voucher-btn ${newVoucher.type === 'Receipt' ? 'active' : ''}`}
                onClick={() => setNewVoucher({ ...newVoucher, type: 'Receipt' })}
              >
                F6: Receipt
              </button>
              <button
                className={`tally-voucher-btn ${newVoucher.type === 'Journal' ? 'active' : ''}`}
                onClick={() => setNewVoucher({ ...newVoucher, type: 'Journal' })}
              >
                F7: Journal
              </button>
              <button
                className={`tally-voucher-btn ${newVoucher.type === 'Sales' ? 'active' : ''}`}
                onClick={() => setNewVoucher({ ...newVoucher, type: 'Sales' })}
              >
                F8: Sales
              </button>
              <button
                className={`tally-voucher-btn ${newVoucher.type === 'Purchase' ? 'active' : ''}`}
                onClick={() => setNewVoucher({ ...newVoucher, type: 'Purchase' })}
              >
                F9: Purchase
              </button>
            </div>

            <div className="tally-modal-content">
              <div className="tally-voucher-grid">
                <div className="tally-row">
                  <span className="tally-lbl">Voucher No</span>
                  <span className="tally-colon">:</span>
                  <div className="tally-input-wrap">
                    <input
                      type="text"
                      className="tally-field"
                      value={newVoucher.voucherNo}
                      onChange={(e) => setNewVoucher({ ...newVoucher, voucherNo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="tally-row">
                  <span className="tally-lbl">Date</span>
                  <span className="tally-colon">:</span>
                  <div className="tally-input-wrap">
                    <input
                      type="text"
                      className="tally-field"
                      value={newVoucher.date}
                      onChange={(e) => setNewVoucher({ ...newVoucher, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Party Ledger Selector with Auto-Suggest Datalist & Current Balance */}
              <div className="tally-row">
                <span className="tally-lbl">Particulars / Party A/c</span>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    list="ledger-party-options"
                    className="tally-field"
                    placeholder="Select or type party ledger (e.g. Oceanic Marine Exports)"
                    value={newVoucher.particulars}
                    onChange={(e) => setNewVoucher({ ...newVoucher, particulars: e.target.value })}
                    autoFocus
                  />
                  <datalist id="ledger-party-options">
                    {ledgers.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name} ({l.group} - {l.balance})
                      </option>
                    ))}
                  </datalist>
                  {selectedPartyLedger && (
                    <div className="tally-party-balance-preview">
                      Current Ledger Balance: <strong>{selectedPartyLedger.balance}</strong> ({selectedPartyLedger.group})
                    </div>
                  )}
                </div>
              </div>

              {/* Offset / Account Selector */}
              <div className="tally-row">
                <span className="tally-lbl">Account / Offset A/c</span>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <select
                    className="tally-field tally-select"
                    value={newVoucher.account}
                    onChange={(e) => setNewVoucher({ ...newVoucher, account: e.target.value })}
                  >
                    {ledgers.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name} ({l.group})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="tally-row">
                <span className="tally-lbl">Amount (₹)</span>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="number"
                    className="tally-field"
                    placeholder="0.00"
                    value={newVoucher.amount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, amount: e.target.value })}
                    style={{ fontSize: '1.05rem', color: '#00f0ff', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div className="tally-row tally-row-align-top">
                <span className="tally-lbl">Narration</span>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <textarea
                    className="tally-field tally-textarea"
                    placeholder="Provide transaction narration/remarks..."
                    value={newVoucher.narration}
                    onChange={(e) => setNewVoucher({ ...newVoucher, narration: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="tally-footer-bar">
              <span className="tally-hint">Press Save Voucher to initiate Accept prompt</span>

              {showVoucherAcceptPrompt ? (
                <div className="tally-accept-dialog">
                  <span className="tally-accept-title">Accept?</span>
                  <div className="tally-accept-actions">
                    <button className="tally-accept-yes" onClick={handleSaveVoucher}>
                      Yes (Y)
                    </button>
                    <button
                      className="tally-accept-no"
                      onClick={() => setShowVoucherAcceptPrompt(false)}
                    >
                      No (N)
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="tally-btn-proceed"
                  onClick={() => setShowVoucherAcceptPrompt(true)}
                >
                  Save Voucher (Enter)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TRANSACTIONS: DAY BOOK SCREEN */}
      {activeModal === 'trans_daybook' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" style={{ maxWidth: 1000 }} onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Day Book</span>
                <span>Transactions Audit Register ({companyInfo.name})</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            {/* Filter bar */}
            <div className="tally-voucher-bar">
              {['All', 'Sales', 'Purchase', 'Payment', 'Receipt', 'Contra', 'Journal'].map((f) => (
                <button
                  key={f}
                  className={`tally-voucher-btn ${voucherFilter === f ? 'active' : ''}`}
                  onClick={() => setVoucherFilter(f)}
                >
                  {f}
                </button>
              ))}
              <button
                className="tally-voucher-btn"
                style={{ marginLeft: 'auto', background: '#f59e0b', color: '#000', fontWeight: 800 }}
                onClick={() => setActiveModal('trans_vouchers')}
              >
                + Record New Voucher
              </button>
            </div>

            <div className="tally-modal-content" style={{ maxHeight: 440 }}>
              {filteredVouchers.length === 0 ? (
                <div className="tally-empty-banner">
                  <p>No transactions found for filter &quot;{voucherFilter}&quot;.</p>
                  <button
                    className="tally-action-switch"
                    onClick={() => setActiveModal('trans_vouchers')}
                  >
                    Click here to record a voucher now
                  </button>
                </div>
              ) : (
                <table className="tally-table">
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
                      const typeClass = `tally-badge-${v.type.toLowerCase()}`;
                      return (
                        <tr key={v.id} className="tally-table-row">
                          <td style={{ color: '#94a3b8' }}>{v.date}</td>
                          <td className="tally-td-name">
                            <strong>{v.particulars}</strong>
                            <div className="tally-sub-address">{v.narration}</div>
                          </td>
                          <td>
                            <span className={`tally-badge-voucher ${typeClass}`}>
                              {v.type}
                            </span>
                          </td>
                          <td className="tally-td-mono">{v.voucherNo}</td>
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
                    <tr className="tally-totals-row">
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

            <div className="tally-footer-bar">
              <span className="tally-hint">All vouchers are stored locally and synced with Tally database records</span>
              <button
                className="tally-btn-secondary"
                onClick={() => setActiveModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REPORTS: BALANCE SHEET (DYNAMIC WITH REAL DEBTORS & CREDITORS) */}
      {activeModal === 'rep_balance' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Balance Sheet</span>
                <span>As on 6-Sep-2026 ({companyInfo.name})</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="tally-modal-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Liabilities */}
                <div className="tally-tree-group">
                  <div className="tally-tree-header">
                    <span>LIABILITIES</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>Capital Account</span>
                    <span>10,00,000.00</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>Reserves & Surplus (P&L)</span>
                    <span>4,85,500.00</span>
                  </div>
                  <div className="tally-tree-item" style={{ color: '#f87171', fontWeight: 700 }}>
                    <span>Sundry Creditors ({creditorsList.length} Accounts)</span>
                    <span>₹{totalCreditorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>Duties & Taxes</span>
                    <span>26,100.00</span>
                  </div>
                  <div className="tally-tree-header" style={{ borderTop: '2px solid #00f0ff', color: '#00f0ff' }}>
                    <span>TOTAL LIABILITIES</span>
                    <span>₹{(1511600 + totalCreditorsBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Assets */}
                <div className="tally-tree-group">
                  <div className="tally-tree-header">
                    <span>ASSETS</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>Fixed Assets (Plant & Labs)</span>
                    <span>8,50,800.00</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>Closing Stock Inventory</span>
                    <span>2,83,500.00</span>
                  </div>
                  <div className="tally-tree-item" style={{ color: '#4ade80', fontWeight: 700 }}>
                    <span>Sundry Debtors ({debtorsList.length} Accounts)</span>
                    <span>₹{totalDebtorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>Bank & Cash Balances</span>
                    <span>₹{(totalBankBalance + totalCashBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="tally-tree-header" style={{ borderTop: '2px solid #00f0ff', color: '#00f0ff' }}>
                    <span>TOTAL ASSETS</span>
                    <span>₹{(1134300 + totalDebtorsBalance + totalBankBalance + totalCashBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tally-footer-bar">
              <span className="tally-hint">Sundry Debtors and Creditors totals are calculated dynamically from active ledgers</span>
              <button className="tally-btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. REPORTS: PROFIT & LOSS */}
      {activeModal === 'rep_pl' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Profit & Loss A/c</span>
                <span>For Period 1-Apr-2026 to 6-Sep-2026</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="tally-modal-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Expenses */}
                <div className="tally-tree-group">
                  <div className="tally-tree-header">
                    <span>PARTICULARS (EXPENSES)</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>To Opening Stock</span>
                    <span>1,20,000.00</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>To Purchase Accounts</span>
                    <span>6,40,000.00</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>To Direct Expenses (Port/Berthing)</span>
                    <span>1,12,000.00</span>
                  </div>
                  <div className="tally-tree-item" style={{ color: '#4ade80', fontWeight: 700 }}>
                    <span>To Gross Profit c/o</span>
                    <span>7,28,000.00</span>
                  </div>
                  <div className="tally-tree-header" style={{ borderTop: '2px solid #00f0ff', color: '#00f0ff' }}>
                    <span>TOTAL TRADING</span>
                    <span>₹16,00,000.00</span>
                  </div>
                </div>

                {/* Incomes */}
                <div className="tally-tree-group">
                  <div className="tally-tree-header">
                    <span>PARTICULARS (INCOME)</span>
                    <span>AMOUNT (₹)</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>By Sales Accounts</span>
                    <span>12,80,000.00</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>By Direct Marine Consulting</span>
                    <span>3,20,000.00</span>
                  </div>
                  <div className="tally-tree-item">
                    <span>By Closing Stock</span>
                    <span>2,83,500.00</span>
                  </div>
                  <div className="tally-tree-item" style={{ color: '#38bdf8' }}>
                    <span>By Gross Profit b/f</span>
                    <span>7,28,000.00</span>
                  </div>
                  <div className="tally-tree-header" style={{ borderTop: '2px solid #00f0ff', color: '#00f0ff' }}>
                    <span>NET PROFIT</span>
                    <span style={{ color: '#4ade80' }}>₹4,85,500.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tally-footer-bar">
              <span className="tally-hint">Calculated on accrual basis per accounting standards</span>
              <button className="tally-btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. REPORTS: STOCK SUMMARY */}
      {activeModal === 'rep_stock' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Stock Summary</span>
                <span>Closing Stock Valuation Statement</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="tally-modal-content">
              <table className="tally-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>UoM</th>
                    <th>Quantity</th>
                    <th>Standard Rate</th>
                    <th style={{ textAlign: 'right' }}>Valuation (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="tally-table-row">
                      <td className="tally-td-name"><strong>{it.name}</strong></td>
                      <td style={{ color: '#38bdf8' }}>{it.unit}</td>
                      <td>{it.stock}</td>
                      <td>{it.rate}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b' }}>
                        {it.id === 'i-1' ? '₹10,80,000.00' : it.id === 'i-2' ? '₹2,97,500.00' : '₹5,40,000.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="tally-totals-row">
                    <td colSpan={4} style={{ padding: '10px 16px' }}>TOTAL STOCK VALUATION</td>
                    <td style={{ textAlign: 'right', padding: '10px 16px', color: '#4ade80' }}>
                      ₹19,17,500.00
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="tally-footer-bar">
              <span className="tally-hint">Valuation method: Average Cost / FIFO</span>
              <button className="tally-btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. REPORTS: RATIO ANALYSIS */}
      {activeModal === 'rep_ratio' && (
        <div className="tally-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="tally-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tally-modal-header">
              <div className="tally-modal-title">
                <span className="tally-badge">Ratio Analysis</span>
                <span>Financial Health & Efficiency Ratios</span>
              </div>
              <button className="tally-modal-close-btn" onClick={() => setActiveModal(null)}>
                Esc: Close
              </button>
            </div>

            <div className="tally-modal-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="tally-info-block">
                  <div className="tally-info-header">Liquidity Ratios</div>
                  <div className="tally-info-body">
                    <div className="tally-info-row">
                      <span className="tally-info-lbl">Current Ratio:</span>
                      <span className="tally-info-val highlight">2.42 : 1</span>
                    </div>
                    <div className="tally-info-row">
                      <span className="tally-info-lbl">Quick Ratio (Acid Test):</span>
                      <span className="tally-info-val highlight">1.84 : 1</span>
                    </div>
                    <div className="tally-info-row">
                      <span className="tally-info-lbl">Working Capital:</span>
                      <span className="tally-info-val">₹6,35,700.00</span>
                    </div>
                  </div>
                </div>

                <div className="tally-info-block">
                  <div className="tally-info-header">Profitability Ratios</div>
                  <div className="tally-info-body">
                    <div className="tally-info-row">
                      <span className="tally-info-lbl">Gross Profit %:</span>
                      <span className="tally-info-val" style={{ color: '#4ade80' }}>45.50 %</span>
                    </div>
                    <div className="tally-info-row">
                      <span className="tally-info-lbl">Net Profit %:</span>
                      <span className="tally-info-val" style={{ color: '#4ade80' }}>30.34 %</span>
                    </div>
                    <div className="tally-info-row">
                      <span className="tally-info-lbl">Return on Capital:</span>
                      <span className="tally-info-val">32.68 %</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tally-footer-bar">
              <span className="tally-hint">Industry benchmark for Maritime Commerce is met and exceeded</span>
              <button className="tally-btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. QUIT CONFIRMATION DIALOG (Authentic Tally Prime) */}
      {showQuitModal && (
        <div className="tally-modal-backdrop" onClick={() => setShowQuitModal(false)}>
          <div className="tally-quit-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tally-quit-title">Quit ?</div>
            <div className="tally-quit-subtitle">
              Do you want to exit to company list?
            </div>
            <div className="tally-quit-btn-group">
              <button
                className="tally-accept-yes"
                onClick={() => router.push('/create')}
                autoFocus
              >
                Yes (Y)
              </button>
              <button
                className="tally-accept-no"
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
