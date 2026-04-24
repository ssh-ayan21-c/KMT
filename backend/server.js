const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

const PORT = process.env.PORT || 5000;

async function startServer() {
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.log('MONGODB_URI not set. Auto-starting local MongoMemoryServer...');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
    }

    try {
        await mongoose.connect(mongoUri);
        console.log(`Connected to MongoDB Atlas`);
        
        // Auto-seed for demo if memory server is used
        if (!process.env.MONGODB_URI) {
            await require('./seed')();
        }

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch(err) {
        console.error('Failed to start server', err);
    }
}

startServer();
