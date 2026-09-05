'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePage() {
  const router = useRouter();

  // Active view: 'create' or 'existing'
  const [activeTab, setActiveTab] = useState('create');

  // Form data for Company Registration
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
    fssai: '',
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Client-side verification for required fields
    if (!formData.name || !formData.address || !formData.gst || !formData.fssai || !formData.phone) {
      setErrorMsg('Please specify Company Name, Address, GST, FSSAI, and Mobile No.');
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
        body: JSON.stringify({
          name: formData.name,
          mailingName: formData.mailingName,
          address: formData.address,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
          telephone: formData.telephone,
          phone: formData.phone,
          fax: formData.fax,
          email: formData.email,
          website: formData.website,
          gst: formData.gst,
          fssai: formData.fssai,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to create company record.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_info', JSON.stringify(result.data || formData));
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Error saving to database.');
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

  // Keyboard navigation shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (showAcceptPrompt) {
        setShowAcceptPrompt(false);
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className="tally-viewport" onKeyDown={handleKeyDown}>
      <div className="tally-window">
        {/* Top Tally Title Bar */}
        <div className="tally-header">
          <div className="tally-header-left">
            <span className="tally-badge">Govt. Enterprise Portal</span>
            <span className="tally-title">
              {activeTab === 'create' ? 'Company Creation' : 'List of Companies'}
            </span>
          </div>

          <div className="tally-header-tabs">
            <button
              type="button"
              className={`tally-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('create');
                setShowAcceptPrompt(false);
              }}
            >
              1. Create
            </button>
            <button
              type="button"
              className={`tally-tab ${activeTab === 'existing' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('existing');
                setShowAcceptPrompt(false);
              }}
            >
              2. Existing {existingItems.length > 0 ? `(${existingItems.length})` : ''}
            </button>
            <Link href="/" className="tally-btn-esc" title="Exit to Landing Page">
              Esc : Quit
            </Link>
          </div>
        </div>

        {/* ================= OPTION 1: CREATE FORM (CLEAN DARK THEME) ================= */}
        {activeTab === 'create' && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              setShowAcceptPrompt(true);
            }}
            className="tally-form-container"
          >
            {/* Error Message Strip */}
            {errorMsg && (
              <div className="tally-error-banner">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            {/* Form Fields Body */}
            <div className="tally-form-body-single">
              {/* Company Name */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-name">
                  Company Name
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    autoFocus
                    placeholder="Enter Enterprise / Company Name"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mailing Name */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-mailing">
                  Mailing Name
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-mailing"
                    name="mailingName"
                    value={formData.mailingName}
                    onChange={handleChange}
                    placeholder="Mailing / Trade Name"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="tally-row tally-row-align-top">
                <label className="tally-lbl" htmlFor="tally-address">
                  Address
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <textarea
                    id="tally-address"
                    name="address"
                    rows="2"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Registered Office / Terminal Port Address"
                    className="tally-field tally-textarea"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* State */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-state">
                  State
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <select
                    id="tally-state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="tally-field tally-select"
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
              <div className="tally-row">
                <label className="tally-lbl">Country</label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <span className="tally-static-text">India</span>
                </div>
              </div>

              {/* Pincode */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-pincode">
                  Pincode
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 530001"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Telephone */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-telephone">
                  Telephone
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="0891-XXXXXXX"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-phone">
                  Mobile
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap tally-mobile-wrap">
                  <span className="tally-prefix">+91 -</span>
                  <input
                    type="tel"
                    id="tally-phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="tally-field tally-mobile-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Fax */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-fax">
                  Fax
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-fax"
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                    placeholder="Fax number"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-email">
                  E-mail
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="email"
                    id="tally-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="office@enterprise.gov.in"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Website */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-website">
                  Website
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="www.marina-eastcoast.in"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* GSTIN / UIN */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-gst">
                  GSTIN / UIN
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-gst"
                    name="gst"
                    required
                    value={formData.gst}
                    onChange={handleChange}
                    placeholder="Enter GST Number (e.g. 37AAAAA0000A1Z5)"
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* FSSAI Lic. No. */}
              <div className="tally-row">
                <label className="tally-lbl" htmlFor="tally-fssai">
                  FSSAI Lic. No.
                </label>
                <span className="tally-colon">:</span>
                <div className="tally-input-wrap">
                  <input
                    type="text"
                    id="tally-fssai"
                    name="fssai"
                    required
                    value={formData.fssai}
                    onChange={handleChange}
                    placeholder="Enter FSSAI 14-digit License No."
                    className="tally-field"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Section with Submit / Accept Box */}
            <div className="tally-bottom-rule" />

            <div className="tally-footer-grid">
              <span className="tally-hint">Press [Enter] or click button below to proceed.</span>

              {/* Tally Classic "Accept? Yes or No" Prompt Box */}
              <div className="tally-action-cluster">
                {!showAcceptPrompt ? (
                  <div className="tally-ready-box">
                    <button
                      type="button"
                      className="tally-btn-proceed"
                      onClick={() => setShowAcceptPrompt(true)}
                    >
                      Verify & Submit (Enter ↵)
                    </button>
                  </div>
                ) : (
                  <div className="tally-accept-dialog">
                    <div className="tally-accept-title">Accept?</div>
                    <div className="tally-accept-actions">
                      <button
                        type="button"
                        className="tally-accept-yes"
                        onClick={() => handleSubmit()}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Yes (Enter)'}
                      </button>
                      <button
                        type="button"
                        className="tally-accept-no"
                        onClick={() => setShowAcceptPrompt(false)}
                      >
                        No (Esc)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {/* ================= OPTION 2: EXISTING LIST (TALLY DARK TABLE) ================= */}
        {activeTab === 'existing' && (
          <div className="tally-existing-panel">
            <div className="tally-existing-header">
              <div className="tally-table-title">
                <span>List of Companies / Registrations (Select company to enter Dashboard)</span>
              </div>
              <button
                type="button"
                className="tally-refresh-link"
                onClick={fetchExisting}
              >
                [↻ Refresh List]
              </button>
            </div>

            {loadingExisting && (
              <div className="tally-empty-banner">
                Fetching companies from Cloud Database...
              </div>
            )}

            {!loadingExisting && existingItems.length === 0 && (
              <div className="tally-empty-banner">
                <p>No company records registered yet.</p>
                <button
                  type="button"
                  className="tally-action-switch"
                  onClick={() => setActiveTab('create')}
                >
                  Press [1. Create] to register the first company.
                </button>
              </div>
            )}

            {!loadingExisting && existingItems.length > 0 && (
              <div className="tally-table-wrap">
                <table className="tally-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Company / Enterprise Name</th>
                      <th style={{ width: '18%' }}>State / Region</th>
                      <th style={{ width: '18%' }}>GSTIN</th>
                      <th style={{ width: '16%' }}>FSSAI</th>
                      <th style={{ width: '18%', textAlign: 'center' }}>Select (↵)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingItems.map((item, idx) => (
                      <tr
                        key={item._id || idx}
                        className="tally-table-row"
                        onClick={() => handleSelectExisting(item)}
                      >
                        <td className="tally-td-name">
                          <strong>{item.name}</strong>
                          {item.address && <div className="tally-sub-address">{item.address}</div>}
                        </td>
                        <td>{item.state || 'Andhra Pradesh'}</td>
                        <td className="tally-td-mono">{item.gst}</td>
                        <td className="tally-td-mono">{item.fssai}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="tally-select-btn"
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

            <div className="tally-footer-bar">
              <span className="tally-hint">Double click or click [Open Dashboard] to access company freight metrics.</span>
              <button
                type="button"
                className="tally-new-btn"
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

