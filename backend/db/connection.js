const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contact_management';
  try {
    const conn = await mongoose.connect(uri);
    console.log(` Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
