const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
    date: { type: Date, required: true }
}, { _id: false });

const Exercise = mongoose.model('Exercise', exerciseSchema);
  
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    log: { type: [exerciseSchema], default: [] }
});
  
const User = mongoose.model('User', userSchema);

module.exports = { User, Exercise };