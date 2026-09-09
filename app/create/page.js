'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePage() {
  const router = useRouter();

  // Active view: 'create' or 'existing'
  const [activeTab, setActiveTab] = useState('create');

  // Form data for Company Registration with ERP defaults
  const [formData, setFormData] = useState({
    name: '',
    mailingName: '',
    address: '',
    state: 'Andhra Pradesh',
    country: 'India',
    pincode: '',
    telephone: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    gst: '',
    IEC: '',
    finYear: '1-Apr-2026',
    booksBegin: '1-Apr-2026',
    currency: '₹',
    formalName: 'INR',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAcceptPrompt, setShowAcceptPrompt] = useState(false);

  // Existing records from MongoDB
  const [existingItems, setExistingItems] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const formRef = useRef(null);

  // Auto-fill mailing name when company name changes if mailing name wasn't modified
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      mailingName: prev.mailingName === '' || prev.mailingName === prev.name ? val : prev.mailingName,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch count on initial load and when switching to existing tab
  useEffect(() => {
    fetchExisting();
  }, []);

  useEffect(() => {
    if (activeTab === 'existing') {
      fetchExisting();
    }
  }, [activeTab]);

  const fetchExisting = async () => {
    setLoadingExisting(true);
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setExistingItems(data.data);
      } else {
        setExistingItems([]);
      }
    } catch (err) {
      console.error('Error fetching existing:', err);
    } finally {
      setLoadingExisting(false);
    }
  };

  // Validate before showing Accept prompt
  const handlePromptOpen = (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.address || !formData.gst || !formData.IEC || !formData.phone) {
      setErrorMsg('Please specify Company Name, Address, GST, IEC, and Mobile No.');
      return;
    }
    setErrorMsg('');
    setShowAcceptPrompt(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');

    // Client-side verification for required fields
    if (!formData.name || !formData.address || !formData.gst || !formData.IEC || !formData.phone) {
      setErrorMsg('Please specify Company Name, Address, GST, IEC, and Mobile No.');
      setLoading(false);
      setShowAcceptPrompt(false);
      return;
    }

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      const savedUser = result?.data || formData;

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_info', JSON.stringify(savedUser));
      }

      router.push('/dashboard');
    } catch (err) {
      console.warn('API save warning, persisting to localStorage fallback:', err);
      // Resilient fallback: ensure user can access dashboard even if DB connection fails
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_info', JSON.stringify(formData));
      }
      router.push('/dashboard');
    } finally {
      setLoading(false);
      setShowAcceptPrompt(false);
    }
  };

  const handleSelectExisting = (item) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_info', JSON.stringify(item));
    }
    router.push('/dashboard');
  };

  // Global Keyboard navigation shortcuts (Enter to accept, Esc/N to cancel, Y to confirm)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (showAcceptPrompt) {
        if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setShowAcceptPrompt(false);
        }
      } else if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showAcceptPrompt, formData]);

  return (
    <div className="marine-viewport">
      <div className="marine-window">
        {/* Top Marine Matrice Title Bar */}
        <div className="marine-header">
          <div className="marine-header-left">
            <span className="marine-badge">Govt. Enterprise Portal</span>
            <span className="marine-title">
              {activeTab === 'create' ? 'Company Creation' : 'List of Companies'}
            </span>
          </div>

          <div className="marine-header-tabs">
            <button
              type="button"
              className={`marine-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('create');
                setShowAcceptPrompt(false);
              }}
            >
              1. Create
            </button>
            <button
              type="button"
              className={`marine-tab ${activeTab === 'existing' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('existing');
                setShowAcceptPrompt(false);
              }}
            >
              2. Existing {existingItems.length > 0 ? `(${existingItems.length})` : ''}
            </button>
            <Link href="/" className="marine-btn-esc" title="Exit to Landing Page">
              Esc : Quit
            </Link>
          </div>
        </div>

        {/* ================= OPTION 1: CREATE FORM (CLEAN DARK THEME) ================= */}
        {activeTab === 'create' && (
          <form
            ref={formRef}
            onSubmit={handlePromptOpen}
            className="marine-form-container"
          >
            {/* Error Message Strip */}
            {errorMsg && (
              <div className="marine-error-banner">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            {/* Form Fields Body */}
            <div className="marine-form-body-single">
              {/* Company Name */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-name">
                  Company Name
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    autoFocus
                    placeholder="Enter Enterprise / Company Name"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mailing Name */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-mailing">
                  Mailing Name
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-mailing"
                    name="mailingName"
                    value={formData.mailingName}
                    onChange={handleChange}
                    placeholder="Mailing / Trade Name"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="marine-row marine-row-align-top">
                <label className="marine-lbl" htmlFor="marine-address">
                  Address
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <textarea
                    id="marine-address"
                    name="address"
                    rows="2"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Registered Office / Terminal Port Address"
                    className="marine-field marine-textarea"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* State */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-state">
                  State
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <select
                    id="marine-state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="marine-field marine-select"
                    disabled={loading}
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh (Visakhapatnam Port)</option>
                    <option value="Odisha">Odisha (Paradip Port)</option>
                    <option value="Tamil Nadu">Tamil Nadu (Chennai / Ennore Port)</option>
                    <option value="West Bengal">West Bengal (Haldia / Kolkata Port)</option>
                    <option value="Maharashtra">Maharashtra (JNPT / Mumbai)</option>
                    <option value="Gujarat">Gujarat (Kandla / Mundra)</option>
                    <option value="Karnataka">Karnataka (Mangalore)</option>
                    <option value="Kerala">Kerala (Cochin)</option>
                    <option value="Delhi">Delhi (NCR)</option>
                    <option value="*Not Applicable">*Not Applicable</option>
                  </select>
                </div>
              </div>

              {/* Country */}
              <div className="marine-row">
                <label className="marine-lbl">Country</label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <span className="marine-static-text">India</span>
                </div>
              </div>

              {/* Pincode */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-pincode">
                  Pincode
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 530001"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Telephone */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-telephone">
                  Telephone
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="0891-XXXXXXX"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-phone">
                  Mobile
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap marine-mobile-wrap">
                  <span className="marine-prefix">+91 -</span>
                  <input
                    type="tel"
                    id="marine-phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="marine-field marine-mobile-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Fax */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-fax">
                  Fax
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-fax"
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                    placeholder="Fax number"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-email">
                  E-mail
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="email"
                    id="marine-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="office@enterprise.gov.in"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Website */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-website">
                  Website
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="www.marina-eastcoast.in"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* GSTIN / UIN */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-gst">
                  GSTIN / UIN
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-gst"
                    name="gst"
                    required
                    value={formData.gst}
                    onChange={handleChange}
                    placeholder="Enter GST Number (e.g. 37AAAAA0000A1Z5)"
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* IEC Lic. No. */}
              <div className="marine-row">
                <label className="marine-lbl" htmlFor="marine-IEC">
                  IEC Lic. No.
                </label>
                <span className="marine-colon">:</span>
                <div className="marine-input-wrap">
                  <input
                    type="text"
                    id="marine-IEC"
                    name="IEC"
                    required
                    value={formData.IEC}
                    onChange={handleChange}
                    placeholder="Enter IEC 10 -digit License No."
                    className="marine-field"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Section with Submit / Accept Box */}
            <div className="marine-bottom-rule" />

            <div className="marine-footer-grid">
              <span className="marine-hint">Press [Enter] or click button below to proceed.</span>

              {/* Marine Matrice Classic "Accept? Yes or No" Prompt Box */}
              <div className="marine-action-cluster">
                {!showAcceptPrompt ? (
                  <div className="marine-ready-box">
                    <button
                      type="submit"
                      className="marine-btn-proceed"
                    >
                      Verify & Submit (Enter ↵)
                    </button>
                  </div>
                ) : (
                  <div className="marine-accept-dialog">
                    <div className="marine-accept-title">Accept?</div>
                    <div className="marine-accept-actions">
                      <button
                        type="button"
                        autoFocus
                        className="marine-accept-yes"
                        onClick={() => handleSubmit()}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Yes (Enter / Y)'}
                      </button>
                      <button
                        type="button"
                        className="marine-accept-no"
                        onClick={() => setShowAcceptPrompt(false)}
                      >
                        No (Esc / N)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {/* ================= OPTION 2: EXISTING LIST (MARINE MATRICE DARK TABLE) ================= */}
        {activeTab === 'existing' && (
          <div className="marine-existing-panel">
            <div className="marine-existing-header">
              <div className="marine-table-title">
                <span>List of Companies / Registrations (Select company to enter Dashboard)</span>
              </div>
              <button
                type="button"
                className="marine-refresh-link"
                onClick={fetchExisting}
              >
                [↻ Refresh List]
              </button>
            </div>

            {loadingExisting && (
              <div className="marine-empty-banner">
                Fetching companies from Cloud Database...
              </div>
            )}

            {!loadingExisting && existingItems.length === 0 && (
              <div className="marine-empty-banner">
                <p>No company records registered yet.</p>
                <button
                  type="button"
                  className="marine-action-switch"
                  onClick={() => setActiveTab('create')}
                >
                  Press [1. Create] to register the first company.
                </button>
              </div>
            )}

            {!loadingExisting && existingItems.length > 0 && (
              <div className="marine-table-wrap">
                <table className="marine-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Company / Enterprise Name</th>
                      <th style={{ width: '18%' }}>State / Region</th>
                      <th style={{ width: '18%' }}>GSTIN</th>
                      <th style={{ width: '16%' }}>IEC</th>
                      <th style={{ width: '18%', textAlign: 'center' }}>Select (↵)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingItems.map((item, idx) => (
                      <tr
                        key={item._id || idx}
                        className="marine-table-row"
                        onClick={() => handleSelectExisting(item)}
                      >
                        <td className="marine-td-name">
                          <strong>{item.name}</strong>
                          {item.address && <div className="marine-sub-address">{item.address}</div>}
                        </td>
                        <td>{item.state || 'Andhra Pradesh'}</td>
                        <td className="marine-td-mono">{item.gst}</td>
                        <td className="marine-td-mono">{item.IEC}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="marine-select-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectExisting(item);
                            }}
                          >
                            Open Dashboard ↵
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="marine-footer-bar">
              <span className="marine-hint">Double click or click [Open Dashboard] to access company freight metrics.</span>
              <button
                type="button"
                className="marine-new-btn"
                onClick={() => setActiveTab('create')}
              >
                + Create New Company
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

