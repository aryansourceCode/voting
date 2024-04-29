const express=require('express');
const{jwtauthmiddleware,generatetoken}=require('./../jwt')
const router=express.Router();
const User=require('./../models/user');
const { error } = require('console');


router.post('/signup',async(req,res)=>{
    try{
        const data=req.body;
        const newuser=new User(data);
        const response=await newuser.save();
        console.log("data saved");
        const payload={
            id:response.id
        }
        console.log(JSON.stringify(payload));
        const token=generatetoken(payload);
        console.log(token);
        res.status(200).json({response:response,token:token});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"});
    }
});


router.put('/profile/password',jwtauthmiddleware,async(req,res)=>{
    try{
        const userid=req.user;
        const {currentPassword,newPassword}=req.body;
        const user = await User.findById(userid); 

        if(!(await user.comparepassword(password))){
            return res.status(401).json({error:'Invalid username or password'});
        }
        user.password=newPassword;

        await user.save();

        console.log("password updated");
        res.status(200).json({message:"password updated"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})
    }
})

router.post('/login',async(req,res)=>{
    try{
        const{aadharCardNumber,password}=req.body;
        const user= await User.findOne({aadharCardNumber:aadharCardNumber});
        if(!user || !(await user.comparepassword(password))){
            return res.status(401).json({error:'Invalid username or password'});
        }
        const payload={
            id:user.id
        }
        const token=generatetoken(payload);
        res.json({token});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Inavalid errorr'})

    }
})

router.get('/profile',jwtauthmiddleware,async(req,res)=>{
    try{
        const userData=req.user;
        console.log('user data',userData);
        const userId = userData.id;
        const user = await User.findById(userId);
        
        // Respond with the user profile data
        res.status(200).json({user});

    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });

    }

})



module.exports=router;