const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super_secret_campus_key';

// --- CONFIGURATION ---
const CENTRIFUGO_API_KEY = 'yxrscKEyV2iBp5B8XnPaduwCuqQwOxopt9gzTF1AGIDUBmE4WA4HCq-RcTjAF85IbsDBxEekxmhlyRzU1MQmlg';
const CENTRIFUGO_SECRET = 'ijKhdtFxrrBiDeFY295DF6EAKe_DbM1jcHoz7ydHxmRjwm8sYZXvWAttbuSQTGVtNUkbiYV1WK58x-6FA7RBog';
const CENTRIFUGO_API_URL = 'http://localhost:8000/api';

// Secure Admin Credentials
const ADMIN_CONFIG = {
    email: 'admin@grabandgo.com',
    password: 'Universe2007$', // Will be hashed on startup
    securityAnswer: 'fluffy'
};
// ---------------------

app.use(cors());
app.use(bodyParser.json());

// Database Setup
const db = new sqlite3.Database('./grabgo.db', (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log('Connected to SQLite database.');
    
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA synchronous = NORMAL;');
    db.configure('busyTimeout', 5000);
  }
});

// Helper: Retry Logic
function runWithRetry(sql, params, callback, retries = 3) {
  const attempt = (n) => {
    db.run(sql, params, function(err) {
      if (err && err.code === 'SQLITE_BUSY' && n > 0) {
        const delay = 50 + Math.random() * 100;
        setTimeout(() => attempt(n - 1), delay);
      } else {
        if (callback) callback.call(this, err);
      }
    });
  };
  attempt(retries);
}

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    phone TEXT,
    securityQuestion TEXT,
    securityAnswer TEXT,
    restaurantId TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT,
    ownerId TEXT,
    description TEXT,
    cuisine TEXT,
    imageUrl TEXT,
    isOpen INTEGER,
    verified INTEGER,
    upiId TEXT,
    hours TEXT
  )`);

  // Migration: Add hours column if it doesn't exist (for existing DBs)
  db.run(`ALTER TABLE restaurants ADD COLUMN hours TEXT`, (err) => {
      // Ignore error if column exists
  });

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    restaurantId TEXT,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    isAvailable INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    restaurantId TEXT,
    items TEXT,
    totalAmount REAL,
    status TEXT,
    pickupCode TEXT,
    createdAt TEXT,
    transactionRef TEXT
  )`);
  
  // Seed Admin from Config (Check by email to ensure specific admin exists)
  db.get("SELECT * FROM users WHERE email = ?", [ADMIN_CONFIG.email], (err, row) => {
    if (!row) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(ADMIN_CONFIG.password, salt);
        const adminId = 'u_admin_' + Date.now(); // Unique ID
        
        runWithRetry(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [adminId, 'Admin', ADMIN_CONFIG.email, hash, 'ADMIN', '000', 'Pet', ADMIN_CONFIG.securityAnswer, null], 
          (err) => { 
              if(err) console.error("Error creating admin", err); 
              else console.log(`Admin account (${ADMIN_CONFIG.email}) created from config.`);
          }
        );
    }
  });
});

async function publishToCentrifuge(channel, data) {
    try {
        await axios.post(CENTRIFUGO_API_URL, {
            method: 'publish',
            params: { channel: channel, data: data }
        }, {
            headers: { 'X-API-Key': CENTRIFUGO_API_KEY, 'Content-Type': 'application/json'}
        });
    } catch (e) { console.error("Centrifugo Error"); }
}

// --- GOOGLE AUTH ROUTES ---

// 1. Verify Google Token & Check Existence
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        // Verify with Google
        const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        const { email, name, sub } = googleRes.data;

        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) return res.status(500).json({ error: "DB Error" });
            
            if (user) {
                // User exists - Log them in
                const authToken = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, SECRET_KEY);
                return res.json({ user, token: authToken, isNewUser: false });
            } else {
                // User does NOT exist - Return info for onboarding
                return res.json({ isNewUser: true, email, name, googleSub: sub });
            }
        });
    } catch (e) {
        res.status(401).json({ error: "Invalid Google Token" });
    }
});

// 2. Complete Google Signup (with Role & Restaurant Details)
app.post('/api/auth/google/complete', async (req, res) => {
    const { email, name, role, restaurantName, hours, upiId, googleSub } = req.body;
    
    // Safety check: ensure user doesn't exist again
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, existing) => {
        if (existing) return res.status(400).json({ error: "User already exists" });

        const userId = `u_${Date.now()}`;
        const restId = role === 'RESTAURANT' ? `r_${Date.now()}` : null;
        const passwordPlaceholder = `GOOGLE_AUTH_${googleSub}`; // Not used for login, just filler

        runWithRetry('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)', 
            [userId, name, email, passwordPlaceholder, role, '000', 'Google', 'Auth', restId], 
            (err) => {
                if (err) return res.status(500).json({ error: "Signup failed" });

                if (role === 'RESTAURANT') {
                    runWithRetry('INSERT INTO restaurants VALUES (?,?,?,?,?,?,?,?,?,?)', 
                        [restId, restaurantName || name + "'s Kitchen", userId, 'New Restaurant', '[]', 'https://picsum.photos/400/300', 0, 0, upiId || '', hours || '9 AM - 9 PM'],
                        (err) => { if (err) console.error("Error creating restaurant", err); }
                    );
                }

                // Auto-login after creation
                const token = jwt.sign({ id: userId, role, restaurantId: restId }, SECRET_KEY);
                
                // Fetch the new user object
                db.get('SELECT * FROM users WHERE id = ?', [userId], (err, newUser) => {
                     res.json({ user: newUser, token });
                });
            }
        );
    });
});

