const express=require('express');
const{jwtauthmiddleware,generatetoken}=require('./../jwt')
const router=express.Router();
const User=require('./../models/user');
const { error } = require('console');
const Candidate=require('./../models/candidate');

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (!user) {
            console.log('User not found with ID:', userID);
            return false; // User not found, consider as non-admin
        }

        console.log('User role:', user.role);

        if (user.role === 'admin') {
            return true; // User is an admin
        } else {
            return false; // User is not an admin
        }
    } catch (err) {
        console.error('Error checking admin role:', err);
        return false; // Handle any errors by considering as non-admin
    }
};

router.post('/', jwtauthmiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "User is not an admin" });
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();

        console.log('Candidate data saved');
        res.status(200).json({ response });
    } catch (err) {
        console.error('Error saving candidate:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.put('/:candidateID',jwtauthmiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(500).json({error:'user is not an admin'});
        }
        const candidateId=req.params.candidateID;
        const upadateCandidateData=req.body; 

        const response= await Person.findByIdAndUpdate(candidateID,upadateCandidateData,{
             new:true,
             runValidators:true
        })
        if(!response){
            return res.status(404).json({error:"Candidate Not FOund"})
        }
        console.log("candidate data updated");
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"});
    }
})

router.delete('/:candidateID',jwtauthmiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(500).json({error:'user is not an admin'});
        }
        const candidateId=req.params.candidateID;
        const response= await Person.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(404).json({error:"Candidate Not FOund"})
        }
        console.log("candidate deleted");
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"});
    }
})


module.exports=router;