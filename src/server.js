require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { getDb } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip/brotli response compression
app.use(compression());

// ===== SECURITY MIDDLEWARE =====
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            styleSrcAttr: ["'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            mediaSrc: ["'self'", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "same-origin" }
}));

app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

// Rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
});

app.use(globalLimiter);

// Body parsing with size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ===== STATIC FILES =====
const staticOptions = {
    etag: true,
    dotfiles: 'deny',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
};

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '1d',
    etag: true,
    index: false,
    dotfiles: 'deny'
}));

app.use('/admin', express.static(path.join(__dirname, '..', 'admin'), {
    index: 'index.html',
    ...staticOptions
}));

app.use(express.static(path.join(__dirname, '..', 'public'), staticOptions));

// ===== API ROUTES =====
app.use('/api/auth', apiLimiter, require('./routes/auth'));
app.use('/api/products', apiLimiter, require('./routes/products'));
app.use('/api/categories', apiLimiter, require('./routes/categories'));
app.use('/api/collections', apiLimiter, require('./routes/collections'));
app.use('/api/product-types', apiLimiter, require('./routes/productTypes'));
app.use('/api/sizes', apiLimiter, require('./routes/sizes'));
app.use('/api/orders', apiLimiter, require('./routes/orders'));
app.use('/api/coupons', apiLimiter, require('./routes/coupons'));
app.use('/api/site', apiLimiter, require('./routes/siteContent'));
app.use('/api/admin/dashboard', apiLimiter, require('./routes/dashboard'));
app.use('/api/customers', apiLimiter, require('./routes/customers'));
app.use('/api/media', apiLimiter, require('./routes/media'));
app.use('/api/admin', apiLimiter, require('./routes/adminUsers'));
app.use('/api/admin', apiLimiter, require('./routes/auditLogs'));
app.use('/api/shipping', apiLimiter, require('./routes/shipping'));
app.use('/api', apiLimiter, require('./routes/contactLeads'));

// ===== SPA FALLBACK =====
// Admin SPA
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// Public SPA
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
});

// ===== INITIALIZE & START =====
async function ensureDatabase() {
    try {
        const db = getDb();
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'").get();
        if (!tableCheck) {
            console.log('⚡ First run detected: initializing database schema and seed data...');
            const { initDatabase } = require('./database/init');
            await initDatabase();
        }
    } catch (err) {
        console.error('❌ Database check error:', err.message);
    }
}

if (!process.env.VERCEL) {
    ensureDatabase().then(() => {
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════╗
║     يدوى — Yadawy E-Commerce Server     ║
╠══════════════════════════════════════════╣
║  Public:  http://localhost:${PORT}           ║
║  Admin:   http://localhost:${PORT}/admin     ║
║  API:     http://localhost:${PORT}/api       ║
╚══════════════════════════════════════════╝
            `);
        });
    });
} else {
    ensureDatabase().catch(err => console.error('Vercel init error:', err));
}

module.exports = app;
