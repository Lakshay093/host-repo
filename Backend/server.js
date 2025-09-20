const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Public'))); // Serve files from the Public directory

// Database connection
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'myhost_secret_key_2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// 1. User Registration
app.post('/api/register', async(req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        // Validate input
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const [existingUser] = await pool.execute(
            'SELECT id FROM users WHERE email = ?', [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, password, phone, created_at) VALUES (?, ?, ?, ?, NOW())', [fullName, email, hashedPassword, phone]
        );

        // Generate JWT token
        const token = jwt.sign({ userId: result.insertId, email: email },
            JWT_SECRET, { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: { id: result.insertId, fullName, email }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. User Login
app.post('/api/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const [users] = await pool.execute(
            'SELECT id, full_name, email, password FROM users WHERE email = ?', [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email },
            JWT_SECRET, { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: { id: user.id, fullName: user.full_name, email: user.email }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Contact form submission
app.post('/api/contact', async(req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert contact message into database
        await pool.execute(
            'INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())', [name, email, subject, message]
        );

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'lakshaydiman21518@gmail.com',
            subject: `New Contact Form Submission: ${subject}`,
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Contact message sent successfully'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// 4. Domain search
app.post('/api/domain/search', async(req, res) => {
    try {
        const { domainName } = req.body;

        if (!domainName) {
            return res.status(400).json({ error: 'Domain name is required' });
        }

        const extensions = ['.com', '.net', '.org', '.us', '.in', '.co.uk'];
        const results = [];

        for (let ext of extensions) {
            const fullDomain = domainName.toLowerCase() + ext;

            // Check if domain exists in our database
            const [existing] = await pool.execute(
                'SELECT id FROM domains WHERE domain_name = ?', [fullDomain]
            );

            results.push({
                domain: fullDomain,
                available: existing.length === 0,
                price: ext === '.com' ? 9.99 : 9.99
            });
        }

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error('Domain search error:', error);
        res.status(500).json({ error: 'Domain search failed' });
    }
});

// 5. Purchase hosting plan
app.post('/api/purchase', authenticateToken, async(req, res) => {
    try {
        const { plan, amount, paymentDetails } = req.body;
        const userId = req.user.userId;

        if (!plan || !amount) {
            return res.status(400).json({ error: 'Plan and amount are required' });
        }

        // Insert order into database
        const [result] = await pool.execute(
            `INSERT INTO orders (user_id, plan_type, amount, status, created_at) 
       VALUES (?, ?, ?, 'pending', NOW())`, [userId, plan, amount]
        );

        // In a real application, you would process payment here
        // For demo purposes, we'll mark it as completed
        await pool.execute(
            'UPDATE orders SET status = ?, payment_date = NOW() WHERE id = ?', ['completed', result.insertId]
        );

        // Create hosting account
        await pool.execute(
            `INSERT INTO hosting_accounts (user_id, order_id, plan_type, status, created_at, expires_at)
       VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH))`, [userId, result.insertId, plan]
        );

        res.json({
            success: true,
            message: 'Purchase successful',
            orderId: result.insertId
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Purchase failed' });
    }
});

// 6. Get user dashboard data
app.get('/api/dashboard', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.userId;

        // Get user info
        const [users] = await pool.execute(
            'SELECT id, full_name, email, phone FROM users WHERE id = ?', [userId]
        );

        // Get hosting accounts
        const [hostingAccounts] = await pool.execute(
            'SELECT * FROM hosting_accounts WHERE user_id = ? ORDER BY created_at DESC', [userId]
        );

        // Get orders
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]
        );

        // Get domains
        const [domains] = await pool.execute(
            'SELECT * FROM domains WHERE user_id = ? ORDER BY created_at DESC', [userId]
        );

        res.json({
            success: true,
            data: {
                user: users[0],
                hostingAccounts: hostingAccounts,
                orders: orders,
                domains: domains
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// 7. Newsletter subscription
app.post('/api/newsletter', async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if already subscribed
        const [existing] = await pool.execute(
            'SELECT id FROM newsletter_subscribers WHERE email = ?', [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already subscribed' });
        }

        // Add to newsletter
        await pool.execute(
            'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())', [email]
        );

        res.json({
            success: true,
            message: 'Successfully subscribed to newsletter'
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ error: 'Subscription failed' });
    }
});

// 8. Get hosting statistics for admin
app.get('/api/admin/stats', authenticateToken, async(req, res) => {
    try {
        // Check if user is admin (you can implement admin role check)

        const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [totalOrders] = await pool.execute('SELECT COUNT(*) as count FROM orders');
        const [activeHosting] = await pool.execute('SELECT COUNT(*) as count FROM hosting_accounts WHERE status = "active"');
        const [totalRevenue] = await pool.execute('SELECT SUM(amount) as total FROM orders WHERE status = "completed"');

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers[0].count,
                totalOrders: totalOrders[0].count,
                activeHosting: activeHosting[0].count,
                totalRevenue: totalRevenue[0].total || 0
            }
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to load statistics' });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    const allowedPages = ['about', 'contact', 'domain', 'hosting', 'team', 'testimonial', 'comparison'];

    if (allowedPages.includes(page)) {
        res.sendFile(path.join(__dirname, 'public', `${page}.html`));
    } else {
        res.status(404).send('Page not found');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`MyHost server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;