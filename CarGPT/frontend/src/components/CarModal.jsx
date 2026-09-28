import React from 'react';
import { X, CheckCircle, ShieldCheck, Target, Zap, Fuel, Settings, Users, Gauge } from 'lucide-react';

export default function CarModal({ car, onClose }) {
  if (!car) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <span className="car-brand-badge">{car.brand}</span>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginTop: '0.4rem' }}>{car.name}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{car.body_type} • {car.model}</p>
        </div>

        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', color: '#334155' }}>
          {car.description}
        </p>

        {/* Quick Specs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Fuel size={14} /> Fuel
            </span>
            <strong style={{ fontSize: '0.85rem' }}>{car.fuel_type.join(', ')}</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Settings size={14} /> Transmission
            </span>
            <strong style={{ fontSize: '0.85rem' }}>{car.transmission.join(', ')}</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Gauge size={14} /> Mileage
            </span>
            <strong style={{ fontSize: '0.85rem' }}>{car.mileage}</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} /> Seating
            </span>
            <strong style={{ fontSize: '0.85rem' }}>{car.seating_capacity} Seats</strong>
          </div>
        </div>

        {/* Engine & Price */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.3rem' }}>Engine Options</h4>
          <p style={{ fontSize: '0.88rem', color: '#475569' }}>{car.engine}</p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.3rem' }}>Demo Price Range</h4>
          <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2563eb' }}>{car.price_range_demo}</p>
        </div>

        {/* Key Features */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="#2563eb" /> Key Features
          </h4>
          <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {car.key_features.map((feat, idx) => (
              <li key={idx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#16a34a" /> {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Features */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#2563eb" /> Safety Features
          </h4>
          <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {car.safety_features.map((safe, idx) => (
              <li key={idx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#2563eb" /> {safe}
              </li>
            ))}
          </ul>
        </div>

        {/* Suitable Usage */}
        <div>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={16} color="#2563eb" /> Suitable Usage
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {car.suitable_usage.map((use, idx) => (
              <span key={idx} style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {use}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
