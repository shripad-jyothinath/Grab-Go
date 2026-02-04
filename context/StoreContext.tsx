import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Restaurant, MenuItem, Order, CartItem, UserRole, OrderStatus } from '../types';
import { api } from '../services/api';
import { Centrifuge } from 'centrifuge';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  isTestMode: boolean;
  
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (user: Omit<User, 'id'>, restaurantName?: string) => Promise<void>;
  logout: () => void;
  recoverPassword: (email: string, answer: string, newPass: string) => Promise<boolean>;
  
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  placeOrder: (paymentRef?: string) => Promise<Order>;
  
  updateOrderStatus: (orderId: string, status: OrderStatus, pickupCode?: string) => void;
  verifyPickup: (orderId: string, code: string) => boolean;
  
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  
  toggleRestaurantStatus: (restaurantId: string) => void;
  toggleTestMode: () => void;
  verifyRestaurant: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [centrifuge, setCentrifuge] = useState<Centrifuge | null>(null);

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      try {
        // Check for existing session
        const storedUser = localStorage.getItem('grabgo_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          connectCentrifugo(user);
        }

        const [rests, items] = await Promise.all([
          api.get('/restaurants'),
          api.get('/menu')
        ]);
        setRestaurants(rests);
        setMenuItems(items);
        
        // If logged in, fetch orders
        if (localStorage.getItem('grabgo_token')) {
          const myOrders = await api.get('/orders');
          setOrders(myOrders);
        }
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    init();
  }, []);

  const connectCentrifugo = async (user: User) => {
    try {
      // Get connection token from backend
      const { token } = await api.post('/centrifugo-token', { userId: user.id });
      
      const client = new Centrifuge('wss://talisha-unjarred-zara.ngrok-free.dev/connection/websocket', {
        token: token
      });

      client.on('connected', (ctx) => {
        console.log("Centrifugo connected", ctx);
      });

      // Handle Incoming Orders (Common Logic)
      const handleOrderUpdate = (ctx: any) => {
        const newOrder = ctx.data;
        setOrders(prev => {
          const exists = prev.find(o => o.id === newOrder.id);
          if (exists) return prev.map(o => o.id === newOrder.id ? newOrder : o);
          return [newOrder, ...prev];
        });
      };

      // 1. Subscribe to User's private channel
      const userSub = client.newSubscription(`orders:user_${user.id}`);
      userSub.on('publication', handleOrderUpdate);
      userSub.subscribe();

      // 2. If Restaurant, subscribe to restaurant channel
      if (user.role === UserRole.RESTAURANT && user.restaurantId) {
        const restSub = client.newSubscription(`orders:restaurant_${user.restaurantId}`);
        restSub.on('publication', handleOrderUpdate);
        restSub.subscribe();
      }

      // 3. Subscribe to public restaurant status updates
      const statusSub = client.newSubscription('restaurant');
      statusSub.on('publication', (ctx) => {
        if (ctx.data.type === 'STATUS_CHANGE') {
           setRestaurants(prev => prev.map(r => r.id === ctx.data.id ? { ...r, isOpen: ctx.data.isOpen } : r));
        }
      });
      statusSub.subscribe();

      client.connect();
      setCentrifuge(client);
    } catch (e) {
      console.error("Failed to connect to real-time server", e);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/login', { email, password: pass });
      setCurrentUser(res.user);
      localStorage.setItem('grabgo_user', JSON.stringify(res.user));
      localStorage.setItem('grabgo_token', res.token);
      
      const userOrders = await api.get('/orders');
      setOrders(userOrders);
      connectCentrifugo(res.user);
      
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const signup = async (userData: Omit<User, 'id'>, restaurantName?: string) => {
    await api.post('/signup', { ...userData, restaurantName });
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    localStorage.removeItem('grabgo_user');
    localStorage.removeItem('grabgo_token');
    if (centrifuge) centrifuge.disconnect();
  };

  const recoverPassword = async (email: string, answer: string, newPass: string) => {
    try {
      await api.post('/recover-password', { email, answer, newPass });
      return true;
    } catch (e) {
      return false;
    }
  };

  const addToCart = (item: MenuItem) => {
    if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
      if (window.confirm("Start a new cart? This will clear your current items.")) {
        setCart([{ ...item, quantity: 1 }]);
      }
    } else {
      setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (paymentRef?: string) => {
    if (!currentUser || cart.length === 0) throw new Error("Cannot place order");
    const order = await api.post('/orders', { 
      items: cart, 
      restaurantId: cart[0].restaurantId, 
      paymentRef 
    });
    setOrders(prev => [order, ...prev]);
    clearCart();
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, pickupCode?: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    await api.put(`/orders/${orderId}/status`, { status });
  };

  const verifyPickup = (orderId: string, code: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.pickupCode === code) {
      updateOrderStatus(orderId, OrderStatus.COMPLETED);
      return true;
    }
    return false;
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const newItem = await api.post('/menu', item);
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = async (item: MenuItem) => {
    await api.put(`/menu/${item.id}`, item);
    setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const deleteMenuItem = async (id: string) => {
    await api.delete(`/menu/${id}`);
    setMenuItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleRestaurantStatus = async (restaurantId: string) => {
    const r = restaurants.find(r => r.id === restaurantId);
    if (r) {
      const newState = !r.isOpen;
      setRestaurants(prev => prev.map(res => res.id === restaurantId ? { ...res, isOpen: newState } : res));
      await api.put(`/restaurants/${restaurantId}/status`, { isOpen: newState });
    }
  };
  
  const verifyRestaurant = async (id: string) => {
    await api.put(`/restaurants/${id}/verify`, { verified: true });
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, verified: true } : r));
  };

  const toggleTestMode = () => setIsTestMode(!isTestMode);

  return (
    <StoreContext.Provider value={{
      currentUser, users: [], restaurants, menuItems, orders, cart, isTestMode,
      login, signup, logout, recoverPassword,
      addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder,
      updateOrderStatus, verifyPickup,
      addMenuItem, updateMenuItem, deleteMenuItem,
      toggleRestaurantStatus, toggleTestMode, verifyRestaurant
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};