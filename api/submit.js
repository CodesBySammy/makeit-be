const mongoose = require('mongoose');
const User = require('./models/User'); // Ensure User model is in a separate file
require('dotenv').config();

const connectToMongo = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = async (req, res) => {
  await connectToMongo(); // Ensure MongoDB connection
  const { name, email, phone } = req.body;

  try {
    // Check if user with same email or phone exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already exists.' });
    }

    // Save new user
    const newUser = new User({ name, email, phone });
    await newUser.save();
    res.status(201).json({ message: 'User submitted successfully!' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'An error occurred while saving data.' });
  }
};
