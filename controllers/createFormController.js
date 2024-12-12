const Event = require('../models/eventModel')
const User = require('../models/formSchema')

exports.createForm = async (req,res)=>{
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: 'Unauthorized access.' });
    }

    const {name,fields,description,date} = req.body;
    if(!name || !Array.isArray(fields)){
        return res.status(400).json({message:"Invalid Form"})
    }
    const exist = await Event.findOne({name})
    if(exist){
        return res.status(400).json({message:"Event with same name took place. Please select a new name"});
    }
    const  newevent = new Event({
        name:name.trim(),
        fields,
        date,
        description
    })
    await newevent.save();
    const host = req.get('host');
    const formurl = `http://${host}/api/register/${newevent._id}`;
    newevent.form_url = formurl;
    await newevent.save();
    console.log(`${name} Event created on ${date} , form-url: ${formurl}`)
    return res.status(200).json({
        message:"event created",
        formurl:formurl
    });
}