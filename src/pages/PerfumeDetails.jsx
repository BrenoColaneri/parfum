import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, User, CalendarDays, Star, Layers, Activity, Users, DollarSign, Plus, CheckCircle, Droplets, Trees, Flame, Wind, FlaskConical, Leaf } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { fetchPerfumeDetails } from '../utils/aiRecommender';

const PerfumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inventory, updatePerfumeDetails, updateFillLevel, updateUserReview, updatePricePaid, recordSotd, sotdHistory } = useAppContext();
  
  const [perfume, setPerfume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [localReview, setLocalReview] = useState('');
  const [localRating, setLocalRating] = useState(0);
  const [localPricePaid, setLocalPricePaid] = useState('');
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
    setLocalPricePaid(foundPerfume.price_paid || '');

    const getDetails = async () => {
      // If we already fetched it before and it's the NEW schema (has accords)
      if (foundPerfume.full_details && foundPerfume.full_details.accords) {
        setIsLoading(false);
        return;
      }

      // If it doesn't exist or is legacy, fetch new
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
    if (localPricePaid !== '') {
      await updatePricePaid(perfume.id, parseFloat(localPricePaid));
    }
    setIsSavingReview(false);
  };

  const handleFillLevelChange = async (e) => {
    const val = parseInt(e.target.value);
    setPerfume(prev => ({...prev, fill_level: val}));
    await updateFillLevel(perfume.id, val);
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

  const renderBar = (label, value, color) => (
    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '80px', fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '5px' }}></div>
      </div>
    </div>
  );

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Trees': return <Trees size={64} color="var(--accent)" />;
      case 'Flame': return <Flame size={64} color="#f97316" />;
      case 'Wind': return <Wind size={64} color="#cbd5e1" />;
      case 'Leaf': return <Leaf size={64} color="#4ade80" />;
      case 'Droplets': default: return <Droplets size={64} color="#38bdf8" />;
    }
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/inventory')} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.5rem', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="perfume-details-header" style={{ textAlign: 'center' }}>
        <div className="perfume-bottle" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {perfume.image ? (
            <img src={perfume.image} alt={perfume.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              {getIcon(perfume.icon)}
            </div>
          )}
        </div>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{perfume.name}</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--accent)', margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>{perfume.brand}</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          onClick={isSotdToday ? null : handleRecordSotd}
          disabled={isSotdToday}
          className="glass-card"
          style={{ 
            width: '100%', 
            padding: '1rem',
            background: isSotdToday ? 'rgba(34, 197, 94, 0.1)' : 'rgba(167, 139, 250, 0.1)',
            color: isSotdToday ? '#4ade80' : 'var(--accent)',
            border: `1px solid ${isSotdToday ? 'rgba(34, 197, 94, 0.3)' : 'rgba(167, 139, 250, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: isSotdToday ? 'default' : 'pointer'
          }}
        >
          {isSotdToday ? <CheckCircle size={20} /> : <CalendarDays size={20} />}
          {isSotdToday ? 'Registrado no Histórico Hoje' : 'Estou usando hoje'}
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: 'var(--accent)' }}>
          <Loader2 size={32} className="lucide-spin" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
          <p>Buscando na enciclopédia Fragrantica...</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : perfume.full_details ? (
        <div className="perfume-details-content">
          
          {/* ACCORDS - Fragrantica Style */}
          {perfume.full_details.accords && perfume.full_details.accords.length > 0 && (
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Principais Acordes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                {perfume.full_details.accords.map((accord, idx) => (
                  <div key={idx} style={{ 
                    width: `${Math.max(30, accord.value)}%`, 
                    background: accord.color, 
                    color: '#fff', 
                    padding: '4px 0', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem', 
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    textTransform: 'lowercase'
                  }}>
                    {accord.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="rationale-box" style={{ borderColor: 'var(--accent)', background: 'rgba(167, 139, 250, 0.05)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              {perfume.full_details.description}
            </p>
            {perfume.full_details.perfumer && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {perfume.full_details.perfumer}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CalendarDays size={14} /> {perfume.full_details.releaseYear || 'N/A'}</span>
              </div>
            )}
          </div>

          {/* PYRAMID */}
          {perfume.full_details.pyramid && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Layers size={20} color="var(--accent)" /> Pirâmide do Perfume
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Notas de Topo</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                    {perfume.full_details.pyramid.top.map((note, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>{note}</div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Notas de Coração</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                    {perfume.full_details.pyramid.heart.map((note, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>{note}</div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Notas de Base</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                    {perfume.full_details.pyramid.base.map((note, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>{note}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE BARS */}
          {perfume.full_details.performance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Activity size={16} color="#38bdf8" /> Longevidade
                </h4>
                {renderBar('Fraco', perfume.full_details.performance.longevity.weak, '#94a3b8')}
                {renderBar('Moderado', perfume.full_details.performance.longevity.moderate, '#38bdf8')}
                {renderBar('Longa Duração', perfume.full_details.performance.longevity.longLasting, '#4ade80')}
                {renderBar('Eterno', perfume.full_details.performance.longevity.eternal, '#8b5cf6')}
              </div>

              <div className="glass-card" style={{ padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Activity size={16} color="#f472b6" /> Rastro (Sillage)
                </h4>
                {renderBar('Íntimo', perfume.full_details.performance.sillage.intimate, '#94a3b8')}
                {renderBar('Moderado', perfume.full_details.performance.sillage.moderate, '#f472b6')}
                {renderBar('Forte', perfume.full_details.performance.sillage.strong, '#f97316')}
                {renderBar('Enorme', perfume.full_details.performance.sillage.enormous, '#ef4444')}
              </div>
            </div>
          )}

          {/* DEMOGRAPHICS */}
          {perfume.full_details.demographics && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ flex: 1, padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                  <Users size={14} color="var(--accent)" /> Gênero
                </h4>
                {renderBar('Feminino', perfume.full_details.demographics.gender.female, '#f472b6')}
                {renderBar('Unissex', perfume.full_details.demographics.gender.unisex, '#a855f7')}
                {renderBar('Masculino', perfume.full_details.demographics.gender.male, '#38bdf8')}
              </div>
              <div className="glass-card" style={{ flex: 1, padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                  <DollarSign size={14} color="#4ade80" /> Valor
                </h4>
                {renderBar('Caro', perfume.full_details.demographics.priceValue.expensive, '#ef4444')}
                {renderBar('OK', perfume.full_details.demographics.priceValue.ok, '#facc15')}
                {renderBar('Ótimo', perfume.full_details.demographics.priceValue.great, '#4ade80')}
              </div>
            </div>
          )}

          {/* SIMILAR PERFUMES */}
          {perfume.full_details.similar && perfume.full_details.similar.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Este Perfume me Lembra do...</h3>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem' }}>
                {perfume.full_details.similar.map((sim, idx) => (
                  <div key={idx} className="glass-card" style={{ minWidth: '140px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FlaskConical size={24} color="var(--accent)" />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{sim}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="section-header" style={{ marginTop: '2rem' }}>Meu Diário Olfativo</h3>
          <div className="glass-card">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={32} 
                  onClick={() => setLocalRating(star)}
                  fill={localRating >= star ? '#fcd34d' : 'transparent'}
                  color={localRating >= star ? '#fcd34d' : 'var(--text-muted)'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                />
              ))}
            </div>
            
            <textarea 
              value={localReview}
              onChange={(e) => setLocalReview(e.target.value)}
              placeholder="O que você acha dessa fragrância? Quando costuma usar?"
              style={{ 
                width: '100%', 
                minHeight: '100px', 
                resize: 'vertical', 
                marginBottom: '1rem', 
                fontSize: '0.9rem',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                outline: 'none'
              }}
            />

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Preço Pago (R$):</span>
              <input 
                type="number" 
                value={localPricePaid}
                onChange={(e) => setLocalPricePaid(e.target.value)}
                placeholder="Ex: 350.00"
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>
            
            <button 
              onClick={handleSaveReview} 
              disabled={isSavingReview}
              className="glass-card" 
              style={{ 
                width: '100%', 
                padding: '1rem', 
                background: 'rgba(167, 139, 250, 0.1)', 
                color: 'var(--accent)', 
                border: '1px solid rgba(167, 139, 250, 0.3)',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {isSavingReview ? 'Salvando...' : 'Salvar Avaliação'}
            </button>
          </div>

        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sem detalhes adicionais disponíveis.</p>
      )}
    </div>
  );
};

export default PerfumeDetails;
