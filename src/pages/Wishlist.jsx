import React, { useState } from 'react';
import { Heart, Plus, Trash2, Bell, TrendingDown, Tag, Sparkles, Droplets, Trees, Flame, Wind, Leaf, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { enrichPerfumeData } from '../utils/aiRecommender';

const Wishlist = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', targetPrice: '', volume: '100ml', link: '' });

  const [isSearchingAI, setIsSearchingAI] = useState(false);

  const handleAdd = async () => {
    if (newItem.name && newItem.targetPrice) {
      setIsSearchingAI(true);
      try {
        const enrichedData = await enrichPerfumeData({ perfumeName: newItem.name });
        
        const query = `${enrichedData.name} ${enrichedData.brand || ""} ${newItem.volume} -decant -amostra -fracionado -inspiração`.trim();
        const autoLink = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;

        await addToWishlist({
          name: enrichedData.name,
          targetPrice: parseFloat(newItem.targetPrice),
          brand: enrichedData.brand,
          type: enrichedData.type,
          icon: enrichedData.icon,
          volume: newItem.volume,
          link: newItem.link || autoLink // Usa o link manual ou gera um link otimizado do Google Shopping
        });
        
        setShowAddForm(false);
        setNewItem({ name: '', targetPrice: '', volume: '100ml', link: '' });
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
        <h2 className="page-title">Desejos & Alertas</h2>
        <Bell size={24} color="var(--accent)" />
      </div>
      <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
        A IA monitora o preço e alerta quando houver promoções abaixo da sua meta.
      </p>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent)" /> Rastrear Novo Perfume
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Digite o nome que a IA vai descobrir a marca e o tipo para você.
          </p>
          <input 
            type="text" 
            placeholder="Nome do Perfume" 
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          />
          <input 
            type="number" 
            placeholder="Preço Meta (R$)" 
            value={newItem.targetPrice}
            onChange={(e) => setNewItem({...newItem, targetPrice: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          />
          <input 
            type="text" 
            placeholder="Link da Loja (Opcional)" 
            value={newItem.link}
            onChange={(e) => setNewItem({...newItem, link: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem' }}
          />
          <select
            value={newItem.volume}
            onChange={(e) => setNewItem({...newItem, volume: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '1rem', appearance: 'none' }}
          >
            <option value="30ml">30ml</option>
            <option value="50ml">50ml</option>
            <option value="100ml">100ml</option>
            <option value="150ml">150ml</option>
            <option value="200ml">200ml</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAdd} disabled={isSearchingAI} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {isSearchingAI ? 'Analisando com IA...' : 'Monitorar'}
            </button>
            <button onClick={() => setShowAddForm(false)} disabled={isSearchingAI} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: '#334155', color: 'white', border: 'none' }}>Cancelar</button>
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
                {item.icon && (
                  <div className="perfume-icon-wrapper" style={{ width: 40, height: 40, marginRight: '1rem', flexShrink: 0 }}>
                    {getIcon(item.icon)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  {item.brand && <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{item.brand}</span>}
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', marginTop: item.brand ? '0.1rem' : '0' }}>
                    {item.name} {item.volume && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({item.volume})</span>}
                  </h4>
                  {item.type && <span style={{ fontSize: '0.7rem', display: 'inline-block', marginBottom: '0.5rem', opacity: 0.8 }}>{item.type}</span>}
                  
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

                  {item.isOnSale && item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '1rem' }}>
                      <ShoppingCart size={16} /> Comprar Agora
                    </a>
                  )}
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
