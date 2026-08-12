import React, { useState } from 'react';
import { Search, Plus, Trash2, Droplet, Trees, Flame } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';

const Inventory = () => {
  const { inventory, addPerfume, removePerfume } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerfume, setNewPerfume] = useState({ name: '', type: 'Fresco' });

  const handleAdd = () => {
    if (newPerfume.name) {
      addPerfume({
        name: newPerfume.name,
        type: newPerfume.type,
        icon: newPerfume.type.includes('Fresco') ? 'Droplet' : (newPerfume.type.includes('Amadeirado') ? 'Trees' : 'Flame')
      });
      setShowAddForm(false);
      setNewPerfume({ name: '', type: 'Fresco' });
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Biblioteria</h2>
        <Search size={24} color="var(--text-muted)" />
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Adicionar Perfume</h4>
          <input 
            type="text" 
            placeholder="Nome do Perfume" 
            value={newPerfume.name}
            onChange={(e) => setNewPerfume({...newPerfume, name: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          />
          <select 
            value={newPerfume.type}
            onChange={(e) => setNewPerfume({...newPerfume, type: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          >
            <option value="Fresco">Fresco</option>
            <option value="Amadeirado">Amadeirado</option>
            <option value="Amadeirado Fresco">Amadeirado Fresco</option>
            <option value="Oriental/Especiado">Oriental/Especiado</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAdd} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none' }}>Salvar</button>
            <button onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: '#334155', color: 'white', border: 'none' }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="inventory-list">
        {inventory.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Sua biblioteria está vazia.</p>
        ) : (
          inventory.map(perfume => (
            <div className="inventory-card" key={perfume.id}>
              <div className="perfume-icon-wrapper" style={{ width: 48, height: 48 }}>
                {perfume.icon === 'Trees' ? <Trees size={24} color="var(--accent)" /> : 
                 perfume.icon === 'Flame' ? <Flame size={24} color="#f97316" /> :
                 <Droplet size={24} color="#38bdf8" />}
              </div>
              <div className="inventory-details" style={{ flex: 1 }}>
                <h4>{perfume.name}</h4>
                <span className="inventory-tags">{perfume.type}</span>
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
