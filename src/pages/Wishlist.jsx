import React, { useState } from 'react';
import { Heart, Plus, Trash2, Bell, TrendingDown, Tag } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';

const Wishlist = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', targetPrice: '' });

  const handleAdd = () => {
    if (newItem.name && newItem.targetPrice) {
      addToWishlist({
        name: newItem.name,
        targetPrice: parseFloat(newItem.targetPrice)
      });
      setShowAddForm(false);
      setNewItem({ name: '', targetPrice: '' });
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Desejos & Alertas</h2>
        <Bell size={24} color="var(--accent)" />
      </div>
      <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
        A IA monitora o preço e alerta quando houver promoções abaixo da sua meta.
      </p>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Rastrear Novo Perfume</h4>
          <input 
            type="text" 
            placeholder="Nome do Perfume" 
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          />
          <input 
            type="number" 
            placeholder="Preço Meta (R$)" 
            value={newItem.targetPrice}
            onChange={(e) => setNewItem({...newItem, targetPrice: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAdd} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none' }}>Monitorar</button>
            <button onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: '#334155', color: 'white', border: 'none' }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="inventory-list">
        {wishlist.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Nenhum alerta configurado.</p>
        ) : (
          wishlist.map(item => (
            <div className="glass-card" key={item.id} style={{ 
              marginBottom: '1rem', 
              border: item.isOnSale ? '1px solid #10b981' : '1px solid var(--glass-border)',
              background: item.isOnSale ? 'rgba(16, 185, 129, 0.05)' : 'var(--glass-bg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                  
                  {item.isOnSale ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      <TrendingDown size={14} /> ALERTA DE PREÇO
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-muted)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      <Tag size={14} /> Monitorando
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Preço Atual (IA)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.isOnSale ? '#10b981' : 'var(--text-main)' }}>
                        R$ {item.currentPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sua Meta</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        R$ {item.targetPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => removeFromWishlist(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.5rem' }}>
                  <Trash2 size={20} />
                </button>
              </div>
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

export default Wishlist;
