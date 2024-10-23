const mongoose = require('mongoose');
const User = require('./models/User');
const xlsx = require('xlsx');
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
    console.error('Error generating Excel:', error);
    res.status(500).json({ message: 'Error generating Excel document.' });
  }
};
