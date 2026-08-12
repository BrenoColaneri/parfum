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
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState(initialInventory);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [weather, setWeather] = useState({
    city: 'São Paulo',
    temp: 18,
    condition: 'Nublado',
    humidity: 65,
    minTemp: 16,
    maxTemp: 22
  });

  useEffect(() => {
    // Auth Listener
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (userId) => {
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
          isOnSale: mockCurrent <= parseFloat(w.target_price)
        };
      });
      setWishlist(mappedWishlist);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error);
      // Fallback for development if account doesn't exist - try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if(signUpError) {
        console.error('Signup error:', signUpError);
      }
    }
  };

  const addPerfume = async (perfume) => {
    if (!user) return;
    const newPerfume = { name: perfume.name, type: perfume.type, icon: perfume.icon, user_id: user.id };
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

  const addToWishlist = async (item) => {
    if (!user) return;
    const newItem = { name: item.name, target_price: item.targetPrice, user_id: user.id };
    const { data, error } = await supabase.from('wishlist').insert([newItem]).select();
    if (!error && data) {
      const w = data[0];
      const mockCurrent = parseFloat(w.target_price) * (0.8 + Math.random() * 0.4); 
      setWishlist([...wishlist, { 
        id: w.id, 
        name: w.name, 
        targetPrice: parseFloat(w.target_price), 
        currentPrice: mockCurrent, 
        isOnSale: mockCurrent <= parseFloat(w.target_price) 
      }]);
    }
  };

  const removeFromWishlist = async (id) => {
    const { error } = await supabase.from('wishlist').delete().match({ id });
    if (!error) {
      setWishlist(wishlist.filter(p => p.id !== id));
    }
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, login, inventory, addPerfume, removePerfume, wishlist, addToWishlist, removeFromWishlist, weather }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
