import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Info, Flame, Trees, CloudOff, ArrowLeft, Droplet, CheckCircle2, Sparkles, Loader2, Search } from 'lucide-react';
import { recommendNewPerfumes, recommendLayering } from '../utils/aiRecommender';
import { useAppContext } from '../context/AppProvider';

const Analysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { inventory, recordSotd } = useAppContext();
  
  const recommendation = location.state?.recommendation;
  const [activeTab, setActiveTab] = useState('uso');
  const [discoveries, setDiscoveries] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [layeringResult, setLayeringResult] = useState(null);
  const [isLayering, setIsLayering] = useState(false);

  if (!recommendation) {
    return <Navigate to="/" />;
  }

  const { perfume, rationale, recommendedNotes = [], avoidNotes = [], occasion, weather } = recommendation;

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

  useEffect(() => {
    if (activeTab === 'descobrir' && discoveries.length === 0) {
      const getDiscoveries = async () => {
        setIsDiscovering(true);
        const results = await recommendNewPerfumes(inventory);
        setDiscoveries(results);
        setIsDiscovering(false);
      };
      getDiscoveries();
    }
  }, [activeTab, inventory, discoveries.length]);

  useEffect(() => {
    if (activeTab === 'laboratorio' && !layeringResult) {
      const getLayering = async () => {
        setIsLayering(true);
        const result = await recommendLayering(inventory);
        setLayeringResult(result);
        setIsLayering(false);
      };
      getLayering();
    }
  }, [activeTab, inventory, layeringResult]);

  const handleConfirmUse = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    await recordSotd(perfume.id, todayStr);
    navigate('/history');
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button 
          onClick={() => setActiveTab('uso')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'uso' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'uso' ? 'bold' : 'normal', borderBottom: activeTab === 'uso' ? '2px solid var(--accent)' : 'none' }}
        >
          O Que Usar
        </button>
        <button 
          onClick={() => setActiveTab('descobrir')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'descobrir' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'descobrir' ? 'bold' : 'normal', borderBottom: activeTab === 'descobrir' ? '2px solid var(--accent)' : 'none' }}
        >
          Descobrir
        </button>
        <button 
          onClick={() => setActiveTab('laboratorio')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'laboratorio' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'laboratorio' ? 'bold' : 'normal', borderBottom: activeTab === 'laboratorio' ? '2px solid var(--accent)' : 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}
        >
          <Sparkles size={16} /> Laboratório
        </button>
      </div>

      {activeTab === 'uso' ? (
        <>
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
              <p>{avoidNotes?.join(', ') || 'Nenhuma nota em específico'}</p>
            </div>
          </div>
          
          <button className="action-btn" onClick={handleConfirmUse} style={{ position: 'relative', bottom: 0, left: 0, right: 0, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} />
              Confirmar Uso
            </div>
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            Baseado no que você já tem na sua Biblioteria, a IA encontrou essas jóias da perfumaria para você.
          </p>
          
          {isDiscovering ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <Loader2 size={32} className="lucide-spin" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
              <p>Vasculhando o mundo da perfumaria...</p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : discoveries.length > 0 ? (
            discoveries.map((disc, idx) => (
              <div key={idx} className="glass-card" style={{ border: '1px solid var(--accent)', background: 'rgba(167, 139, 250, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{disc.name}</h4>
                  <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' }}>
                    {disc.brand}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1rem' }}>Notas: {disc.notes}</p>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}><Sparkles size={14} color="#fcd34d" /> Por que você vai amar:</span>
                  {disc.reason}
                </div>
                <a 
                  href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(disc.name + ' ' + disc.brand)}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '1rem', padding: '0.75rem', background: '#334155', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  <Search size={16} /> Pesquisar Preços
                </a>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Não foi possível carregar as recomendações no momento.</p>
          )}
        </div>
      )}

      {activeTab === 'laboratorio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Sparkles size={32} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>O Laboratório do Alquimista</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>A IA está descobrindo a combinação perfeita entre dois frascos da sua coleção...</p>
          </div>

          {isLayering ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <Loader2 size={32} className="lucide-spin" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
              <p>Misturando essências...</p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : layeringResult ? (
            <div className="glass-card" style={{ border: '2px dashed #a855f7', background: 'rgba(168, 85, 247, 0.05)', textAlign: 'center' }}>
              <h4 style={{ color: '#d8b4fe', fontSize: '1.4rem', margin: '0 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {layeringResult.mix_name}
              </h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                  <Droplet size={24} color="#38bdf8" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{layeringResult.perfume1_name}</div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#a855f7' }}>+</div>
                <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
                  <Flame size={24} color="#fbbf24" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{layeringResult.perfume2_name}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#e9d5ff', fontStyle: 'italic', lineHeight: '1.5' }}>
                "{layeringResult.rationale}"
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Você precisa de pelo menos 2 perfumes na coleção para fazer misturas.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;
