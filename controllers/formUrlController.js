const Event = require('../models/eventModel')
const User = require('../models/formSchema')

exports.createUrl = async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json({
            url : event.form_url,
            message: `Registration form url for ${event.name} is ${url}`,
        });
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ message: "An error occurred while fetching the event." });
    }
};