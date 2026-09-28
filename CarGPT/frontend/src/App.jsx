import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatTab from './components/ChatTab';
import KnowledgeBaseTab from './components/KnowledgeBaseTab';
import AboutTab from './components/AboutTab';
import CarModal from './components/CarModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCar, setSelectedCar] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    // Check backend health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => {
        console.warn("Backend health check failed:", err);
        setHealthStatus({ status: 'offline', api_key_configured: false });
      });
  }, []);

  const handleSelectCar = (car) => {
    setSelectedCar(car);
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'chat' && (
          <ChatTab
            healthStatus={healthStatus}
            onSelectCar={handleSelectCar}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseTab
            onSelectCar={handleSelectCar}
          />
        )}

        {activeTab === 'about' && (
          <AboutTab />
        )}
      </main>

      {/* Modal for viewing individual car details */}
      {selectedCar && (
        <CarModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </div>
  );
}
