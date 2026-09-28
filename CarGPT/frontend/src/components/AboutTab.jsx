import React from 'react';
import { Cpu, Layers, Shield, Sparkles, Terminal, Code, CheckCircle, Database } from 'lucide-react';

export default function AboutTab() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Title Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Sparkles size={28} color="#60a5fa" />
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>CarGPT – AI Car Knowledge Assistant</h1>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '800px' }}>
          An end-to-end <strong>Generative AI Internship Project</strong> demonstrating <strong>Retrieval-Augmented Generation (RAG)</strong>, 
          custom knowledge base grounding, prompt engineering, and modern web application development.
        </p>
      </div>

      {/* RAG Architecture Diagram Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers color="#2563eb" size={22} /> RAG System Architecture Flow
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.25rem 0' }}>1. User Query</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>"Tell me about Hyundai Creta"</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Database size={24} color="#2563eb" style={{ margin: '0 auto' }} />
            <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.25rem 0' }}>2. Keyword RAG Retrieval</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Searches 16 car records in custom dataset</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Shield size={24} color="#2563eb" style={{ margin: '0 auto' }} />
            <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.25rem 0' }}>3. Prompt Engineering</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Context injection & anti-hallucination rules</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Cpu size={24} color="#2563eb" style={{ margin: '0 auto' }} />
            <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.25rem 0' }}>4. LLM / RAG Answer</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Grounded answer delivered to user</p>
          </div>
        </div>
      </div>

      {/* Grid of Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Key Features & Objectives */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle color="#16a34a" size={20} /> Core Technical Capabilities
          </h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#334155', lineHeight: '1.8' }}>
            <li><strong>Custom Car Knowledge Base</strong>: Pre-loaded with 16 popular models from 9 major brands (Hyundai, Tata, Kia, Maruti Suzuki, Toyota, Honda, Mahindra, Volkswagen, Skoda).</li>
            <li><strong>Retrieval-Augmented Generation (RAG)</strong>: Matches user intent keywords against car fields before sending context to LLM.</li>
            <li><strong>Prompt Engineering Guardrails</strong>: Strict anti-hallucination prompt prevents fabricating specs or answering off-topic queries.</li>
            <li><strong>Car Comparison Engine</strong>: Produces clean side-by-side spec comparisons for models like Creta vs Seltos or Nexon.</li>
            <li><strong>Dual API / Offline Support</strong>: Supports Gemini/OpenAI API keys via `.env` with automatic fallback to a local smart RAG generator.</li>
          </ul>
        </div>

        {/* Technology Stack */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code color="#2563eb" size={20} /> Technology Stack
          </h3>
          <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: '600', color: '#0f172a' }}>Frontend Framework</td>
                <td style={{ color: '#475569' }}>React 18 + Vite (JavaScript)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: '600', color: '#0f172a' }}>Styling & Icons</td>
                <td style={{ color: '#475569' }}>Vanilla CSS (Modern Tokens) + Lucide Icons</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: '600', color: '#0f172a' }}>Backend Server</td>
                <td style={{ color: '#475569' }}>Python 3.10+ & FastAPI</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: '600', color: '#0f172a' }}>RAG & LLM Engine</td>
                <td style={{ color: '#475569' }}>Custom Keyword Retriever + Gemini API / Fallback</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', fontWeight: '600', color: '#0f172a' }}>Dataset Storage</td>
                <td style={{ color: '#475569' }}>Structured JSON (`backend/data/cars.json`)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Evaluation Guide Card */}
      <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#1e40af', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎓 Student Evaluation Explanation Guide
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.6', marginBottom: '1rem' }}>
          When presenting this project to evaluators, highlight these key concepts:
        </p>
        <ol style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#1e3a8a', lineHeight: '1.8' }}>
          <li><strong>Why RAG over general LLM?</strong> General LLMs can hallucinate outdated or incorrect specs. RAG forces the model to answer strictly using our verified local dataset.</li>
          <li><strong>How does Retrieval work?</strong> When a user asks "Which cars have automatic transmission?", our keyword service scans `cars.json`, extracts matching records, and formats them into a context string.</li>
          <li><strong>How Prompt Engineering works?</strong> System prompts instruct the AI to refuse non-car questions, format comparison tables, and acknowledge missing records cleanly.</li>
        </ol>
      </div>
    </div>
  );
}
