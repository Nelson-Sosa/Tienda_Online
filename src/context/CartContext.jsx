import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext(null);

/**
 * Normaliza un producto a la representación pública mínima requerida por el carrito.
 * Garantiza que purchasePrice y campos internos nunca ingresen al estado ni a localStorage.
 */
function sanitizeCartItem(product, quantity = 1) {
  if (!product || typeof product !== 'object' || !product.id) return null;
  return {
    id: String(product.id),
    name: product.name || "",
    salePrice: Number(product.salePrice) || 0,
    originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
    images: Array.isArray(product.images) ? product.images : [],
    categoryId: product.categoryId || "",
    categoryName: product.categoryName || "Sin categoría",
    quantity: Math.max(1, Number(quantity) || 1),
  };
}

export function CartProvider({ children }) {
  // Inicializar estado desde localStorage migrando y saneando datos antiguos
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('tiendaonline_cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      if (!Array.isArray(parsed)) return [];

      let needsMigration = false;
      const sanitizedList = [];

      for (const item of parsed) {
        if (!item || typeof item !== 'object' || !item.id) {
          needsMigration = true;
          continue;
        }

        // Si el elemento guardado contiene purchasePrice u otros campos internos,
        // marcamos que requiere re-escribir localStorage limpio
        if ('purchasePrice' in item || 'minimumStock' in item || 'createdBy' in item || 'updatedBy' in item) {
          needsMigration = true;
        }

        const clean = sanitizeCartItem(item, item.quantity);
        if (clean) {
          sanitizedList.push(clean);
        }
      }

      // Migración activa: si había campos internos persistidos, limpiar localStorage de inmediato
      if (needsMigration) {
        localStorage.setItem('tiendaonline_cart', JSON.stringify(sanitizedList));
      }

      return sanitizedList;
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      return [];
    }
  });

  // Guardar en localStorage cada vez que cartItems cambia
  useEffect(() => {
    localStorage.setItem('tiendaonline_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, qty = 1) => {
    if (!product || !product.id) return;
    const addQty = Math.max(1, Number(qty) || 1);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + addQty } : item
        );
      }
      const newItem = sanitizeCartItem(product, addQty);
      if (!newItem) return prevItems;
      return [...prevItems, newItem];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== productId);
      }
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (Number(item.salePrice) || 0) * item.quantity, 0);
  }, [cartItems]);

  const isInCart = useCallback((productId) => {
    return cartItems.some((item) => item.id === productId);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

