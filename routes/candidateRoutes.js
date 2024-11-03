const express = require('express');
const { jwtauthmiddleware, generatetoken } = require('./../jwt');
const router = express.Router();
const User = require('./../models/user');
const app=express();
const Candidate = require('./../models/candidate');
const path = require("path");
const { uploadToCloudinary } = require('../cloudinary');
const upload=require('../multer');
const { error } = require('console');

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
router.post('/addcandidate', upload.single('f_image'), jwtauthmiddleware, async (req, res) => {
    try {
        // Check if user is an admin
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "User is not an admin" });
        }

        const data = req.body;

        // Upload the file to Cloudinary
        console.log("file",req.file);
        const cloudinaryResponse = await uploadToCloudinary(req.file.path);
        console.log('Cloudinary response:', cloudinaryResponse);

        if (cloudinaryResponse) {
            data.f_image = cloudinaryResponse.secure_url; // Set the image URL
        } else {
            console.error('Cloudinary upload failed, response:', cloudinaryResponse);
            return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
        }

        console.log('Candidate data before saving:', data);  // Log the candidate data

        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();

        console.log('Candidate data saved:', response);
        res.status(200).json({ response });
    } catch (err) {
        console.error('Error saving candidate:', err); // Logs the error details
        res.status(500).json({ error: "Internal server error" });
    }
});


router.put('/update/:candidateID',upload.single('f_image'), jwtauthmiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ error: 'User is not an admin' });
        }

        const candidateId = req.params.candidateID;
        const updateCandidateData = req.body;
        const uploadedFile = req.file;

        // Find the existing candidate data
        const existingCandidate = await Candidate.findById(candidateId);
        if (!existingCandidate) {
            return res.status(404).json({ error: "Candidate Not Found" });
        }

        // Merge updates with existing data
        const updatedData = {
            state: updateCandidateData.state || existingCandidate.state,
            constituency: updateCandidateData.constituency || existingCandidate.constituency,
            name: updateCandidateData.name || existingCandidate.name,
            party: updateCandidateData.party || existingCandidate.party,
            symbol: updateCandidateData.symbol || existingCandidate.symbol,
            gender: updateCandidateData.gender || existingCandidate.gender,
            criminalcases: updateCandidateData.criminalcases || existingCandidate.criminalcases,
            age: updateCandidateData.age || existingCandidate.age,
            category: updateCandidateData.category || existingCandidate.category,
            education: updateCandidateData.education || existingCandidate.education,
            assets: updateCandidateData.assets || existingCandidate.assets,
            liabilities: updateCandidateData.liabilities || existingCandidate.liabilities,
            image: uploadedFile ? uploadedFile.path : existingCandidate.image
        };

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ error: "Candidate Not Found" });
        }

        console.log("Candidate data updated");
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/delete/:candidateID', jwtauthmiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(500).json({ error: 'user is not an admin' });
        }
        const candidateId = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: "Candidate Not Found" });
        }
        console.log("candidate deleted");
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/vote/:candidateID', jwtauthmiddleware, async (req, res) => {
    const candidateId = req.params.candidateID;
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: "candidate not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }
        if (user.isVoted) {
            return res.status(404).json({ error: "you have already voted" });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ error: "admin is not allowed" });
        }

        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();
        user.votedto=candidateId;

        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: "vote recorded successfully" });
    } catch (err) {
        console.log(err);
        return res.status(404).json({ error: "internal server error" });
    }
});

router.get('/vote/count', async (req, res) => {
    try {
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            };
        });
        return res.status(200).json(voteRecord);

    } catch (err) {
        console.log(err);
        return res.status(404).json({ error: "internal server error" });
    }
});

router.get('/candidates', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const searchQuery = req.query.search || '';
    const startIndex = (page - 1) * limit;

    try {
        // Create a search criteria
        const searchCriteria = searchQuery ? {
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },//i for checking case sensitive
                { constituency: { $regex: searchQuery, $options: 'i' } },
                { party: { $regex: searchQuery, $options: 'i' } },
                { state: { $regex: searchQuery, $options: 'i' } }
            ]
        } : {};

        const totalCandidates = await Candidate.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalCandidates / limit);
        const candi = await Candidate.find(searchCriteria).skip(startIndex).limit(limit);//pagination

        res.render('candidateslist', {//sending data from backend
            candi,
            currentPage: page,
            totalPages,
            searchQuery
        });
        
    } catch (err) {
        console.log(err);
        return res.status(404).json({ error: "internal server error" });
    }
});
router.get('/candi', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const searchQuery = req.query.search || '';
    const startIndex = (page - 1) * limit;

    try {
        // Create a search criteria
        const searchCriteria = searchQuery ? {
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { constituency: { $regex: searchQuery, $options: 'i' } },
                { party: { $regex: searchQuery, $options: 'i' } },
                { state: { $regex: searchQuery, $options: 'i' } }
            ]
        } : {};

        const totalCandidates = await Candidate.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalCandidates / limit);
        const candi = await Candidate.find(searchCriteria).skip(startIndex).limit(limit);

        res.render('candi',{
            candi,
            currentPage: page,
            totalPages,
            searchQuery
        })
       
        
    } catch (err) {
        console.log(err);
        return res.status(404).json({ error: "internal server error" });
    }
});

router.get('/results', async (req, res) => {
    try {
        // Aggregate total vote counts
        const totalVotesResult = await Candidate.aggregate([
            {
                $group: {
                    _id: null,
                    totalVotes: { $sum: "$voteCount" }
                }
            }
        ]);

        const totalVotes = totalVotesResult[0]?.totalVotes || 0;

        // Aggregate vote counts by party, calculate percentage, and sort in descending order
        const results = await Candidate.aggregate([
            {
                $group: {
                    _id: "$party",
                    totalVotes: { $sum: "$voteCount" },
                    allvotes:{$sum:"$voteCount"}
                }
            },
            {
                $project: {
                    _id: 1,
                    totalVotes: 1,
                    percentage: { $cond: { if: { $eq: [totalVotes, 0] }, then: 0, else: { $multiply: [{ $divide: ["$totalVotes", totalVotes] }, 100] } } }
                }
            },
            {
                $sort: { totalVotes: -1 } // Sort by totalVotes in descending order
            }
        ]);

        res.render('results', { results,totalVotes });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.get('/yourvotes',jwtauthmiddleware,async(req,res)=>{
    try{
    const userId = req.user.id;
    const c=await User.findById(userId);
    console.log(c.votedto);
    if(c.isVoted){
        const candidate = await Candidate.findById(c.votedto);
    //console.log(candidate);
        res.status(200).json({candidate});

    }
    else{
        res.status(500).error({message:"not voted"});
    }
    
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });

    }
})


module.exports = router;
