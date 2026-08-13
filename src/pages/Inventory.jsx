import React, { useState } from 'react';
import { Search, Plus, Trash2, Droplets, Trees, Flame, Wind, Leaf, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { enrichPerfumeData } from '../utils/aiRecommender';

const Inventory = () => {
  const { inventory, addPerfume, removePerfume } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerfumeName, setNewPerfumeName] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  const handleAdd = async () => {
    if (newPerfumeName) {
      setIsSearchingAI(true);
      try {
        const enrichedData = await enrichPerfumeData(newPerfumeName);
        
        await addPerfume({
          name: enrichedData.name,
          type: enrichedData.type,
          icon: enrichedData.icon,
          notes: enrichedData.notes
        });
        
        setShowAddForm(false);
        setNewPerfumeName('');
      } catch (error) {
        alert('Erro ao buscar perfume. Tente novamente.');
      } finally {
        setIsSearchingAI(false);
      }
    }
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Trees': return <Trees size={24} color="var(--accent)" />;
      case 'Flame': return <Flame size={24} color="#f97316" />;
      case 'Wind': return <Wind size={24} color="#cbd5e1" />;
      case 'Leaf': return <Leaf size={24} color="#4ade80" />;
      case 'Droplets': default: return <Droplets size={24} color="#38bdf8" />;
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Biblioteria</h2>
        <Search size={24} color="var(--text-muted)" />
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent)" /> Busca Inteligente
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Digite o nome do perfume e nossa IA buscará a família olfativa e as notas principais automaticamente.
          </p>
          <input 
            type="text" 
            placeholder="Ex: Bleu de Chanel" 
            value={newPerfumeName}
            onChange={(e) => setNewPerfumeName(e.target.value)}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          />
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleAdd} 
              disabled={isSearchingAI || !newPerfumeName}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {isSearchingAI ? 'Consultando IA...' : 'Adicionar ao Acervo'}
            </button>
            <button 
              onClick={() => setShowAddForm(false)} 
              disabled={isSearchingAI}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#334155', color: 'white', border: 'none' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="inventory-list">
        {inventory.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Sua biblioteria está vazia.</p>
        ) : (
          inventory.map(perfume => (
            <div className="inventory-card" key={perfume.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
              <div className="perfume-icon-wrapper" style={{ width: 48, height: 48, marginTop: '4px' }}>
                {getIcon(perfume.icon)}
              </div>
              <div className="inventory-details" style={{ flex: 1, marginLeft: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{perfume.name}</h4>
                <span className="inventory-tags" style={{ display: 'inline-block', marginTop: '0.25rem', marginBottom: '0.5rem' }}>{perfume.type}</span>
                {perfume.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                    Notas: {perfume.notes}
                  </p>
                )}
              </div>
              <button onClick={() => removePerfume(perfume.id)} style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0.5rem' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowAddForm(true)}>
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Inventory;
