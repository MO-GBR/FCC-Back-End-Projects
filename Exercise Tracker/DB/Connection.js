const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urlshortener';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected successfuly 👍: ${conn.connection.host}`);
    } catch (error) {
        console.log(`MongoDB Connection Failed 💥: ${error}`);
    }
};

module.exports = connectDB;