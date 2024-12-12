const Event = require('../models/eventModel')
const User = require('../models/formSchema')

exports.updateAttendanceById =  async (req, res) => {
    const { id ,eventId} = req.params;
    const { password, status } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        const event = Event.findById(eventId)
        if(!event){
            return res.status(400).json({message:"Event not found"})
        }
        const attendanceRecord = event.attendance.find(record => record.userId.toString() === id);
        if (!attendanceRecord) {
            return res.status(404).json({ message: 'User not found in attendance list for this event.' });
        }
        attendanceRecord.status = status;
        await event.save();
    } catch (error) {
        console.error('Error updating attendance for user:', error);
        res.status(500).json({ message: 'Error updating user attendance.' });
    }
};

exports.updateAllAttendance = async (req, res) => {
    const { password, status } = req.body;
    const {eventId} = req.params;
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(400).json({ message: "Event not found" });
        }

        for (let record of event.attendance) {
            record.status = status;
        }

        await event.save();
        res.status(200).json({ message: "Attendance updated successfully" });
    } catch (error) {
        console.error('Error updating attendance for all formdata:', error);
        res.status(500).json({ message: 'Error updating attendance.' });
    }
};