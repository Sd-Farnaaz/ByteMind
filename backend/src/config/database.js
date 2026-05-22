const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database Name: ${conn.connection.name}`);
    
    // Log all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Monitor connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️ Make sure MongoDB is running on localhost:27017');
    process.exit(1);
  }
};

module.exports = connectDB;