import React from 'react';
import { Bot, Car, BookOpen, Info } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <div className="brand-container">
        <div className="brand-logo-icon">
          <Car size={26} />
        </div>
        <div>
          <h1 className="brand-title">CarGPT</h1>
          <p className="brand-subtitle">Your AI Car Knowledge Assistant</p>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <Bot size={18} />
          AI Chat
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <BookOpen size={18} />
          Car Knowledge Base
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <Info size={18} />
          About Project
        </button>
      </nav>
    </header>
  );
}
