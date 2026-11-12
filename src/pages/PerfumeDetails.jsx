import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, User, CalendarDays, Star, Layers, Activity, Users, DollarSign, Droplets, Trees, Flame, Wind, FlaskConical, Leaf, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useToast } from '../context/ToastContext';
import { fetchPerfumeDetails } from '../utils/aiRecommender';

const PerfumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    inventory,
    updatePerfumeDetails,
    updateFillLevel,
    updateUserReview,
    updatePricePaid,
    recordSotd,
    removeSotd,
    sotdHistory,
    editPerfumeBaseInfo,
    removePerfume
  } = useAppContext();
  const { toastSuccess, toastError, toastInfo, showConfirm } = useToast();

  const [perfume, setPerfume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    brand: '',
    concentration: 'EDP',
    type: '',
    gender: 'Unissex',
    intensity: 'Moderada',
    notes: '',
    price_paid: '',
    volume_ml: '100',
    fill_level: 100,
    perfumer: '',
    releaseYear: '',
    description: '',
    topNotes: '',
    heartNotes: '',
    baseNotes: ''
  });

  const [localReview, setLocalReview] = useState('');
  const [localRating, setLocalRating] = useState(0);
  const [localPricePaid, setLocalPricePaid] = useState('');
  const [localFillLevel, setLocalFillLevel] = useState(100);
  const [isSavingReview, setIsSavingReview] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isSotdToday = sotdHistory.some(s => s.perfume_id === id && s.date === todayStr);

  useEffect(() => {
    const foundPerfume = inventory.find(p => p.id === id);
    if (!foundPerfume) {
      setError('Perfume não encontrado na sua biblioteria.');
      setIsLoading(false);
      return;
    }

    const details = foundPerfume.full_details || {};
    const volMl = details.volume_ml || 100;
    const spraysUsed = details.sprays_used || 0;
    const computedFill = typeof foundPerfume.fill_level === 'number'
      ? foundPerfume.fill_level
      : Math.max(0, Math.round(100 - ((spraysUsed / 12) / volMl * 100)));

    setPerfume({
      ...foundPerfume,
      full_details: {
        ...details,
        volume_ml: volMl,
        sprays_used: spraysUsed
      }
    });
    setLocalReview(foundPerfume.user_review || '');
    setLocalRating(foundPerfume.user_rating || 0);
    setLocalPricePaid(foundPerfume.price_paid ?? '');
    setLocalFillLevel(computedFill);

    setEditForm({
      name: foundPerfume.name || '',
      brand: foundPerfume.brand || '',
      concentration: foundPerfume.concentration || 'EDP',
      type: foundPerfume.type || '',
      gender: foundPerfume.gender || 'Unissex',
      intensity: foundPerfume.intensity || 'Moderada',
      notes: foundPerfume.notes || '',
      price_paid: foundPerfume.price_paid ?? '',
      volume_ml: volMl,
      fill_level: computedFill,
      perfumer: details.perfumer || 'Casa de Perfumaria',
      releaseYear: details.releaseYear || '2020',
      description: details.description || '',
      topNotes: Array.isArray(details.pyramid?.top) ? details.pyramid.top.join(', ') : '',
      heartNotes: Array.isArray(details.pyramid?.heart) ? details.pyramid.heart.join(', ') : '',
      baseNotes: Array.isArray(details.pyramid?.base) ? details.pyramid.base.join(', ') : ''
    });

    const getDetails = async () => {
      if (foundPerfume.full_details && foundPerfume.full_details.accords && foundPerfume.full_details.pyramid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const fetchedDetails = await fetchPerfumeDetails(foundPerfume.name);
      if (fetchedDetails) {
        const mergedDetails = {
          ...fetchedDetails,
          volume_ml: foundPerfume.full_details?.volume_ml || fetchedDetails.volume_ml || 100,
          sprays_used: foundPerfume.full_details?.sprays_used || fetchedDetails.sprays_used || 0,
          gender: foundPerfume.gender || 'Unissex',
          intensity: foundPerfume.intensity || 'Moderada',
          image: foundPerfume.image || null
        };
        await updatePerfumeDetails(foundPerfume.id, mergedDetails);
        setPerfume(prev => ({ ...prev, full_details: mergedDetails }));
      } else {
        setError('Não foi possível carregar os detalhes do perfume.');
      }
      setIsLoading(false);
    };

    getDetails();
  }, [id, inventory, updatePerfumeDetails]);

  const handleRecordSotd = async () => {
    if (isSotdToday) {
      const record = sotdHistory.find(s => s.perfume_id === id && s.date === todayStr);
      if (record) {
        await removeSotd(record.id);
      }
      toastInfo('Perfume do Dia desmarcado.');
    } else {
      const res = await recordSotd(perfume.id, todayStr);
      if (res?.duplicate) {
        toastInfo(res.message);
      } else {
        toastSuccess('Registrado como seu Perfume do Dia!');
      }
    }
  };

  const handleSaveReview = async () => {
    setIsSavingReview(true);
    try {
      await updateUserReview(perfume.id, localRating, localReview);
      if (localPricePaid !== '') {
        await updatePricePaid(perfume.id, parseFloat(localPricePaid) || 0);
      }
      await updateFillLevel(perfume.id, localFillLevel);
      toastSuccess('Diário olfativo, nível e preço atualizados com sucesso!');
    } catch {
      toastError('Erro ao salvar avaliação.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.name.trim()) {
      toastError('O nome do perfume não pode ficar vazio.');
      return;
    }

    setIsSavingReview(true);
    try {
      const vol = Math.max(5, parseFloat(editForm.volume_ml) || 100);
      const fill = Math.max(0, Math.min(100, parseInt(editForm.fill_level) || 100));
      const currentDetails = perfume.full_details || {};

      const updatedPyramid = {
        top: editForm.topNotes
          ? editForm.topNotes.split(',').map(s => s.trim()).filter(Boolean)
          : (currentDetails.pyramid?.top || ['🍋 Notas Cítricas']),
        heart: editForm.heartNotes
          ? editForm.heartNotes.split(',').map(s => s.trim()).filter(Boolean)
          : (currentDetails.pyramid?.heart || ['🪻 Lavanda']),
        base: editForm.baseNotes
          ? editForm.baseNotes.split(',').map(s => s.trim()).filter(Boolean)
          : (currentDetails.pyramid?.base || ['🪵 Madeiras Nobres'])
      };

      const newDetails = {
        ...currentDetails,
        volume_ml: vol,
        sprays_used: currentDetails.sprays_used || 0,
        gender: editForm.gender || 'Unissex',
        intensity: editForm.intensity || 'Moderada',
        perfumer: editForm.perfumer || currentDetails.perfumer || 'Casa de Perfumaria',
        releaseYear: editForm.releaseYear || currentDetails.releaseYear || '2020',
        description: editForm.description || currentDetails.description || '',
        pyramid: updatedPyramid
      };

      const updated = {
        name: editForm.name.trim(),
        brand: editForm.brand.trim(),
        concentration: editForm.concentration || 'EDP',
        type: editForm.type.trim() || 'Amadeirado Fresco',
        gender: editForm.gender || 'Unissex',
        intensity: editForm.intensity || 'Moderada',
        notes: editForm.notes.trim(),
        price_paid: parseFloat(editForm.price_paid) || 0,
        fill_level: fill,
        volume_ml: vol,
        full_details: newDetails
      };

      await editPerfumeBaseInfo(perfume.id, updated);
      setPerfume(prev => ({ ...prev, ...updated, full_details: newDetails }));
      setLocalPricePaid(updated.price_paid);
      setLocalFillLevel(fill);
      setIsEditing(false);
      toastSuccess('Ficha técnica e informações atualizadas!');
    } catch {
      toastError('Erro ao atualizar perfume.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleAddSprays = async (sprays) => {
    const volMl = perfume.full_details?.volume_ml || 100;
    const currentSprays = perfume.full_details?.sprays_used || 0;
    const newSprays = currentSprays + sprays;
    const totalCapacitySprays = volMl * 12;
    const newFillLevel = Math.max(0, Math.min(100, Math.round(100 - (newSprays / totalCapacitySprays * 100))));
    const newDetails = {
      ...(perfume.full_details || {}),
      volume_ml: volMl,
      sprays_used: newSprays
    };

    await updatePerfumeDetails(perfume.id, newDetails);
    await updateFillLevel(perfume.id, newFillLevel);
    setPerfume(prev => ({ ...prev, fill_level: newFillLevel, full_details: newDetails }));
    setLocalFillLevel(newFillLevel);
    toastSuccess(`+${sprays} borrifadas registradas (${newSprays} no total).`);
  };

  const handleDeletePerfume = () => {
    showConfirm({
      title: 'Excluir Perfume?',
      message: `Tem certeza que deseja remover ${perfume.name} da sua coleção? Essa ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      isDanger: true,
      onConfirm: async () => {
        await removePerfume(perfume.id);
        toastInfo(`${perfume.name} removido da sua Biblioteria.`);
        navigate('/inventory');
      }
    });
  };

  if (error) {
    return (
      <div className="page-wrapper" style={{ paddingBottom: '3rem', textAlign: 'center' }}>
        <button onClick={() => navigate('/inventory')} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.5rem', cursor: 'pointer', alignSelf: 'flex-start', marginBottom: '2rem' }}>
          <ArrowLeft size={24} />
        </button>
        <p style={{ color: '#ef4444' }}>{error}</p>
      </div>
    );
  }

  if (!perfume) return null;

  const volumeMl = perfume.full_details?.volume_ml || 100;
  const spraysUsed = perfume.full_details?.sprays_used || 0;
  const mlRemaining = Math.max(0, volumeMl - (spraysUsed / 12));
  const fillPercentage = typeof perfume.fill_level === 'number'
    ? perfume.fill_level
    : Math.max(0, Math.round((mlRemaining / volumeMl) * 100));

  const renderBar = (label, value, color) => (
    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '95px', fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '5px' }}></div>
      </div>
      <div style={{ width: '36px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{value}%</div>
    </div>
  );

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Trees': return <Trees size={64} color="var(--accent)" />;
      case 'Flame': return <Flame size={64} color="#f97316" />;
      case 'Wind': return <Wind size={64} color="#cbd5e1" />;
      case 'Leaf': return <Leaf size={64} color="#4ade80" />;
      case 'Droplets': default: return <Droplets size={64} color="#38bdf8" />;
    }
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/inventory')} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0.5rem', cursor: 'pointer' }} aria-label="Voltar para Biblioteca">
          <ArrowLeft size={24} />
        </button>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Edit2 size={18} /> Editar Ficha
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <X size={20} /> Cancelar
            </button>
            <button onClick={handleSaveEdit} disabled={isSavingReview} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              {isSavingReview ? <Loader2 size={20} className="lucide-spin" /> : <><Save size={20} /> Salvar</>}
            </button>
          </div>
        )}
      </div>

      <div className="perfume-details-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div className="perfume-bottle" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {perfume.image ? (
            <img src={perfume.image} alt={perfume.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              {getIcon(perfume.icon)}
            </div>
          )}
        </div>

        {!isEditing ? (
          <>
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.35rem 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{perfume.name}</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--accent)', margin: '0 0 0.85rem 0', fontWeight: 'bold', letterSpacing: '1px' }}>{perfume.brand || 'Alta Perfumaria'}</p>

            {/* Badges Técnicos Completos */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="inventory-tags" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', fontWeight: 600 }}>
                {perfume.concentration || 'EDP'}
              </span>
              <span className="inventory-tags">
                {perfume.type || 'Amadeirado Aromático'}
              </span>
              <span className="inventory-tags" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>
                {perfume.gender || 'Unissex'}
              </span>
              <span className="inventory-tags" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
                Intensidade: {perfume.intensity || 'Moderada'}
              </span>
              <span className="inventory-tags" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#86efac' }}>
                {volumeMl} mL ({fillPercentage}% cheio)
              </span>
            </div>

            {perfume.notes && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 auto', maxWidth: '480px', fontStyle: 'italic' }}>
                Notas em destaque: {perfume.notes}
              </p>
            )}
          </>
        ) : (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--accent)' }}>Editar Ficha Técnica Completa</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nome *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--accent)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marca</label>
                <input type="text" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Concentração</label>
                <select value={editForm.concentration} onChange={e => setEditForm({ ...editForm, concentration: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}>
                  <option value="EDC">EDC</option>
                  <option value="EDT">EDT</option>
                  <option value="EDP">EDP</option>
                  <option value="Parfum">Parfum</option>
                  <option value="Extrait">Extrait</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gênero</label>
                <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Unissex">Unissex</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Intensidade</label>
                <select value={editForm.intensity} onChange={e => setEditForm({ ...editForm, intensity: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }}>
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Forte">Forte</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Família Olfativa</label>
                <input type="text" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notas Principais</label>
                <input type="text" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preço Pago (R$)</label>
                <input type="number" step="0.01" value={editForm.price_paid} onChange={e => setEditForm({ ...editForm, price_paid: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume (mL)</label>
                <input type="number" value={editForm.volume_ml} onChange={e => setEditForm({ ...editForm, volume_ml: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nível Restante (%)</label>
                <input type="number" min="0" max="100" value={editForm.fill_level} onChange={e => setEditForm({ ...editForm, fill_level: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Perfumista</label>
                <input type="text" value={editForm.perfumer} onChange={e => setEditForm({ ...editForm, perfumer: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ano de Lançamento</label>
                <input type="text" value={editForm.releaseYear} onChange={e => setEditForm({ ...editForm, releaseYear: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notas de Saída (separadas por vírgula)</label>
              <input type="text" value={editForm.topNotes} onChange={e => setEditForm({ ...editForm, topNotes: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notas de Coração (separadas por vírgula)</label>
              <input type="text" value={editForm.heartNotes} onChange={e => setEditForm({ ...editForm, heartNotes: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notas de Fundo (separadas por vírgula)</label>
              <input type="text" value={editForm.baseNotes} onChange={e => setEditForm({ ...editForm, baseNotes: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Descrição Olfativa</label>
              <textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Registro de SOTD e Calculadora de Uso / Volumetria */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={handleRecordSotd}
          className="glass-card"
          style={{
            width: '100%',
            padding: '1rem',
            background: isSotdToday ? 'rgba(239, 68, 68, 0.1)' : 'rgba(167, 139, 250, 0.1)',
            color: isSotdToday ? '#ef4444' : 'var(--accent)',
            border: `1px solid ${isSotdToday ? 'rgba(239, 68, 68, 0.3)' : 'rgba(167, 139, 250, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {isSotdToday ? <X size={20} /> : <CalendarDays size={20} />}
          {isSotdToday ? 'Desfazer Uso de Hoje' : 'Estou usando hoje'}
        </button>

        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>Calculadora de Uso ({spraysUsed} borrifadas usadas)</span>
            <span>{mlRemaining.toFixed(1)} / {volumeMl} mL ({fillPercentage}%)</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'var(--accent)',
              width: `${fillPercentage}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleAddSprays(3)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+3 Borrifadas</button>
            <button onClick={() => handleAddSprays(5)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+5 Borrifadas</button>
            <button onClick={() => handleAddSprays(10)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+10 Borrifadas</button>
          </div>
          <p style={{ textAlign: 'center', margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Restam aprox. {Math.max(0, (volumeMl * 12) - spraysUsed)} borrifadas no frasco.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: 'var(--accent)' }}>
          <Loader2 size={32} className="lucide-spin" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
          <p>Buscando ficha técnica na enciclopédia...</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : perfume.full_details ? (
        <div className="perfume-details-content">

          {/* ACCORDS */}
          {perfume.full_details.accords && perfume.full_details.accords.length > 0 && (
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Principais Acordes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                {perfume.full_details.accords.map((accord, idx) => (
                  <div key={idx} style={{
                    width: `${Math.max(30, accord.value)}%`,
                    background: accord.color,
                    color: '#fff',
                    padding: '4px 0',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    textTransform: 'lowercase'
                  }}>
                    {accord.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESCRIPTION & PERFUMER / RELEASE YEAR */}
          <div className="rationale-box" style={{ borderColor: 'var(--accent)', background: 'rgba(167, 139, 250, 0.05)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              {perfume.full_details.description || `${perfume.name} apresenta evolução refinada com equilíbrio entre projeção e fixação.`}
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={14} /> Perfumista: <strong>{perfume.full_details.perfumer || 'Casa de Perfumaria'}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CalendarDays size={14} /> Lançamento: <strong>{perfume.full_details.releaseYear || '2020'}</strong>
              </span>
            </div>
          </div>

          {/* PYRAMID */}
          {perfume.full_details.pyramid && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Layers size={20} color="var(--accent)" /> Pirâmide Olfativa
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Notas de Saída (Topo)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                    {(perfume.full_details.pyramid.top || []).map((note, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>{note}</div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Notas de Coração (Corpo)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                    {(perfume.full_details.pyramid.heart || []).map((note, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>{note}</div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Notas de Fundo (Base)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                    {(perfume.full_details.pyramid.base || []).map((note, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>{note}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE BARS */}
          {perfume.full_details.performance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Activity size={16} color="#38bdf8" /> Longevidade (Fixação)
                </h4>
                {renderBar('Fraca', perfume.full_details.performance.longevity.weak, '#94a3b8')}
                {renderBar('Moderada', perfume.full_details.performance.longevity.moderate, '#38bdf8')}
                {renderBar('Longa Duração', perfume.full_details.performance.longevity.longLasting, '#4ade80')}
                {renderBar('Eterna', perfume.full_details.performance.longevity.eternal, '#8b5cf6')}
              </div>

              <div className="glass-card" style={{ padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Activity size={16} color="#f472b6" /> Projeção / Rastro (Sillage)
                </h4>
                {renderBar('Íntima', perfume.full_details.performance.sillage.intimate, '#94a3b8')}
                {renderBar('Moderada', perfume.full_details.performance.sillage.moderate, '#f472b6')}
                {renderBar('Forte', perfume.full_details.performance.sillage.strong, '#f97316')}
                {renderBar('Enorme', perfume.full_details.performance.sillage.enormous, '#ef4444')}
              </div>
            </div>
          )}

          {/* DEMOGRAPHICS */}
          {perfume.full_details.demographics && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <div className="glass-card" style={{ flex: 1, minWidth: '220px', padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                  <Users size={14} color="var(--accent)" /> Percepção de Gênero
                </h4>
                {renderBar('Feminino', perfume.full_details.demographics.gender.female, '#f472b6')}
                {renderBar('Unissex', perfume.full_details.demographics.gender.unisex, '#a855f7')}
                {renderBar('Masculino', perfume.full_details.demographics.gender.male, '#38bdf8')}
              </div>
              <div className="glass-card" style={{ flex: 1, minWidth: '220px', padding: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                  <DollarSign size={14} color="#4ade80" /> Custo-Benefício
                </h4>
                {renderBar('Caro', perfume.full_details.demographics.priceValue.expensive, '#ef4444')}
                {renderBar('Justo', perfume.full_details.demographics.priceValue.ok, '#facc15')}
                {renderBar('Excelente', perfume.full_details.demographics.priceValue.great, '#4ade80')}
              </div>
            </div>
          )}

          {/* SIMILAR PERFUMES */}
          {perfume.full_details.similar && perfume.full_details.similar.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Este Perfume me Lembra do...</h3>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem' }}>
                {perfume.full_details.similar.map((sim, idx) => (
                  <div key={idx} className="glass-card" style={{ minWidth: '140px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FlaskConical size={24} color="var(--accent)" />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{sim}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="section-header" style={{ marginTop: '2rem' }}>Meu Diário Olfativo</h3>
          <div className="glass-card">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={32}
                  onClick={() => setLocalRating(star)}
                  fill={localRating >= star ? '#fcd34d' : 'transparent'}
                  color={localRating >= star ? '#fcd34d' : 'var(--text-muted)'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                />
              ))}
            </div>

            <textarea
              value={localReview}
              onChange={(e) => setLocalReview(e.target.value)}
              placeholder="O que você acha dessa fragrância? Quando costuma usar?"
              style={{
                width: '100%',
                minHeight: '100px',
                resize: 'vertical',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
                padding: '1rem',
                borderRadius: '8px',
                outline: 'none'
              }}
            />

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', minWidth: '130px' }}>Nível do Frasco ({localFillLevel}%):</span>
              <input
                type="range"
                min="0"
                max="100"
                value={localFillLevel}
                onChange={(e) => setLocalFillLevel(parseInt(e.target.value) || 0)}
                style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', minWidth: '130px' }}>Preço Pago (R$):</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={localPricePaid}
                onChange={(e) => setLocalPricePaid(e.target.value)}
                placeholder="Ex: 350.00"
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleSaveReview}
              disabled={isSavingReview}
              className="glass-card"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              {isSavingReview ? 'Salvando...' : 'Salvar Avaliação, Nível & Preço'}
            </button>
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <button
              onClick={handleDeletePerfume}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <Trash2 size={18} />
              Excluir Perfume da Coleção
            </button>
          </div>

        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sem detalhes adicionais disponíveis.</p>
      )}
    </div>
  );
};

export default PerfumeDetails;
