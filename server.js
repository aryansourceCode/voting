const express=require('express');
const app=express();
const db=require('./db');
const path=require("path");
app.set("view engine","ejs");//for ejs file
app.use(express.static("public"));
app.set("views",path.join(__dirname,"/views"));
require('dotenv').config();
const bodyParser=require('body-parser')//not required as express has its own function
app.use(bodyParser.json());
const PORT=process.env.PORT || 4000;
const userRoutes=require('./routes/userRoutes')
const candidateRoutes=require('./routes/candidateRoutes')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JavaScript, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));
const {jwtauthmiddleware} =require('./jwt')
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.get("/home",(req,res)=>{
    res.render("home.ejs");
})
app.get('/profile-page', (req, res) => {
    res.render('profile');
  });
app.get('/afterlogin',(req,res)=>{
    res.render('afterlogin.ejs');
})
app.get('/adminpage',(req,res)=>{
    res.render("adminpage.ejs");
})
app.get("/changepassword",(req,res)=>{
    res.render("changepassword.ejs");
})
app.get("/results",(req,res)=>{
    res.render("results.ejs")
})
app.get('/',(req,res)=>{
    res.render('home.ejs');
})
app.get('/yourvote',(req,res)=>{
    res.render('yourvote.ejs')
})
app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`)
})
