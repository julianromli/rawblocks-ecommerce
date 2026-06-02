import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../lib/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, getAccessToken } = useAuth();
  const userId = user?.id || user?.sub || null;
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      return [];
    }

    setIsCartLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setCartItems([]);
        return [];
      }

      const { items } = await apiRequest('/api/cart');
      setCartItems(items);
      return items;
    } finally {
      setIsCartLoading(false);
    }
  }, [getAccessToken, userId]);

  useEffect(() => {
    loadCart().catch(() => setCartItems([]));
  }, [loadCart]);

  const addToCart = async (product) => {
    if (!userId) {
      throw new Error('Please sign in before adding items to your cart.');
    }

    const previous = cartItems;
    setCartItems((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    try {
      const { items } = await apiRequest('/api/cart', {
        method: 'PATCH',
        body: { productId: product.id, delta: 1 },
      });
      setCartItems(items);
    } catch (error) {
      setCartItems(previous);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    const previous = cartItems;
    setCartItems(prev => prev.filter(item => item.id !== productId));

    try {
      const { items } = await apiRequest(`/api/cart?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      setCartItems(items);
    } catch (error) {
      setCartItems(previous);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const currentItem = cartItems.find((item) => item.id === productId);

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!currentItem || currentItem.quantity === quantity) {
      return;
    }

    const previous = cartItems;
    const delta = quantity - currentItem.quantity;
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );

    try {
      const { items } = await apiRequest('/api/cart', {
        method: 'PATCH',
        body: { productId, delta },
      });
      setCartItems(items);
    } catch (error) {
      setCartItems(previous);
      throw error;
    }
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadCart,
      cartTotal,
      itemCount,
      isCartLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
};
