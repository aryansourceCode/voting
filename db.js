const mongoose=require('mongoose');
//const mongoURL="mongodb://localhost:27017/voting";
require('dotenv').config();
const mongoURL=process.env.DB_URL;
mongoose.connect(mongoURL,{//mongoose se connection build ho rha db se
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
const db = mongoose.connection;

db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.on('connected', () => {
    console.log('Connected to MongoDB');
});

db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});
module.exports=db;