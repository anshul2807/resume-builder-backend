const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Drop stale unique index on userId in the resumes collection.
    // An older schema version created this, preventing multiple resumes per user.
    const db = mongoose.connection.db;
    const collection = db.collection('resumes');
    const indexes = await collection.indexes();
    const staleIndex = indexes.find(
      (idx) => idx.name === 'userId_1' && idx.unique === true
    );
    if (staleIndex) {
      await collection.dropIndex('userId_1');
      console.log('🗑️  Dropped stale unique index userId_1 on resumes');
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;