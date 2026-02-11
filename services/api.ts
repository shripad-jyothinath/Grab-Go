// Configuration: Points to the Backend Server
// We use dynamic detection to support both local development and production domains

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // 1. Local Development (Explicit)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // 2. Direct Tunnel Access (Visiting the ngrok URL directly)
  if (hostname.includes('ngrok-free.dev')) {
    return `${window.location.origin}/api`;
  }

  // 3. Production (Hostinger) OR Preview Environments (AI Studio, etc.)
  // If we are not on localhost, we assume we need to hit the public tunnel.
  return 'https://talisha-unjarred-zara.ngrok-free.dev/api';
};

export const API_URL = getBaseUrl();

console.log("Grab&Go API initialized at:", API_URL);

const getHeaders = () => {
  const token = localStorage.getItem('grabgo_token');
  const headers: any = { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Required for Ngrok
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async (endpoint: string) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error(`API GET Error [${endpoint}]:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, body: any) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
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
    const headers: any = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  }
};