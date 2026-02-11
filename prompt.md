Act as a world-class senior full-stack engineer. I need you to rebuild the **Grab&Go** campus food ordering application from scratch.

### **Project Overview**
**Grab&Go** is a React + Node.js application designed for high performance and low latency. It connects students with campus cafeterias.
1.  **Role-based Access:** Student, Restaurant, Admin.
2.  **Tech Stack:** React (Frontend), Node.js/Express (Backend), SQLite (Database), TailwindCSS (Styling).
3.  **Physics & Math Optimizations:** The app implements Request Deduplication, Optimistic UI updates, Memoization ($O(N)$ reduction), and Latency minimization techniques.
4.  **Real-time:** Uses Centrifugo logic (simulated or actual) with HTTP polling fallbacks.

Please create the following files exactly as specified below.

---

### **1. Configuration & Metadata**

**Filename: `metadata.json`**
```json
{
  "name": "Grab&Go",
  "description": "A streamlined campus food pre-ordering platform connecting students with university cafeterias. Features role-based access, real-time order tracking, and AI-powered menu management.",
  "requestFramePermissions": [
    "camera"
  ]
}
```

**Filename: `manifest.json`**
```json
{
  "name": "Grab&Go",
  "short_name": "Grab&Go",
  "description": "Campus food ordering made easy.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "orientation": "portrait",
  "icons": [
    {
      "src": "https://cdn-icons-png.flaticon.com/512/7541/7541673.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://cdn-icons-png.flaticon.com/512/7541/7541673.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Filename: `setup.txt`**
```text
# Grab&Go - Simplified Setup Guide

Follow these steps to get your campus food platform running.

==================================================
STEP 0: SERVER ENVIRONMENT SETUP
==================================================
Your server should be running Node.js 20.x.

1. Update package list:
   sudo apt-get update

2. Install Node.js 20.x:
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

==================================================
STEP 1: DATABASE & BACKEND SETUP
==================================================
1. Navigate to your project folder.
2. Install dependencies:
   npm install express sqlite3 cors body-parser jsonwebtoken bcryptjs multer

3. Start the server:
   node server.js

*NOTE:* Default Admin: admin@grabandgo.com / Universe2007$

==================================================
STEP 2: FRONTEND SETUP
==================================================
1. Install frontend dependencies:
   npm install @react-oauth/google jwt-decode react-qr-code lucide-react react-router-dom

2. Start the development server:
   npm run dev
```

---

### **2. Entry Points & Types**

**Filename: `index.html`**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#4f46e5" />
    <link rel="manifest" href="/manifest.json" />
    <title>Grab&Go - Campus Food Ordering</title>
    
    <!-- === PHYSICS: LATENCY REDUCTION === -->
    <!-- Preconnect establishes TCP handshake + TLS negotiation immediately -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'media',
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
            },
          }
        }
      }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Inter', sans-serif;
      }
      /* Custom scrollbar for cleaner look */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      @media (prefers-color-scheme: dark) {
        ::-webkit-scrollbar-thumb {
          background: #475569;
        }
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.4/",
    "react": "https://esm.sh/react@^19.2.4",
    "lucide-react": "https://esm.sh/lucide-react@^0.563.0",
    "react-router-dom": "https://esm.sh/react-router-dom@^7.13.0",
    "recharts": "https://esm.sh/recharts@^3.7.0",
    "@google/genai": "https://esm.sh/@google/genai@^1.39.0",
    "react-dom/": "https://esm.sh/react-dom@^19.2.4/",
    "@react-oauth/google": "https://esm.sh/@react-oauth/google@^0.13.4",
    "react-qr-code": "https://esm.sh/react-qr-code@2.0.15",
    "centrifuge": "https://esm.sh/centrifuge@^5.2.2"
  }
}
</script>
</head>
  <body class="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
    <div id="root"></div>
  </body>
</html>
```

**Filename: `index.tsx`**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Replace with your actual Google Client ID from Cloud Console
const GOOGLE_CLIENT_ID = "777581521134-3lhd7fvvov8vbkqgaf6ve5l7pe5krjk8.apps.googleusercontent.com";

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

**Filename: `types.ts`**
```ts
export enum UserRole {
  STUDENT = 'STUDENT',
  RESTAURANT = 'RESTAURANT',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string; // In real app, never store plain text
  securityQuestion?: string;
  securityAnswer?: string;
  restaurantId?: string; // If role is RESTAURANT
}

export interface Restaurant {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  cuisine: string[];
  imageUrl: string;
  isOpen: boolean;
  upiId?: string;
  hours?: string; // Opening/Closing hours
  razorpayKey?: string;
  verified: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  pickupCode: string;
  createdAt: string; // ISO String
  transactionRef?: string; // For UPI
}

export interface Stats {
  totalRevenue: number;
  totalOrders: number;
  activeRestaurants: number;
}
```

---

### **3. Services & Core Logic**

**Filename: `services/api.ts`**
```ts
// Configuration: Points to the Backend Server
// Optimized for Hostinger (grabandgo.tech) + Ngrok tunnel setup

// === PHYSICS: PATH OPTIMIZATION ===
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // 1. Production Domain (Hostinger) -> Tunnel -> Localhost
  if (hostname.includes('grabandgo.tech') || hostname.includes('hostinger')) {
    // Replace this with your ACTIVE Ngrok URL
    return 'https://talisha-unjarred-zara.ngrok-free.dev/api';
  }
  
  // 2. Direct Tunnel Access
  if (hostname.includes('ngrok-free.dev')) {
    return `${window.location.origin}/api`;
  }

  // 3. Local Development (Low Latency)
  return 'http://127.0.0.1:3000/api';
};

export const API_URL = getBaseUrl();

console.log("Grab&Go API initialized at:", API_URL);

// === ALGORITHM: REQUEST DEDUPLICATION ===
// If a request is in flight, return the existing promise instead of firing a new one.
const inflightRequests = new Map<string, Promise<any>>();

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('grabgo_token');
  const headers: Record<string, string> = {
    // Bypass Ngrok landing page interception
    'ngrok-skip-browser-warning': '69420', 
    'Accept': 'application/json'
  };
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async (endpoint: string) => {
    // Check if we are already fetching this resource
    if (inflightRequests.has(endpoint)) {
      return inflightRequests.get(endpoint);
    }

    const requestPromise = (async () => {
      try {
        const token = localStorage.getItem('grabgo_token');
        // Minimal headers for GET to reduce packet size and avoid complex CORS preflight
        const headers: Record<string, string> = {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, { 
          method: 'GET',
          headers: headers,
          mode: 'cors',
        });
        
        if (!res.ok) {
          const text = await res.text();
          try {
              const json = JSON.parse(text);
              throw new Error(json.error || `Error ${res.status}: ${res.statusText}`);
          } catch (e) {
              throw new Error(`API Error ${res.status}: ${res.statusText}`);
          }
        }
        return res.json();
      } catch (error) {
        console.error(`API GET Error [${endpoint}]:`, error);
        throw error;
      } finally {
        // Cleanup: Remove from map so future requests can fire fresh
        inflightRequests.delete(endpoint);
      }
    })();

    inflightRequests.set(endpoint, requestPromise);
    return requestPromise;
  },

  post: async (endpoint: string, body: any) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
        mode: 'cors'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error(`API POST Error [${endpoint}]:`, error);
      throw error;
    }
  },

  put: async (endpoint: string, body: any) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
        mode: 'cors'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error(`API PUT Error [${endpoint}]:`, error);
      throw error;
    }
  },
  
  delete: async (endpoint: string) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
        mode: 'cors'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error(`API DELETE Error [${endpoint}]:`, error);
      throw error;
    }
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('grabgo_token');
    const headers: any = { 
      'ngrok-skip-browser-warning': 'true' 
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
        mode: 'cors'
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  }
};
```

**Filename: `services/geminiService.ts`**
```ts
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

const API_KEY = process.env.API_KEY || '';

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractMenuFromImage = async (imageFile: File): Promise<Partial<MenuItem>[]> => {
  if (!API_KEY) {
    console.error("API Key is missing");
    throw new Error("Gemini API Key is missing");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const base64Data = await fileToGenerativePart(imageFile);

    const prompt = `
      Analyze this menu image and extract the food items. 
      Return a JSON array where each object has:
      - name (string)
      - description (string, keep it short)
      - price (number, just the value)
      - category (string, e.g., 'Main', 'Starter', 'Drink')
      
      Ignore non-food text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as Partial<MenuItem>[];
  } catch (error) {
    console.error("Error extracting menu:", error);
    throw error;
  }
};
```

**Filename: `utils/dateTime.ts`**
```ts
// Helper to get current IST time components (Hours 0-23, Minutes 0-59)
const getCurrentIST = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    hourCycle: 'h23' // Forces 0-23 format
  });
  
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  
  return { hour, minute };
};

