const mongoose = require('mongoose');

// Schema for URL mapping
const urlSchema = new mongoose.Schema({
    original_url: { type: String, required: true },
    short_url: { type: Number, required: true, unique: true },
    created_at: { type: Date, default: Date.now }
});

const URLModel = mongoose.model('URL', urlSchema);
  
// Counter schema for auto-incrementing short_url
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const getNextSequence = async (name) => {
    const ret = await Counter.findByIdAndUpdate(
        name,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return ret.seq;
};

module.exports = { URLModel, Counter, getNextSequence };