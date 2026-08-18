import React, { useState, useMemo } from 'react';
import { CalendarDays, ArrowLeft, BarChart3, Trophy, PieChart as PieChartIcon, Wallet, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const History = () => {
  const { sotdHistory, inventory, removeSotd } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('historico');

  // Group history by date
  const groupedHistory = useMemo(() => sotdHistory.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = [];
    }
    const perfume = inventory.find(p => p.id === curr.perfume_id);
    if (perfume) {
      acc[curr.date].push({ perfume, sotd_id: curr.id });
    }
    return acc;
  }, {}), [sotdHistory, inventory]);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00'); // avoid timezone offset issues
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  // --- STATS LOGIC ---
  const topUsed = useMemo(() => {
    const counts = {};
    sotdHistory.forEach(sotd => {
      counts[sotd.perfume_id] = (counts[sotd.perfume_id] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => {
        const perf = inventory.find(p => p.id === id);
        return { perfume: perf, count };
      }).filter(item => item.perfume); // Filter out deleted perfumes
  }, [sotdHistory, inventory]);

  const familyData = useMemo(() => {
    const counts = {};
    inventory.forEach(p => {
      // Simplified family grouping
      let family = "Outros";
      if (p.type.includes("Amadeirado")) family = "Amadeirado";
      else if (p.type.includes("Fresco") || p.type.includes("Cítrico") || p.type.includes("Aquático")) family = "Fresco";
      else if (p.type.includes("Oriental") || p.type.includes("Especiado") || p.type.includes("Quente")) family = "Oriental";
      else if (p.type.includes("Floral")) family = "Floral";
      else if (p.type.includes("Couro")) family = "Couro";
      
      counts[family] = (counts[family] || 0) + 1;
    });

    const colors = {
      "Amadeirado": "#4ade80",
      "Fresco": "#38bdf8",
      "Oriental": "#f97316",
      "Floral": "#f472b6",
      "Couro": "#a16207",
      "Outros": "#94a3b8"
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || "#94a3b8"
    }));
  }, [inventory]);

  const totalInvested = useMemo(() => {
    return inventory.reduce((total, p) => total + (p.price_paid || 0), 0);
  }, [inventory]);

  return (
    <div className="page-wrapper" style={{ paddingBottom: '5rem' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: 0 }}>
        <ArrowLeft size={20} /> Voltar
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Perfil Olfativo</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('historico')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'historico' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'historico' ? 'bold' : 'normal', borderBottom: activeTab === 'historico' ? '2px solid var(--accent)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <CalendarDays size={18} /> Histórico
        </button>
        <button 
          onClick={() => setActiveTab('estatisticas')}
          style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', color: activeTab === 'estatisticas' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'estatisticas' ? 'bold' : 'normal', borderBottom: activeTab === 'estatisticas' ? '2px solid var(--accent)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <BarChart3 size={18} /> Estatísticas
        </button>
      </div>

      {activeTab === 'historico' && (
        <>
          <p className="subtitle" style={{ marginBottom: '2rem' }}>
            Sua jornada olfativa. Veja quais perfumes marcaram seus dias.
          </p>

          {sortedDates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p>Nenhum perfume registrado ainda.</p>
              <p style={{ fontSize: '0.8rem' }}>Acesse a página de um perfume na sua Biblioteria e clique em "Estou usando hoje".</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {sortedDates.map(date => (
                <div key={date}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'capitalize', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    {formatDate(date)}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {groupedHistory[date].map((item, idx) => (
                      <div key={idx} className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/perfume/${item.perfume.id}`)}>
                          {item.perfume.brand && <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{item.perfume.brand}</span>}
                          <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{item.perfume.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.perfume.type}</span>
                        </div>
                        <button onClick={() => removeSotd(item.sotd_id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'estatisticas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{inventory.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Frascos na Coleção</div>
            </div>
            <div className="glass-card" style={{ flex: 1, textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{sotdHistory.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dias Registrados</div>
            </div>
          </div>

          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(20, 83, 45, 0.15))', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.1rem', color: '#4ade80' }}>
              <Wallet size={20} /> Controle de Investimento
            </h3>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '0.75rem', color: '#86efac', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Valor Total da Coleção</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <Trophy size={20} color="#fcd34d" /> Top 3 Mais Usados
            </h3>
            {topUsed.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sem dados suficientes.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topUsed.map((item, idx) => (
                  <div key={item.perfume.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: idx === 0 ? '#fcd34d' : idx === 1 ? '#e2e8f0' : '#d97706', width: '20px', textAlign: 'center' }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.perfume.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.perfume.brand}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', background: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' }}>
                      {item.count}x
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <PieChartIcon size={20} color="#a855f7" /> Perfil de Famílias
            </h3>
            {familyData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sem perfumes na coleção.</p>
            ) : (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={familyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {familyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--accent)', borderRadius: '8px', color: 'white' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default History;
