import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Info, Flame, Trees, CloudOff, ArrowLeft, Droplet, CheckCircle2, Sparkles, Loader2, Search, Swords, MessageSquare, Camera, Send, ImageIcon } from 'lucide-react';
import { recommendNewPerfumes, recommendLayering, findClones, perfumeBattle, chatWithSommelier } from '../utils/aiRecommender';
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
  
  const [clones, setClones] = useState([]);
  const [isFindingClones, setIsFindingClones] = useState(false);
  const [cloneSearchText, setCloneSearchText] = useState('');
  const [cloneHistory, setCloneHistory] = useState(() => {
    const saved = localStorage.getItem('cloneHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [battlePerfume1, setBattlePerfume1] = useState('');
  const [battlePerfume2, setBattlePerfume2] = useState('');
  const [battleResult, setBattleResult] = useState(null);
  const [isBattling, setIsBattling] = useState(false);
  const [battleHistory, setBattleHistory] = useState(() => {
    const saved = localStorage.getItem('battleHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: 'Olá! Sou o Jean, seu Sommelier pessoal. Você pode me perguntar sobre seus perfumes ou enviar uma foto do seu look para eu recomendar o perfume ideal.' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [isChatting, setIsChatting] = useState(false);

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

  const handleSearchClones = async () => {
    if (!cloneSearchText) return;
    setIsFindingClones(true);
    const results = await findClones(cloneSearchText);
    setClones(results);
    const newHistory = [{ searchText: cloneSearchText, clones: results }, ...cloneHistory.filter(h => h.searchText !== cloneSearchText)].slice(0, 5);
    setCloneHistory(newHistory);
    localStorage.setItem('cloneHistory', JSON.stringify(newHistory));
    setIsFindingClones(false);
  };

  const handleBattle = async () => {
    if (!battlePerfume1 || !battlePerfume2) return;
    const p1 = inventory.find(p => p.id === battlePerfume1);
    const p2 = inventory.find(p => p.id === battlePerfume2);
    if (!p1 || !p2) return;
    
    setIsBattling(true);
    const result = await perfumeBattle(p1, p2);
    setBattleResult(result);
    const newHistory = [{ p1: p1.name, p2: p2.name, result }, ...battleHistory].slice(0, 5);
    setBattleHistory(newHistory);
    localStorage.setItem('battleHistory', JSON.stringify(newHistory));
    setIsBattling(false);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() && !chatImage) return;
    
    const userMessageText = chatInput.trim() || 'Aqui está a foto.';
    const newMessage = { role: 'user', text: userMessageText, image: chatImage?.preview };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatting(true);

    const aiResponse = await chatWithSommelier(
      inventory,
      chatMessages,
      userMessageText,
      chatImage?.base64,
      chatImage?.mimeType
    );

    setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    setChatImage(null);
    setIsChatting(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatImage({
          preview: reader.result,
          base64: reader.result.split(',')[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
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
        <button 
          onClick={() => setActiveTab('clones')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'clones' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'clones' ? 'bold' : 'normal', borderBottom: activeTab === 'clones' ? '2px solid var(--accent)' : 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}
        >
          <Search size={16} /> Clones
        </button>
        <button 
          onClick={() => setActiveTab('batalha')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'batalha' ? '#ef4444' : 'var(--text-muted)', fontWeight: activeTab === 'batalha' ? 'bold' : 'normal', borderBottom: activeTab === 'batalha' ? '2px solid #ef4444' : 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}
        >
          <Swords size={16} /> Batalha
        </button>
        <button 
          onClick={() => setActiveTab('sommelier')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'sommelier' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'sommelier' ? 'bold' : 'normal', borderBottom: activeTab === 'sommelier' ? '2px solid var(--accent)' : 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}
        >
          <MessageSquare size={16} /> Consultor
        </button>
      </div>

      {activeTab === 'uso' && (
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
      )}

      {activeTab === 'descobrir' && (
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

      {activeTab === 'clones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="subtitle">Encontre o Melhor Contratipo</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Digite o nome de um perfume importado caro e a IA te mostrará as melhores opções acessíveis no Brasil.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text"
              placeholder="Ex: Tom Ford Oud Wood"
              value={cloneSearchText}
              onChange={(e) => setCloneSearchText(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
            <button 
              onClick={handleSearchClones}
              disabled={isFindingClones}
              className="btn-primary"
            >
              Buscar
            </button>
          </div>

          {isFindingClones ? (
             <div style={{ textAlign: 'center', padding: '2rem 0' }}>
               <Loader2 size={32} className="lucide-spin" style={{ color: 'var(--accent)', animation: 'spin 2s linear infinite', margin: '0 auto' }} />
               <p style={{ color: 'var(--accent)', marginTop: '1rem' }}>Vasculhando o mercado...</p>
               <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             </div>
          ) : clones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {clones.map((c, i) => (
                <div key={i} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{c.brand}</div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0.25rem 0' }}>{c.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Similaridade: {c.similarity}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    <strong>Por que é bom?</strong> {c.pros}
                  </p>
                </div>
              ))}
            </div>
          )}

          {cloneHistory.length > 0 && !isFindingClones && clones.length === 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1rem' }}>Pesquisas Recentes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cloneHistory.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      setCloneSearchText(item.searchText);
                      setClones(item.clones);
                    }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Search size={14} style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }} />
                    Clones de: {item.searchText}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'batalha' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Swords size={32} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Batalha Olfativa</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Escolha dois frascos e veja quem vence o duelo.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <select 
              value={battlePerfume1}
              onChange={(e) => setBattlePerfume1(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Selecione o Desafiante 1</option>
              {inventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span style={{ fontWeight: 'bold', color: '#ef4444' }}>VS</span>
            <select 
              value={battlePerfume2}
              onChange={(e) => setBattlePerfume2(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Selecione o Desafiante 2</option>
              {inventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <button 
            onClick={handleBattle}
            disabled={isBattling || !battlePerfume1 || !battlePerfume2 || battlePerfume1 === battlePerfume2}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isBattling ? 'Julgando Batalha...' : 'Iniciar Combate'}
          </button>

          {isBattling && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Loader2 size={32} className="lucide-spin" style={{ color: '#ef4444', margin: '0 auto', animation: 'spin 2s linear infinite' }} />
              <p style={{ color: '#ef4444', marginTop: '1rem' }}>Analisando projeção e notas...</p>
            </div>
          )}

          {battleHistory.length > 0 && !isBattling && !battleResult && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1rem' }}>Batalhas Recentes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {battleHistory.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setBattleResult(item.result)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Swords size={14} style={{ marginRight: '0.5rem', color: '#ef4444' }} />
                    {item.p1} vs {item.p2}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isBattling && battleResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="glass-card" style={{ borderLeft: '4px solid #f97316' }}>
                <h4 style={{ color: '#f97316', margin: '0 0 0.5rem 0' }}>🥊 Projeção e Fixação</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Vencedor:</strong> {battleResult.projection_winner}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{battleResult.projection_reason}</p>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #ec4899' }}>
                <h4 style={{ color: '#ec4899', margin: '0 0 0.5rem 0' }}>💖 Elogios e Encontros</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Vencedor:</strong> {battleResult.compliments_winner}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{battleResult.compliments_reason}</p>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <h4 style={{ color: '#3b82f6', margin: '0 0 0.5rem 0' }}>💼 Dia a Dia e Versatilidade</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Vencedor:</strong> {battleResult.versatility_winner}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{battleResult.versatility_reason}</p>
              </div>

              <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.2))', border: '1px solid #ef4444', textAlign: 'center' }}>
                <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>🏆 Vencedor Geral</h3>
                <h2 style={{ margin: '0 0 1rem 0', color: 'white' }}>{battleResult.overall_winner}</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: '#fca5a5' }}>
                  "{battleResult.overall_verdict}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sommelier' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: msg.role === 'user' ? 'white' : 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomRightRadius: msg.role === 'user' ? '0' : '16px', borderBottomLeftRadius: msg.role === 'model' ? '0' : '16px' }}>
                  {msg.image && <img src={msg.image} alt="Upload" style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />}
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.text}</p>
                </div>
              </div>
            ))}
            {isChatting && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomLeftRadius: '0' }}>
                <Loader2 size={20} className="lucide-spin" color="var(--accent)" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <label style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={20} color="var(--text-main)" />
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
              {chatImage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '8px', alignSelf: 'flex-start' }}>
                  <ImageIcon size={14} /> <span style={{ fontSize: '0.75rem' }}>Imagem Anexada</span>
                  <button onClick={() => setChatImage(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, marginLeft: '0.5rem' }}>x</button>
                </div>
              )}
              <input 
                type="text" 
                placeholder="Pergunte ao Sommelier..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()}
                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
              />
            </div>
            <button 
              onClick={handleSendChatMessage}
              disabled={isChatting}
              style={{ background: 'var(--accent)', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
            >
              <Send size={20} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
