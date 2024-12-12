const Event = require('../models/eventModel')
const User = require('../models/formSchema')
const xlsx = require('xlsx');
exports.excelController = async (req, res) => {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        const formdata = await User.find().lean();
        const excelData = formdata.map(user => ({
            Name: user.name,
            Email: user.email,
            Phone: user.phone,
            Attendance: user.attendance,
            Gender: user.gender,
            SubmittedAt: new Date(user.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
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
};