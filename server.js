const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super_secret_campus_key';
const DAILY_SIGNUP_LIMIT = 300;

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

app.use('/connection', createProxyMiddleware({ 
    target: 'http://127.0.0.1:8000',
    changeOrigin: true, 
    ws: true 
}));

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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
    } catch (e) { res.status(401).json({ error: "Invalid Google Token" }); }
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
app.listen(PORT, () => console.log(`Server: ${PORT}`));