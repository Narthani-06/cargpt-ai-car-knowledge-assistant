import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, Sparkles, Cpu, Layers } from 'lucide-react';

// Lightweight Markdown Renderer Helper
function renderMarkdown(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table Row Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
      if (trimmed.includes('---')) {
        // Divider row - skip
        return;
      }
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      // Flush Table
      elements.push(
        <div key={`table-${index}`} style={{ overflowX: 'auto', margin: '0.75rem 0' }}>
          <table>
            <thead>
              <tr>
                {tableHeaders.map((th, i) => (
                  <th key={i}>{parseInline(th)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{parseInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      elements.push(<h4 key={index}>{parseInline(trimmed.replace('#### ', ''))}</h4>);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={index}>{parseInline(trimmed.replace('### ', ''))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={index}>{parseInline(trimmed.replace('## ', ''))}</h2>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <ul key={index}>
          <li>{parseInline(trimmed.replace(/^[-*]\s+/, ''))}</li>
        </ul>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={index} style={{
          borderLeft: '4px solid #2563eb',
          paddingLeft: '0.75rem',
          margin: '0.5rem 0',
          color: '#475569',
          fontStyle: 'italic'
        }}>
          {parseInline(trimmed.replace('> ', ''))}
        </blockquote>
      );
    } else if (trimmed.length > 0) {
      elements.push(<p key={index}>{parseInline(trimmed)}</p>);
    }
  });

  if (inTable) {
    elements.push(
      <div key={`table-end`} style={{ overflowX: 'auto', margin: '0.75rem 0' }}>
        <table>
          <thead>
            <tr>
              {tableHeaders.map((th, i) => (
                <th key={i}>{parseInline(th)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>{parseInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="markdown-body">{elements}</div>;
}

function parseInline(text) {
  // Regex for bold **text** and inline `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function ChatTab({ healthStatus, onSelectCar }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Welcome to **CarGPT**! I'm your AI Car Knowledge Assistant.\n\nAsk me anything about car specifications, features, safety ratings, or request a side-by-side comparison between models from our custom knowledge base.",
      retrievedCars: [],
      source: 'system'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Tell me about Hyundai Creta",
    "Compare Tata Nexon and Hyundai Creta",
    "Which cars are suitable for a family?",
    "Which cars have automatic transmission?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const query = questionText || input;
    if (!query || !query.trim()) return;

    setError(null);
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      retrievedCars: []
    };

    setMessages(prev => [...prev, userMessage]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer,
        retrievedCars: data.retrieved_cars || [],
        source: data.source || 'llm'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat API Error:", err);
      setError("Failed to communicate with CarGPT backend. Please verify backend service is running.");
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "⚠️ **Backend Error**: Unable to process question right now. Please ensure the Python FastAPI backend server is running on `http://localhost:8000`.",
          retrievedCars: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Chat history cleared. How can I help you with cars today?",
        retrievedCars: []
      }
    ]);
    setError(null);
  };

  return (
    <div className="chat-container">
      {/* Header Info */}
      <div className="chat-header">
        <div className="chat-header-info">
          <Sparkles size={20} color="#2563eb" />
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>CarGPT RAG Chatbot</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Custom Knowledge Base Grounded</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`status-pill ${healthStatus?.status === 'online' ? '' : 'offline'}`}>
            <span className="status-dot"></span>
            {healthStatus?.api_key_configured ? 'Live LLM API' : 'RAG Generator Ready'}
          </span>

          <button className="btn-clear" onClick={handleClearChat} title="Clear Conversation">
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            <div className={`avatar ${msg.sender}`}>
              {msg.sender === 'user' ? 'U' : <Bot size={20} />}
            </div>

            <div>
              <div className="message-content">
                {renderMarkdown(msg.text)}

                {/* Retrieved Knowledge Base Context Cards */}
                {msg.sender === 'ai' && msg.retrievedCars && msg.retrievedCars.length > 0 && (
                  <div className="retrieved-context-box">
                    <div className="retrieved-context-title">
                      <Layers size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      RAG Retrieved Context ({msg.retrievedCars.length} Records)
                    </div>
                    <div className="retrieved-pills">
                      {msg.retrievedCars.map(car => (
                        <button
                          key={car.id}
                          className="car-pill"
                          onClick={() => onSelectCar && onSelectCar(car)}
                        >
                          🚗 {car.name} ({car.brand})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-wrapper ai">
            <div className="avatar ai"><Bot size={20} /></div>
            <div className="message-content" style={{ background: '#ffffff' }}>
              <div className="typing-indicator">
                <span style={{ fontSize: '0.85rem', color: '#64748b', marginRight: '6px' }}>
                  Retrieving context & generating answer...
                </span>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        {/* Suggested Questions */}
        <div className="suggested-questions">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              className="suggested-btn"
              onClick={() => handleSend(q)}
              disabled={loading}
            >
              💡 {q}
            </button>
          ))}
        </div>

        <div className="input-box-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask a question about cars (e.g. Tell me about Hyundai Creta, Compare Nexon & Seltos)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
