const express=require('express');
const app=express();
const db=require('./db');
require('dotenv').config();
const bodyParser=require('body-parser')
app.use(bodyParser.json());
const PORT=process.env.PORT || 4000;
const userRoutes=require('./routes/userRoutes')
const candidateRoutes=require('./routes/candidateRoutes')
const {jwtauthmiddleware} =require('./jwt')
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);

app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`)
})
