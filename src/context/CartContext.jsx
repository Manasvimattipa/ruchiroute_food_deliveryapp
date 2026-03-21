import React, { createContext, useContext, useState, useEffect } from 'react';

import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  
  // Use a temporary key for the very first render before auth is ready
  const getCartKey = (uid) => uid ? `ruchiRouteCart_${uid}` : 'ruchiRouteCart_guest';

  const [cart, setCart] = useState([]);

  // 1. Initial Load & Switch Cart on User Change
  useEffect(() => {
    if (authLoading) return;

    const currentKey = getCartKey(currentUser?.uid);
    const savedCart = localStorage.getItem(currentKey);
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, [currentUser?.uid, authLoading]);

  // 2. Persist Cart to Correct Key
  useEffect(() => {
    if (authLoading) return;
    
    // Only save if auth check is done to avoid clobbering keys with empty state
    const currentKey = getCartKey(currentUser?.uid);
    localStorage.setItem(currentKey, JSON.stringify(cart));
  }, [cart, currentUser?.uid, authLoading]);

  const addToCart = (item) => {
    // Prevent adding if auth is still validating
    if (authLoading) return;
    
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((i) => i.id === item.id);
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, amount) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity + amount };
        }
        return item;
      });
      // Remove any items that dropped to 0 or less
      return updatedCart.filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
