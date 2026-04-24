const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/request-access', requireAuth, async (req, res) => {
    try {
        const { categories } = req.body;
        const user = await User.findById(req.user._id);
        user.requestedCategories = categories;
        await user.save();
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('approvedCategories');
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );
    
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/google-login', async (req, res) => {
    try {
        const { googleToken, phoneNumber } = req.body;
        if (!googleToken) return res.status(400).json({ error: 'Missing token' });

        let googleId, email, name;

        // An idToken is a JWT (looks like xxxx.yyyy.zzzz and is very long)
        // An access_token is a short random string.
        if (googleToken.includes('.')) {
            // ID Token Flow
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
        } else {
            // Access Token Flow (used by Custom Google Login Button hook)
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${googleToken}` }
            });
            if (!response.ok) throw new Error('Invalid access token');
            const data = await response.json();
            googleId = data.sub;
            email = data.email;
            name = data.name;
        }

        let user = await User.findOne({ email }).populate('approvedCategories');

        if (user) {
            // Link account if not already linked
            if (!user.googleId) {
                user.googleId = googleId;
            }
            // Update phone if provided and currently pending
            if (phoneNumber && (user.phoneNumber === 'PENDING' || !user.phoneNumber)) {
                user.phoneNumber = phoneNumber;
            }
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                email,
                name: name || email.split('@')[0],
                googleId,
                role: 'buyer',
                isApproved: false,
                phoneNumber: phoneNumber || 'PENDING'
            });
        }

        // If after all that, phone is still pending, we alert the frontend 
        // but we can still issue a token for the "Phone Modal" phase
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user, needsPhone: user.phoneNumber === 'PENDING' });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ error: 'Google authentication failed' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, passwordHash, phoneNumber, role: 'buyer', isApproved: false });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, phoneNumber, newPassword } = req.body;
        
        // Find user by both email and phone number to ensure security during demo phase
        const user = await User.findOne({ email, phoneNumber });
        if (!user) {
            return res.status(404).json({ error: 'No account found matching this email and phone number' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = passwordHash;
        await user.save();

        res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });
    } catch (err) {
        res.status(500).json({ error: 'Password reset completely failed' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).populate('approvedCategories');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.json({ user });
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.phoneNumber = phoneNumber;
        await user.save();
        res.json({ success: true, user });
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// To set up quick demo users (admin / buyer)
router.post('/setup-demo', async (req, res) => {
    try {
        const hash = await bcrypt.hash('password123', 10);
        await User.create([
            { email: 'admin@demo.com', name: 'Admin Salesman', role: 'admin', passwordHash: hash, isApproved: true },
            { email: 'buyer@demo.com', name: 'Buyer User', role: 'buyer', passwordHash: hash, isApproved: false }
        ]);
        res.json({ success: true, message: "Demo accounts created." });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;
