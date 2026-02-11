import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Restaurant, MenuItem, Order, CartItem, UserRole, OrderStatus } from '../types';
import { api, API_URL } from '../services/api';
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
  verifyRestaurant: (id: string, status: boolean) => void;
  declineRestaurant: (id: string) => void;
  updateRestaurantProfile: (id: string, data: Partial<Restaurant>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
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
        
        if (localStorage.getItem('grabgo_token')) {
          const myOrders = await api.get('/orders');
          setOrders(myOrders);
        }
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    init();

    return () => {
      if (centrifugeRef.current) centrifugeRef.current.disconnect();
    };
  }, []);

  const connectCentrifugo = async (user: User) => {
    if (centrifugeRef.current) centrifugeRef.current.disconnect();

    try {
      const { token } = await api.post('/centrifugo-token', { userId: user.id });
      
      // Calculate WS URL from API_URL
      // e.g. https://domain.com/api -> wss://domain.com/connection/websocket
      const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
      const host = API_URL.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
      const WS_URL = `${wsProtocol}://${host}/connection/websocket`;
      
      console.log(`Centrifugo connecting to: ${WS_URL}`);

      const client = new Centrifuge(WS_URL, {
        token: token,
        debug: true
      });

      const handleOrderUpdate = (ctx: any) => {
        const updatedOrder = ctx.data;
        setOrders(prev => {
          const exists = prev.find(o => o.id === updatedOrder.id);
          if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          return [updatedOrder, ...prev];
        });
      };

      // Namespace: orders
      const userSub = client.newSubscription(`orders:user_${user.id}`);
      userSub.on('publication', handleOrderUpdate);
      userSub.subscribe();

      if (user.role === UserRole.RESTAURANT && user.restaurantId) {
        const restSub = client.newSubscription(`orders:restaurant_${user.restaurantId}`);
        restSub.on('publication', handleOrderUpdate);
        restSub.subscribe();
      }

      // Namespace: public
      const publicSub = client.newSubscription('public:general');
      publicSub.on('publication', (ctx) => {
        const data = ctx.data;
        if (data.type === 'STATUS_CHANGE') {
          setRestaurants(prev => prev.map(r => r.id === data.id ? { ...r, isOpen: data.isOpen } : r));
        } else if (data.type === 'MENU_UPDATE') {
          setMenuItems(prev => {
            const exists = prev.find(i => i.id === data.item.id);
            if (exists) return prev.map(i => i.id === data.item.id ? data.item : i);
            return [...prev, data.item];
          });
        } else if (data.type === 'MENU_DELETE') {
          setMenuItems(prev => prev.filter(i => i.id !== data.id));
        }
      });
      publicSub.subscribe();

      client.connect();
      centrifugeRef.current = client;
    } catch (e) {
      console.error("Real-time connection setup failed", e);
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
      console.error("Login error:", e);
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
    if (centrifugeRef.current) {
      centrifugeRef.current.disconnect();
      centrifugeRef.current = null;
    }
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
    const updated = await api.put(`/menu/${item.id}`, item);
    setMenuItems(prev => prev.map(i => i.id === item.id ? updated : i));
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
  
  const verifyRestaurant = async (id: string, status: boolean) => {
    await api.put(`/restaurants/${id}/verify`, { verified: status });
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, verified: status } : r));
  };
  
  const declineRestaurant = async (id: string) => {
      await api.delete(`/restaurants/${id}`);
      setRestaurants(prev => prev.filter(r => r.id !== id));
  };

  const updateRestaurantProfile = async (id: string, data: Partial<Restaurant>) => {
      await api.put(`/restaurants/${id}`, data);
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const toggleTestMode = () => setIsTestMode(!isTestMode);

  return (
    <StoreContext.Provider value={{
      currentUser, users: [], restaurants, menuItems, orders, cart, isTestMode,
      login, signup, logout, recoverPassword,
      addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder,
      updateOrderStatus, verifyPickup,
      addMenuItem, updateMenuItem, deleteMenuItem,
      toggleRestaurantStatus, toggleTestMode, verifyRestaurant, declineRestaurant,
      updateRestaurantProfile
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