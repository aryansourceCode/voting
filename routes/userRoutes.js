const express=require('express');
const{jwtauthmiddleware,generatetoken}=require('./../jwt')
const router=express.Router();
const app=express();
const upload=require('../multer');
const User=require('./../models/user');
const { error } = require('console');
const path=require("path");
const { uploadToCloudinary } = require('../cloudinary');


router.post('/signup', upload.single('f_image'), async (req, res) => {
    try {
        const data = req.body;
        console.log("Data received:", data);

        if (req.file) {
            // If a file is uploaded, upload it to Cloudinary
            const cloudinaryResponse = await uploadToCloudinary(req.file.path);

            if (cloudinaryResponse) {
                // If successfully uploaded to Cloudinary, set cloudinary URL in data
                data.f_image = cloudinaryResponse.secure_url;
            } else {
                // Handle case where upload to Cloudinary failed
                return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
            }
        }

        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        const newuser = new User(data);
        const response = await newuser.save();
        console.log("User data saved");

        res.render("login.ejs");

        const payload = {
            id: response.id
        };
        const token = generatetoken(payload);

        console.log("Token generated:", token);
        // Optionally, you can return the token in the response if needed
        // res.status(200).json({ response: response, token: token });
    } catch (err) {
        console.log("Error during signup:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.put('/profile/password',jwtauthmiddleware,async(req,res)=>{
    try{
        const userid=req.user;
        //console.log({"user is":userid});
        const {currentPassword,newPassword}=req.body;
        const user = await User.findById(userid.id); 

        if(!(await user.comparepassword(currentPassword))){
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
        console.log(req.body)
        const{aadharCardNumber,password}=req.body;
         console.log(aadharCardNumber);
        const user= await User.findOne({aadharCardNumber:aadharCardNumber});
        if(!user || !(await user.comparepassword(password))){
            return res.status(401).json({error:'Invalid username or password'});
        }
        const payload={
            id:user.id
        }
        
        const token=generatetoken(payload);
        console.log(token);
      
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