export const isRestaurantOpen = (hours: string | undefined): boolean => {
  if (!hours) return false; // Assume closed if no hours set
  
  try {
    const [startStr, endStr] = hours.split(' - ');
    if (!startStr || !endStr) return false;

    const parseTime = (t: string) => {
      // Handles "10:00 AM" or "10:00 PM"
      t = t.trim();
      const [time, modifier] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      
      // 12-hour format conversion
      if (h === 12 && modifier === 'AM') h = 0;
      else if (h === 12 && modifier === 'PM') h = 12; // Keep 12 PM as 12
      else if (h !== 12 && modifier === 'PM') h += 12;
      
      return h * 60 + m; // Minutes from midnight
    };

    const start = parseTime(startStr);
    const end = parseTime(endStr);
    
    // Get Current Time in IST specifically
    const ist = getCurrentIST();
    const current = ist.hour * 60 + ist.minute;

    if (end < start) {
      // Crosses midnight (e.g. 6 PM to 2 AM)
      // Open if current > start (6 PM - 11:59 PM) OR current < end (0 AM - 2 AM)
      return current >= start || current < end;
    } else {
      // Standard day (e.g. 9 AM to 9 PM)
      return current >= start && current < end;
    }
  } catch (e) {
    console.error("Error parsing time:", e);
    return false;
  }
};

