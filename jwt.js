const jwt=require('jsonwebtoken');
const jwtauthmiddleware=(req,res,next)=>{
    const authorization=req.headers.authorization;
    if(!authorization)return res.status(401).json({error:"token not found"});
    const token=req.headers.authorization.split(' ')[1];
    if(!token)return res.status(401).json({error:'unauthorised'});
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);
        req.user=decoded;
        next();
    }catch(err){
        console.log(err);
    }
}
const generatetoken=(userdata)=>{
    return jwt.sign(userdata,process.env.JWT_SECRET,{expiresIn:30000});
}

module.exports={jwtauthmiddleware,generatetoken};