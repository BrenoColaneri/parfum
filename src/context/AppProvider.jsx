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
    name: 'Terre d\'Hermès',
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
    targetPrice: 1850.00, 
    volume: '50ml', 
    link: 'https://www.google.com/search?tbm=shop&q=Tom+Ford+Tobacco+Vanille+50ml'
  },
  { 
    id: 'w-demo-2', 
    name: 'Creed Aventus', 
    brand: 'Creed',
    type: 'Chipre Frutado',
    targetPrice: 2200.00, 
    volume: '100ml', 
    link: 'https://www.google.com/search?tbm=shop&q=Creed+Aventus+100ml'
  }
];

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

  const [customOccasions, setCustomOccasions] = useState([]);
  const [weather, setWeather] = useState({
    city: 'São Paulo',
    temp: 21,
    condition: 'Agradável',
    humidity: 60,
    minTemp: 17,
    maxTemp: 24
  });

  // Carrega preferências locais e clima
  useEffect(() => {
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
          } catch (e) {
            console.warn('Uso de clima padrão de contingência:', e.message);
          }
        },
        (error) => {
          console.warn('Geolocalização não autorizada, utilizando clima de referência.', error.message);
        },
        { timeout: 7000 }
      );
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
          // Permite modo demo se estiver configurado
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
      // Se Supabase não foi configurado, inicia em Modo Demonstração seguro
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
    setInventory(DEMO_PERFUMES);
    setWishlist(DEMO_WISHLIST);
    setSotdHistory([
      {
        id: 'sotd-demo-1',
        perfume_id: 'demo-1',
        date: new Date().toISOString().split('T')[0]
      }
    ]);
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
        setInventory(invData);
      }

      // 2. Busca Wishlist
      const { data: wishData, error: wishError } = await supabase
        .from('wishlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (!wishError && wishData) {
        const mappedWishlist = wishData.map(w => ({
          id: w.id,
          name: w.name,
          targetPrice: parseFloat(w.target_price) || 0,
          volume: w.volume || '100ml',
          link: w.link || '',
          brand: w.brand || '',
          type: w.type || '',
          icon: w.icon || 'Droplets'
        }));
        setWishlist(mappedWishlist);
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
    if (!supabase) {
      enableDemoMode();
      return { user: { email, user_metadata: { name: 'Usuário Convidado' } } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, name) => {
    if (!supabase) {
      enableDemoMode();
      return { user: { email, user_metadata: { name } } };
    }
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { name } }
    });
    if (error) throw error;
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
    const newPerfumeObj = {
      name: perfume.name,
      brand: perfume.brand || '',
      concentration: perfume.concentration || 'EDP',
      type: perfume.type || 'Fresco',
      gender: perfume.gender || 'Unissex',
      intensity: perfume.intensity || 'Moderada',
      icon: perfume.icon || 'Droplets',
      notes: perfume.notes || '',
      price_paid: parseFloat(perfume.pricePaid || perfume.price_paid) || 0,
      fill_level: perfume.fill_level || 100,
      user_rating: perfume.user_rating || 0,
      user_review: perfume.user_review || '',
      full_details: perfume.full_details || null
    };

    if (user && supabase && !isDemoMode) {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{ ...newPerfumeObj, user_id: user.id }])
        .select();

      if (!error && data && data[0]) {
        setInventory(prev => [data[0], ...prev]);
        return data[0];
      }
    }

    // Fallback local / Modo Demonstração
    const localPerfume = {
      ...newPerfumeObj,
      id: 'local-' + Date.now()
    };
    setInventory(prev => [localPerfume, ...prev]);
    return localPerfume;
  };

  const removePerfume = async (id) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('inventory').delete().match({ id });
    }
    setInventory(prev => prev.filter(p => p.id !== id));
    // Remove também do histórico SOTD local
    setSotdHistory(prev => prev.filter(s => s.perfume_id !== id));
  };

  // Implementação Requisitada: updatePricePaid
  const updatePricePaid = async (id, price) => {
    const numericPrice = parseFloat(price) || 0;
    
    if (user && supabase && !isDemoMode) {
      try {
        const { error } = await supabase
          .from('inventory')
          .update({ price_paid: numericPrice })
          .match({ id });
          
        if (error) {
          console.error('Erro ao atualizar price_paid no Supabase:', error);
        }
      } catch (err) {
        console.error('Erro ao persistir preço pago:', err);
      }
    }

    setInventory(prev => prev.map(p => p.id === id ? { ...p, price_paid: numericPrice } : p));
    return true;
  };

  const updatePerfumeDetails = async (id, details) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('inventory').update({ full_details: details }).match({ id });
    }
    setInventory(prev => prev.map(p => p.id === id ? { ...p, full_details: details } : p));
  };

  const editPerfumeBaseInfo = async (id, updatedData) => {
    const payload = {
      name: updatedData.name,
      brand: updatedData.brand,
      concentration: updatedData.concentration,
      type: updatedData.type,
      gender: updatedData.gender || 'Unissex',
      intensity: updatedData.intensity || 'Moderada',
      price_paid: parseFloat(updatedData.price_paid) || 0
    };

    if (user && supabase && !isDemoMode) {
      await supabase.from('inventory').update(payload).match({ id });
    }
    setInventory(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));
  };

  const updateFillLevel = async (id, level) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('inventory').update({ fill_level: level }).match({ id });
    }
    setInventory(prev => prev.map(p => p.id === id ? { ...p, fill_level: level } : p));
  };

  const updateUserReview = async (id, rating, review) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('inventory').update({ user_rating: rating, user_review: review }).match({ id });
    }
    setInventory(prev => prev.map(p => p.id === id ? { ...p, user_rating: rating, user_review: review } : p));
  };

  // Funções da Lista de Desejos (Wishlist)
  const addToWishlist = async (item) => {
    const newItem = {
      name: item.name,
      target_price: parseFloat(item.targetPrice) || 0,
      volume: item.volume || '100ml',
      link: item.link || '',
      brand: item.brand || '',
      type: item.type || '',
      icon: item.icon || 'Droplets'
    };

    if (user && supabase && !isDemoMode) {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ ...newItem, user_id: user.id }])
        .select();

      if (!error && data && data[0]) {
        const w = data[0];
        setWishlist(prev => [{
          id: w.id,
          name: w.name,
          targetPrice: parseFloat(w.target_price),
          volume: w.volume,
          link: w.link,
          brand: item.brand,
          type: item.type,
          icon: item.icon
        }, ...prev]);
        return;
      }
    }

    // Local / Demo Mode
    setWishlist(prev => [{
      id: 'wish-' + Date.now(),
      name: newItem.name,
      targetPrice: newItem.target_price,
      volume: newItem.volume,
      link: newItem.link,
      brand: newItem.brand,
      type: newItem.type,
      icon: newItem.icon
    }, ...prev]);
  };

  const removeFromWishlist = async (id) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('wishlist').delete().match({ id });
    }
    setWishlist(prev => prev.filter(p => p.id !== id));
  };

  // Funções do SOTD (Perfume do Dia) - Padronizado na tabela sotd_history
  const recordSotd = async (perfumeId, dateStr) => {
    // Evita duplicidade do mesmo perfume na mesma data
    const alreadyRecorded = sotdHistory.some(s => s.perfume_id === perfumeId && s.date === dateStr);
    if (alreadyRecorded) {
      return { success: true, message: 'Já registrado hoje.' };
    }

    if (user && supabase && !isDemoMode) {
      const { data, error } = await supabase.from('sotd_history').insert([{
        user_id: user.id,
        perfume_id: perfumeId,
        date: dateStr
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
      date: dateStr
    };
    setSotdHistory(prev => [localSotd, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    return { success: true, data: localSotd };
  };

  const removeSotd = async (id) => {
    if (user && supabase && !isDemoMode) {
      await supabase.from('sotd_history').delete().match({ id });
    }
    setSotdHistory(prev => prev.filter(s => s.id !== id));
  };

  // Ocasiões Customizadas
  const addCustomOccasion = (occasion) => {
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
