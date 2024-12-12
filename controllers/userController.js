const Event = require('../models/eventModel')
const User = require('../models/formSchema')

exports.userController = async (req, res) => {
    const { id } = req.params;
    const { password, name, email, phone } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        await User.findByIdAndUpdate(id, { name, email, phone});
        res.status(200).json({ message: 'User details updated successfully.' });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Error updating user details.' });
    }
};

exports.getAllUsers = async (req, res) => {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        const formdata = await User.find().lean();
        res.status(200).json(formdata);
    } catch (error) {
        console.error('Error retrieving formdata:', error);
        res.status(500).json({ message: 'Error retrieving formdata.' });
    }
};

