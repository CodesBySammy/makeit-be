    const mongoose = require('mongoose')

    const eventModel = new mongoose.Schema({
        name:{
            type:String,
            required:true,
            unique:true
        },
        date:{
            type:String,
            required:true
        },
        created:{
            type:Date,
            default:Date.now
        },
        description:{
            type:String,
            required:true
        },
        attendance:[{
            name:{
                type:String,
                required:true
            },
            status:{
                type:String,
                enum:['Present','Absent'],
                default:'Absent'
            },
            email:{
                type:String,
                required:true
            }
        }],
        fields:[
            {
                type:{
                    type:String,
                    enum: ['text','email','number','radio','checkbox','select','text-area','file'],
                    required:true
                },
                name:{
                    type:String,
                    required:true
                },
                placeholder:{
                    type:String
                },
                options:[String],
                validation: {
                    required: { type: Boolean },
                    minLength: { type: Number },
                    maxLength: { type: Number },
                    regex: { type: String },
                    min: { type: Number },
                    max: { type: Number },
                },
            }
        ],
        form_url:{
            type:String
        }
    })

    module.exports = mongoose.model('Event',eventModel)