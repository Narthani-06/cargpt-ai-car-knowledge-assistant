import React, { useState, useEffect } from 'react';
import { Search, Filter, Fuel, Settings, Users, ArrowRight, BookOpen } from 'lucide-react';

export default function KnowledgeBaseTab({ onSelectCar }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedTrans, setSelectedTrans] = useState('All');

  const brands = ["All", "Hyundai", "Tata", "Kia", "Maruti Suzuki", "Toyota", "Honda", "Mahindra", "Volkswagen", "Skoda"];
  const fuelTypes = ["All", "Petrol", "Diesel", "Electric", "CNG", "Hybrid"];
  const transmissions = ["All", "Manual", "Automatic"];

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrand !== 'All') params.append('brand', selectedBrand);
      if (selectedFuel !== 'All') params.append('fuel_type', selectedFuel);
      if (selectedTrans !== 'All') params.append('transmission', selectedTrans);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/cars?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars || []);
      }
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [search, selectedBrand, selectedFuel, selectedTrans]);

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#ffffff',
        padding: '1.75rem 2rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BookOpen size={24} color="#93c5fd" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Car Knowledge Base</h2>
          <span style={{
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#93c5fd',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            DEMO KNOWLEDGE BASE
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '700px' }}>
          Explore specifications, fuel options, safety features, and usages across 16 popular models from 9 top automotive manufacturers.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="kb-controls">
        <div className="search-input-group">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search cars by name, model, feature (e.g. Creta, Sunroof, ADAS)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Brand Filter */}
        <select
          className="filter-select"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="All">All Brands</option>
          {brands.filter(b => b !== 'All').map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Fuel Filter */}
        <select
          className="filter-select"
          value={selectedFuel}
          onChange={(e) => setSelectedFuel(e.target.value)}
        >
          <option value="All">All Fuel Types</option>
          {fuelTypes.filter(f => f !== 'All').map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {/* Transmission Filter */}
        <select
          className="filter-select"
          value={selectedTrans}
          onChange={(e) => setSelectedTrans(e.target.value)}
        >
          <option value="All">All Transmissions</option>
          {transmissions.filter(t => t !== 'All').map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Results Header Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '500' }}>
          Showing <strong>{cars.length}</strong> matching vehicles
        </p>
      </div>

      {/* Grid of Cars */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading car knowledge base...
        </div>
      ) : cars.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No matching cars found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Try adjusting your search criteria or resetting filters to see available models.
          </p>
        </div>
      ) : (
        <div className="cars-grid">
          {cars.map(car => (
            <div key={car.id} className="car-card">
              <div>
                <div className="car-card-header">
                  <div>
                    <span className="car-brand-badge">{car.brand}</span>
                    <h3 className="car-title" style={{ marginTop: '0.2rem' }}>{car.name}</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {car.body_type}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                  {car.description.substring(0, 110)}...
                </p>

                {/* Specs Pills */}
                <div className="car-specs-summary">
                  <span className="spec-badge">
                    <Fuel size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {car.fuel_type.join(', ')}
                  </span>
                  <span className="spec-badge">
                    <Settings size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {car.transmission[0]}
                  </span>
                  <span className="spec-badge">
                    <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {car.seating_capacity} Seats
                  </span>
                </div>

                <div className="car-price-demo">
                  {car.price_range_demo}
                </div>
              </div>

              <button
                className="btn-view-details"
                onClick={() => onSelectCar(car)}
              >
                View Full Specs & Features <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
