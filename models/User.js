const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
