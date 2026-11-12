import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const AppContext = createContext();

// Coleção Curada de Alta Fidelidade para Demonstração Acadêmica e Apresentação
export const DEMO_PERFUMES = [
  {
    id: 'demo-1',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    concentration: 'EDP',
    type: 'Amadeirado Aromático',
    gender: 'Masculino',
    intensity: 'Forte',
    icon: 'Wind',
    notes: 'Toranja, Incenso, Cedro',
    price_paid: 890.00,
    fill_level: 85,
    user_rating: 5,
    user_review: 'Uma das obras-primas da perfumaria moderna. Abre cítrico vibrante e assenta em um incenso sedutor.',
    full_details: {
      volume_ml: 100,
      sprays_used: 120,
      perfumer: 'Jacques Polge',
      releaseYear: '2014',
      description: 'Bleu de Chanel é um tributo à liberdade masculina em um aromático amadeirado de rastro cativante.',
      accords: [
        { name: 'cítrico fresco', color: '#38bdf8', value: 95 },
        { name: 'amadeirado', color: '#4ade80', value: 90 },
        { name: 'aromático', color: '#8b5cf6', value: 85 }
      ],
      pyramid: {
        top: ['🍋 Toranja', '🌿 Hortelã', '🌶️ Pimenta Rosa'],
        heart: ['🪻 Lavanda', '🌱 Gengibre', '🌸 Jasmim'],
        base: ['🪵 Cedro', '🌲 Sândalo', '🕯️ Incenso']
      }
    }
  },
  {
    id: 'demo-2',
    name: 'Sauvage Elixir',
    brand: 'Dior',
    concentration: 'Parfum',
    type: 'Especiado Quente',
    gender: 'Masculino',
    intensity: 'Forte',
    icon: 'Flame',
    notes: 'Canela, Noz-moscada, Lavanda, Alcaçuz',
    price_paid: 1150.00,
    fill_level: 90,
    user_rating: 5,
    user_review: 'Potência absurda. Apenas duas borrifadas preenchem o ambiente com sofisticação noturna.',
    full_details: {
      volume_ml: 60,
      sprays_used: 40,
      perfumer: 'François Demachy',
      releaseYear: '2021',
      description: 'Sauvage Elixir é uma fragrância extraordinariamente concentrada, imersa no frescor emblemático de Sauvage com coração inebriante de especiarias.',
      accords: [
        { name: 'especiado quente', color: '#f97316', value: 100 },
        { name: 'amadeirado', color: '#4ade80', value: 85 },
        { name: 'aromático', color: '#8b5cf6', value: 75 }
      ],
      pyramid: {
        top: ['🪵 Canela', '🌰 Noz-moscada', '🍊 Cardamomo'],
        heart: ['🪻 Lavanda Noturna', '🌿 Alcaçuz'],
        base: ['🪵 Sândalo', '🌲 Âmbar', '🌾 Patchouli']
      }
    }
  },
  {
    id: 'demo-3',
    name: 'Acqua di Giò Profondo',
    brand: 'Giorgio Armani',
    concentration: 'EDP',
    type: 'Cítrico Aquático',
    gender: 'Masculino',
    intensity: 'Moderada',
    icon: 'Droplets',
    notes: 'Notas Marinhas, Bergamota, Alecrim, Patchouli',
    price_paid: 680.00,
    fill_level: 70,
    user_rating: 4,
    user_review: 'O perfume supremo para dias quentes e ambientes executivos de verão.',
    full_details: {
      volume_ml: 125,
      sprays_used: 210,
      perfumer: 'Alberto Morillas',
      releaseYear: '2020',
      description: 'Acqua di Giò Profondo é uma interpretação marinha intensa que mergulha na alma profunda do oceano.',
      accords: [
        { name: 'marinho aquático', color: '#38bdf8', value: 100 },
        { name: 'cítrico', color: '#facc15', value: 85 },
        { name: 'aromático', color: '#8b5cf6', value: 70 }
      ],
      pyramid: {
        top: ['🌊 Notas Marinhas', '🍋 Bergamota Verde', '🍊 Mandarina'],
        heart: ['🌿 Alecrim', '🪻 Lavanda', '🌱 Cipreste'],
        base: ['🌲 Almíscar', '🌾 Patchouli Mineral', '🪵 Âmbar']
      }
    }
  },
  {
    id: 'demo-4',
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    concentration: 'Extrait',
    type: 'Âmbar Floral Amadeirado',
    gender: 'Unissex',
    intensity: 'Forte',
    icon: 'Flame',
    notes: 'Açafrão, Jasmim Grandiflorum, Âmbar Cinzento, Cedro',
    price_paid: 2450.00,
    fill_level: 95,
    user_rating: 5,
    user_review: 'Aura hipnótica e doce etéreo. Projeção cristalina inconfundível.',
    full_details: {
      volume_ml: 70,
      sprays_used: 35,
      perfumer: 'Francis Kurkdjian',
      releaseYear: '2015',
      description: 'Luminoso e sofisticado, Baccarat Rouge 540 pousa na pele como um sopro floral âmbar e amadeirado.',
      accords: [
        { name: 'âmbar amadeirado', color: '#f59e0b', value: 100 },
        { name: 'especiado quente', color: '#ea580c', value: 80 },
        { name: 'floral', color: '#ec4899', value: 70 }
      ],
      pyramid: {
        top: ['🌺 Açafrão Raro', '🌸 Jasmim Egípcio'],
        heart: ['🪵 Madeira de Cedro', '✨ Amberwood'],
        base: ['🌊 Âmbar Cinzento', '🌲 Resina de Abeto']
      }
    }
  },
  {
    id: 'demo-5',
    name: "Terre d'Hermès",
    brand: 'Hermès',
    concentration: 'EDT',
    type: 'Amadeirado Especiado Mineral',
    gender: 'Masculino',
    intensity: 'Moderada',
    icon: 'Trees',
    notes: 'Laranja, Pederneira, Vetiver, Cedro',
    price_paid: 720.00,
    fill_level: 80,
    user_rating: 5,
    user_review: 'A perfeita união entre a terra e o céu. Mineral, maduro e de extrema classe.',
    full_details: {
      volume_ml: 100,
      sprays_used: 150,
      perfumer: 'Jean-Claude Ellena',
      releaseYear: '2006',
      description: 'Terre d\'Hermès une o vigor cítrico da laranja à mineralidade da pederneira e à nobreza do vetiver.',
      accords: [
        { name: 'cítrico amadeirado', color: '#84cc16', value: 95 },
        { name: 'mineral terroso', color: '#a16207', value: 85 },
        { name: 'especiado', color: '#f97316', value: 75 }
      ],
      pyramid: {
        top: ['🍊 Laranja Amarga', '🍋 Toranja'],
        heart: ['🪨 Pederneira Mineral', '🌶️ Pimenta'],
        base: ['🌾 Vetiver', '🪵 Cedro', '🌲 Benjoim']
      }
    }
  }
];

