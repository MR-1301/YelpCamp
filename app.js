const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const Campground=require('./models/campground')

//connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app=express();
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.get('/',(req,res) => {
    res.render('home')
});

app.get('/makecampground',async (req,res) => {
    const camp=new Campground({title:'My BackYard', description:'Cheap camping option'});
    await camp.save();
    res.send(camp);
});

const port=3000;
app.listen(port, () => {
    console.log(`Listening on Port : ${port}`)
})