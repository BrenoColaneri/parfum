import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, Wind, Droplets, Trees, Flame, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { fetchPerfumeDetails } from '../utils/aiRecommender';

const PerfumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inventory, updatePerfumeDetails } = useAppContext();
  
  const [perfume, setPerfume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const foundPerfume = inventory.find(p => p.id === id);
    if (!foundPerfume) {
      setError("Perfume não encontrado na sua biblioteria.");
      setIsLoading(false);
      return;
    }
    
    setPerfume(foundPerfume);

    const getDetails = async () => {
      // If we already fetched it before, don't fetch again
      if (foundPerfume.full_details) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const details = await fetchPerfumeDetails(foundPerfume.name);
      if (details) {
        await updatePerfumeDetails(foundPerfume.id, details);
        setPerfume(prev => ({ ...prev, full_details: details }));
      } else {
        setError("Não foi possível carregar os detalhes do perfume.");
      }
      setIsLoading(false);
    };

    getDetails();
  }, [id, inventory, updatePerfumeDetails]);

  const renderIcon = (iconName) => {
    switch(iconName) {
      case 'Trees': return <Trees size={40} color="var(--accent)" />;
      case 'Flame': return <Flame size={40} color="#f97316" />;
      case 'Wind': return <Wind size={40} color="#cbd5e1" />;
      case 'Droplets': default: return <Droplets size={40} color="#38bdf8" />;
    }
  };

  if (error) {
    return (
      <div className="page-wrapper" style={{ paddingBottom: '3rem', textAlign: 'center' }}>
        <button onClick={() => navigate('/inventory')} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start', marginBottom: '2rem' }}>
          <ArrowLeft size={24} />
        </button>
        <p style={{ color: '#ef4444' }}>{error}</p>
      </div>
    );
  }

  if (!perfume) return null;

  return (
    <div className="page-wrapper" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/inventory')} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.5rem', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="page-title" style={{ margin: 0 }}>Dossiê Olfativo</h2>
      </div>

      <div className="featured-bottle" style={{ marginBottom: '2rem' }}>
        <div className="bottle-glow" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(0,0,0,0) 70%)' }}></div>
        {renderIcon(perfume.icon)}
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', marginTop: '1rem' }}>{perfume.name}</h2>
        {perfume.brand && <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{perfume.brand}</span>}
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <span className="inventory-tags">{perfume.type}</span>
          {perfume.concentration && <span className="inventory-tags" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>{perfume.concentration}</span>}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="lucide-spin" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
          <p>A IA está estudando este perfume...</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : perfume.full_details ? (
        <div className="perfume-details-content">
          <div className="rationale-box" style={{ borderColor: 'var(--accent)', background: 'rgba(167, 139, 250, 0.05)', marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} /> A Essência
            </h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              {perfume.full_details.description}
            </p>
            {perfume.full_details.vibe && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', color: 'white', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                Vibe: {perfume.full_details.vibe}
              </div>
            )}
          </div>

          <h3 className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--accent)" /> Pirâmide Olfativa
          </h3>
          <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notas de Topo (Saída)</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{perfume.full_details.topNotes?.join(', ') || 'Não especificado'}</p>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div>
              <h4 style={{ fontSize: '0.8rem', color: '#4ade80', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notas de Coração (Corpo)</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{perfume.full_details.heartNotes?.join(', ') || 'Não especificado'}</p>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div>
              <h4 style={{ fontSize: '0.8rem', color: '#f97316', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notas de Fundo (Base)</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{perfume.full_details.baseNotes?.join(', ') || 'Não especificado'}</p>
            </div>
          </div>

          <h3 className="section-header">Performance Estimada</h3>
          <div className="glass-card">
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Longevidade (Fixação)</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{perfume.full_details.longevity}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: \`\${perfume.full_details.longevity}%\`, height: '100%', background: 'linear-gradient(90deg, var(--accent) 0%, #d8b4fe 100%)', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Projeção (Sillage)</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{perfume.full_details.projection}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: \`\${perfume.full_details.projection}%\`, height: '100%', background: 'linear-gradient(90deg, #38bdf8 0%, #bae6fd 100%)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PerfumeDetails;
