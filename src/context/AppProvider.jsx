import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

const initialInventory = [
  { id: '1', name: 'Maison Alhambra', type: 'Amadeirado Amadeirado', icon: 'Trees' },
  { id: '2', name: 'Granado', type: 'Fresco Fresco', icon: 'Wind' },
  { id: '3', name: 'Granado', type: 'Fresco Fresco', icon: 'Wind' },
  { id: '4', name: 'Maison Alhambra', type: 'Amadeirado Fresco', icon: 'Trees' },
  { id: '5', name: 'Maison Alhambra', type: 'Fresco Amadeirado', icon: 'Trees' },
];

const initialWishlist = [
  { id: 'w1', name: 'Dior Sauvage Elixir', targetPrice: 850, currentPrice: 799, isOnSale: true },
  { id: 'w2', name: 'Tom Ford Oud Wood', targetPrice: 1500, currentPrice: 1650, isOnSale: false },
];

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const login = (email, password) => {
    // Mock login logic
    setIsAuthenticated(true);
  };

  const addPerfume = (perfume) => {
    setInventory([...inventory, { ...perfume, id: Date.now().toString() }]);
  };

  const removePerfume = (id) => {
    setInventory(inventory.filter(p => p.id !== id));
  };

  const addToWishlist = (item) => {
    // Simulate current price slightly fluctuating around the target price
    const mockCurrent = item.targetPrice * (0.8 + Math.random() * 0.4); 
    setWishlist([...wishlist, { 
      ...item, 
      id: Date.now().toString(),
      currentPrice: mockCurrent,
      isOnSale: mockCurrent <= item.targetPrice
    }]);
  };

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, login, inventory, addPerfume, removePerfume, wishlist, addToWishlist, removeFromWishlist, weather }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
