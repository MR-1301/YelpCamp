const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const expressError = require("./utils/expressErrors");
const passport = require('passport');
const LocalStrategy = require('passport-local');

const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const userRoutes=require('./routes/users')
const User = require('./models/user')

//connect to local MongoDB
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

//sets and uses
const app = express();
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
	secret: "thisshouldbeabettersecret",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionConfig));
app.use(flash());

//passport stuff
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//flash middleware
app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	return next();
});

//all routes
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use('/',userRoutes);

app.get("/", (req, res) => {
	res.render("home");
});

//login routes
app.get('/fakeUser', async (req, res) => {
	const userEntity = new User({email: 'mahir2cool@gmail.com', username: 'mmaahhiirr'});
	const newUser = await User.register(userEntity, 'chicken');
	res.send(newUser);
})

app.all("*", (req, res, next) => {
	next(new expressError("Page Note Found!!!", 404));
});

//Error handler
app.use((err, req, res, next) => {
	if (!err.message) err.message = "ops!! something Went Wrong!!";
	res.status(err.statusCode || 500).render("error", {err});
});

const port = 3000;
app.listen(port, () => {
	
	console.log(`Listening on Port : ${port}`);
});
