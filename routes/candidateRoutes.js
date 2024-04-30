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

        const response= await Candidate.findByIdAndUpdate(candidateId,upadateCandidateData,{
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
        const response= await Candidate.findByIdAndDelete(candidateId);

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
router.post('/vote/:candidateID',jwtauthmiddleware,async(req,res)=>{
    candidateId=req.params.candidateID;
    userId=req.user.id;
    try{
        const candidate=await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({error:"candidate not found"});
        }
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"user not found"});
        }
        if(user.isVoted){
            res.status(404).json({error:"you have already voted"});
        }
        if(user.role==='admin'){
            res.status(403).json({error:"admin is not allowed"});
        }

        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        user.isVoted=true;
        await user.save();

        res.status(200).json({message:"vote recorded successfully"});
    }catch(err){
        console.log(err);
        return res.status(404).json({error:"internal server error"});
    }
})

router.get('/vote/count',async(req,res)=>{
    try{
        const candidate=await Candidate.find().sort({voteCount:'desc'});

        const voteRecord=candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        });
        return res.status(200).json(voteRecord);

    }catch(err){
        console.log(err);
        return res.status(404).json({error:"internal server error"});
    }
})

module.exports=router;