import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Info, Flame, Trees, CloudOff, ArrowLeft, Droplet, CheckCircle2 } from 'lucide-react';

const Analysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recommendation = location.state?.recommendation;

  if (!recommendation) {
    return <Navigate to="/" />;
  }

  const { perfume, rationale, recommendedNotes, avoidedNotes, occasion, weather } = recommendation;

  const renderIcon = (type) => {
    if (type.includes('Fresco')) return <Droplet size={80} color="#38bdf8" style={{ marginBottom: '1rem' }} />;
    if (type.includes('Amadeirado')) return <Trees size={80} color="#4ade80" style={{ marginBottom: '1rem' }} />;
    return <Flame size={80} color="#f97316" style={{ marginBottom: '1rem' }} />;
  };

  const renderSmallIcon = (noteName) => {
    if (noteName.includes('Limão') || noteName.includes('Cítrico')) return <Droplet size={20} color="#38bdf8" />;
    if (noteName.includes('Madeira') || noteName.includes('Vetiver')) return <Trees size={20} color="#4ade80" />;
    return <Flame size={20} color="#fbbf24" />;
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.5rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Info size={24} color="var(--accent)" />
          Sua Recomendação
        </h2>
      </div>

      <h3 className="subtitle" style={{ marginBottom: '1rem' }}>Contexto Atual</h3>
      <div className="analysis-summary">
        <div className="summary-stat">
          <div className="summary-val">{weather.temp}°C</div>
          <div className="summary-label">{weather.city}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-val" style={{ color: '#a78bfa' }}>{occasion}</div>
          <div className="summary-label">Ocasião</div>
        </div>
        <div className="summary-stat">
          <div className="summary-val">{weather.condition}</div>
          <div className="summary-label">Clima</div>
        </div>
      </div>

      <h3 className="subtitle">O Perfume Ideal</h3>
      <div className="featured-bottle">
        <div className="bottle-glow" style={{ background: perfume.type.includes('Fresco') ? 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, rgba(0,0,0,0) 70%)'}}></div>
        {renderIcon(perfume.type)}
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{perfume.name}</h2>
        <span className="inventory-tags" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
          {perfume.type}
        </span>
      </div>

      <div className="rationale-box" style={{ 
        borderLeftColor: perfume.type.includes('Fresco') ? '#38bdf8' : '#f97316',
        background: perfume.type.includes('Fresco') ? 'rgba(56, 189, 248, 0.1)' : 'rgba(249, 115, 22, 0.1)'
      }}>
        <h4 style={{ color: perfume.type.includes('Fresco') ? '#bae6fd' : '#fed7aa', marginBottom: '0.5rem', fontSize: '1rem' }}>Por que esta é a escolha certa?</h4>
        <p style={{ color: perfume.type.includes('Fresco') ? '#e0f2fe' : '#fed7aa' }}>
          "{rationale}"
        </p>
      </div>

      <h3 className="subtitle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Notas Recomendadas</h3>
      <div className="note-tags">
        {recommendedNotes.map((note, index) => (
          <div className="note-tag" key={index}>
            <div className="note-icon">
              {renderSmallIcon(note)}
            </div>
            <span style={{ textAlign: 'center', fontSize: '0.75rem' }}>{note}</span>
          </div>
        ))}
      </div>

      <div className="avoid-box" style={{ marginBottom: '2rem' }}>
        <CloudOff size={32} color="#f87171" style={{ flexShrink: 0 }} />
        <div className="avoid-text">
          <h4>Evitar:</h4>
          <p>{avoidedNotes.join(', ')}</p>
        </div>
      </div>
      
      <button className="action-btn" onClick={() => navigate('/')} style={{ position: 'relative', bottom: 0, left: 0, right: 0, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} />
          Confirmar Uso
        </div>
      </button>
    </div>
  );
};

export default Analysis;
