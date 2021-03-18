const mongoose=require('mongoose');
const Campground=require('../models/campground');
const cities = require('./cities');
const {descriptors,places}=require('./seedHelpers');

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

const sample= arr => arr[Math.floor(Math.random()*(arr.length))];

const seedDB=async () =>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++)
    {
        const index=Math.floor(Math.random()*1000);
        const camp=new Campground({
            title:`${sample(descriptors)} ${sample(places)}`,
            location:`${cities[index].city}, ${cities[index].state}`,

        });
        await camp.save();
    }
    
};

seedDB().then(() => {
    mongoose.connection.close();
});