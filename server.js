require('dotenv').config();
const Event = require('./models/eventModel')
const User = require('./models/formSchema')
const connectDb = require('./DB/dbConnection')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const xlsx = require('xlsx');
const connectionString = process.env.MONGO_URI;
connectDb(connectionString)
app.use(bodyParser.json());
const user = require('./routes/userRoutes')
const admin = require('./routes/adminRoutes')

const allowedOrigins = ['https://makeit-fawn.vercel.app/'];
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

const PORT = process.env.PORT || 5000;
app.use('/api',user,admin)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
