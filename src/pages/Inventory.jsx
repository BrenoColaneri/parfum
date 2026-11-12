import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Droplets, Trees, Flame, Wind, Leaf, Sparkles, Camera, X, Edit2, Loader2, Filter } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useToast } from '../context/ToastContext';
import { enrichPerfumeData } from '../utils/aiRecommender';

const Inventory = () => {
  const navigate = useNavigate();
  const { inventory, addPerfume, removePerfume, editPerfumeBaseInfo } = useAppContext();
  const { toastSuccess, toastError, toastWarning, toastInfo, showConfirm } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerfumeName, setNewPerfumeName] = useState('');
  const [newPerfumeBrand, setNewPerfumeBrand] = useState('');
  const [newPerfumeConcentration, setNewPerfumeConcentration] = useState('EDP');
  const [newPerfumeType, setNewPerfumeType] = useState('Amadeirado Aromático');
  const [newPerfumeGender, setNewPerfumeGender] = useState('Unissex');
  const [newPerfumeIntensity, setNewPerfumeIntensity] = useState('Moderada');
  const [newPerfumeNotes, setNewPerfumeNotes] = useState('');
  const [newPerfumeIcon, setNewPerfumeIcon] = useState('Trees');
  const [newPerfumeVolume, setNewPerfumeVolume] = useState('100');
  const [newPerfumePrice, setNewPerfumePrice] = useState('');
  const [aiFeedbackWarning, setAiFeedbackWarning] = useState(null);
  const [hasEnrichedPreview, setHasEnrichedPreview] = useState(false);

  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('Todos');
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState('Todas');
  const [editingPerfume, setEditingPerfume] = useState(null);

  const genderCategories = ['Todos', 'Masculino', 'Feminino', 'Unissex'];
  const familyCategories = ['Todas', 'Amadeirado', 'Fresco', 'Cítrico', 'Especiado', 'Oriental', 'Aromático', 'Floral', 'Doce'];

  // Estado Multimodal para Foto
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const fileInputRef = useRef(null);

  const resetAddForm = () => {
    setNewPerfumeName('');
    setNewPerfumeBrand('');
    setNewPerfumeConcentration('EDP');
    setNewPerfumeType('Amadeirado Aromático');
    setNewPerfumeGender('Unissex');
    setNewPerfumeIntensity('Moderada');
    setNewPerfumeNotes('');
    setNewPerfumeIcon('Trees');
    setNewPerfumeVolume('100');
    setNewPerfumePrice('');
    setAiFeedbackWarning(null);
    setHasEnrichedPreview(false);
    removeImage();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toastError('A imagem deve ter no máximo 4MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setImageBase64(base64String);
        setImageMimeType(file.type);
        toastInfo('Foto do frasco carregada. Clique em "Identificar com IA" ou preencha os campos.');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageBase64(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEnrichWithAI = async () => {
    if (!newPerfumeName.trim() && !imageBase64) {
      toastError('Digite o nome do perfume ou envie uma foto do frasco para identificar.');
      return;
    }

    setIsSearchingAI(true);
    setAiFeedbackWarning(null);
    try {
      const enrichedData = await enrichPerfumeData({
        perfumeName: newPerfumeName,
        imageBase64,
        imageMimeType
      });

      if (enrichedData.name && enrichedData.name !== 'Fragrância não identificada') {
        setNewPerfumeName(enrichedData.name);
      }
      setNewPerfumeBrand(enrichedData.brand || '');
      setNewPerfumeConcentration(enrichedData.concentration || 'EDP');
      setNewPerfumeType(enrichedData.type || 'Amadeirado Fresco');
      setNewPerfumeGender(enrichedData.gender || 'Unissex');
      setNewPerfumeIntensity(enrichedData.intensity || 'Moderada');
      setNewPerfumeNotes(enrichedData.notes || '');
      setNewPerfumeIcon(enrichedData.icon || 'Trees');
      setHasEnrichedPreview(true);

      if (enrichedData.identified === false || enrichedData.aiWarning) {
        const warningMsg = enrichedData.aiWarning || 'Fragrância não identificada automaticamente. Revise e preencha os campos manualmente.';
        setAiFeedbackWarning(warningMsg);
        toastWarning(warningMsg);
      } else {
        toastSuccess(`"${enrichedData.name}" identificado! Revise os dados abaixo e confirme o cadastro.`);
      }
    } catch (err) {
      console.error('Erro na identificação IA:', err);
      setAiFeedbackWarning('Serviço de identificação indisponível no momento. Preencha os campos manualmente.');
      setHasEnrichedPreview(true);
      toastWarning('Não foi possível consultar a IA. Preencha os dados manualmente.');
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleAdd = async () => {
    if (!newPerfumeName.trim() && !imageBase64) {
      toastError('Informe o nome do perfume (campo obrigatório).');
      return;
    }

    if (newPerfumePrice && (isNaN(parseFloat(newPerfumePrice)) || parseFloat(newPerfumePrice) < 0)) {
      toastError('Informe um preço pago válido.');
      return;
    }

    setIsSearchingAI(true);
    try {
      let finalPayload = {
        name: newPerfumeName.trim(),
        brand: newPerfumeBrand.trim(),
        concentration: newPerfumeConcentration,
        type: newPerfumeType.trim() || 'Amadeirado Fresco',
        gender: newPerfumeGender,
        intensity: newPerfumeIntensity,
        icon: newPerfumeIcon || 'Trees',
        notes: newPerfumeNotes.trim(),
        volume_ml: parseInt(newPerfumeVolume) || 100,
        pricePaid: newPerfumePrice ? parseFloat(newPerfumePrice) : 0,
        image: imageBase64 && imageMimeType ? `data:${imageMimeType};base64,${imageBase64}` : null
      };

      // Se o usuário ainda não clicou em "Identificar com IA" e não preencheu marca/notas manualmente, enriquece automaticamente
      if (!hasEnrichedPreview && !newPerfumeBrand.trim() && !newPerfumeNotes.trim()) {
        const enrichedData = await enrichPerfumeData({
          perfumeName: newPerfumeName,
          imageBase64,
          imageMimeType
        });

        // Se apenas uma foto foi enviada e a IA não identificou o nome, solicita preenchimento manual antes de salvar
        if (!newPerfumeName.trim() && enrichedData.identified === false) {
          setHasEnrichedPreview(true);
          setAiFeedbackWarning(enrichedData.aiWarning);
          toastWarning(enrichedData.aiWarning || 'Informe o nome do perfume manualmente para concluir o cadastro.');
          setIsSearchingAI(false);
          return;
        }

        if (enrichedData.aiWarning) {
          toastWarning(enrichedData.aiWarning);
        }

        finalPayload = {
          ...finalPayload,
          name: newPerfumeName.trim() || enrichedData.name || 'Fragrância',
          brand: newPerfumeBrand.trim() || enrichedData.brand || 'Importado / Designer',
          concentration: enrichedData.concentration || newPerfumeConcentration || 'EDP',
          type: enrichedData.type || newPerfumeType || 'Amadeirado Fresco',
          gender: enrichedData.gender || newPerfumeGender || 'Unissex',
          intensity: enrichedData.intensity || newPerfumeIntensity || 'Moderada',
          icon: enrichedData.icon || newPerfumeIcon || 'Trees',
          notes: newPerfumeNotes.trim() || enrichedData.notes || ''
        };
      }

      if (!finalPayload.name) {
        toastError('O nome do perfume é obrigatório.');
        setIsSearchingAI(false);
        return;
      }

      await addPerfume(finalPayload);

      toastSuccess(`${finalPayload.name} cadastrado com sucesso!`);
      setShowAddForm(false);
      resetAddForm();
    } catch (error) {
      console.error('Erro ao adicionar no inventário:', error);
      toastError('Erro ao salvar perfume no acervo. Tente novamente.');
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedGenderFilter('Todos');
    setSelectedFamilyFilter('Todas');
  };

  const hasActiveFilters = searchTerm.trim() !== '' || selectedGenderFilter !== 'Todos' || selectedFamilyFilter !== 'Todas';

  const filteredPerfumes = [...inventory]
    .filter(p => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.type && p.type.toLowerCase().includes(q));

      const matchesGender = selectedGenderFilter === 'Todos' ||
        (p.gender || 'Unissex').toLowerCase() === selectedGenderFilter.toLowerCase();

      const matchesFamily = selectedFamilyFilter === 'Todas' ||
        (p.type && p.type.toLowerCase().includes(selectedFamilyFilter.toLowerCase())) ||
        (p.notes && p.notes.toLowerCase().includes(selectedFamilyFilter.toLowerCase()));

      return matchesSearch && matchesGender && matchesFamily;
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const getIcon = (iconName) => {
    switch (iconName) {
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
      {perfume.image ? (
        <img
          src={perfume.image}
          alt={perfume.name}
          style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover', marginTop: '4px', border: '1px solid var(--accent)' }}
        />
      ) : (
        <div className="perfume-icon-wrapper" style={{ width: 48, height: 48, marginTop: '4px', flexShrink: 0 }}>
          {getIcon(perfume.icon)}
        </div>
      )}
      <div className="inventory-details" style={{ flex: 1, marginLeft: '1rem', minWidth: 0 }}>
        {perfume.brand && <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold' }}>{perfume.brand}</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0', flexWrap: 'wrap' }}>
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
            setEditingPerfume({
              ...perfume,
              volume_ml: perfume.full_details?.volume_ml || 100
            });
          }}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', padding: '0.5rem', cursor: 'pointer' }}
          title="Editar"
          aria-label={`Editar ${perfume.name}`}
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
          aria-label={`Excluir ${perfume.name}`}
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
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {filteredPerfumes.length} de {inventory.length} frasco(s)
        </span>
      </div>

      {/* Campo de Busca */}
      <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
        <input
          type="text"
          placeholder="Buscar perfume, marca ou nota olfativa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.9rem 2.5rem 0.9rem 2.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', outline: 'none' }}
        />
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ position: 'absolute', right: '0.85rem', top: '0.85rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filtros Combináveis: Gênero + Família Olfativa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
            <Filter size={12} /> Gênero:
          </span>
          {genderCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedGenderFilter(cat)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                border: selectedGenderFilter === cat ? 'none' : '1px solid var(--glass-border)',
                background: selectedGenderFilter === cat ? 'var(--accent)' : 'var(--glass-bg)',
                color: selectedGenderFilter === cat ? 'white' : 'var(--text-main)',
                fontWeight: selectedGenderFilter === cat ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: '0.25rem' }}>
            Família:
          </span>
          {familyCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFamilyFilter(cat)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                border: selectedFamilyFilter === cat ? 'none' : '1px solid var(--glass-border)',
                background: selectedFamilyFilter === cat ? '#8b5cf6' : 'var(--glass-bg)',
                color: selectedFamilyFilter === cat ? 'white' : 'var(--text-main)',
                fontWeight: selectedFamilyFilter === cat ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {cat}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                border: '1px solid #ef4444',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Formulário de Cadastro Completo + Enriquecimento via IA */}
      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Sparkles size={18} color="var(--accent)" /> Adicionar Fragrância ao Acervo
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Digite o nome ou envie uma foto do frasco para identificação automática via IA, ou preencha/edite os campos manualmente.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nome do Perfume * (Ex: Bleu de Chanel)"
              value={newPerfumeName}
              onChange={(e) => setNewPerfumeName(e.target.value)}
              disabled={isSearchingAI}
              style={{ flex: 1, minWidth: '200px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
            />
            <button
              type="button"
              onClick={handleEnrichWithAI}
              disabled={isSearchingAI || (!newPerfumeName.trim() && !imageBase64)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid #8b5cf6',
                color: 'var(--text-main)',
                fontWeight: '600',
                cursor: isSearchingAI ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem'
              }}
            >
              {isSearchingAI ? <Loader2 size={16} className="lucide-spin" /> : <Sparkles size={16} color="#a855f7" />}
              Identificar com IA
            </button>
          </div>

          {aiFeedbackWarning && (
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fcd34d', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
              ⚠️ {aiFeedbackWarning}
            </div>
          )}

          {/* Campos Editáveis e Preenchimento Manual */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Marca</label>
              <input
                type="text"
                placeholder="Ex: Chanel, Dior..."
                value={newPerfumeBrand}
                onChange={(e) => setNewPerfumeBrand(e.target.value)}
                disabled={isSearchingAI}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Concentração</label>
              <select
                value={newPerfumeConcentration}
                onChange={(e) => setNewPerfumeConcentration(e.target.value)}
                disabled={isSearchingAI}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
              >
                <option value="EDC">EDC (Eau de Cologne)</option>
                <option value="EDT">EDT (Eau de Toilette)</option>
                <option value="EDP">EDP (Eau de Parfum)</option>
                <option value="Parfum">Parfum</option>
                <option value="Extrait">Extrait de Parfum</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Família Olfativa</label>
              <input
                type="text"
                placeholder="Ex: Amadeirado Aromático"
                value={newPerfumeType}
                onChange={(e) => setNewPerfumeType(e.target.value)}
                disabled={isSearchingAI}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Gênero</label>
              <select
                value={newPerfumeGender}
                onChange={(e) => setNewPerfumeGender(e.target.value)}
                disabled={isSearchingAI}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Unissex">Unissex</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Intensidade</label>
              <select
                value={newPerfumeIntensity}
                onChange={(e) => setNewPerfumeIntensity(e.target.value)}
                disabled={isSearchingAI}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
              >
                <option value="Leve">Leve</option>
                <option value="Moderada">Moderada</option>
                <option value="Forte">Forte</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Volume (mL)</label>
              <input
                type="number"
                min="5"
                max="500"
                placeholder="100"
                value={newPerfumeVolume}
                onChange={(e) => setNewPerfumeVolume(e.target.value)}
                disabled={isSearchingAI}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Preço Pago (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 450.00"
                value={newPerfumePrice}
                onChange={(e) => setNewPerfumePrice(e.target.value)}
                disabled={isSearchingAI}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Notas Principais</label>
            <input
              type="text"
              placeholder="Ex: Bergamota, Lavanda, Cedro, Sândalo"
              value={newPerfumeNotes}
              onChange={(e) => setNewPerfumeNotes(e.target.value)}
              disabled={isSearchingAI}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}
            />
          </div>

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
                style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleAdd}
              disabled={isSearchingAI}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              {isSearchingAI ? <><Loader2 size={18} className="lucide-spin" /> Processando...</> : 'Adicionar ao Acervo'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); resetAddForm(); }}
              disabled={isSearchingAI}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição Completa de Perfume */}
      {editingPerfume && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', overflowY: 'auto'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Editar Informações</h3>
              <button onClick={() => setEditingPerfume(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nome do Perfume *</label>
                <input
                  type="text"
                  value={editingPerfume.name || ''}
                  onChange={e => setEditingPerfume({ ...editingPerfume, name: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marca</label>
                  <input
                    type="text"
                    value={editingPerfume.brand || ''}
                    onChange={e => setEditingPerfume({ ...editingPerfume, brand: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Concentração</label>
                  <select
                    value={editingPerfume.concentration || 'EDP'}
                    onChange={e => setEditingPerfume({ ...editingPerfume, concentration: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="EDC">EDC</option>
                    <option value="EDT">EDT</option>
                    <option value="EDP">EDP</option>
                    <option value="Parfum">Parfum</option>
                    <option value="Extrait">Extrait</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Família Olfativa</label>
                <input
                  type="text"
                  value={editingPerfume.type || ''}
                  onChange={e => setEditingPerfume({ ...editingPerfume, type: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gênero</label>
                  <select
                    value={editingPerfume.gender || 'Unissex'}
                    onChange={e => setEditingPerfume({ ...editingPerfume, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Unissex">Unissex</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Intensidade</label>
                  <select
                    value={editingPerfume.intensity || 'Moderada'}
                    onChange={e => setEditingPerfume({ ...editingPerfume, intensity: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="Leve">Leve</option>
                    <option value="Moderada">Moderada</option>
                    <option value="Forte">Forte</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notas Olfativas</label>
                <input
                  type="text"
                  value={editingPerfume.notes || ''}
                  onChange={e => setEditingPerfume({ ...editingPerfume, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preço Pago (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingPerfume.price_paid ?? ''}
                    onChange={e => setEditingPerfume({ ...editingPerfume, price_paid: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volume (mL)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={editingPerfume.volume_ml ?? 100}
                    onChange={e => setEditingPerfume({ ...editingPerfume, volume_ml: parseInt(e.target.value) || 100 })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avaliação Pessoal (0 a 5 estrelas)</label>
                <select
                  value={editingPerfume.user_rating || 0}
                  onChange={e => setEditingPerfume({ ...editingPerfume, user_rating: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none' }}
                >
                  <option value={0}>Sem avaliação</option>
                  <option value={1}>1 ★</option>
                  <option value={2}>2 ★★</option>
                  <option value={3}>3 ★★★</option>
                  <option value={4}>4 ★★★★</option>
                  <option value={5}>5 ★★★★★</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comentário / Resenha Pessoal</label>
                <textarea
                  rows={2}
                  value={editingPerfume.user_review || ''}
                  onChange={e => setEditingPerfume({ ...editingPerfume, user_review: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button
                onClick={async () => {
                  if (!editingPerfume.name || !editingPerfume.name.trim()) {
                    toastError('O nome do perfume não pode ficar em branco.');
                    return;
                  }
                  await editPerfumeBaseInfo(editingPerfume.id, {
                    name: editingPerfume.name.trim(),
                    brand: editingPerfume.brand,
                    concentration: editingPerfume.concentration,
                    type: editingPerfume.type,
                    gender: editingPerfume.gender,
                    intensity: editingPerfume.intensity,
                    notes: editingPerfume.notes,
                    price_paid: editingPerfume.price_paid,
                    volume_ml: editingPerfume.volume_ml,
                    user_rating: editingPerfume.user_rating,
                    user_review: editingPerfume.user_review
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
        ) : filteredPerfumes.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Nenhuma fragrância encontrada para os filtros selecionados.
            </p>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Tente buscar outro termo ou limpe os filtros ativos.
            </p>
            <button
              onClick={clearAllFilters}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--accent)',
                background: 'transparent',
                color: 'var(--accent)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPerfumes.map(perfume => renderPerfumeCard(perfume))}
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
