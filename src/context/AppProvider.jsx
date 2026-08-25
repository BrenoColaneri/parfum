import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const AppContext = createContext();

const initialInventory = [
  { id: '1', name: 'Acqua di Giò', type: 'Fresco', icon: 'Droplets' },
  { id: '2', name: 'Bleu de Chanel', type: 'Amadeirado Fresco', icon: 'Wind' },
  { id: '3', name: 'Terre d\'Hermès', type: 'Amadeirado', icon: 'Trees' },
  { id: '4', name: 'Sauvage', type: 'Especiado', icon: 'Flame' },
  { id: '5', name: 'Maison Alhambra', type: 'Fresco Amadeirado', icon: 'Trees' },
];

const initialWishlist = [
  { id: 'w1', name: 'Dior Sauvage Elixir', targetPrice: 850, currentPrice: 799, isOnSale: true },
  { id: 'w2', name: 'Tom Ford Oud Wood', targetPrice: 1500, currentPrice: 1650, isOnSale: false },
];

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState(initialInventory);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [sotdHistory, setSotdHistory] = useState([]);
  const [customOccasions, setCustomOccasions] = useState([]);
  const [weather, setWeather] = useState({
    city: 'São Paulo',
    temp: 18,
    condition: 'Nublado',
    humidity: 65,
    minTemp: 16,
    maxTemp: 22
  });

  useEffect(() => {
    // Weather and Location Fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Get city name using BigDataCloud
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`);
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || 'Localização Desconhecida';

          // Get weather using Open-Meteo
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
          const weatherData = await weatherRes.json();

          const temp = Math.round(weatherData.current.temperature_2m);
          const humidity = Math.round(weatherData.current.relative_humidity_2m);
          const maxTemp = Math.round(weatherData.daily.temperature_2m_max[0]);
          const minTemp = Math.round(weatherData.daily.temperature_2m_min[0]);
          const wmo = weatherData.current.weather_code;
          
          let condition = 'Limpo';
          if (wmo >= 1 && wmo <= 3) condition = 'Nublado';
          if (wmo >= 45 && wmo <= 48) condition = 'Neblina';
          if (wmo >= 51 && wmo <= 67) condition = 'Chuvoso';
          if (wmo >= 71 && wmo <= 77) condition = 'Neve';
          if (wmo >= 80 && wmo <= 99) condition = 'Tempestade';

          setWeather({
            city,
            temp,
            condition,
            humidity,
            minTemp,
            maxTemp
          });
        } catch(e) {
          console.error("Erro ao buscar clima/localização:", e);
        }
      }, (error) => {
        console.error("Erro de geolocalização:", error);
      });
    }

    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        fetchData(session.user.id);
      }
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        fetchData(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setInventory([]);
        setWishlist([]);
        setSotdHistory([]);
        setCustomOccasions([]);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    // Fetch Inventory
    const { data: invData, error: invError } = await supabase.from('inventory').select('*');
    if (!invError && invData) setInventory(invData);
    
    // Fetch Wishlist
    const { data: wishData, error: wishError } = await supabase.from('wishlist').select('*');
    if (!wishError && wishData) {
      // Re-map wishlist to include mocked currentPrice logic for UI
      const mappedWishlist = wishData.map(w => {
        const mockCurrent = parseFloat(w.target_price) * (0.8 + Math.random() * 0.4); 
        return {
          id: w.id,
          name: w.name,
          targetPrice: parseFloat(w.target_price),
          currentPrice: mockCurrent,
          isOnSale: mockCurrent <= parseFloat(w.target_price),
          volume: w.volume,
          link: w.link
        };
      });
      setWishlist(mappedWishlist);
    }

    // Fetch SOTD History
    const { data: sotdData, error: sotdError } = await supabase.from('sotd').select('*').order('date', { ascending: false });
    if (!sotdError && sotdData) setSotdHistory(sotdData);

    const savedOccasions = localStorage.getItem('customOccasions');
    if (savedOccasions) {
      try {
        setCustomOccasions(JSON.parse(savedOccasions));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    if (error) {
      console.error('Signup error:', error);
      throw error;
    }
    return data;
  };

  const addPerfume = async (perfume) => {
    if (!user) return;
    const newPerfume = { 
      name: perfume.name, 
      brand: perfume.brand || '',
      concentration: perfume.concentration || '',
      type: perfume.type, 
      icon: perfume.icon, 
      notes: perfume.notes || '',
      price_paid: perfume.pricePaid || 0,
      user_id: user.id 
    };
    const { data, error } = await supabase.from('inventory').insert([newPerfume]).select();
    if (!error && data) {
      setInventory([...inventory, data[0]]);
    }
  };

  const removePerfume = async (id) => {
    const { error } = await supabase.from('inventory').delete().match({ id });
    if (!error) {
      setInventory(inventory.filter(p => p.id !== id));
    }
  };

  const updatePerfumeDetails = async (id, details) => {
    const { data, error } = await supabase.from('inventory').update({ full_details: details }).match({ id }).select();
    if (!error && data) {
      setInventory(inventory.map(p => p.id === id ? { ...p, full_details: details } : p));
    } else if (error) {
      console.error('Error updating details in Supabase:', error);
    }
  };

  const editPerfumeBaseInfo = async (id, updatedData) => {
    const { data, error } = await supabase.from('inventory').update(updatedData).match({ id }).select();
    if (!error && data) {
      setInventory(inventory.map(p => p.id === id ? { ...p, ...updatedData } : p));
    } else if (error) {
      console.error('Error updating perfume base info in Supabase:', error);
    }
  };

  const addToWishlist = async (item) => {
    if (!user) return;
    const newItem = { 
      name: item.name, 
      target_price: item.targetPrice, 
      volume: item.volume,
      link: item.link,
      user_id: user.id 
    };
    const { data, error } = await supabase.from('wishlist').insert([newItem]).select();
    if (!error && data) {
      const w = data[0];
      const mockCurrent = parseFloat(w.target_price) * (0.8 + Math.random() * 0.4); 
      setWishlist([...wishlist, { 
        id: w.id, 
        name: w.name, 
        targetPrice: parseFloat(w.target_price), 
        currentPrice: mockCurrent, 
        isOnSale: mockCurrent <= parseFloat(w.target_price),
        brand: item.brand,
        type: item.type,
        icon: item.icon,
        volume: w.volume,
        link: w.link
      }]);
    }
  };

  const removeFromWishlist = async (id) => {
    const { error } = await supabase.from('wishlist').delete().match({ id });
    if (!error) {
      setWishlist(wishlist.filter(p => p.id !== id));
    }
  };

  const recordSotd = async (perfumeId, dateStr) => {
    if (!user) return;
    const { data, error } = await supabase.from('sotd_history').insert([{
      user_id: user.id,
      perfume_id: perfumeId,
      date: dateStr
    }]).select();
    
    if (error) {
      console.error('Error recording SOTD:', error);
      alert('Erro ao registrar histórico: ' + error.message);
    } else if (data) {
      setSotdHistory([data[0], ...sotdHistory].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };

  const removeSotd = async (id) => {
    const { error } = await supabase.from('sotd_history').delete().match({ id });
    if (!error) {
      setSotdHistory(sotdHistory.filter(s => s.id !== id));
    }
  };

  const updateFillLevel = async (id, level) => {
    const { data, error } = await supabase.from('inventory').update({ fill_level: level }).match({ id }).select();
    if (!error && data) {
      setInventory(inventory.map(p => p.id === id ? { ...p, fill_level: level } : p));
    }
  };

  const updateUserReview = async (id, rating, review) => {
    const { data, error } = await supabase.from('inventory').update({ user_rating: rating, user_review: review }).match({ id }).select();
    if (!error && data) {
      setInventory(inventory.map(p => p.id === id ? { ...p, user_rating: rating, user_review: review } : p));
    }
  };

  const addCustomOccasion = (occasion) => {
    const newOccasions = [...customOccasions, occasion];
    setCustomOccasions(newOccasions);
    localStorage.setItem('customOccasions', JSON.stringify(newOccasions));
  };

  return (
    <AppContext.Provider value={{ 
      isAuthenticated, 
      isAuthLoading, 
      user, 
      inventory, 
      wishlist, 
      weather, 
      sotdHistory,
      customOccasions,
      addCustomOccasion,
      login, 
      signup, 
      logout, 
      addPerfume, 
      removePerfume, 
      updatePerfumeDetails, 
      updateFillLevel, 
      updateUserReview, 
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
