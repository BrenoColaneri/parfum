import React from 'react';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const { sotdHistory, inventory } = useAppContext();
  const navigate = useNavigate();

  // Group history by date
  const groupedHistory = sotdHistory.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = [];
    }
    const perfume = inventory.find(p => p.id === curr.perfume_id);
    if (perfume) {
      acc[curr.date].push(perfume);
    }
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00'); // avoid timezone offset issues
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="page-wrapper">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: 0 }}>
        <ArrowLeft size={20} /> Voltar
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Histórico de Uso</h2>
        <CalendarDays size={24} color="var(--accent)" />
      </div>
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
                {groupedHistory[date].map((perfume, idx) => (
                  <div key={idx} className="glass-card" onClick={() => navigate(`/perfume/${perfume.id}`)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      {perfume.brand && <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{perfume.brand}</span>}
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{perfume.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{perfume.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
