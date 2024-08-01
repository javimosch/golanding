module.exports = app => {
    const mongoose = require('mongoose');
    if(!process.env.DBNAME){
        throw new Error('process.env.DBNAME required')
    }
    
    // Connect to MongoDB
    mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DBNAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}