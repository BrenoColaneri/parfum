import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Droplets, Trees, Flame, Wind, Leaf, Sparkles, Camera, X, Edit2, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useToast } from '../context/ToastContext';
import { enrichPerfumeData } from '../utils/aiRecommender';

const Inventory = () => {
  const navigate = useNavigate();
  const { inventory, addPerfume, removePerfume, editPerfumeBaseInfo } = useAppContext();
  const { toastSuccess, toastError, toastInfo, showConfirm } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerfumeName, setNewPerfumeName] = useState('');
  const [newPerfumePrice, setNewPerfumePrice] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [editingPerfume, setEditingPerfume] = useState(null);

  const filterCategories = ['Todos', 'Masculino', 'Feminino', 'Unissex', 'Amadeirado', 'Fresco', 'Doce', 'Especiado'];

  // Estado Multimodal para Foto
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toastError('A imagem deve ter no máximo 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setImageBase64(base64String);
        setImageMimeType(file.type);
        toastInfo('Foto do frasco carregada para identificação por visão computacional.');
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
    if (!newPerfumeName.trim() && !imageBase64) {
      toastError('Digite o nome do perfume ou envie uma foto do frasco.');
      return;
    }

    setIsSearchingAI(true);
    try {
      const enrichedData = await enrichPerfumeData({ 
        perfumeName: newPerfumeName, 
        imageBase64, 
        imageMimeType 
      });
      
      await addPerfume({
        name: enrichedData.name,
        brand: enrichedData.brand || '',
        concentration: enrichedData.concentration || 'EDP',
        type: enrichedData.type || 'Fresco',
        gender: enrichedData.gender || 'Unissex',
        intensity: enrichedData.intensity || 'Moderada',
        icon: enrichedData.icon || 'Trees',
        notes: enrichedData.notes || '',
        pricePaid: newPerfumePrice ? parseFloat(newPerfumePrice) : 0
      });
      
      toastSuccess(`${enrichedData.name} cadastrado com sucesso!`);
      setShowAddForm(false);
      setNewPerfumeName('');
      setNewPerfumePrice('');
      removeImage();
    } catch (error) {
      console.error("Erro ao adicionar no inventário:", error);
      toastError('Erro ao consultar perfume com a IA. Tente novamente.');
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleDelete = (perfume) => {
    showConfirm({
      title: 'Excluir Perfume?',
      message: `Tem certeza que deseja excluir "${perfume.name}" da sua coleção?`,
      confirmText: 'Excluir',
      isDanger: true,
      onConfirm: async () => {
        await removePerfume(perfume.id);
        toastInfo(`"${perfume.name}" removido da Biblioteria.`);
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

  const renderPerfumeCard = (perfume) => (
    <div 
      className="inventory-card" 
      key={perfume.id} 
      onClick={() => navigate(`/perfume/${perfume.id}`)}
      style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem', cursor: 'pointer', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}
    >
      <div className="perfume-icon-wrapper" style={{ width: 48, height: 48, marginTop: '4px' }}>
        {getIcon(perfume.icon)}
      </div>
      <div className="inventory-details" style={{ flex: 1, marginLeft: '1rem' }}>
        {perfume.brand && <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{perfume.brand}</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{perfume.name}</h4>
          {perfume.concentration && (
            <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 'bold' }}>
              {perfume.concentration}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className="inventory-tags">{perfume.type}</span>
          <span className="inventory-tags" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>{perfume.gender || 'Unissex'}</span>
          <span className="inventory-tags" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>Intensidade: {perfume.intensity || 'Moderada'}</span>
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
          <Edit2 size={18} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(perfume);
          }} 
          style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0.5rem', cursor: 'pointer' }}
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Biblioteria Olfativa</h2>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Buscar perfume, marca ou nota olfativa..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', outline: 'none' }}
        />
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
      </div>

      {/* Categorias de Filtro */}
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
              color: selectedFilter === cat ? 'white' : 'var(--text-main)',
              fontWeight: selectedFilter === cat ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Sparkles size={18} color="var(--accent)" /> Adicionar Fragrância ao Acervo
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Digite o nome ou tire uma foto do frasco para preenchimento inteligente via IA.
          </p>
          
          <input 
            type="text" 
            placeholder="Nome do Perfume (Ex: Terre d'Hermès)" 
            value={newPerfumeName}
            onChange={(e) => setNewPerfumeName(e.target.value)}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', marginBottom: '0.75rem' }}
          />

          <input 
            type="number" 
            placeholder="Preço Pago (Opcional - Ex: 450.00)" 
            value={newPerfumePrice}
            onChange={(e) => setNewPerfumePrice(e.target.value)}
            disabled={isSearchingAI}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', marginBottom: '1rem' }}
          />

          {/* Upload de Imagem */}
          <div style={{ marginBottom: '1rem' }}>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              style={{ display: 'none' }} 
              id="camera-input"
              disabled={isSearchingAI}
            />
            <label 
              htmlFor="camera-input" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.65rem 1rem', 
                background: 'var(--glass-bg)', 
                color: 'var(--text-main)', 
                border: '1px dashed var(--accent)', 
                borderRadius: '8px', 
                cursor: isSearchingAI ? 'not-allowed' : 'pointer', 
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              <Camera size={16} color="var(--accent)" />
              {imageBase64 ? 'Alterar Foto do Frasco' : 'Tirar Foto ou Escolher Imagem'}
            </label>
          </div>

          {imageBase64 && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              <img 
                src={`data:${imageMimeType};base64,${imageBase64}`} 
                alt="Preview do Frasco" 
                style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--accent)' }} 
              />
              <button 
                type="button"
                onClick={removeImage}
                disabled={isSearchingAI}
                style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleAdd} 
              disabled={isSearchingAI || (!newPerfumeName.trim() && !imageBase64)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {isSearchingAI ? <><Loader2 size={18} className="lucide-spin" /> Analisando com IA...</> : 'Adicionar ao Acervo'}
            </button>
            <button 
              onClick={() => { setShowAddForm(false); removeImage(); setNewPerfumeName(''); setNewPerfumePrice(''); }} 
              disabled={isSearchingAI}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição de Perfume */}
      {editingPerfume && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Editar Informações</h3>
              <button onClick={() => setEditingPerfume(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Marca</label>
                <input 
                  type="text" 
                  value={editingPerfume.brand || ''}
                  onChange={e => setEditingPerfume({...editingPerfume, brand: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nome do Perfume</label>
                <input 
                  type="text" 
                  value={editingPerfume.name}
                  onChange={e => setEditingPerfume({...editingPerfume, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gênero</label>
                  <select 
                    value={editingPerfume.gender || 'Unissex'}
                    onChange={e => setEditingPerfume({...editingPerfume, gender: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Unissex">Unissex</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preço Pago (R$)</label>
                  <input 
                    type="number" 
                    value={editingPerfume.price_paid || ''}
                    onChange={e => setEditingPerfume({...editingPerfume, price_paid: parseFloat(e.target.value) || 0})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
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
                  toastSuccess('Alterações salvas com sucesso!');
                  setEditingPerfume(null);
                }}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 'bold', marginTop: '0.5rem', cursor: 'pointer' }}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Perfumes */}
      <div className="inventory-list">
        {inventory.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Sua Biblioteria está vazia.</p>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Cadastre suas fragrâncias com o botão "+" ou carregue dados de demonstração nas Configurações.</p>
            <button
              onClick={() => {
                setShowAddForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Adicionar Primeiro Perfume
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...inventory]
              .filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));
                if (selectedFilter === 'Todos') return matchesSearch;
                
                if (['Masculino', 'Feminino', 'Unissex'].includes(selectedFilter)) {
                   return matchesSearch && (p.gender || 'Unissex').toLowerCase() === selectedFilter.toLowerCase();
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
      }} aria-label="Adicionar Perfume">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Inventory;
