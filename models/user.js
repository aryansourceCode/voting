const mongoose = require('mongoose');
const bcrypt=require('bcrypt');

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String
    },
    mobile:{
        type:String,
    },
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["voter","admin"],
        default:"voter"
    },
    isVoted:{
        type:Boolean,
        default:false
    }

})
userSchema.pre('save',async function(next){
    const person= this;
    if(!person.isModified('password')) return next();
    try{
        const salt= await bcrypt.genSalt(10);
        const hashedpassword=await bcrypt.hash(person.password,salt);
        person.password=hashedpassword;
        next();
    }
    catch(err){
        return next(err);
    }
})
userSchema.methods.comparepassword=async function(candidatepassword){
    try{
        const ismatch = await bcrypt.compare(candidatepassword,this.password);
        return ismatch; 
    }catch(err){
        throw err;
    }
 }


const User=mongoose.model('User',userSchema);
module.exports= User;