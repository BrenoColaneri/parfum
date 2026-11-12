import React, { useState } from 'react';
import { Plus, Trash2, Bell, Tag, Sparkles, Droplets, Trees, Flame, Wind, Leaf, Search } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useToast } from '../context/ToastContext';
import { enrichPerfumeData } from '../utils/aiRecommender';

const Wishlist = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useAppContext();
  const { toastSuccess, toastError, toastInfo, showConfirm } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', targetPrice: '', volume: '100ml', link: '' });
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  const handleAdd = async () => {
    const cleanName = newItem.name.trim();
    const priceNum = parseFloat(newItem.targetPrice);
    const cleanLink = newItem.link.trim();

    if (!cleanName || !newItem.targetPrice) {
      toastError('Informe o nome do perfume e seu preço-alvo.');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      toastError('Informe um preço-alvo válido maior que zero.');
      return;
    }

    if (cleanLink && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(cleanLink)) {
      toastError('Informe um link externo válido iniciando com http:// ou https://.');
      return;
    }

    setIsSearchingAI(true);
    try {
      const enrichedData = await enrichPerfumeData({ perfumeName: cleanName });
      
      const query = `comprar ${enrichedData.name} ${enrichedData.brand || ""} ${newItem.volume} -decant -amostra -fracionado`.trim();
      const autoLink = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;

      await addToWishlist({
        name: enrichedData.name || cleanName,
        targetPrice: priceNum,
        brand: enrichedData.brand,
        type: enrichedData.type,
        icon: enrichedData.icon,
        volume: newItem.volume,
        link: cleanLink || autoLink
      });
      
      toastSuccess(`${enrichedData.name || cleanName} adicionado à sua lista de desejos!`);
      setShowAddForm(false);
      setNewItem({ name: '', targetPrice: '', volume: '100ml', link: '' });
    } catch (error) {
      console.error("Erro ao buscar perfume na IA:", error);
      toastError('Erro ao consultar perfume. Tente novamente.');
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleRemove = (item) => {
    showConfirm({
      title: 'Remover dos Desejos?',
      message: `Deseja remover "${item.name}" da sua lista de desejos?`,
      confirmText: 'Remover',
      isDanger: true,
      onConfirm: async () => {
        await removeFromWishlist(item.id);
        toastInfo(`"${item.name}" foi removido da lista.`);
      }
    });
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
    <div className="page-wrapper" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Lista de Desejos</h2>
        <Bell size={24} color="var(--accent)" />
      </div>
      <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
        Acompanhe suas metas de compra com atalhos diretos para os principais e-commerces.
      </p>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Sparkles size={18} color="var(--accent)" /> Cadastrar Novo Desejo
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            A IA identifica a marca e gera os links diretos para cotação de mercado.
          </p>
          <input 
            type="text" 
            placeholder="Nome do Perfume (Ex: Sauvage Elixir)" 
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', marginBottom: '1rem' }}
          />
          <input 
            type="number" 
            placeholder="Preço Meta Desejado (R$)" 
            value={newItem.targetPrice}
            onChange={(e) => setNewItem({...newItem, targetPrice: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', marginBottom: '1rem' }}
          />
          <input 
            type="text" 
            placeholder="Link Opcional de Loja Específica" 
            value={newItem.link}
            onChange={(e) => setNewItem({...newItem, link: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', marginBottom: '1rem' }}
          />
          <select
            value={newItem.volume}
            onChange={(e) => setNewItem({...newItem, volume: e.target.value})}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', marginBottom: '1rem' }}
          >
            <option value="30ml">30ml</option>
            <option value="50ml">50ml</option>
            <option value="75ml">75ml</option>
            <option value="100ml">100ml</option>
            <option value="125ml">125ml</option>
            <option value="200ml">200ml</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAdd} disabled={isSearchingAI} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {isSearchingAI ? 'Processando IA...' : 'Cadastrar Meta'}
            </button>
            <button onClick={() => setShowAddForm(false)} disabled={isSearchingAI} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="inventory-list">
        {wishlist.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Sua lista de desejos está vazia.</p>
            <p style={{ fontSize: '0.85rem' }}>Clique no botão "+" abaixo para monitorar uma nova fragrância.</p>
          </div>
        ) : (
          wishlist.map(item => (
            <div className="glass-card" key={item.id} style={{ 
              marginBottom: '1rem', 
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {item.icon && (
                  <div className="perfume-icon-wrapper" style={{ width: 44, height: 44, marginRight: '1rem', flexShrink: 0 }}>
                    {getIcon(item.icon)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  {item.brand && <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{item.brand}</span>}
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', marginTop: item.brand ? '0.1rem' : '0', color: 'var(--text-main)' }}>
                    {item.name} {item.volume && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({item.volume})</span>}
                  </h4>
                  {item.type && <span style={{ fontSize: '0.75rem', display: 'inline-block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{item.type}</span>}
                  
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <Tag size={13} /> Preço Alvo Configurado
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', margin: '0.25rem 0 1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sua Meta de Compra</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                        R$ {Number(item.targetPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Links de Consulta em Lojas Reais */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Consultar Preço Atual em Lojas:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a 
                      href={item.link || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item.name + ' ' + (item.brand || ''))}`}
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent)', textDecoration: 'none', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                    >
                      <Search size={13} /> Google Shopping
                    </a>
                    <a href={`https://www.amazon.com.br/s?k=${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--glass-bg)', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                      🛒 Amazon
                    </a>
                    <a href={`https://www.sephora.com.br/busca/?q=${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--glass-bg)', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                      🖤 Sephora
                    </a>
                    <a href={`https://lista.mercadolivre.com.br/${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--glass-bg)', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                      🤝 Mercado Livre
                    </a>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRemove(item)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.5rem', cursor: 'pointer' }}
                  title="Remover"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowAddForm(true)} aria-label="Adicionar Desejo">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Wishlist;
