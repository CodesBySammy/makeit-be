const mongoose = require('mongoose')

const formdata = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    events:[
        {
            name:{
                type:String
            },
            responses:{
                type:Object,
                required:true
            }
        }
    ],
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    }
},{ timestamps: true });

const User = mongoose.model('User', formdata, 'formdata');
module.exports = User