// --- STANDARD ROUTES ---

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Allow standard login only if not a Google-only account (optional security)
    if (user.password.startsWith('GOOGLE_AUTH_')) {
        return res.status(401).json({ error: 'Please sign in with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, SECRET_KEY);
    res.json({ user, token });
  });
});

app.post('/api/signup', async (req, res) => {
  const { name, email, phone, role, password, securityQuestion, securityAnswer, restaurantName } = req.body;
  
  if (role === 'RESTAURANT' && !restaurantName) {
      return res.status(400).json({ error: "Restaurant Name is required" });
  }

  const userId = `u_${Date.now()}`;
  const restId = role === 'RESTAURANT' ? `r_${Date.now()}` : null;
  
  try {
      const hashedPassword = await bcrypt.hash(password, 10);

      runWithRetry('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)', 
        [userId, name, email, hashedPassword, role, phone, securityQuestion, securityAnswer, restId], 
        (err) => {
          if (err) return res.status(500).json({ error: "Email already exists" });
          
          if (role === 'RESTAURANT') {
            runWithRetry('INSERT INTO restaurants VALUES (?,?,?,?,?,?,?,?,?,?)', 
              [restId, restaurantName, userId, 'New Restaurant', '[]', 'https://picsum.photos/400/300', 0, 0, 'campus@upi', '10 AM - 10 PM'],
              (err) => { if (err) console.error("Error creating restaurant entry:", err); }
            );
          }
          res.json({ success: true });
        }
      );
  } catch (e) {
      res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/recover-password', (req, res) => {
    const { email, answer, newPass } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: "User not found" });
        if (!user.securityAnswer || user.securityAnswer.toLowerCase() !== answer.toLowerCase()) {
            return res.status(400).json({ error: "Security answer incorrect" });
        }
        const hashedPassword = await bcrypt.hash(newPass, 10);
        runWithRetry('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (err) => {
            if (err) return res.status(500).json({ error: "Failed to update password" });
            res.json({ success: true });
        });
    });
});

app.post('/api/centrifugo-token', (req, res) => {
  const { userId } = req.body;
  const jwtToken = jwt.sign({ sub: userId }, CENTRIFUGO_SECRET, { algorithm: 'HS256' });
  res.json({ token: jwtToken });
});

app.get('/api/restaurants', (req, res) => {
  db.all('SELECT * FROM restaurants', (err, rows) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    const restaurants = rows.map(r => ({ ...r, cuisine: JSON.parse(r.cuisine || '[]'), isOpen: !!r.isOpen, verified: !!r.verified }));
    res.json(restaurants);
  });
});

app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu_items', (err, rows) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json(rows.map(i => ({...i, isAvailable: !!i.isAvailable})));
  });
});

app.post('/api/orders', (req, res) => {
  const { items, restaurantId, paymentRef } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.sendStatus(401);
  
  try {
    const user = jwt.verify(token, SECRET_KEY);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = `o_${Date.now()}`;
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
    const createdAt = new Date().toISOString();

    const order = {
      id: orderId, userId: user.id, restaurantId, items, totalAmount, 
      status: 'PENDING', pickupCode, createdAt, transactionRef: paymentRef
    };

    runWithRetry('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)', 
      [orderId, user.id, restaurantId, JSON.stringify(items), totalAmount, 'PENDING', pickupCode, createdAt, paymentRef],
      (err) => {
        if (err) return res.status(500).json({ error: "Failed to place order" });
        publishToCentrifuge(`orders:user_${user.id}`, order);
        publishToCentrifuge(`orders:restaurant_${restaurantId}`, order);
        res.json(order);
      }
    );
  } catch (e) { res.sendStatus(401); }
});

app.get('/api/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.sendStatus(401);
  try {
    const user = jwt.verify(token, SECRET_KEY);
    let query = 'SELECT * FROM orders';
    let params = [];
    if (user.role === 'STUDENT') {
      query += ' WHERE userId = ?';
      params.push(user.id);
    } else if (user.role === 'RESTAURANT') {
      if (!user.restaurantId) return res.json([]); 
      query += ' WHERE restaurantId = ?';
      params.push(user.restaurantId);
    }
    db.all(query, params, (err, rows) => {
      if (err) return res.status(500).json({ error: "DB Error" });
      const orders = rows.map(o => ({...o, items: JSON.parse(o.items || '[]')}));
      res.json(orders);
    });
  } catch(e) { res.sendStatus(401); }
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  runWithRetry('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if(row) {
            const order = {...row, items: JSON.parse(row.items || '[]')};
            publishToCentrifuge(`orders:user_${order.userId}`, order);
            publishToCentrifuge(`orders:restaurant_${order.restaurantId}`, order);
            res.json({ success: true });
        }
    });
  });
});

app.post('/api/menu', (req, res) => {
  const item = req.body;
  const id = `m_${Date.now()}`;
  runWithRetry('INSERT INTO menu_items VALUES (?,?,?,?,?,?,?)',
    [id, item.restaurantId, item.name, item.description, item.price, item.category, 1],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to add item" });
      res.json({ ...item, id });
    }
  );
});

app.put('/api/restaurants/:id/status', (req, res) => {
    const { isOpen } = req.body;
    runWithRetry('UPDATE restaurants SET isOpen = ? WHERE id = ?', [isOpen ? 1 : 0, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        publishToCentrifuge('restaurant', { type: 'STATUS_CHANGE', id: req.params.id, isOpen });
        res.json({success: true});
    });
});

app.put('/api/restaurants/:id/verify', (req, res) => {
    runWithRetry('UPDATE restaurants SET verified = 1 WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        res.json({success: true});
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});