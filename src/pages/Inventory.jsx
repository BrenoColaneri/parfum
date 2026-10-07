import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Droplets, Trees, Flame, Wind, Leaf, Sparkles, Camera, X } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { enrichPerfumeData } from '../utils/aiRecommender';

const Inventory = () => {
  const navigate = useNavigate();
  const { inventory, addPerfume, removePerfume } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerfumeName, setNewPerfumeName] = useState('');
  const [newPerfumePrice, setNewPerfumePrice] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [editingPerfume, setEditingPerfume] = useState(null);
  const { editPerfumeBaseInfo } = useAppContext();

  const filterCategories = ['Todos', 'Masculino', 'Feminino', 'Unissex', 'Amadeirado', 'Fresco', 'Doce', 'Especiado'];

  // Multimodal state
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setImageBase64(base64String);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageBase64(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = async () => {
    if (newPerfumeName || imageBase64) {
      setIsSearchingAI(true);
      try {
        const enrichedData = await enrichPerfumeData({ 
          perfumeName: newPerfumeName, 
          imageBase64, 
          imageMimeType 
        });
        
        await addPerfume({
          name: enrichedData.name,
          brand: enrichedData.brand,
          concentration: enrichedData.concentration,
          type: enrichedData.type,
          icon: enrichedData.icon,
          notes: enrichedData.notes,
          pricePaid: newPerfumePrice ? parseFloat(newPerfumePrice) : 0
        });
        
        setShowAddForm(false);
        setNewPerfumeName('');
        setNewPerfumePrice('');
        removeImage();
      } catch (error) {
        console.error("Erro ao adicionar no inventário:", error);
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

  const renderPerfumeCard = (perfume) => (
    <div 
      className="inventory-card" 
      key={perfume.id} 
      onClick={() => navigate(`/perfume/${perfume.id}`)}
      style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem', cursor: 'pointer' }}
    >
      <div className="perfume-icon-wrapper" style={{ width: 48, height: 48, marginTop: '4px' }}>
        {getIcon(perfume.icon)}
      </div>
      <div className="inventory-details" style={{ flex: 1, marginLeft: '1rem' }}>
        {perfume.brand && <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{perfume.brand}</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{perfume.name}</h4>
          {perfume.concentration && (
            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e2e8f0', fontWeight: 'bold' }}>
              {perfume.concentration}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="inventory-tags">{perfume.type}</span>
          <span className="inventory-tags" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>{perfume.gender || 'Unissex'}</span>
          <span className="inventory-tags" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>Intensidade: {perfume.intensity || 'Média'}</span>
        </div>
        {perfume.notes && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
            Notas: {perfume.notes}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setEditingPerfume(perfume);
          }} 
          style={{ background: 'none', border: 'none', color: 'var(--accent)', padding: '0.5rem', cursor: 'pointer' }}
          title="Editar"
        >
          <Sparkles size={20} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            removePerfume(perfume.id);
          }} 
          style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0.5rem', cursor: 'pointer' }}
          title="Excluir"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="page-title">Biblioteria</h2>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Buscar na coleção..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'white' }}
        />
        <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {filterCategories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            style={{ 
              padding: '0.4rem 1rem', 
              borderRadius: '20px', 
              whiteSpace: 'nowrap',
              border: selectedFilter === cat ? 'none' : '1px solid var(--glass-border)', 
              background: selectedFilter === cat ? 'var(--accent)' : 'var(--glass-bg)', 
              color: 'white',
              fontWeight: selectedFilter === cat ? 'bold' : 'normal'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent)" /> Busca Inteligente (Texto ou Foto)
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Digite o nome ou envie uma foto do frasco para a IA analisar.
          </p>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Ex: Bleu de Chanel" 
              value={newPerfumeName}
              onChange={(e) => setNewPerfumeName(e.target.value)}
              disabled={isSearchingAI}
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={isSearchingAI}
              style={{ padding: '0 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={24} />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }} 
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input 
              type="number" 
              placeholder="Preço pago (opcional) Ex: 350.00" 
              value={newPerfumePrice}
              onChange={(e) => setNewPerfumePrice(e.target.value)}
              disabled={isSearchingAI}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          {imageBase64 && (
            <div style={{ position: 'relative', marginBottom: '1rem', display: 'inline-block' }}>
              <img 
                src={`data:${imageMimeType};base64,${imageBase64}`} 
                alt="Preview" 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--accent)' }} 
              />
              <button 
                onClick={removeImage}
                disabled={isSearchingAI}
                style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleAdd} 
              disabled={isSearchingAI || (!newPerfumeName && !imageBase64)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {isSearchingAI ? 'Analisando com IA...' : 'Adicionar ao Acervo'}
            </button>
            <button 
              onClick={() => { setShowAddForm(false); removeImage(); setNewPerfumeName(''); setNewPerfumePrice(''); }} 
              disabled={isSearchingAI}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#334155', color: 'white', border: 'none' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editingPerfume && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Editar Perfume</h3>
              <button onClick={() => setEditingPerfume(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Marca</label>
                <input 
                  type="text" 
                  value={editingPerfume.brand || ''}
                  onChange={e => setEditingPerfume({...editingPerfume, brand: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nome</label>
                <input 
                  type="text" 
                  value={editingPerfume.name}
                  onChange={e => setEditingPerfume({...editingPerfume, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gênero</label>
                  <select 
                    value={editingPerfume.gender || 'Unissex'}
                    onChange={e => setEditingPerfume({...editingPerfume, gender: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Unissex">Unissex</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Valor Pago</label>
                  <input 
                    type="number" 
                    value={editingPerfume.price_paid || ''}
                    onChange={e => setEditingPerfume({...editingPerfume, price_paid: parseFloat(e.target.value) || 0})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white' }}
                  />
                </div>
              </div>
              
              <button 
                onClick={async () => {
                  await editPerfumeBaseInfo(editingPerfume.id, {
                    name: editingPerfume.name,
                    brand: editingPerfume.brand,
                    gender: editingPerfume.gender,
                    price_paid: editingPerfume.price_paid
                  });
                  setEditingPerfume(null);
                }}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', marginTop: '0.5rem' }}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="inventory-list">
        {inventory.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Sua biblioteria está vazia.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...inventory]
              .filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
                if (selectedFilter === 'Todos') return matchesSearch;
                
                // Advanced filtering
                if (['Masculino', 'Feminino', 'Unissex'].includes(selectedFilter)) {
                   return matchesSearch && p.gender === selectedFilter;
                }
                
                return matchesSearch && p.type && p.type.toLowerCase().includes(selectedFilter.toLowerCase());
              })
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(perfume => renderPerfumeCard(perfume))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => {
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}>
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Inventory;
