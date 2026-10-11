const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const customUri = process.env.MONGO_URI;

  // Try standard connection first if explicit URI provided
  if (customUri && !customUri.includes('127.0.0.1') && !customUri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(customUri, { autoIndex: true });
      console.log(`[Database] Connected to external MongoDB: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[Database] External MongoDB connection failed: ${err.message}`);
    }
  }

  // Try local MongoDB port 27017
  try {
    const conn = await mongoose.connect(customUri || 'mongodb://127.0.0.1:27017/mediccare_db', {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true
    });
    console.log(`[Database] Connected to local MongoDB server: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.log('[Database] Local MongoDB daemon on port 27017 not detected.');
    console.log('[Database] Initializing automated in-memory MongoDB engine for zero-configuration evaluation...');
  }

  // Automatically start MongoMemoryServer so the app runs immediately without external installation
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'mediccare_db'
      }
    });
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] In-Memory MongoDB Engine Active at: ${memoryUri}`);

    // Auto-seed demo accounts so the application is immediately ready to explore
    const User = require('../models/User');
    const existing = await User.countDocuments();
    if (existing === 0) {
      console.log('[Database] Auto-seeding initial hospital records and demo users...');
      const seedData = require('../seed/seedData');
      if (typeof seedData.runSeed === 'function') {
        await seedData.runSeed();
      }
    }
  } catch (memErr) {
    console.error(`[Database Error] In-Memory Mongo fallback error: ${memErr.message}`);
  }
};

module.exports = connectDB;
