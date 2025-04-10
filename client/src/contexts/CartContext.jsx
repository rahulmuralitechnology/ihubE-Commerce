import { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const response = await getCart();
          setCart(response.data);
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      } else {
        // For guest users, try to get cart from localStorage
        const guestCart = localStorage.getItem("guestCart");
        if (guestCart) {
          setCart(JSON.parse(guestCart));
        }
      }
      setLoading(false);
    };

    fetchCart();
  }, [user]);

  const updateCart = (newCart) => {
    setCart(newCart);
    if (!user) {
      localStorage.setItem("guestCart", JSON.stringify(newCart));
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, updateCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
