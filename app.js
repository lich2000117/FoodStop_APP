//====================NPM modules====================
const express = require("express")
const exphbs = require("express-handlebars")
var bodyParser = require('body-parser');

const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash-plus')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()
require('./config/passport')



//====================Models Import====================
require('./models')
const customerRouter = require('./routes/customerRouter.js')
const vendorRouter = require('./routes/vendorRouter');
const { isAuthenticated } = require("./static/js/helpers");

const mongoose = require('mongoose')

//database model import
const Van = mongoose.model("Van")

//====================Configurations====================
const app = express();
const PORT = 3000


//====================Modules====================
// setup a session store signing the contents using the secret key
app.use(session({ secret: process.env.PASSPORT_KEY,
    resave: true,
    saveUninitialized: true
   }));
  
//middleware that's required for passport to operate
app.use(passport.initialize());
  
// middleware to store user object
app.use(passport.session());





app.engine("hbs", exphbs({
    defaultLayout: "main",
    extname: "hbs",
    helpers: require(__dirname + "/static/js/helpers.js").helpers
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.set("view engine", "hbs")

// use flash to store messages
app.use(flash());


//====================Main URLs====================
app.get('/google819f75dfb4bf9046.html',(req,res)=>{
    res.sendFile(__dirname + "/static/auth/google819f75dfb4bf9046.html")
})

app.get('/',(req,res)=>{
    //cover page
    res.sendFile(__dirname + "/views/cover.html")
})
app.get('/home',async (req,res)=>{
    try {
        res.status(200)
        res.render("home")
    } catch (err) {
        res.status(400)
        res.send('Database query failed')
    }
    
})

app.get('/vansLocation',async (req,res)=>{
    try {
        const vans = await Van.find({readyForOrder: true}).lean()
        res.status(200)
        res.json(vans)
    } catch (err) {
        res.status(400)
        res.send('Database query failed')
    }
    
})
app.get('/contact',(req,res)=>{
    //contact page
    res.render("contact")
})


//Login and register Page
app.get('/login',(req,res)=>{
    res.render("login_page", {"Message":req.session.message})
    req.session.message=null;
})
//====================Functional_Page====================


// app.get('*',(req,res)=>{
//     res.status(404).send("Invalid Request")
// })


//====================Import Routers====================
app.use('/customer',customerRouter)
app.use('/vendor', vendorRouter)




//====================Error Page====================
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.status(404);
    res.render("notification", {"FailMessage": "404 Error!", "message": "404"})
  });

//====================Start Server====================
app.listen(process.env.PORT || PORT,()=>{
    console.log("Server is running!")
    console.log("running on port", PORT)
})

module.exports = app