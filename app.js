// requiring
const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');
const Campground=require('./models/campground');

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

//sets and uses
const app=express();
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

//all routes
app.get('/',(req,res) => {
    res.render('home')
});

app.get('/campgrounds',async (req,res) => {
    const allCampgrounds=await Campground.find({});
    res.render('./campgrounds/index',{allCampgrounds});
});

app.post('/campgrounds',async (req,res) => {;
    const newCampground=new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
});

app.get('/campgrounds/new',(req,res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id/edit',async (req,res) => {
    const {id}=req.params;
    const currInfo=await Campground.findById(id);
    res.render('./campgrounds/edit',{currInfo});
})

app.get('/campgrounds/:id',async (req,res) => {
    const {id}=req.params;
    const currCampground=await Campground.findById(id);
    res.render('./campgrounds/show',{currCampground});
});

app.put('/campgrounds/:id',async (req,res) => {
    const {id}=req.params;
    const camp=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${id}`);
});

app.delete('/campgrounds/:id',async (req,res) => {
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

const port=3000;
app.listen(port, () => {
    console.log(`Listening on Port : ${port}`)
})