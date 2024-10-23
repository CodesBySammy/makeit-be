require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const xlsx = require('xlsx');

const app = express();

// Update CORS options to allow only your frontend
const corsOptions = {
    origin: 'https://makeit-fawn.vercel.app', // Your frontend URL
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow necessary methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Add any other headers you need
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
}, { timestamps: true }); // Add timestamps for submission tracking

const User = mongoose.model('User', userSchema);

// Route for form submission
app.post('/api/submit', async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        // Check if the user with the same email or phone already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'A submission with this email or phone number already exists.' });
        }

        // If no match found, save the new user
        const newUser = new User({ name, email, phone });
        await newUser.save();
        res.status(201).json({ message: 'User submitted successfully!' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'An error occurred while saving data.' });
    }
});

// Route to download responses in Excel format
app.post('/api/download', async (req, res) => {
    const { password } = req.body; // Get password from request body

    // Check if the password matches
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        const users = await User.find().lean(); // Fetch users and convert to plain JavaScript objects

        // Prepare the data for Excel
        const excelData = users.map(user => ({
            Name: user.name,
            Email: user.email,
            Phone: user.phone,
            SubmittedAt: user.createdAt, // Add timestamp
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
        console.error('Error generating Excel document:', error);
        res.status(500).json({ message: 'Error generating Excel document.' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
