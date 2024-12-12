const { response } = require('express');
const Event = require('../models/eventModel')
const User = require('../models/formSchema')

exports.registerEvent = async (req, res) => {
    const {event} = req.params;
    const { name, userData, email, phone } = req.body;

    if (!name || !userData || !email || !phone) {
        return res.status(400).json({ 
            message: 'Invalid input. Please provide Complete Form Details.' 
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        const oldevent = await Event.findById(event)
        if(!oldevent){
            return res.status(400).json({message:"Event not found. Please enter correct name"})
        }
        if (oldevent) {
            const alreadyRegistered = oldevent.attendance.find(att => att.email === email);
            if (alreadyRegistered) {
                return res.status(400).json({ message: "User already registered in the event" });
            }
        }
        const fieldNames = oldevent.fields.map(field => field.name);
        const isValid = Object.keys(userData).every(field => fieldNames.includes(field));

        if (!isValid) {
            return res.status(400).json({ message: "Some fields in the form are invalid" });
        }

        const userResponses = Object.entries(userData).map(([key, value]) => ({
            fieldName: key,
            response: value
        }));
        if(oldevent){
            const newUser = new User({ 
                name: name.trim(),
                email,
                phone,
                events:[{
                    name:oldevent.name,
                    responses: userData
                }]
            });
            await Event.findByIdAndUpdate(
                oldevent._id,
                {
                    $push: {
                        attendance: {
                            name: newUser.name, 
                            status: 'Absent',
                            email: newUser.email
                        }
                    }
                },
                { new: true }
            ).populate('attendance')
              .exec();
            if(!existingUser){
                await newUser.save();
            }
            if(existingUser){
                const existevent = await User.findOne({events:event._id, _id: existingUser._id})
                if(existevent){
                    return res.status(400).json({message:"User already in the event"})
                }
                else{
                    await User.findByIdAndUpdate(
                        existingUser._id,
                        {$push: 
                            {
                                events: {
                                    name: oldevent.name,
                                    responses: userData,
                                },
                            },
                        },
                        {new:true}
                    )
                }
                return res.status(200).json({message:"user added to event"});
            }
        }  
        res.status(201).json({ message: 'User submitted successfully!' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'An error occurred while saving data.' });
    }
};