export const DEMO_WISHLIST = [
  {
    id: 'w-demo-1',
    name: 'Tom Ford Tobacco Vanille',
    brand: 'Tom Ford',
    type: 'Oriental Especiado',
    icon: 'Flame',
    targetPrice: 1850.00,
    volume: '50ml',
    link: 'https://www.google.com/search?tbm=shop&q=Tom+Ford+Tobacco+Vanille+50ml'
  },
  {
    id: 'w-demo-2',
    name: 'Creed Aventus',
    brand: 'Creed',
    type: 'Chipre Frutado',
    icon: 'Trees',
    targetPrice: 2200.00,
    volume: '100ml',
    link: 'https://www.google.com/search?tbm=shop&q=Creed+Aventus+100ml'
  }
];

// Normaliza registros do banco Supabase (extraindo campos estendidos de full_details)
const normalizePerfumeRecord = (p) => {
  if (!p) return p;
  const details = p.full_details && typeof p.full_details === 'object' ? p.full_details : {};
  const gender = p.gender || details.gender || 'Unissex';
  const intensity = p.intensity || details.intensity || 'Moderada';
  const image = p.image || details.image || null;
  const volumeMl = parseInt(details.volume_ml ?? p.volume_ml) || 100;
  const spraysUsed = parseInt(details.sprays_used ?? p.sprays_used) || 0;

  return {
    ...p,
    brand: p.brand || details.brand || '',
    concentration: p.concentration || details.concentration || 'EDP',
    type: p.type || details.type || 'Amadeirado Fresco',
    gender,
    intensity,
    icon: p.icon || details.icon || 'Droplets',
    notes: p.notes || details.notes || '',
    image,
    price_paid: parseFloat(p.price_paid ?? p.pricePaid) || 0,
    fill_level: typeof p.fill_level === 'number' ? p.fill_level : 100,
    user_rating: typeof p.user_rating === 'number' ? p.user_rating : 0,
    user_review: p.user_review || '',
    full_details: {
      ...details,
      volume_ml: volumeMl,
      sprays_used: spraysUsed,
      gender,
      intensity,
      image
    }
  };
};

