require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const xlsx = require('xlsx');
const multer = require('multer'); // Import multer

const app = express();
app.use(bodyParser.json());

// CORS configuration
const allowedOrigins = ['https://makeit-fawn.vercel.app'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

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
    file: String, // Field for storing uploaded file path
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Configure multer for PDF file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

// Filter for PDF files only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only PDF files are allowed!'), false); // Reject the file
    }
};

const upload = multer({ storage, fileFilter });

// Route for form submission with PDF upload
app.post('/api/submit', upload.single('file'), async (req, res) => {
    const { name, email, phone } = req.body;

    // Trim and validate input on the backend as well
    if (!name || !phone || name.trim().length < 2 || phone.trim().length < 5) {
        return res.status(400).json({ message: 'Invalid input. Please provide a valid name and phone number.' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'A submission with this email or phone number already exists.' });
        }

        const newUser = new User({
            name: name.trim(),
            email,
            phone: phone.trim(),
            file: req.file.path, // Save the file path to the database
        });
        await newUser.save();
        res.status(201).json({ message: 'User submitted successfully!' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'An error occurred while saving data.' });
    }
});

// Route to download responses in Excel format
app.post('/api/download', async (req, res) => {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        const users = await User.find().lean();
        const excelData = users.map(user => ({
            Name: user.name,
            Email: user.email,
            Phone: user.phone,
            File: user.file, // Include the file path in the response
            SubmittedAt: user.createdAt,
        }));

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(excelData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Responses');

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
