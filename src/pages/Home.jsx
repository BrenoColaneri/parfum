import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { CloudRain, Thermometer, Droplets, Briefcase, Heart, Dumbbell, GlassWater, PartyPopper, Utensils, Coffee, Music, Sun, Moon, Plus, X, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { simulateAIRecommendation, formatCustomOccasion } from '../utils/aiRecommender';

const Home = () => {
  const navigate = useNavigate();
  const { weather, inventory, user, customOccasions, addCustomOccasion, removeCustomOccasion } = useAppContext();
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOccasionText, setNewOccasionText] = useState('');
  const [isAddingOccasion, setIsAddingOccasion] = useState(false);

  let userName = user?.user_metadata?.name;
  if (!userName && user?.email) {
    const prefix = user.email.split('@')[0];
    userName = prefix.replace(/[0-9.]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  userName = (userName || 'Usuário').split(' ')[0];
  const capitalizedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const occasions = [
    { id: 'Trabalho', icon: <Briefcase size={20} /> },
    { id: 'Encontro', icon: <Heart size={20} /> },
    { id: 'Casual', icon: <GlassWater size={20} /> },
    { id: 'Academia', icon: <Dumbbell size={20} /> },
    { id: 'Festa', icon: <PartyPopper size={20} /> },
    { id: 'Jantar', icon: <Utensils size={20} /> },
    { id: 'Reunião', icon: <Coffee size={20} /> },
    { id: 'Balada', icon: <Music size={20} /> },
    { id: 'Parque', icon: <Sun size={20} /> },
    { id: 'Dormir', icon: <Moon size={20} /> }
  ];

  const allOccasions = [
    ...occasions,
    ...(customOccasions || []).map(co => {
      let iconName = co.lucideIcon;
      if (!iconName && co.name) {
        const n = co.name.toLowerCase();
        if (n.includes('faculdade') || n.includes('estudo')) iconName = 'GraduationCap';
        else if (n.includes('cinema') || n.includes('filme')) iconName = 'Film';
        else if (n.includes('igreja') || n.includes('culto')) iconName = 'Building';
      }
      const IconComp = (iconName && LucideIcons[iconName]) ? LucideIcons[iconName] : LucideIcons.Sparkles;
      return {
        id: co.name,
        icon: <IconComp size={20} />,
        isCustom: true
      };
    })
  ];

  const handleAddCustomOccasion = async () => {
    if (!newOccasionText.trim()) return;
    setIsAddingOccasion(true);
    try {
      const result = await formatCustomOccasion(newOccasionText);
      addCustomOccasion(result);
      setNewOccasionText('');
      setShowAddModal(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar ocasião.");
    } finally {
      setIsAddingOccasion(false);
    }
  };

  const handleRecommend = async () => {
    if (selectedOccasion && inventory.length > 0) {
      setIsThinking(true);
      const aiResult = await simulateAIRecommendation(weather, selectedOccasion, inventory);
      setIsThinking(false);
      if (aiResult) {
        const recommendation = {
          ...aiResult,
          weather,
          occasion: selectedOccasion
        };
        navigate('/analysis', { state: { recommendation } });
      }
    } else if (inventory.length === 0) {
      alert("Por favor, adicione perfumes na sua Biblioteria primeiro!");
      navigate('/inventory');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 className="page-title">Olá, {capitalizedUserName} 👋</h2>
          <p className="subtitle">Pronto para escolher a fragrância de hoje?</p>
        </div>
      </div>

      <div className="glass-card weather-widget">
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{weather.city}</h3>
          <div className="weather-temp">{weather.temp}°C</div>
          <p style={{ opacity: 0.9 }}>{weather.condition}</p>
          
          <div className="weather-details">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Thermometer size={14} /> {weather.minTemp}-{weather.maxTemp}°C</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Droplets size={14} /> {weather.humidity}%</span>
          </div>
        </div>
        <CloudRain size={64} style={{ opacity: 0.8 }} />
      </div>

      <h3 className="section-header">Qual será a sua ocasião hoje?</h3>
      
      <div className="occasion-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {allOccasions.map(occ => (
          <div 
            key={occ.id}
            className={`perfume-item ${selectedOccasion === occ.id ? 'selected' : ''}`}
            onClick={() => setSelectedOccasion(occ.id)}
            style={{ padding: '1.25rem 1rem', position: 'relative' }}
          >
            {occ.isCustom && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  removeCustomOccasion(occ.id);
                  if (selectedOccasion === occ.id) setSelectedOccasion(null);
                }}
                style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                title="Remover ocasião"
              >
                <X size={14} />
              </button>
            )}
            <div className="perfume-icon-wrapper">
              {occ.icon}
            </div>
            <p>{occ.id}</p>
          </div>
        ))}
        
        {/* Add Occasion Button */}
        <div 
          className="perfume-item"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '1.25rem 1rem', borderStyle: 'dashed', background: 'transparent' }}
        >
          <div className="perfume-icon-wrapper" style={{ background: 'var(--glass-bg)' }}>
            <Plus size={20} />
          </div>
          <p>Adicionar</p>
        </div>
      </div>

      <button 
        className="action-btn" 
        disabled={!selectedOccasion || isThinking}
        onClick={handleRecommend}
      >
        {isThinking ? 'A IA está pensando...' : 'Gerar Recomendação Inteligente'}
      </button>

      <div style={{ height: '120px' }}></div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Nova Ocasião</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                  Qual a ocasião?
                </label>
                <input 
                  type="text" 
                  value={newOccasionText}
                  onChange={e => setNewOccasionText(e.target.value)}
                  placeholder="Ex: Ir ao cinema com amigos"
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-main)', fontSize: '1rem', outline: 'none'
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddCustomOccasion();
                  }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  A IA vai padronizar o nome e escolher um ícone pra você.
                </p>
              </div>

              <button 
                onClick={handleAddCustomOccasion}
                disabled={!newOccasionText.trim() || isAddingOccasion}
                style={{
                  background: 'var(--accent)', color: 'white', border: 'none',
                  padding: '1rem', borderRadius: '12px', fontWeight: '600',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                  opacity: (!newOccasionText.trim() || isAddingOccasion) ? 0.5 : 1
                }}
              >
                {isAddingOccasion ? <><Loader2 size={18} className="animate-spin" /> Padronizando...</> : 'Adicionar Ocasião'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
