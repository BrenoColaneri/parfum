import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Thermometer, Droplets, Briefcase, Heart, Dumbbell, GlassWater, PartyPopper } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { simulateAIRecommendation } from '../utils/aiRecommender';

const Home = () => {
  const navigate = useNavigate();
  const { weather, inventory } = useAppContext();
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  const occasions = [
    { id: 'Trabalho', icon: <Briefcase size={20} /> },
    { id: 'Encontro', icon: <Heart size={20} /> },
    { id: 'Casual', icon: <GlassWater size={20} /> },
    { id: 'Academia', icon: <Dumbbell size={20} /> },
    { id: 'Festa', icon: <PartyPopper size={20} /> }
  ];

  const handleRecommend = async () => {
    if (selectedOccasion && inventory.length > 0) {
      setIsThinking(true);
      const recommendation = await simulateAIRecommendation(weather, selectedOccasion, inventory);
      setIsThinking(false);
      navigate('/analysis', { state: { recommendation } });
    } else if (inventory.length === 0) {
      alert("Por favor, adicione perfumes na sua Biblioteria primeiro!");
      navigate('/inventory');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 className="page-title">Olá, Usuário 👋</h2>
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
      
      <div className="occasion-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {occasions.map(occ => (
          <div 
            key={occ.id}
            className={`perfume-item ${selectedOccasion === occ.id ? 'selected' : ''}`}
            onClick={() => setSelectedOccasion(occ.id)}
            style={{ padding: '1.25rem 1rem' }}
          >
            <div className="perfume-icon-wrapper">
              {occ.icon}
            </div>
            <p>{occ.id}</p>
          </div>
        ))}
      </div>

      <button 
        className="action-btn" 
        disabled={!selectedOccasion || isThinking}
        onClick={handleRecommend}
      >
        {isThinking ? 'A IA está pensando...' : 'Gerar Recomendação Inteligente'}
      </button>
    </div>
  );
};

export default Home;