// Helper to display dates in IST format
export const formatToIST = (isoDate: string) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return isoDate;
  }
};
```

**Filename: `context/StoreContext.tsx`**
```tsx
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

  // === ALGORITHM: PARALLEL INITIALIZATION ===
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem('grabgo_user');
        if (storedUser) {
          try {
              const user = JSON.parse(storedUser);
              setCurrentUser(user);
              connectCentrifugo(user);
          } catch(e) {
              console.error("Failed to parse user", e);
              localStorage.removeItem('grabgo_user');
          }
        }

        // Fetch concurrently to minimize T_total = max(T_1, T_2, T_3) instead of sum(T)
        // Using Promise.allSettled to ensure UI loads even if one API endpoint fails
        const results = await Promise.allSettled([
            api.get('/restaurants'),
            api.get('/menu'),
            localStorage.getItem('grabgo_token') ? api.get('/orders') : Promise.resolve([])
        ]);

        if (results[0].status === 'fulfilled') setRestaurants(results[0].value || []);
        if (results[1].status === 'fulfilled') setMenuItems(results[1].value || []);
        if (results[2].status === 'fulfilled') setOrders(results[2].value || []);
        
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
      
      const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
      const host = API_URL.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
      const WS_URL = `${wsProtocol}://${host}/connection/websocket`;
      
      const client = new Centrifuge(WS_URL, { token: token, debug: false });

      const handleOrderUpdate = (ctx: any) => {
        const updatedOrder = ctx.data;
        setOrders(prev => {
          const exists = prev.find(o => o.id === updatedOrder.id);
          if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          return [updatedOrder, ...prev];
        });
      };

      const userSub = client.newSubscription(`grabgo:orders_user_${user.id}`);
      userSub.on('publication', handleOrderUpdate);
      userSub.subscribe();

      if (user.role === UserRole.RESTAURANT && user.restaurantId) {
        const restSub = client.newSubscription(`grabgo:orders_restaurant_${user.restaurantId}`);
        restSub.on('publication', handleOrderUpdate);
        restSub.subscribe();
      }

      const publicSub = client.newSubscription('grabgo:general');
      publicSub.on('publication', (ctx) => {
        const data = ctx.data;
        if (data.type === 'STATUS_CHANGE') {
          setRestaurants(prev => prev.map(r => r.id === data.id ? { ...r, isOpen: data.isOpen } : r));
        } else if (data.type === 'MENU_UPDATED') {
          setMenuItems(prev => prev.map(i => i.id === data.item.id ? data.item : i));
        } else if (data.type === 'MENU_ADDED') {
          setMenuItems(prev => [...prev, data.item]);
        } else if (data.type === 'MENU_DELETED') {
          setMenuItems(prev => prev.filter(i => i.id !== data.id));
        }
      });
      publicSub.subscribe();

      client.connect();
      centrifugeRef.current = client;
    } catch (e) {
      console.warn("Real-time connection setup failed - Falling back to HTTP polling", e);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/login', { email, password: pass });
      setCurrentUser(res.user);
      localStorage.setItem('grabgo_user', JSON.stringify(res.user));
      localStorage.setItem('grabgo_token', res.token);
      
      // Eager loading orders after login
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

  // === OPTIMIZATION: MEMOIZATION ===
  // Prevents re-calculation of cart logic on every render
  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      if (prev.length > 0 && prev[0].restaurantId !== item.restaurantId) {
        if (window.confirm("Start a new cart? This will clear your current items.")) {
          return [{ ...item, quantity: 1 }];
        }
        return prev;
      }
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = async (paymentRef?: string) => {
    if (!currentUser || cart.length === 0) throw new Error("Cannot place order");
    
    // Server handles the logic, we just wait
    const order = await api.post('/orders', { 
      items: cart, 
      restaurantId: cart[0].restaurantId, 
      paymentRef 
    });
    setOrders(prev => [order, ...prev]);
    clearCart();
    return order;
  };

  // === OPTIMISTIC UI UPDATES ===
  // Update state IMMEDIATELY, then revert if server fails
  const updateOrderStatus = async (orderId: string, status: OrderStatus, pickupCode?: string) => {
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    try {
        await api.put(`/orders/${orderId}/status`, { status });
    } catch (e) {
        // Rollback on error
        setOrders(originalOrders);
        alert("Failed to update status. Please try again.");
    }
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
    // Optimistic add could be complex due to ID generation, so we wait for server response here
    // but we can show a loader in the UI component
    const newItem = await api.post('/menu', item);
  };

  const updateMenuItem = async (item: MenuItem) => {
    // Optimistic Update
    const originalItems = [...menuItems];
    setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
    
    try {
        await api.put(`/menu/${item.id}`, item);
    } catch (e) {
        setMenuItems(originalItems);
    }
  };

  const deleteMenuItem = async (id: string) => {
    const originalItems = [...menuItems];
    setMenuItems(prev => prev.filter(i => i.id !== id));
    try {
        await api.delete(`/menu/${id}`);
    } catch (e) {
        setMenuItems(originalItems);
    }
  };

  const toggleRestaurantStatus = async (restaurantId: string) => {
    const r = restaurants.find(r => r.id === restaurantId);
    if (r) {
      const newState = !r.isOpen;
      // Optimistic Update
      setRestaurants(prev => prev.map(res => res.id === restaurantId ? { ...res, isOpen: newState } : res));
      
      try {
          await api.put(`/restaurants/${restaurantId}/status`, { isOpen: newState });
      } catch (e) {
          // Revert
          setRestaurants(prev => prev.map(res => res.id === restaurantId ? { ...res, isOpen: !newState } : res));
      }
    }
  };
  
  const verifyRestaurant = async (id: string, status: boolean) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, verified: status } : r));
    await api.put(`/restaurants/${id}/verify`, { verified: status });
  };
  
  const declineRestaurant = async (id: string) => {
      setRestaurants(prev => prev.filter(r => r.id !== id));
      await api.delete(`/restaurants/${id}`);
  };

  const updateRestaurantProfile = async (id: string, data: Partial<Restaurant>) => {
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      await api.put(`/restaurants/${id}`, data);
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
```

---

### **4. React Components**

**Filename: `App.tsx`**
```tsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { UserRole } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import StudentDashboard from './components/Student/StudentDashboard';
import RestaurantView from './components/Student/RestaurantView';
import OrderHistory from './components/Student/OrderHistory';
import RestaurantDashboard from './components/Restaurant/RestaurantDashboard';
import MenuManager from './components/Restaurant/MenuManager';
import RestaurantSettings from './components/Restaurant/RestaurantSettings';
import RestaurantHistory from './components/Restaurant/RestaurantHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import Cart from './components/Student/Cart';

const ProtectedRoute = ({ children, allowedRoles }: React.PropsWithChildren<{ allowedRoles: UserRole[] }>) => {
  const { currentUser } = useStore();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { currentUser } = useStore();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Auth /> : <Navigate to="/" replace />} />
      
      {/* Root redirects based on role */}
      <Route path="/" element={
        currentUser ? (
          currentUser.role === UserRole.STUDENT ? <Navigate to="/student/restaurants" replace /> :
          currentUser.role === UserRole.RESTAURANT ? <Navigate to="/restaurant/dashboard" replace /> :
          <Navigate to="/admin" replace />
        ) : <Navigate to="/login" replace />
      } />

      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
          <Layout>
            <Routes>
              <Route path="restaurants" element={<StudentDashboard />} />
              <Route path="restaurant/:id" element={<RestaurantView />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="cart" element={<Cart />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="restaurants" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Restaurant Routes */}
      <Route path="/restaurant/*" element={
        <ProtectedRoute allowedRoles={[UserRole.RESTAURANT]}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="menu" element={<MenuManager />} />
              <Route path="settings" element={<RestaurantSettings />} />
              <Route path="history" element={<RestaurantHistory />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <AppRoutes />
      </Router>
    </StoreProvider>
  );
}
```

**Filename: `components/Layout.tsx`**
```tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import InstallPrompt from './InstallPrompt';
import { 
  Home, 
  ShoppingBag, 
  LayoutDashboard, 
  Menu as MenuIcon, 
  LogOut, 
  ShieldAlert,
  ShoppingCart,
  Settings,
  History
} from 'lucide-react';

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { currentUser, logout, isTestMode, cart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Student Layout (Responsive: Bottom Nav on Mobile, Top Nav on Desktop)
  if (currentUser?.role === UserRole.STUDENT) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0 transition-colors duration-200">
        <InstallPrompt />
        {isTestMode && (
          <div className="bg-yellow-400 text-yellow-900 text-xs text-center py-1 font-bold">
            TEST MODE ENABLED - ORDERS ARE SIMULATED
          </div>
        )}
        
        {/* Responsive Header */}
        <header className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-800/50 sticky top-0 z-30 px-4 py-3 border-b border-transparent dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Grab&Go</h1>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/student/restaurants" className={`text-sm font-medium transition ${location.pathname.includes('restaurants') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Eat</Link>
                <Link to="/student/orders" className={`text-sm font-medium transition ${location.pathname.includes('orders') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Orders</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
               <Link to="/student/cart" className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition group">
                <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                    {cart.length}
                  </span>
                )}
              </Link>
              <button onClick={handleLogout} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
                <span className="hidden md:inline">Logout</span>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
          <Link to="/student/restaurants" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('restaurants') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
            <Home size={22} />
            <span>Eat</span>
          </Link>
          <Link to="/student/orders" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('orders') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
            <ShoppingBag size={22} />
            <span>Orders</span>
          </Link>
        </nav>
      </div>
    );
  }

  // Restaurant & Admin Layout (Responsive: Sidebar on Desktop, Header + Bottom Nav on Mobile)
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-0 transition-colors duration-200">
       <InstallPrompt />
       {isTestMode && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-yellow-900 text-xs text-center py-1 font-bold md:hidden">
            TEST MODE
          </div>
        )}
      
      {/* Mobile Header */}
      <header className="bg-white dark:bg-slate-900 p-4 shadow md:hidden flex justify-between items-center sticky top-0 z-10 border-b dark:border-slate-800">
        <span className="font-bold text-indigo-600 dark:text-indigo-400">Grab&Go Panel</span>
        <button onClick={handleLogout} className="text-slate-600 dark:text-slate-300"><LogOut size={20} /></button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-black text-white min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">Grab&Go</h2>
          <p className="text-slate-400 text-sm mt-1 capitalize">{currentUser?.role.toLowerCase()} Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {currentUser?.role === UserRole.RESTAURANT && (
            <>
              <Link to="/restaurant/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('dashboard') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link to="/restaurant/menu" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('menu') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <MenuIcon size={20} />
                Menu Manager
              </Link>
              <Link to="/restaurant/history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('history') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <History size={20} />
                Order History
              </Link>
              <Link to="/restaurant/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('settings') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <Settings size={20} />
                Settings
              </Link>
            </>
          )}

          {currentUser?.role === UserRole.ADMIN && (
            <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname.includes('admin') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              <ShieldAlert size={20} />
              Admin Overview
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white transition w-full px-4 py-2">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full text-slate-900 dark:text-slate-100">
        {children}
      </main>

      {/* Mobile Bottom Nav for Restaurant/Admin */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
         {currentUser?.role === UserRole.RESTAURANT && (
            <>
              <Link to="/restaurant/dashboard" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('dashboard') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                <LayoutDashboard size={22} />
                <span>Home</span>
              </Link>
              <Link to="/restaurant/menu" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('menu') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                <MenuIcon size={22} />
                <span>Menu</span>
              </Link>
              <Link to="/restaurant/history" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('history') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                <History size={22} />
                <span>History</span>
              </Link>
              <Link to="/restaurant/settings" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('settings') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                <Settings size={22} />
                <span>Settings</span>
              </Link>
            </>
          )}
          {currentUser?.role === UserRole.ADMIN && (
             <Link to="/admin" className={`flex flex-col items-center gap-1 text-xs ${location.pathname.includes('admin') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
              <ShieldAlert size={22} />
              <span>Overview</span>
            </Link>
          )}
      </nav>
    </div>
  );
};

export default Layout;
```

**Filename: `components/Auth.tsx`**
```tsx
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { Lock, Mail, User as UserIcon, Phone, Key, ArrowRight, Loader2, Store, Clock, CreditCard, ShieldAlert } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../services/api';

export default function Auth() {
  const { login, signup, recoverPassword } = useStore();
  const [view, setView] = useState<'login' | 'signup' | 'recover'>('login');
  
  // Google Onboarding State
  const [googleOnboarding, setGoogleOnboarding] = useState<{ active: boolean, email?: string, name?: string, sub?: string }>({ active: false });
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<UserRole | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Admin Mode State
  const [secretCount, setSecretCount] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [restaurantName, setRestaurantName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('Pet');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Restaurant Details (Hours as separate times)
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [upiId, setUpiId] = useState('');
  
  // Rate Limit State
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Helper to format time (09:00 -> 9:00 AM)
  const formatTime = (time: string) => {
     if(!time) return '';
     const [h, m] = time.split(':');
     const hour = parseInt(h);
     const ampm = hour >= 12 ? 'PM' : 'AM';
     const hour12 = hour % 12 || 12;
     return `${hour12}:${m} ${ampm}`;
  };

  // 1. Google Success Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      
      if (res.isNewUser) {
        // Start Onboarding Flow
        setGoogleOnboarding({ active: true, email: res.email, name: res.name, sub: res.googleSub });
        setError('');
      } else {
        // Log in immediately
        localStorage.setItem('grabgo_user', JSON.stringify(res.user));
        localStorage.setItem('grabgo_token', res.token);
        window.location.reload(); // Simple reload to refresh context
      }
    } catch (err: any) {
      setError(err.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Role Selection & Completion
  const completeGoogleSignup = async () => {
    if (!selectedGoogleRole) return;
    
    let hoursStr = '';
    // Validation for Restaurant
    if (selectedGoogleRole === UserRole.RESTAURANT) {
        if (!restaurantName || !upiId || !openTime || !closeTime) {
            setError("Please fill all restaurant details");
            return;
        }
        hoursStr = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
    }

    setLoading(true);
    try {
        const res = await api.post('/auth/google/complete', {
            email: googleOnboarding.email,
            name: googleOnboarding.name,
            role: selectedGoogleRole,
            googleSub: googleOnboarding.sub,
            // Restaurant specifics
            restaurantName,
            hours: hoursStr,
            upiId
        });
        
        localStorage.setItem('grabgo_user', JSON.stringify(res.user));
        localStorage.setItem('grabgo_token', res.token);
        window.location.reload();
    } catch (err) {
        setError('Failed to complete signup');
    } finally {
        setLoading(false);
    }
  };

  // Handles both secret admin trigger AND normal submission
  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Secret Admin Trigger Logic
    if (!isAdminMode) {
        const newCount = secretCount + 1;
        setSecretCount(newCount);
        
        if (newCount === 5) {
            setIsAdminMode(true);
            setView('login');
            setEmail('');
            setPassword('');
            setError("Enter Admin Credentials");
            setSecretCount(0);
            return;
        }
    }

    // 2. Normal Validation Logic
    if (view === 'login') {
        if (!email || !password) {
            if (isAdminMode || secretCount === 1) setError('Please enter email and password');
            return;
        }
    } else if (view === 'signup') {
         // Should not happen if button is hidden, but safety check
         return;
    }

    // 3. Submission (Login/Signup)
    setError('');
    setLoading(true);
    setIsRateLimited(false);

    try {
      if (view === 'login') {
        const success = await login(email, password);
        if (!success) setError('Invalid credentials');
      } else if (view === 'recover') {
        const success = await recoverPassword(email, securityAnswer, newPassword);
        if (success) {
          alert('Password reset successful. Please login.');
          setView('login');
        } else {
          setError('Verification failed. Check your email and security answer.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- THEME CLASSES ---
  const containerClass = isAdminMode 
    ? "min-h-screen bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-slate-950 flex items-center justify-center p-4 transition-all duration-500"
    : "min-h-screen bg-gradient-to-br from-indigo-100 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-all duration-500";

  const buttonClass = isAdminMode
    ? "w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none"
    : "w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 active:scale-95";

  const textAccent = isAdminMode ? "text-orange-600 dark:text-orange-500" : "text-indigo-600 dark:text-indigo-400";
  const iconColor = isAdminMode ? "text-orange-500" : "text-slate-400";

  // --- RENDER GOOGLE ONBOARDING ---
  if (googleOnboarding.active) {
      return (
        <div className={containerClass}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome, {googleOnboarding.name}!</h2>
                <p className="text-slate-500 mb-6">Let's finish setting up your account.</p>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                {!selectedGoogleRole ? (
                    <div className="space-y-4">
                        <p className="font-medium text-slate-700 dark:text-slate-300">I am a...</p>
                        <button onClick={() => setSelectedGoogleRole(UserRole.STUDENT)} className="w-full p-4 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center gap-4">
                            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><UserIcon /></div>
                            <div className="text-left"><div className="font-bold text-slate-900 dark:text-white">Student</div><div className="text-xs text-slate-500">I want to order food</div></div>
                        </button>
                        <button onClick={() => setSelectedGoogleRole(UserRole.RESTAURANT)} className="w-full p-4 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center gap-4">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Store /></div>
                            <div className="text-left"><div className="font-bold text-slate-900 dark:text-white">Restaurant</div><div className="text-xs text-slate-500">I want to sell food</div></div>
                        </button>
                    </div>
                ) : selectedGoogleRole === UserRole.RESTAURANT ? (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <h3 className="font-bold text-indigo-600">Restaurant Details</h3>
                        <input type="text" placeholder="Restaurant Name" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
                        
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="text-xs text-slate-500 block mb-1">Opens At</label>
                                <input type="time" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white" value={openTime} onChange={e => setOpenTime(e.target.value)} />
                             </div>
                             <div>
                                <label className="text-xs text-slate-500 block mb-1">Closes At</label>
                                <input type="time" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
                             </div>
                        </div>

                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="text" placeholder="UPI ID (e.g. shop@okicici)" className="w-full pl-10 p-2 border rounded dark:bg-slate-800 dark:text-white" value={upiId} onChange={e => setUpiId(e.target.value)} />
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setSelectedGoogleRole(null)} className="flex-1 py-2 text-slate-500">Back</button>
                            <button onClick={completeGoogleSignup} disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded">{loading ? 'Saving...' : 'Complete Setup'}</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4 animate-in slide-in-from-right">
                         <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-indigo-800 dark:text-indigo-200 text-sm">
                            Creating your Student account linked to <b>{googleOnboarding.email}</b>.
                         </div>
                         <div className="flex gap-2 mt-4">
                            <button onClick={() => setSelectedGoogleRole(null)} className="flex-1 py-2 text-slate-500">Back</button>
                            <button onClick={completeGoogleSignup} disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded">{loading ? 'Creating...' : 'Confirm'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )
  }

  // --- RENDER STANDARD AUTH ---
  return (
    <div className={containerClass}>
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 border transition-all duration-300 ${isAdminMode ? 'border-orange-500 shadow-orange-500/20' : 'border-transparent dark:border-slate-800'} ${isRateLimited ? 'ring-4 ring-red-200 dark:ring-red-900' : ''}`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            {isAdminMode && <ShieldAlert size={48} className="text-orange-500 animate-bounce" />}
          </div>
          <h1 
            className={`text-3xl font-bold ${textAccent} mb-2 cursor-pointer select-none`}
          >
            {isAdminMode ? 'Admin Portal' : 'Grab&Go'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdminMode 
                ? 'Authorized Personnel Only' 
                : (view === 'login' ? 'Welcome back! Hungry?' : view === 'signup' ? 'Create your account' : 'Recover Password')
            }
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded-lg text-sm mb-6 text-center animate-pulse ${isAdminMode ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}>
            {error}
          </div>
        )}

        {/* GOOGLE BUTTON (Hide in Admin Mode, show in Login AND Signup) */}
        {(view === 'login' || view === 'signup') && !isAdminMode && (
             <div className={`mb-6 p-1 rounded-lg transition ${isRateLimited ? 'bg-indigo-100 dark:bg-indigo-900/40 p-2 scale-105 shadow-md' : ''}`}>
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="outline"
                        size="large"
                        width="100%"
                        text={view === 'signup' ? "signup_with" : "signin_with"}
                    />
                </div>
                {isRateLimited && (
                    <p className="text-xs text-center text-indigo-600 dark:text-indigo-400 mt-2 font-bold">
                        Please use Google Sign-In to continue.
                    </p>
                )}
                {/* Only show "continue with email" separator on Login screen */}
                {view === 'login' && (
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span></div>
                    </div>
                )}
             </div>
        )}

        {/* Manual Auth Form - Only for Login and Recover, NOT Signup */}
        <form className="space-y-4">
          
          {/* Message for Signup View */}
          {view === 'signup' && (
              <div className="text-center text-slate-500 dark:text-slate-400 py-4 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                  <p>We now exclusively use Google for secure account creation.</p>
                  <p className="mt-2 text-xs">Existing email users can still log in below.</p>
              </div>
          )}

          {/* Input Fields (Hidden on Signup) */}
          {view !== 'signup' && (
            <>
                <div className="relative">
                    <Mail className={`absolute left-3 top-3 ${iconColor}`} size={18} />
                    <input type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                {view !== 'recover' && (
                    <div className="relative">
                    <Lock className={`absolute left-3 top-3 ${iconColor}`} size={18} />
                    <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                )}

                {view === 'recover' && (
                    <>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                        <select className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)}>
                        <option value="Pet">Security Question: First Pet's Name?</option>
                        <option value="City">Security Question: Birth City?</option>
                        <option value="Color">Security Question: Favorite Color?</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="text" placeholder="Security Answer" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="password" placeholder="New Password" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    </>
                )}

                <button 
                    type="button" 
                    onClick={handleSmartSubmit}
                    disabled={loading} 
                    className={buttonClass}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        {view === 'login' ? (isAdminMode ? 'Admin Login' : 'Sign In') : 'Reset Password'}
                        <ArrowRight size={18} />
                    </>
                    )}
                </button>
            </>
          )}
        </form>
        
        {isAdminMode ? (
            <div className="mt-6 text-center">
                <button onClick={() => { setIsAdminMode(false); setError(''); }} className="text-sm text-slate-500 hover:text-orange-600 underline">
                    Exit Admin Mode
                </button>
            </div>
        ) : (
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
              {view === 'login' ? (
                <>
                  <p>New here? <button onClick={() => setView('signup')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</button></p>
                  <p>Forgot password? <button onClick={() => setView('recover')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Reset it</button></p>
                </>
              ) : (
                <p>Already have an account? <button onClick={() => setView('login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Log in</button></p>
              )}
            </div>
        )}
      </div>
    </div>
  );
}
```

**Filename: `components/InstallPrompt.tsx`**
```tsx
import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-indigo-600 dark:bg-indigo-500 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-4 max-w-sm">
        <div className="bg-white/20 p-2 rounded-lg">
            <Download size={24} />
        </div>
        <div>
            <h4 className="font-bold text-sm">Install App</h4>
            <p className="text-xs text-indigo-100">Add to home screen for better experience.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleInstallClick}
                className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition"
            >
                Install
            </button>
            <button 
                onClick={() => setIsVisible(false)}
                className="text-indigo-200 hover:text-white transition"
            >
                <X size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **5. Student Components**

**Filename: `components/Student/StudentDashboard.tsx`**
```tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Search, MapPin, Clock } from 'lucide-react';
import { isRestaurantOpen } from '../../utils/dateTime';

export default function StudentDashboard() {
  const { restaurants } = useStore();
  const [search, setSearch] = useState('');

  // === OPTIMIZATION: MEMOIZATION ===
  // Filter complexity is O(N). By memoizing, we prevent re-computation 
  // on every render unless 'restaurants' or 'search' string changes.
  const filteredRestaurants = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return restaurants.filter(r => 
      r.verified && 
      (r.name.toLowerCase().includes(lowerSearch) || 
       r.cuisine.some(c => c.toLowerCase().includes(lowerSearch)))
    );
  }, [restaurants, search]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-2xl mx-auto md:mx-0">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search food or restaurants..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 transition-colors"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => {
          const isTimeOpen = isRestaurantOpen(restaurant.hours);
          const isOpen = restaurant.isOpen;

          return (
            <Link to={`/student/restaurant/${restaurant.id}`} key={restaurant.id} className={`block bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-800/50 overflow-hidden transition hover:shadow-md hover:-translate-y-1 ${!isOpen ? 'opacity-80 grayscale-[0.5]' : ''}`}>
              <div className="h-40 w-full relative">
                {/* === OPTIMIZATION: LAZY LOADING & ASYNC DECODING === */}
                {/* 'loading="lazy"' defers loading until near viewport. */}
                {/* 'decoding="async"' moves image decoding off the main thread. */}
                <img 
                  src={restaurant.imageUrl} 
                  alt={restaurant.name} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover" 
                />
                {!isOpen && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {isTimeOpen ? 'Offline' : 'Closed'}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{restaurant.name}</h3>
                  {isOpen && (
                     <span className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                       <Clock size={12} /> 15-20 min
                     </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-1">{restaurant.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  {restaurant.cuisine.map(c => (
                    <span key={c} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">{c}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
        {filteredRestaurants.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400 dark:text-slate-500">
            <p>No restaurants found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Filename: `components/Student/RestaurantView.tsx`**
```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import { isRestaurantOpen } from '../../utils/dateTime';

export default function RestaurantView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restaurants, menuItems, addToCart, cart, updateCartQuantity, removeFromCart } = useStore();
  
  const restaurant = restaurants.find(r => r.id === id);
  // We show all items, but disable unavailable ones
  const items = menuItems.filter(m => m.restaurantId === id);

  if (!restaurant) return <div>Restaurant not found</div>;

  const getItemQuantity = (itemId: string) => {
    return cart.find(c => c.id === itemId)?.quantity || 0;
  };

  const handleAdd = (item: any) => {
    addToCart(item);
  };

  const handleRemove = (itemId: string) => {
    updateCartQuantity(itemId, -1);
  };

  // Logic: Restaurant is open if (Manually Open IN DB) AND (Currently within Operating Hours)
  
  const isWithinHours = isRestaurantOpen(restaurant.hours);
  const isOpen = restaurant.isOpen;

  return (
    <div className="pb-20 md:pb-0 relative min-h-[80vh]">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
        <ArrowLeft size={16} /> Back to Restaurants
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{restaurant.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">{restaurant.description}</p>
        <div className="flex gap-2 mt-3">
             {restaurant.cuisine.map(c => (
                  <span key={c} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">{c}</span>
             ))}
        </div>
        {restaurant.hours && (
            <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded">
                    Hours: {restaurant.hours}
                </p>
                {!isWithinHours && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded dark:bg-orange-900/30 dark:text-orange-400">
                        Currently outside hours
                    </span>
                )}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {items.map(item => {
          const qty = getItemQuantity(item.id);
          const isAvailable = item.isAvailable;
          
          return (
            <div key={item.id} className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center border border-transparent dark:border-slate-800 hover:border-indigo-50 dark:hover:border-indigo-900/50 ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex-1 pr-4">
                <div className="flex justify-between items-start">
                   <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{item.name}</h3>
                   <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded text-sm">₹{item.price.toFixed(2)}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{item.description}</p>
                <div className="flex gap-2 mt-2">
                    <span className="inline-block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                    {item.category}
                    </span>
                    {!isAvailable && (
                        <span className="inline-block text-[10px] uppercase tracking-wider text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded font-bold">
                        Sold Out
                        </span>
                    )}
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 pl-2 border-l border-slate-50 dark:border-slate-800">
                {qty === 0 ? (
                  <button 
                    onClick={() => handleAdd(item)}
                    disabled={!isOpen || !isAvailable}
                    className={`p-2 rounded-full shadow-sm transition ${isOpen && isAvailable ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                  >
                    <Plus size={24} />
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-1 shadow-inner dark:shadow-none">
                    <button onClick={() => handleAdd(item)} disabled={!isAvailable} className="p-1 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition disabled:opacity-50"><Plus size={18} /></button>
                    <span className="font-bold text-sm text-indigo-900 dark:text-indigo-100 w-6 text-center">{qty}</span>
                    <button onClick={() => handleRemove(item.id)} className="p-1 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition"><Minus size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {!isOpen && (
        <div className="fixed bottom-20 left-4 right-4 md:static md:mt-8 bg-red-500 text-white text-center py-3 rounded-lg shadow-lg font-medium">
          {isWithinHours 
            ? "Restaurant is currently set to OFFLINE by owner." 
            : `Closed. Opens at ${restaurant.hours?.split(' - ')[0] || 'Unknown'}`
          }
        </div>
      )}
    </div>
  );
}
```

**Filename: `components/Student/Cart.tsx`**
```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Trash2, QrCode, ArrowRight, Loader2, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, placeOrder, clearCart, restaurants } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'payment'>('review');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | null>(null);
  const [upiRef, setUpiRef] = useState('');
  const [isDeepLinkOpened, setIsDeepLinkOpened] = useState(false);

  const restaurant = cart.length > 0 ? restaurants.find(r => r.id === cart[0].restaurantId) : null;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'upi' && !upiRef) {
      alert("Please enter your UPI ID");
      return;
    }
    setLoading(true);
    try {
      await placeOrder(upiRef);
      navigate('/student/orders');
    } catch (e) {
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Generate UPI Deep Link
  const getDeepLink = () => {
      if (!restaurant?.upiId) return '';
      const pa = restaurant.upiId;
      const pn = encodeURIComponent(restaurant.name);
      const am = total.toFixed(2);
      const cu = 'INR';
      // Format: upi://pay?pa=...&pn=...&am=...&cu=INR
      return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}`;
  };
  
  const handleDeepLinkClick = () => {
      setIsDeepLinkOpened(true);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 dark:text-slate-500">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <Trash2 size={40} />
        </div>
        <p className="text-lg font-medium">Your cart is empty</p>
        <button onClick={() => navigate('/student/restaurants')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium">Browse Restaurants</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Checkout</h1>
      
      {step === 'review' ? (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden mb-6 border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
              <span className="font-medium text-indigo-900 dark:text-indigo-300">{restaurant?.name}</span>
              <button onClick={clearCart} className="text-xs text-red-500 dark:text-red-400 font-medium hover:underline">Clear All</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cart.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-1.5 rounded">{item.quantity}x</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-slate-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="font-medium text-slate-600 dark:text-slate-400">Total</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => setStep('payment')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center gap-2">
            Proceed to Payment <ArrowRight size={20} />
          </button>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Select Payment Method</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center gap-4 p-4 rounded-lg border transition ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600 dark:border-indigo-500 dark:ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
              >
                <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-sm"><QrCode size={24} className="text-slate-700 dark:text-slate-200" /></div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-white">UPI / QR</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Scan or Pay via App</p>
                </div>
              </button>
            </div>
          </div>

          {paymentMethod === 'upi' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
              <div className="bg-white p-4 mx-auto rounded-xl flex items-center justify-center mb-4 w-fit shadow-sm border border-slate-100">
                {getDeepLink() ? (
                    <QRCode 
                        value={getDeepLink()} 
                        size={180}
                        viewBox={`0 0 256 256`}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                ) : (
                    <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                        Invalid UPI Config
                    </div>
                )}
              </div>
              <p className="font-mono text-xs text-slate-500 mb-4">{restaurant?.upiId || 'No UPI ID'}</p>
              
              <div className="mb-6">
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">On Mobile?</p>
                   <a 
                     href={getDeepLink()}
                     onClick={handleDeepLinkClick}
                     className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-4 py-2 rounded-full font-medium hover:bg-indigo-200 transition"
                   >
                     <Smartphone size={16} /> Pay via UPI App
                   </a>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Total Amount: <span className="font-bold text-slate-900 dark:text-white">₹{total.toFixed(2)}</span></p>
              
              {isDeepLinkOpened ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                         Payment Verification
                     </label>
                     <input 
                        type="text" 
                        placeholder="Enter your UPI ID (e.g. name@bank)" 
                        className="w-full max-w-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none mx-auto block"
                        value={upiRef}
                        onChange={e => setUpiRef(e.target.value)}
                    />
                     <p className="text-xs text-slate-400 mt-2">Enter the UPI ID you used to make the payment.</p>
                  </div>
              ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      Please scan or click "Pay via UPI App" first to proceed.
                  </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('review')} className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Back</button>
            <button 
              onClick={handlePlaceOrder}
              disabled={!paymentMethod || loading || (paymentMethod === 'upi' && !upiRef)}
              className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Filename: `components/Student/OrderHistory.tsx`**
```tsx
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { formatToIST } from '../../utils/dateTime';

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const colors = {
    [OrderStatus.PENDING]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200',
    [OrderStatus.ACCEPTED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200',
    [OrderStatus.READY]: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200 animate-pulse',
    [OrderStatus.COMPLETED]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
      {status}
    </span>
  );
};

export default function OrderHistory() {
  const { orders, restaurants, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const myOrders = orders.filter(o => o.userId === currentUser?.id);
  
  const activeOrders = myOrders.filter(o => [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.READY].includes(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const historyOrders = myOrders.filter(o => [OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'active' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                  Active
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                  History
              </button>
          </div>
      </div>
      
      {displayedOrders.length === 0 ? (
        <div className="text-center text-slate-400 dark:text-slate-500 py-10">
            {activeTab === 'active' ? "No active orders. Hungry?" : "No past orders found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedOrders.map(order => {
            const restaurant = restaurants.find(r => r.id === order.restaurantId);
            const isActive = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.READY].includes(order.status);
            
            return (
              <div key={order.id} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 overflow-hidden flex flex-col justify-between transition-colors ${isActive ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{restaurant?.name || 'Unknown Restaurant'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatToIST(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                    {order.items.map(i => (
                        <div key={i.id} className="flex justify-between">
                            <span>{i.name}</span>
                            <span className="font-medium text-slate-400 dark:text-slate-500">x{i.quantity}</span>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 pt-0">
                    <span className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</span>
                    
                    {isActive ? (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-indigo-100 dark:border-indigo-900/30">
                         <span className="text-xs text-indigo-700 dark:text-indigo-300 uppercase font-bold">Pickup Code</span>
                         <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{order.pickupCode}</span>
                      </div>
                    ) : (
                       <span className="text-xs text-slate-400">ID: {order.id.slice(-6)}</span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

### **6. Restaurant Components**

**Filename: `components/Restaurant/RestaurantDashboard.tsx`**
```tsx
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, Order } from '../../types';
import { Check, Clock, BellRing, User, Power, HelpCircle } from 'lucide-react';

const OrderCard: React.FC<{ order: Order; action?: React.ReactNode }> = ({ order, action }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-3 animate-in fade-in slide-in-from-bottom-2">
    <div className="flex justify-between items-start mb-2">
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">#{order.id.slice(-4)}</span>
      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">₹{order.totalAmount.toFixed(2)}</span>
    </div>
    <div className="space-y-1 mb-3">
      {order.items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="text-slate-700 dark:text-slate-200">{item.name}</span>
          <span className="font-bold text-slate-500 dark:text-slate-400">x{item.quantity}</span>
        </div>
      ))}
    </div>
    {order.transactionRef && (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs p-2 rounded mb-3">
        UPI Ref: {order.transactionRef}
      </div>
    )}
    {action}
  </div>
);

export default function RestaurantDashboard() {
  const { currentUser, orders, restaurants, updateOrderStatus, verifyPickup, toggleRestaurantStatus } = useStore();
  const [verifyCode, setVerifyCode] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const myRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId);
  const myOrders = orders.filter(o => o.restaurantId === currentUser?.restaurantId);
  const pending = myOrders.filter(o => o.status === OrderStatus.PENDING);
  const accepted = myOrders.filter(o => o.status === OrderStatus.ACCEPTED);
  const ready = myOrders.filter(o => o.status === OrderStatus.READY);

  const handleGlobalVerify = (e: React.FormEvent) => {
      e.preventDefault();
      // Find order with this code that is READY
      const targetOrder = ready.find(o => o.pickupCode === verifyCode);
      
      if (targetOrder) {
          if (verifyPickup(targetOrder.id, verifyCode)) {
              alert(`Order #${targetOrder.id.slice(-4)} Verified & Completed!`);
              setVerifyCode('');
          }
      } else {
          alert("Invalid Code or Order not Ready!");
      }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Board</h1>
             
             {/* Open/Close Toggle */}
             {myRestaurant && (
               <button 
                onClick={() => toggleRestaurantStatus(myRestaurant.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition shadow-sm ${myRestaurant.isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
               >
                 <Power size={18} />
                 {myRestaurant.isOpen ? 'ONLINE' : 'OFFLINE'}
               </button>
             )}
          </div>
          
          {/* Global Verification Input */}
          <form onSubmit={handleGlobalVerify} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm w-full lg:w-auto">
              <input 
                  type="text" 
                  maxLength={5}
                  placeholder="Verify 5-Digit Pickup Code"
                  className="bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 px-2 font-mono"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
              />
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition">
                  <Check size={18} />
              </button>
          </form>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {/* Pending Column */}
        <div className="min-w-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-lg text-orange-600 dark:text-orange-300"><Clock size={20} /></div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Incoming ({pending.length})</h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl min-h-[500px] border border-transparent dark:border-slate-800">
            {pending.map(order => (
              <OrderCard key={order.id} order={order} action={
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateOrderStatus(order.id, OrderStatus.CANCELLED)} className="flex-1 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 font-medium text-sm transition">Decline</button>
                  <button onClick={() => updateOrderStatus(order.id, OrderStatus.ACCEPTED)} className="flex-1 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm transition">Accept</button>
                </div>
              } />
            ))}
            {pending.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">No new orders</p>}
          </div>
        </div>

        {/* Preparation Column */}
        <div className="min-w-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-300"><User size={20} /></div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Preparing ({accepted.length})</h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl min-h-[500px] border border-transparent dark:border-slate-800">
            {accepted.map(order => (
              <OrderCard key={order.id} order={order} action={
                <button onClick={() => updateOrderStatus(order.id, OrderStatus.READY)} className="w-full mt-2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition">
                  <BellRing size={16} /> Mark Ready
                </button>
              } />
            ))}
          </div>
        </div>

        {/* Ready / Verification Column */}
        <div className="min-w-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg text-green-600 dark:text-green-300"><Check size={20} /></div>
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Ready for Pickup ({ready.length})</h2>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl min-h-[500px] border border-transparent dark:border-slate-800">
             {ready.map(order => (
              <OrderCard key={order.id} order={order} action={
                 <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-center border-l-4 border-indigo-500">
                    <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
                        <HelpCircle size={16} />
                        <span>Verify Pickup</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Ask student for code</p>
                 </div>
              } />
            ))}
            {ready.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">No ready orders</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Filename: `components/Restaurant/MenuManager.tsx`**
```tsx
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { extractMenuFromImage } from '../../services/geminiService';
import { MenuItem } from '../../types';
import { Plus, Trash2, Edit2, Sparkles, Loader2, Upload, Power, CheckCircle2, XCircle } from 'lucide-react';

export default function MenuManager() {
  const { currentUser, menuItems, addMenuItem, deleteMenuItem, updateMenuItem } = useStore();
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myItems = menuItems.filter(m => m.restaurantId === currentUser?.restaurantId);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({ name: '', description: '', price: 0, category: 'Main' });

  const handleAIUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAIProcessing(true);
    try {
      const extractedItems = await extractMenuFromImage(file);
      if (extractedItems.length > 0) {
        if(window.confirm(`AI found ${extractedItems.length} items. Import them?`)) {
            extractedItems.forEach(item => {
                if (item.name && item.price && currentUser?.restaurantId) {
                    addMenuItem({
                        name: item.name,
                        description: item.description || '',
                        price: item.price,
                        category: item.category || 'Main',
                        restaurantId: currentUser.restaurantId,
                        isAvailable: true
                    });
                }
            });
        }
      } else {
        alert("Could not identify menu items. Please try a clearer image.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze menu image.");
    } finally {
      setIsAIProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.restaurantId) {
      if (editingId) {
        // Preserve availability status when editing other fields
        const existingItem = myItems.find(i => i.id === editingId);
        updateMenuItem({ ...formData, id: editingId, restaurantId: currentUser.restaurantId, isAvailable: existingItem?.isAvailable ?? true } as MenuItem);
      } else {
        addMenuItem({ ...formData, restaurantId: currentUser.restaurantId, isAvailable: true } as MenuItem);
      }
      setFormData({ name: '', description: '', price: 0, category: 'Main' });
      setEditingId(null);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData(item);
  };
  
  const toggleAvailability = (item: MenuItem) => {
      updateMenuItem({ ...item, isAvailable: !item.isAvailable });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Menu List */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Menu</h1>
          <button onClick={() => fileInputRef.current?.click()} disabled={isAIProcessing} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-2">
            {isAIProcessing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            AI Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAIUpload} className="hidden" accept="image/*" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Item</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Price</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myItems.map(item => (
                <tr key={item.id} className={`transition-colors ${!item.isAvailable ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <td className="px-6 py-4">
                    <div className={`font-medium text-slate-900 dark:text-slate-200 ${!item.isAvailable ? 'line-through text-slate-500' : ''}`}>{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.category}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">₹{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleAvailability(item)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition ${
                            item.isAvailable 
                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                          {item.isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(item)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"><Edit2 size={16} /></button>
                      <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {myItems.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">No items yet. Add manually or use AI Import.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Form */}
      <div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-8">
          <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>
               <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>
            
            <div className="pt-2 flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: 0, category: 'Main' }); }} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Filename: `components/Restaurant/RestaurantSettings.tsx`**
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Save, Store, Clock, CreditCard, Image as ImageIcon, Loader2, Upload } from 'lucide-react';

export default function RestaurantSettings() {
  const { currentUser, restaurants, updateRestaurantProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Find current restaurant data
  const myRestaurant = restaurants.find(r => r.id === currentUser?.restaurantId);

  // Time States
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('22:00');

  const [formData, setFormData] = useState({
      name: '',
      upiId: '',
      imageUrl: ''
  });

  // Helpers for time conversion
  const to24 = (t: string) => {
    if(!t) return '10:00';
    const [time, modifier] = t.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const formatTime = (time: string) => {
     if(!time) return '';
     const [h, m] = time.split(':');
     const hour = parseInt(h);
     const ampm = hour >= 12 ? 'PM' : 'AM';
     const hour12 = hour % 12 || 12;
     return `${hour12}:${m} ${ampm}`;
  };

  useEffect(() => {
      if (myRestaurant) {
          setFormData({
              name: myRestaurant.name || '',
              upiId: myRestaurant.upiId || '',
              imageUrl: myRestaurant.imageUrl || ''
          });
          
          if(myRestaurant.hours && myRestaurant.hours.includes(' - ')) {
              const [start, end] = myRestaurant.hours.split(' - ');
              setOpenTime(to24(start));
              setCloseTime(to24(end));
          }
      }
  }, [myRestaurant]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
          const res = await api.uploadFile(file);
          setFormData(prev => ({ ...prev, imageUrl: res.url }));
      } catch (e) {
          alert("Failed to upload image");
      } finally {
          setUploading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!myRestaurant) return;

      setLoading(true);
      setSuccess(false);
      
      const hoursStr = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
      
      try {
          await updateRestaurantProfile(myRestaurant.id, {
              ...formData,
              hours: hoursStr
          });
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
          alert("Failed to update settings");
      } finally {
          setLoading(false);
      }
  };

  if (!myRestaurant) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Restaurant Settings</h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Cover Image Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cover Image</label>
                    <div className="h-48 w-full rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                type="button" 
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-100 transition"
                            >
                                {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                                Upload New
                            </button>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Form Fields */}
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Restaurant Name</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Time</label>
                             <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="time" 
                                    required
                                    value={openTime}
                                    onChange={e => setOpenTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                             </div>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Closing Time</label>
                             <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="time" 
                                    required
                                    value={closeTime}
                                    onChange={e => setCloseTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                             </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">UPI ID (for payments)</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required
                                placeholder="merchant@upi"
                                value={formData.upiId}
                                onChange={e => setFormData({...formData, upiId: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {success && <span className="text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in">Settings Saved Successfully!</span>}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
```

**Filename: `components/Restaurant/RestaurantHistory.tsx`**
```tsx
import React from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import { formatToIST } from '../../utils/dateTime';

export default function RestaurantHistory() {
  const { currentUser, orders } = useStore();
  
  // Filter for completed or cancelled orders for this restaurant
  const historyOrders = orders.filter(o => 
      o.restaurantId === currentUser?.restaurantId && 
      (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order History</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {historyOrders.length === 0 ? (
           <div className="p-8 text-center text-slate-400">No past orders found.</div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                 <tr>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Date</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Order ID</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Items</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Total</th>
                   <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {historyOrders.map(order => (
                   <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                       {formatToIST(order.createdAt)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-500">
                       #{order.id.slice(-6)}
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                       <div className="max-w-xs truncate">
                         {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                       ₹{order.totalAmount.toFixed(2)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                         order.status === OrderStatus.COMPLETED 
                           ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                           : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                       }`}>
                         {order.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>
    </div>
  );
}
```

---

### **7. Admin Dashboard**

**Filename: `components/Admin/AdminDashboard.tsx`**
```tsx
import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, TrendingUp, Users, Store, XCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminDashboard() {
  const { restaurants, orders, users, isTestMode, toggleTestMode, verifyRestaurant, declineRestaurant } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Calculate Real Chart Data (Last 7 Days)
  const chartData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateKey = d.toLocaleDateString(); // Matches local date format
      
      // Count orders created on this specific date
      const count = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === dateKey).length;
      
      chartData.push({ name: dayName, orders: count });
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
        <button 
          onClick={toggleTestMode} 
          className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isTestMode ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
          {isTestMode ? 'Test Mode: ON' : 'Enable Test Mode'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Total Orders" value={orders.length} icon={ShieldCheck} color="bg-indigo-500" />
        <StatCard title="Active Users" value={users.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Restaurants" value={restaurants.length} icon={Store} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Weekly Order Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Pending Approvals</h3>
          <div className="space-y-4">
            {restaurants.filter(r => !r.verified).map(r => (
              <div key={r.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={r.imageUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{r.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {r.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                          if(window.confirm(`Are you sure you want to decline ${r.name}? This will delete the restaurant entry.`)) {
                              declineRestaurant(r.id);
                          }
                      }}
                      className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center gap-1"
                    >
                      <XCircle size={16} /> Decline
                    </button>
                    <button 
                      onClick={() => verifyRestaurant(r.id, true)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                </div>
              </div>
            ))}
             {restaurants.filter(r => !r.verified).length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 py-8">All pending requests approved.</div>
             )}
          </div>
        </div>
      </div>

      {/* Active Restaurants List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Active Restaurants (Live on Dashboard)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.filter(r => r.verified).map(r => (
                 <div key={r.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <img src={r.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{r.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                {r.isOpen ? <span className="text-green-500">● Open</span> : <span className="text-red-500">● Closed</span>}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button 
                            onClick={() => verifyRestaurant(r.id, false)}
                            className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex flex-col items-center gap-1 text-xs"
                            title="Hide Restaurant from Dashboard"
                        >
                            <EyeOff size={20} />
                            <span>Hide</span>
                        </button>
                    </div>
                 </div>
            ))}
            {restaurants.filter(r => r.verified).length === 0 && (
                <div className="col-span-full text-center text-slate-400 dark:text-slate-500 py-8">No active restaurants found.</div>
            )}
        </div>
      </div>
    </div>
  );
}
```

---

### **8. Backend Logic**

**Filename: `server.js`**
```javascript
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super_secret_campus_key';

// --- CENTRIFUGO CONFIG ---
const CENTRIFUGO_API_KEY = 'yxrscKEyV2iBp5B8XnPaduwCuqQwOxopt9gzTF1AGIDUBmE4WA4HCq-RcTjAF85IbsDBxEekxmhlyRzU1MQmlg';
const CENTRIFUGO_SECRET = 'ijKhdtFxrrBiDeFY295DF6EAKe_DbM1jcHoz7ydHxmRjwm8sYZXvWAttbuSQTGVtNUkbiYV1WK58x-6FA7RBog';
const CENTRIFUGO_API_URL = 'http://127.0.0.1:8000/api';

// Secure Admin Credentials
const ADMIN_CONFIG = {
    email: 'admin@grabandgo.com',
    password: 'Universe2007$',
    securityAnswer: 'fluffy'
};

// --- CORS CONFIG ---
// We allow all origins (*) and explicitly list common headers to bypass Ngrok warnings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Log incoming requests for easier debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('origin')}`);
    next();
});

// --- FILE UPLOAD SETUP ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'img-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Setup
const db = new sqlite3.Database('./grabgo.db', (err) => {
  if (err) console.error("Error opening database:", err.message);
  else {
    console.log('Connected to SQLite database.');
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA synchronous = NORMAL;');
  }
});

// Real-time Helper
async function publishToCentrifuge(channel, data) {
    try {
        await axios.post(CENTRIFUGO_API_URL, {
            method: 'publish', 
            params: { channel, data }
        }, { 
            headers: { 'X-API-Key': CENTRIFUGO_API_KEY, 'Content-Type': 'application/json'} 
        });
    } catch (e) { 
        console.error(`Centrifugo Error [${channel}]:`, e.message); 
    }
}

// Database Init
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT, phone TEXT, securityQuestion TEXT, securityAnswer TEXT, restaurantId TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (id TEXT PRIMARY KEY, name TEXT, ownerId TEXT, description TEXT, cuisine TEXT, imageUrl TEXT, isOpen INTEGER, verified INTEGER, upiId TEXT, hours TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, restaurantId TEXT, name TEXT, description TEXT, price REAL, category TEXT, isAvailable INTEGER)`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, userId TEXT, restaurantId TEXT, items TEXT, totalAmount REAL, status TEXT, pickupCode TEXT, createdAt TEXT, transactionRef TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS daily_stats (date TEXT PRIMARY KEY, signup_count INTEGER DEFAULT 0)`);
  
  db.get("SELECT * FROM users WHERE email = ?", [ADMIN_CONFIG.email], (err, row) => {
    if (!row) {
        const hash = bcrypt.hashSync(ADMIN_CONFIG.password, 10);
        db.run(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          ['u_admin_001', 'Admin', ADMIN_CONFIG.email, hash, 'ADMIN', '000', 'Pet', ADMIN_CONFIG.securityAnswer, null]);
    }
  });
});

const api = express.Router();

// Real-time Auth
api.post('/centrifugo-token', (req, res) => {
  const { userId } = req.body;
  const token = jwt.sign({ sub: userId }, CENTRIFUGO_SECRET, { algorithm: 'HS256' });
  res.json({ token });
});

// Google Auth Handlers
api.post('/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        // Verify with Google
        const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        const { email, name, sub } = googleRes.data;
        
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (user) {
                const authToken = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, SECRET_KEY);
                return res.json({ user, token: authToken, isNewUser: false });
            } else {
                return res.json({ isNewUser: true, email, name, googleSub: sub });
            }
        });
    } catch (e) { 
        console.error("Google Token Verification Failed:", e.message);
        res.status(401).json({ error: "Invalid Google Token" }); 
    }
});

api.post('/auth/google/complete', async (req, res) => {
    const { email, name, role, restaurantName, hours, upiId, googleSub } = req.body;
    const userId = `u_${Date.now()}`;
    const restId = role === 'RESTAURANT' ? `r_${Date.now()}` : null;
    const pass = `GOOGLE_${googleSub}`;
    
    db.run('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)', 
        [userId, name, email, pass, role, '000', 'Google', 'Verified', restId], 
        (err) => {
            if (err) return res.status(500).json({ error: "Auth failed" });
            if (role === 'RESTAURANT') {
                db.run('INSERT INTO restaurants VALUES (?,?,?,?,?,?,?,?,?,?)', 
                    [restId, restaurantName, userId, 'New', '[]', 'https://picsum.photos/400/300', 0, 0, upiId, hours]);
            }
            const token = jwt.sign({ id: userId, role, restaurantId: restId }, SECRET_KEY);
            db.get('SELECT * FROM users WHERE id = ?', [userId], (err, newUser) => res.json({ user: newUser, token }));
        }
    );
});

api.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  res.json({ url: `${protocol}://${host}/uploads/${req.file.filename}` });
});

api.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid' });
    const token = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, SECRET_KEY);
    res.json({ user, token });
  });
});

api.post('/signup', async (req, res) => {
    const { name, email, phone, role, password, securityQuestion, securityAnswer, restaurantName } = req.body;
    const userId = `u_${Date.now()}`;
    const restId = role === 'RESTAURANT' ? `r_${Date.now()}` : null;
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)', [userId, name, email, hash, role, phone, securityQuestion, securityAnswer, restId], (err) => {
        if (err) return res.status(500).json({ error: "Email exists" });
        if (role === 'RESTAURANT') {
            db.run('INSERT INTO restaurants VALUES (?,?,?,?,?,?,?,?,?,?)', [restId, restaurantName, userId, 'New', '[]', 'https://picsum.photos/400/300', 0, 0, 'upi@id', '10:00 AM - 10:00 PM']);
        }
        res.json({ success: true });
    });
});

api.get('/restaurants', (req, res) => {
  db.all('SELECT * FROM restaurants', (err, rows) => {
    res.json(rows.map(r => ({ ...r, cuisine: JSON.parse(r.cuisine || '[]'), isOpen: !!r.isOpen, verified: !!r.verified })));
  });
});

api.get('/menu', (req, res) => {
  db.all('SELECT * FROM menu_items', (err, rows) => res.json(rows.map(i => ({...i, isAvailable: !!i.isAvailable}))));
});

api.post('/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const user = jwt.verify(token, SECRET_KEY);
    const { items, restaurantId, paymentRef } = req.body;
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const id = `o_${Date.now()}`;
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const created = new Date().toISOString();
    const orderData = { id, userId: user.id, restaurantId, items, totalAmount: total, status: 'PENDING', pickupCode: code, createdAt: created, transactionRef: paymentRef };

    db.run('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)', [id, user.id, restaurantId, JSON.stringify(items), total, 'PENDING', code, created, paymentRef], (err) => {
        if (err) return res.status(500).send();
        publishToCentrifuge(`orders:user_${user.id}`, orderData);
        publishToCentrifuge(`orders:restaurant_${restaurantId}`, orderData);
        res.json(orderData);
    });
  } catch(e) { res.status(401).send(); }
});

api.get('/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const user = jwt.verify(token, SECRET_KEY);
    let q = 'SELECT * FROM orders';
    if (user.role === 'STUDENT') q += ` WHERE userId = '${user.id}'`;
    else if (user.role === 'RESTAURANT') q += ` WHERE restaurantId = '${user.restaurantId}'`;
    db.all(q, (err, rows) => res.json(rows.map(o => ({...o, items: JSON.parse(o.items || '[]')}))));
  } catch(e) { res.status(401).send(); }
});

api.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], () => {
    db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
        if (row) {
            const data = {...row, items: JSON.parse(row.items || '[]')};
            publishToCentrifuge(`orders:user_${data.userId}`, data);
            publishToCentrifuge(`orders:restaurant_${data.restaurantId}`, data);
        }
    });
    res.json({ success: true });
  });
});

api.put('/menu/:id', (req, res) => {
    const item = req.body;
    db.run('UPDATE menu_items SET name=?, description=?, price=?, category=?, isAvailable=? WHERE id=?', [item.name, item.description, item.price, item.category, item.isAvailable ? 1 : 0, req.params.id], () => {
        const updated = {...item, id: req.params.id};
        publishToCentrifuge('public:general', { type: 'MENU_UPDATE', item: updated });
        res.json(updated);
    });
});

api.post('/menu', (req, res) => {
  const item = req.body;
  const id = `m_${Date.now()}`;
  db.run('INSERT INTO menu_items VALUES (?,?,?,?,?,?,?)', [id, item.restaurantId, item.name, item.description, item.price, item.category, 1], () => {
      const created = {...item, id, isAvailable: true};
      publishToCentrifuge('public:general', { type: 'MENU_UPDATE', item: created });
      res.json(created);
  });
});

api.delete('/menu/:id', (req, res) => {
    db.run('DELETE FROM menu_items WHERE id = ?', [req.params.id], () => {
        publishToCentrifuge('public:general', { type: 'MENU_DELETE', id: req.params.id });
        res.json({ success: true });
    });
});

api.put('/restaurants/:id/status', (req, res) => {
    const { isOpen } = req.body;
    db.run('UPDATE restaurants SET isOpen = ? WHERE id = ?', [isOpen ? 1 : 0, req.params.id], () => {
        publishToCentrifuge('public:general', { type: 'STATUS_CHANGE', id: req.params.id, isOpen });
        res.json({success: true});
    });
});

api.put('/restaurants/:id', (req, res) => {
    const { name, upiId, hours, imageUrl } = req.body;
    db.run('UPDATE restaurants SET name=?, upiId=?, hours=?, imageUrl=? WHERE id=?', [name, upiId, hours, imageUrl, req.params.id], () => res.json({success: true}));
});

api.put('/restaurants/:id/verify', (req, res) => {
    db.run('UPDATE restaurants SET verified = ? WHERE id = ?', [req.body.verified ? 1 : 0, req.params.id], () => res.json({success: true}));
});

api.delete('/restaurants/:id', (req, res) => {
    db.run('DELETE FROM restaurants WHERE id = ?', [req.params.id], () => res.json({ success: true }));
});

app.use('/api', api);
app.use('/', api);

// Binding to 0.0.0.0 is critical for accessibility through local network tunnels
app.listen(PORT, '0.0.0.0', () => console.log(`Backend Server running on port ${PORT}`));
```