require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const xlsx = require('xlsx');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
});

const User = mongoose.model('User', userSchema);

// Route for form submission
app.post('/api/submit', async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email, phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Already submitted.' });
        }

        const newUser = new User({ name, email, phone });
        await newUser.save();
        res.status(201).json({ message: 'User submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while saving data.' });
    }
});

// Route to download responses in Excel format
app.get('/api/download', async (req, res) => {
    const adminPassword = req.query.password; // Get password from query parameter

    // Check if the password matches
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        const users = await User.find().lean(); // Fetch users and convert to plain JavaScript objects

        // Prepare the data for Excel
        const excelData = users.map(user => ({
            Name: user.name,
            Email: user.email,
            Phone: user.phone,
        }));

        // Create a new workbook and a new worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(excelData);

        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Responses');

        // Create a buffer and send the Excel document
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.set({
            'Content-Disposition': 'attachment; filename="responses.xlsx"',
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'Error generating Excel document.' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
