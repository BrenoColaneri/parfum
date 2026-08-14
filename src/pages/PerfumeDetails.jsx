import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, Wind, Droplets, Trees, Flame, Sparkles, Sun, Moon, Calendar, User, CalendarDays, Star, CheckCircle, Droplet } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { fetchPerfumeDetails } from '../utils/aiRecommender';

const PerfumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inventory, updatePerfumeDetails, updateFillLevel, updateUserReview, recordSotd, sotdHistory } = useAppContext();
  
  const [perfume, setPerfume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [localReview, setLocalReview] = useState('');
  const [localRating, setLocalRating] = useState(0);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [justRecordedSotd, setJustRecordedSotd] = useState(false);

  // Check if recorded today
  const todayStr = new Date().toISOString().split('T')[0];
  const isSotdToday = sotdHistory.some(s => s.perfume_id === id && s.date === todayStr) || justRecordedSotd;

  useEffect(() => {
    const foundPerfume = inventory.find(p => p.id === id);
    if (!foundPerfume) {
      setError("Perfume não encontrado na sua biblioteria.");
      setIsLoading(false);
      return;
    }
    
    setPerfume(foundPerfume);
    setLocalReview(foundPerfume.user_review || '');
    setLocalRating(foundPerfume.user_rating || 0);

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

  const handleRecordSotd = async () => {
    await recordSotd(perfume.id, todayStr);
    setJustRecordedSotd(true);
  };

  const handleSaveReview = async () => {
    setIsSavingReview(true);
    await updateUserReview(perfume.id, localRating, localReview);
    setIsSavingReview(false);
  };

  const handleFillLevelChange = async (e) => {
    const val = parseInt(e.target.value);
    setPerfume(prev => ({...prev, fill_level: val}));
    await updateFillLevel(perfume.id, val);
  };

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

        <div style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={handleRecordSotd}
            disabled={isSotdToday}
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: isSotdToday ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, var(--accent), #d8b4fe)', color: isSotdToday ? '#10b981' : 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: isSotdToday ? 'default' : 'pointer', transition: 'all 0.3s ease' }}
          >
            {isSotdToday ? <><CheckCircle size={20} /> Registrado Hoje</> : <><Sparkles size={20} /> Estou usando hoje</>}
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Droplet size={14} /> Volumetria Restante</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{perfume.fill_level ?? 100}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            value={perfume.fill_level ?? 100} 
            onChange={handleFillLevelChange}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
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
            {perfume.full_details.perfumer && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {perfume.full_details.perfumer}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CalendarDays size={14} /> {perfume.full_details.releaseYear || 'N/A'}</span>
              </div>
            )}
          </div>

          {perfume.full_details.mainAccords && perfume.full_details.mainAccords.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Principais Acordes</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {perfume.full_details.mainAccords.map((accord, idx) => (
                  <span key={idx} style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>
                    {accord}
                  </span>
                ))}
              </div>
            </div>
          )}

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
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Longevidade (Fixação)</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{perfume.full_details.longevity}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${perfume.full_details.longevity}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent) 0%, #d8b4fe 100%)', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Projeção (Sillage)</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{perfume.full_details.projection}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${perfume.full_details.projection}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8 0%, #bae6fd 100%)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>

          <h3 className="section-header">Clima e Ocasião Ideal</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ flex: 1, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Sun size={24} color="#fcd34d" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Uso Ideal</h4>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{perfume.full_details.timeOfDay || 'Não especificado'}</p>
            </div>
            <div className="glass-card" style={{ flex: 1, padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Calendar size={24} color="#6ee7b7" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Estações</h4>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{perfume.full_details.bestSeasons?.join(', ') || 'Não especificado'}</p>
            </div>
          </div>

          <h3 className="section-header" style={{ marginTop: '2rem' }}>Meu Diário Olfativo</h3>
          <div className="glass-card">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={32} 
                  onClick={() => setLocalRating(star)}
                  fill={localRating >= star ? '#fcd34d' : 'transparent'}
                  color={localRating >= star ? '#fcd34d' : 'rgba(255,255,255,0.2)'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                />
              ))}
            </div>
            <textarea 
              value={localReview}
              onChange={(e) => setLocalReview(e.target.value)}
              placeholder="Quais as suas memórias com esse perfume? O que você sente quando usa?"
              style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical', marginBottom: '1rem' }}
            ></textarea>
            <button 
              onClick={handleSaveReview}
              disabled={isSavingReview}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold' }}
            >
              {isSavingReview ? 'Salvando...' : 'Salvar Diário'}
            </button>
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default PerfumeDetails;
