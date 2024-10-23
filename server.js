require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const xlsx = require('xlsx');
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');

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
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
    // Initialize GridFS
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
})
.catch(err => console.error('MongoDB connection error:', err));

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads' // Collection name
        };
    }
});

const upload = multer({ storage });

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' }, // Reference to the uploaded file
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Route for form submission with PDF upload
app.post('/api/submit', upload.single('file'), async (req, res) => {
    const { name, email, phone } = req.body;

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
            fileId: req.file.id // Store the GridFS file ID
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
        const excelData = await Promise.all(users.map(async user => {
            const file = await gfs.files.findOne({ _id: user.fileId });
            const fileLink = file ? `https://<your-domain>/api/files/${file.filename}` : 'No file uploaded'; // Adjust this link based on your app's URL

            return {
                Name: user.name,
                Email: user.email,
                Phone: user.phone,
                SubmittedAt: user.createdAt,
                FileLink: fileLink
            };
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

// Route to serve files
app.get('/api/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }
        const readstream = gfs.createReadStream(file._id);
        readstream.pipe(res);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