// Codifica e decodifica metadados extras (brand, type, icon) no campo link da tabela wishlist
const encodeWishlistLink = (link, meta = {}) => {
  const cleanLink = (link || '').split('#parfum_meta=')[0];
  const encodedMeta = encodeURIComponent(JSON.stringify({
    brand: meta.brand || '',
    type: meta.type || '',
    icon: meta.icon || 'Droplets'
  }));
  return `${cleanLink}#parfum_meta=${encodedMeta}`;
};

const decodeWishlistRow = (w) => {
  const rawLink = w.link || '';
  const [cleanLink, metaPart] = rawLink.split('#parfum_meta=');
  let meta = {};
  if (metaPart) {
    try {
      meta = JSON.parse(decodeURIComponent(metaPart));
    } catch {
      meta = {};
    }
  }
  return {
    id: w.id,
    name: w.name,
    targetPrice: parseFloat(w.target_price ?? w.targetPrice) || 0,
    volume: w.volume || '100ml',
    link: cleanLink || '',
    brand: w.brand || meta.brand || '',
    type: w.type || meta.type || '',
    icon: w.icon || meta.icon || 'Droplets'
  };
};

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [inventory, setInventory] = useState(DEMO_PERFUMES);
  const [wishlist, setWishlist] = useState(DEMO_WISHLIST);
  const [sotdHistory, setSotdHistory] = useState([
    {
      id: 'sotd-demo-1',
      perfume_id: 'demo-1',
      date: new Date().toISOString().split('T')[0]
    }
  ]);

  const [customOccasions, setCustomOccasions] = useState(() => {
    try {
      const saved = localStorage.getItem('customOccasions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [weather, setWeather] = useState({
    city: 'São Paulo',
    temp: 21,
    condition: 'Agradável',
    humidity: 60,
    minTemp: 17,
    maxTemp: 24
  });
  const [weatherWarning, setWeatherWarning] = useState(null);

  // Sincroniza estado do Modo Demo no localStorage para persistência após F5
  const saveDemoState = (nextInv, nextWish, nextSotd) => {
    try {
      if (nextInv !== undefined) localStorage.setItem('parfum_demo_inventory', JSON.stringify(nextInv));
      if (nextWish !== undefined) localStorage.setItem('parfum_demo_wishlist', JSON.stringify(nextWish));
      if (nextSotd !== undefined) localStorage.setItem('parfum_demo_sotd', JSON.stringify(nextSotd));
    } catch {
      // Ignora quota excedida no localStorage
    }
  };

  // Carrega preferências locais, tema e clima
  useEffect(() => {
    // 0. Tema claro/escuro persistido globalmente
    try {
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    } catch {
      // Ambiente sem localStorage
    }

    // 1. Clima e Localização em tempo real via Open-Meteo & BigDataCloud
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`);
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || 'Sua Região';

            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
            const weatherData = await weatherRes.json();

            const temp = Math.round(weatherData.current.temperature_2m);
            const humidity = Math.round(weatherData.current.relative_humidity_2m);
            const maxTemp = Math.round(weatherData.daily.temperature_2m_max[0]);
            const minTemp = Math.round(weatherData.daily.temperature_2m_min[0]);
            const wmo = weatherData.current.weather_code;

            let condition = 'Céu Limpo';
            if (wmo >= 1 && wmo <= 3) condition = 'Parcialmente Nublado';
            else if (wmo >= 45 && wmo <= 48) condition = 'Neblina Suave';
            else if (wmo >= 51 && wmo <= 67) condition = 'Chuvoso';
            else if (wmo >= 71 && wmo <= 77) condition = 'Neve / Frio Intenso';
            else if (wmo >= 80 && wmo <= 99) condition = 'Tempestade';

            setWeather({ city, temp, condition, humidity, minTemp, maxTemp });
            setWeatherWarning(null);
          } catch (e) {
            console.warn('Uso de clima padrão de contingência:', e.message);
            setWeatherWarning('Serviço meteorológico indisponível no momento. Utilizando clima de referência.');
          }
        },
        (error) => {
          console.warn('Geolocalização não autorizada, utilizando clima de referência.', error.message);
          setWeatherWarning('Localização não autorizada pelo navegador. Exibindo clima de referência (São Paulo).');
        },
        { timeout: 7000 }
      );
    } else {
      setWeatherWarning('Geolocalização indisponível neste dispositivo. Exibindo clima de referência.');
    }

    // 2. Ouvinte de Autenticação Supabase Seguro
    if (supabase && supabase.auth) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!error && session) {
          setIsAuthenticated(true);
          setUser(session.user);
          setIsDemoMode(false);
          fetchData();
        } else {
          const savedDemo = localStorage.getItem('parfum_demo_mode');
          if (savedDemo === 'true') {
            enableDemoMode();
          }
        }
        setIsAuthLoading(false);
      }).catch((err) => {
        console.warn('Erro ao obter sessão Supabase:', err.message);
        setIsAuthLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
          setIsDemoMode(false);
          fetchData();
        } else {
          setIsAuthenticated(false);
          setUser(null);
          const savedDemo = localStorage.getItem('parfum_demo_mode');
          if (savedDemo === 'true') {
            enableDemoMode();
          } else {
            setInventory([]);
            setWishlist([]);
            setSotdHistory([]);
          }
        }
        setIsAuthLoading(false);
      });

      return () => {
        if (authListener?.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    } else {
      enableDemoMode();
      setIsAuthLoading(false);
    }
  }, []);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setIsAuthenticated(true);
    setUser({
      id: 'demo-user-id',
      email: 'sommelier@biblioteria.com',
      user_metadata: { name: 'Colecionador Convidado' }
    });

    try {
      const savedInv = localStorage.getItem('parfum_demo_inventory');
      const savedWish = localStorage.getItem('parfum_demo_wishlist');
      const savedSotd = localStorage.getItem('parfum_demo_sotd');

      setInventory(savedInv ? JSON.parse(savedInv).map(normalizePerfumeRecord) : DEMO_PERFUMES.map(normalizePerfumeRecord));
      setWishlist(savedWish ? JSON.parse(savedWish) : DEMO_WISHLIST);
      setSotdHistory(savedSotd ? JSON.parse(savedSotd) : [
        {
          id: 'sotd-demo-1',
          perfume_id: 'demo-1',
          date: new Date().toISOString().split('T')[0]
        }
      ]);
    } catch {
      setInventory(DEMO_PERFUMES.map(normalizePerfumeRecord));
      setWishlist(DEMO_WISHLIST);
      setSotdHistory([
        {
          id: 'sotd-demo-1',
          perfume_id: 'demo-1',
          date: new Date().toISOString().split('T')[0]
        }
      ]);
    }

    localStorage.setItem('parfum_demo_mode', 'true');
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('parfum_demo_mode');
    if (!supabase || !user || user.id === 'demo-user-id') {
      setIsAuthenticated(false);
      setUser(null);
      setInventory([]);
      setWishlist([]);
      setSotdHistory([]);
    }
  };

  const fetchData = async () => {
    if (!supabase) return;

    try {
      // 1. Busca Inventário
      const { data: invData, error: invError } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (!invError && invData) {
        setInventory(invData.map(normalizePerfumeRecord));
      }

      // 2. Busca Wishlist
      const { data: wishData, error: wishError } = await supabase
        .from('wishlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (!wishError && wishData) {
        setWishlist(wishData.map(decodeWishlistRow));
      }

      // 3. Busca Histórico SOTD (PADRONIZADO NA TABELA sotd_history)
      const { data: sotdData, error: sotdError } = await supabase
        .from('sotd_history')
        .select('*')
        .order('date', { ascending: false });

      if (!sotdError && sotdData) {
        setSotdHistory(sotdData);
      }
    } catch (err) {
      console.error('Erro ao sincronizar dados com o Supabase:', err);
    }

    const savedOccasions = localStorage.getItem('customOccasions');
    if (savedOccasions) {
      try {
        setCustomOccasions(JSON.parse(savedOccasions));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Funções de Autenticação
  const login = async (email, password) => {
    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Formato de e-mail inválido.');
    }
    if (!password) {
      throw new Error('Informe sua senha.');
    }
    if (!supabase) {
      enableDemoMode();
      return { user: { email: cleanEmail, user_metadata: { name: 'Usuário Convidado' } } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, name) => {
    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Formato de e-mail inválido.');
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }
    if (!supabase) {
      enableDemoMode();
      return { user: { email: cleanEmail, user_metadata: { name } } };
    }
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name: (name || '').trim() || 'Colecionador' } }
    });
    if (error) throw error;
    // Detecta e-mail já cadastrado quando identidades vêm vazias no Supabase
    if (data?.user?.identities && data.user.identities.length === 0) {
      throw new Error('User already registered');
    }
    return data;
  };

  const logout = async () => {
    disableDemoMode();
    if (supabase && supabase.auth) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Erro durante signOut:', e.message);
      }
    }
    setIsAuthenticated(false);
    setUser(null);
    setInventory([]);
    setWishlist([]);
    setSotdHistory([]);
  };

  // Funções do Inventário / Biblioteria
  const addPerfume = async (perfume) => {
    const gender = perfume.gender || 'Unissex';
    const intensity = perfume.intensity || 'Moderada';
    const image = perfume.image || perfume.full_details?.image || null;
    const volumeMl = parseInt(perfume.volume_ml ?? perfume.full_details?.volume_ml) || 100;
    const spraysUsed = parseInt(perfume.sprays_used ?? perfume.full_details?.sprays_used) || 0;

    const mergedDetails = {
      ...(perfume.full_details || {}),
      volume_ml: volumeMl,
      sprays_used: spraysUsed,
      gender,
      intensity,
      image
    };

    const dbPayload = {
      name: (perfume.name || '').trim(),
      brand: perfume.brand || '',
      concentration: perfume.concentration || 'EDP',
      type: perfume.type || 'Fresco',
      icon: perfume.icon || 'Droplets',
      notes: perfume.notes || '',
      price_paid: parseFloat(perfume.pricePaid ?? perfume.price_paid) || 0,
      fill_level: typeof perfume.fill_level === 'number' ? perfume.fill_level : 100,
      user_rating: perfume.user_rating || 0,
      user_review: perfume.user_review || '',
      full_details: mergedDetails
    };

    if (user && supabase && !isDemoMode) {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{ ...dbPayload, user_id: user.id }])
        .select();

      if (!error && data && data[0]) {
        const normalized = normalizePerfumeRecord(data[0]);
        setInventory(prev => [normalized, ...prev]);
        return normalized;
      }
    }

    // Fallback local / Modo Demonstração
    const localPerfume = normalizePerfumeRecord({
      ...dbPayload,
      gender,
      intensity,
      image,
      id: 'local-' + Date.now()
    });
    setInventory(prev => {
      const next = [localPerfume, ...prev];
      if (isDemoMode) saveDemoState(next, undefined, undefined);
      return next;
    });
    return localPerfume;
  };

  const removePerfume = async (id) => {
    if (user && supabase && !isDemoMode) {
      // Remove registros dependentes na tabela sotd_history antes de excluir de inventory
      await supabase.from('sotd_history').delete().match({ perfume_id: id });
      await supabase.from('inventory').delete().match({ id });
    }
    setInventory(prev => {
      const next = prev.filter(p => p.id !== id);
      if (isDemoMode) saveDemoState(next, undefined, undefined);
      return next;
    });
    setSotdHistory(prev => {
      const next = prev.filter(s => s.perfume_id !== id);
      if (isDemoMode) saveDemoState(undefined, undefined, next);
      return next;
    });
  };

  // Persiste atualização em inventory (com fallback atômico delete+insert caso a policy FOR UPDATE não esteja ativa no banco)
  const persistInventoryUpdate = async (id, patchFields) => {
    if (!user || !supabase || isDemoMode) return;
    try {
      const { data: updatedRows, error } = await supabase
        .from('inventory')
        .update(patchFields)
        .match({ id })
        .select();

      if (!error && (!updatedRows || updatedRows.length === 0)) {
        const current = inventory.find(p => p.id === id);
        if (!current) return;

        // Preserva registros de sotd_history vinculados ao perfume_id
        const { data: linkedSotd } = await supabase
          .from('sotd_history')
          .select('*')
          .match({ perfume_id: id });

        if (linkedSotd && linkedSotd.length > 0) {
          await supabase.from('sotd_history').delete().match({ perfume_id: id });
        }

        const replacementRow = {
          id,
          user_id: user.id,
          name: patchFields.name !== undefined ? patchFields.name : current.name,
          brand: patchFields.brand !== undefined ? patchFields.brand : (current.brand || ''),
          concentration: patchFields.concentration !== undefined ? patchFields.concentration : (current.concentration || 'EDP'),
          type: patchFields.type !== undefined ? patchFields.type : (current.type || 'Fresco'),
          icon: patchFields.icon !== undefined ? patchFields.icon : (current.icon || 'Droplets'),
          notes: patchFields.notes !== undefined ? patchFields.notes : (current.notes || ''),
          price_paid: patchFields.price_paid !== undefined ? patchFields.price_paid : (parseFloat(current.price_paid) || 0),
          fill_level: patchFields.fill_level !== undefined ? patchFields.fill_level : (current.fill_level ?? 100),
          user_rating: patchFields.user_rating !== undefined ? patchFields.user_rating : (current.user_rating ?? 0),
          user_review: patchFields.user_review !== undefined ? patchFields.user_review : (current.user_review ?? ''),
          full_details: patchFields.full_details !== undefined ? patchFields.full_details : (current.full_details || {}),
          created_at: current.created_at || new Date().toISOString()
        };

        await supabase.from('inventory').delete().match({ id });
        await supabase.from('inventory').insert([replacementRow]);

        if (linkedSotd && linkedSotd.length > 0) {
          await supabase.from('sotd_history').insert(linkedSotd);
        }
      }
    } catch (err) {
      console.error('Erro ao persistir atualização no Supabase:', err);
    }
  };

  // Implementação Requisitada: updatePricePaid
  const updatePricePaid = async (id, price) => {
    const numericPrice = parseFloat(price) || 0;
    await persistInventoryUpdate(id, { price_paid: numericPrice });

    setInventory(prev => {
      const next = prev.map(p => p.id === id ? { ...p, price_paid: numericPrice } : p);
      if (isDemoMode) saveDemoState(next, undefined, undefined);
      return next;
    });
    return true;
  };

  const updatePerfumeDetails = async (id, details) => {
    const current = inventory.find(p => p.id === id);
    const mergedDetails = {
      volume_ml: 100,
      sprays_used: 0,
      ...(current?.full_details || {}),
      ...(details || {}),
      gender: details?.gender || current?.gender || current?.full_details?.gender || 'Unissex',
      intensity: details?.intensity || current?.intensity || current?.full_details?.intensity || 'Moderada',
      image: details?.image !== undefined ? details.image : (current?.image || current?.full_details?.image || null)
    };

    await persistInventoryUpdate(id, { full_details: mergedDetails });
    setInventory(prev => {
      const next = prev.map(p => p.id === id ? normalizePerfumeRecord({ ...p, full_details: mergedDetails }) : p);
      if (isDemoMode) saveDemoState(next, undefined, undefined);
      return next;
    });
  };

  const editPerfumeBaseInfo = async (id, updatedData) => {
    const current = inventory.find(p => p.id === id) || {};
    const gender = updatedData.gender || current.gender || 'Unissex';
    const intensity = updatedData.intensity || current.intensity || 'Moderada';
    const image = updatedData.image !== undefined ? updatedData.image : (current.image || current.full_details?.image || null);
    const volumeMl = parseInt(updatedData.volume_ml ?? current.full_details?.volume_ml) || 100;
    const spraysUsed = parseInt(updatedData.sprays_used ?? current.full_details?.sprays_used) || 0;

    const mergedDetails = {
      ...(current.full_details || {}),
      ...(updatedData.full_details || {}),
      volume_ml: volumeMl,
      sprays_used: spraysUsed,
      gender,
      intensity,
      image
    };

    const dbPayload = {
      name: updatedData.name !== undefined ? updatedData.name : current.name,
      brand: updatedData.brand !== undefined ? updatedData.brand : current.brand,
      concentration: updatedData.concentration !== undefined ? updatedData.concentration : current.concentration,
      type: updatedData.type !== undefined ? updatedData.type : current.type,
      notes: updatedData.notes !== undefined ? updatedData.notes : (current.notes || ''),
      icon: updatedData.icon !== undefined ? updatedData.icon : (current.icon || 'Droplets'),
      price_paid: updatedData.price_paid !== undefined ? (parseFloat(updatedData.price_paid) || 0) : (current.price_paid || 0),
      fill_level: updatedData.fill_level !== undefined ? updatedData.fill_level : (current.fill_level ?? 100),
      user_rating: updatedData.user_rating !== undefined ? updatedData.user_rating : (current.user_rating ?? 0),
      user_review: updatedData.user_review !== undefined ? updatedData.user_review : (current.user_review ?? ''),
      full_details: mergedDetails
    };

    await persistInventoryUpdate(id, dbPayload);
    setInventory(prev => {
      const next = prev.map(p => p.id === id ? normalizePerfumeRecord({ ...p, ...dbPayload, gender, intensity, image }) : p);
      if (isDemoMode) saveDemoState(next, undefined, undefined);
      return next;
    });
  };

  const updateFillLevel = async (id, level) => {
    const clamped = Math.max(0, Math.min(100, Math.round(Number(level) || 0)));
    await persistInventoryUpdate(id, { fill_level: clamped });
    setInventory(prev => {
      const next = prev.map(p => p.id === id ? { ...p, fill_level: clamped } : p);
      if (isDemoMode) saveDemoState(next, undefined, undefined);
      return next;
    });
  };

  const updateUserReview = async (id, rating, review) => {
    await persistInventoryUpdate(id, { user_rating: rating, user_review: review });
    setInventory(prev => {
      const next = prev.map(p => p.id === id ? { ...p, user_rating: rating, user_review: review } : p);
      if (isDemoMode) saveDemoState(next, undefined, undefined);
      return next;
    });
  };

  // Funções da Lista de Desejos (Wishlist)
  const addToWishlist = async (item) => {
    const cleanName = (item.name || '').trim();
    const numericTargetPrice = parseFloat(item.targetPrice ?? item.target_price) || 0;
    const volume = item.volume || '100ml';
    const cleanLink = (item.link || '').trim();
    const brand = item.brand || '';
    const type = item.type || '';
    const icon = item.icon || 'Droplets';

    const dbRow = {
      name: cleanName,
      target_price: numericTargetPrice,
      volume,
      link: encodeWishlistLink(cleanLink, { brand, type, icon })
    };

    if (user && supabase && !isDemoMode) {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ ...dbRow, user_id: user.id }])
        .select();

      if (!error && data && data[0]) {
        const decoded = decodeWishlistRow(data[0]);
        setWishlist(prev => [decoded, ...prev]);
        return decoded;
      }
    }

    // Local / Demo Mode
    const localWish = {
      id: 'wish-' + Date.now(),
      name: cleanName,
      targetPrice: numericTargetPrice,
      volume,
      link: cleanLink,
      brand,
      type,
      icon
    };
    setWishlist(prev => {
      const next = [localWish, ...prev];
      if (isDemoMode) saveDemoState(undefined, next, undefined);
      return next;
    });
    return localWish;
  };

  const removeFromWishlist = async (id) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('wishlist').delete().match({ id });
    }
    setWishlist(prev => {
      const next = prev.filter(p => p.id !== id);
      if (isDemoMode) saveDemoState(undefined, next, undefined);
      return next;
    });
  };

  // Funções do SOTD (Perfume do Dia) - Padronizado na tabela sotd_history
  const recordSotd = async (perfumeId, dateStr) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    // Evita duplicidade do mesmo perfume na mesma data
    const alreadyRecorded = sotdHistory.some(s => s.perfume_id === perfumeId && s.date === targetDate);
    if (alreadyRecorded) {
      return { success: false, duplicate: true, message: 'Este perfume já foi registrado nesta data.' };
    }

    if (user && supabase && !isDemoMode) {
      const { data, error } = await supabase.from('sotd_history').insert([{
        user_id: user.id,
        perfume_id: perfumeId,
        date: targetDate
      }]).select();

      if (!error && data && data[0]) {
        setSotdHistory(prev => [data[0], ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
        return { success: true, data: data[0] };
      }
    }

    // Local / Demo Mode
    const localSotd = {
      id: 'sotd-' + Date.now(),
      perfume_id: perfumeId,
      date: targetDate
    };
    setSotdHistory(prev => {
      const next = [localSotd, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
      if (isDemoMode) saveDemoState(undefined, undefined, next);
      return next;
    });
    return { success: true, data: localSotd };
  };

  const removeSotd = async (id) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('sotd_history').delete().match({ id });
    }
    setSotdHistory(prev => {
      const next = prev.filter(s => s.id !== id);
      if (isDemoMode) saveDemoState(undefined, undefined, next);
      return next;
    });
  };

  // Ocasiões Customizadas
  const addCustomOccasion = (occasion) => {
    if (!occasion || !occasion.name) return;
    if (customOccasions.some(o => o.name.toLowerCase() === occasion.name.toLowerCase())) return;
    const newOccasions = [...customOccasions, occasion];
    setCustomOccasions(newOccasions);
    localStorage.setItem('customOccasions', JSON.stringify(newOccasions));
  };

  const removeCustomOccasion = (name) => {
    const newOccasions = customOccasions.filter(o => o.name !== name);
    setCustomOccasions(newOccasions);
    localStorage.setItem('customOccasions', JSON.stringify(newOccasions));
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      isAuthLoading,
      user,
      isDemoMode,
      enableDemoMode,
      disableDemoMode,
      inventory,
      wishlist,
      weather,
      weatherWarning,
      sotdHistory,
      customOccasions,
      addCustomOccasion,
      removeCustomOccasion,
      login,
      signup,
      logout,
      addPerfume,
      removePerfume,
      updatePerfumeDetails,
      updateFillLevel,
      updateUserReview,
      updatePricePaid,
      editPerfumeBaseInfo,
      addToWishlist,
      removeFromWishlist,
      recordSotd,
      removeSotd
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
