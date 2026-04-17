import * as React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { extractApiErrorMessage } from '../../utils/api-errors';
import './HospitalProfile.css';
const HospitalProfile = () => {
    const [hospital, setHospital] = useState(null);
    const [resources, setResources] = useState({
        icuBeds: 2,
        ventilators: 1,
        generalBeds: 15
    });
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState('');
    useEffect(() => {
        const fetchHospitalProfile = async () => {
            try {
                const response = await api.get('/hospitals/profile');
                setHospital(response.data);
                setResources({
                    icuBeds: response.data.icuAvailable ?? 0,
                    ventilators: response.data.ventilators ?? 0,
                    generalBeds: response.data.availableBeds ?? 0,
                });
            }
            catch (error) {
                setFeedback(extractApiErrorMessage(error, 'Failed to load hospital profile.'));
            }
        };
        fetchHospitalProfile();
    }, []);
    const handleSave = async () => {
        if (!hospital) {
            return;
        }
        setIsSaving(true);
        setFeedback('');
        try {
            const response = await api.put('/hospitals/profile', {
                name: hospital.name,
                address: hospital.address,
                phone: hospital.phone,
                latitude: Number(hospital.latitude),
                longitude: Number(hospital.longitude),
                availableBeds: Number(resources.generalBeds),
                icuAvailable: Number(resources.icuBeds),
                ventilators: Number(resources.ventilators),
            });
            setHospital(response.data);
            setFeedback('Hospital profile updated successfully.');
        }
        catch (error) {
            setFeedback(extractApiErrorMessage(error, 'Failed to save hospital updates.'));
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="sb-hprof">
    <div className="sb-hprof__bg-grid" aria-hidden="true"/>

    <div className="sb-hprof__page">

      {/* ── Header ── */}
      <header className="sb-hprof__header">
        <div className="sb-hprof__eyebrow">
          <span className="sb-hprof__eyebrow-dot" aria-hidden="true"/>
          <span className="sb-hprof__eyebrow-text">Resource Management</span>
        </div>
        <h1 className="sb-hprof__title">
          Hospital <span className="sb-hprof__title-accent">Profile</span>
        </h1>
        <div className="sb-hprof__hospital-id">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <rect x=".5" y=".5" width="10" height="10" rx="2" stroke="currentColor" strokeOpacity=".5"/>
            <path d="M5.5 3v5M3 5.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {hospital?.name || 'Hospital'} · {hospital?.id ? hospital.id.slice(0, 8) : 'Loading'}
        </div>
      </header>

      <p className="sb-hprof__subtitle">
        Manage live inventory and location data so dispatch assigns your facility accurately.
      </p>

      {/* ── ER Status Card ── */}
      <div className="sb-hprof__status-card">
        <div className="sb-hprof__status-left">
          <div className="sb-hprof__status-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9l3.5 3.5L14 5.5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="sb-hprof__status-label">ER Status</div>
            <div className="sb-hprof__status-value">{hospital?.address || 'Loading address...'}</div>
          </div>
        </div>
        {/* Toggle is display-only; logic lives in parent — not altering hooks */}
        <div className="sb-hprof__status-toggle-wrap" aria-label="Accepting patients toggle">
          <span className="sb-hprof__toggle-track">
            <span className="sb-hprof__toggle-thumb"/>
          </span>
        </div>
      </div>

      <div className="sb-hprof__divider" aria-hidden="true"/>

      <div className="sb-hprof__section-head">
        <span className="sb-hprof__section-title">Location</span>
        <span className="sb-hprof__section-line" aria-hidden="true"/>
      </div>
      <p className="sb-hprof__section-sub">
        Keep the hospital name, address, and coordinates accurate for routing.
      </p>

      <div className="sb-hprof__resources">
        <div className="sb-hprof__resource-row">
          <div className="sb-hprof__resource-left">
            <div>
              <div className="sb-hprof__resource-name">Hospital Name</div>
              <div className="sb-hprof__resource-hint">Shown to drivers and patients</div>
            </div>
          </div>
          <div className="sb-hprof__resource-right" style={{ width: '100%' }}>
            <input className="sb-hprof__resource-input" type="text" value={hospital?.name || ''} onChange={(e) => setHospital((prev) => prev ? { ...prev, name: e.target.value } : prev)} aria-label="Hospital name"/>
          </div>
        </div>

        <div className="sb-hprof__resource-row">
          <div className="sb-hprof__resource-left">
            <div>
              <div className="sb-hprof__resource-name">Address</div>
              <div className="sb-hprof__resource-hint">Used for hospital destination labels</div>
            </div>
          </div>
          <div className="sb-hprof__resource-right" style={{ width: '100%' }}>
            <input className="sb-hprof__resource-input" type="text" value={hospital?.address || ''} onChange={(e) => setHospital((prev) => prev ? { ...prev, address: e.target.value } : prev)} aria-label="Hospital address"/>
          </div>
        </div>

        <div className="sb-hprof__resource-row">
          <div className="sb-hprof__resource-left">
            <div>
              <div className="sb-hprof__resource-name">Latitude / Longitude</div>
              <div className="sb-hprof__resource-hint">Precise routing coordinates</div>
            </div>
          </div>
          <div className="sb-hprof__resource-right" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%' }}>
            <input className="sb-hprof__resource-input" type="number" step="any" value={hospital?.latitude ?? ''} onChange={(e) => setHospital((prev) => prev ? { ...prev, latitude: e.target.value } : prev)} aria-label="Hospital latitude"/>
            <input className="sb-hprof__resource-input" type="number" step="any" value={hospital?.longitude ?? ''} onChange={(e) => setHospital((prev) => prev ? { ...prev, longitude: e.target.value } : prev)} aria-label="Hospital longitude"/>
          </div>
        </div>
      </div>

      {/* ── Inventory Section ── */}
      <div className="sb-hprof__section-head">
        <span className="sb-hprof__section-title">Live Inventory</span>
        <span className="sb-hprof__section-line" aria-hidden="true"/>
      </div>
      <p className="sb-hprof__section-sub">
        Update counts to ensure accurate dispatching decisions.
      </p>

      <div className="sb-hprof__resources">

        {/* ICU Beds */}
        <div className="sb-hprof__resource-row">
          <div className="sb-hprof__resource-left">
            <div className="sb-hprof__resource-icon-wrap sb-hprof__resource-icon-wrap--icu">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1 11V6a2 2 0 012-2h10a2 2 0 012 2v5M1 11h14M5 4V3M11 4V3" stroke="#ff2d42" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="sb-hprof__resource-name">ICU Beds</div>
              <div className="sb-hprof__resource-hint">Intensive care available</div>
            </div>
          </div>
          <div className="sb-hprof__resource-right">
            <button className="sb-hprof__stepper-btn" aria-label="Decrease ICU beds" onClick={() => setResources((r) => ({ ...r, icuBeds: Math.max(0, r.icuBeds - 1) }))}>−</button>
            <input className="sb-hprof__resource-input" type="number" value={resources.icuBeds} onChange={(e) => setResources({ ...resources, icuBeds: parseInt(e.target.value) || 0 })} aria-label="ICU beds count"/>
            <button className="sb-hprof__stepper-btn" aria-label="Increase ICU beds" onClick={() => setResources((r) => ({ ...r, icuBeds: r.icuBeds + 1 }))}>+</button>
          </div>
        </div>

        {/* Ventilators */}
        <div className="sb-hprof__resource-row">
          <div className="sb-hprof__resource-left">
            <div className="sb-hprof__resource-icon-wrap sb-hprof__resource-icon-wrap--vent">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="3" stroke="#60a5fa" strokeWidth="1.3"/>
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="sb-hprof__resource-name">Ventilators</div>
              <div className="sb-hprof__resource-hint">Mechanical ventilation units</div>
            </div>
          </div>
          <div className="sb-hprof__resource-right">
            <button className="sb-hprof__stepper-btn" aria-label="Decrease ventilators" onClick={() => setResources((r) => ({ ...r, ventilators: Math.max(0, r.ventilators - 1) }))}>−</button>
            <input className="sb-hprof__resource-input" type="number" value={resources.ventilators} onChange={(e) => setResources({ ...resources, ventilators: parseInt(e.target.value) || 0 })} aria-label="Ventilators count"/>
            <button className="sb-hprof__stepper-btn" aria-label="Increase ventilators" onClick={() => setResources((r) => ({ ...r, ventilators: r.ventilators + 1 }))}>+</button>
          </div>
        </div>

        {/* General Ward Beds */}
        <div className="sb-hprof__resource-row">
          <div className="sb-hprof__resource-left">
            <div className="sb-hprof__resource-icon-wrap sb-hprof__resource-icon-wrap--bed">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1 12V8a2 2 0 012-2h10a2 2 0 012 2v4M1 12h14M4 6V5a1 1 0 011-1h6a1 1 0 011 1v1" stroke="#4ade80" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="sb-hprof__resource-name">General Ward Beds</div>
              <div className="sb-hprof__resource-hint">Standard ward capacity</div>
            </div>
          </div>
          <div className="sb-hprof__resource-right">
            <button className="sb-hprof__stepper-btn" aria-label="Decrease general beds" onClick={() => setResources((r) => ({ ...r, generalBeds: Math.max(0, r.generalBeds - 1) }))}>−</button>
            <input className="sb-hprof__resource-input" type="number" value={resources.generalBeds} onChange={(e) => setResources({ ...resources, generalBeds: parseInt(e.target.value) || 0 })} aria-label="General ward beds count"/>
            <button className="sb-hprof__stepper-btn" aria-label="Increase general beds" onClick={() => setResources((r) => ({ ...r, generalBeds: r.generalBeds + 1 }))}>+</button>
          </div>
        </div>

      </div>

      {/* ── Save ── */}
      <button className="sb-hprof__btn-save" onClick={handleSave} disabled={isSaving}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path d="M2 7.5L6 11.5L13 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isSaving ? 'Saving...' : 'Save Updates'}
      </button>
      <p className="sb-hprof__save-note">
        Changes are reflected in dispatch routing within 30 seconds.
      </p>
      {feedback && <p className="sb-hprof__save-note">{feedback}</p>}

    </div>
  </div>);
};
export default HospitalProfile;
