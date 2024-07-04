const mongoose = require('mongoose');

const candidateSchema= new mongoose.Schema({
    state:{
        type:String
    },
    constituency:{
        type:String
    },
    name:{
        type: String,
        required:true
    },

    party:{
        type:String,
    },
    symbol:{
        type:String,
    },
    gender:{
        type:String,
    },
    criminalcases:{
        type:String,
    },
    age:{
        type:Number,
        required:true
    },
    category:{
        type:String
    },
    education:{
        type:String
    },
    assests:{
        type:String
    },
    liabilities:{

        type:String
    },
    image:{
        type:String
    },
    votes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            votedAt:{
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
})

const Candidate=mongoose.model('Candidate',candidateSchema);
module.exports= Candidate;