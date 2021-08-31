//Cutomer Router
// url:  /cutomer/.....
const express = require('express')

require('../models')
const { isAuthenticated } = require("../static/js/helpers");
const { isLoggedin } = require("../static/js/helpers");


// Use passport strategy pre-defined
const passport = require('passport');
require('../config/passport')(passport);


const customerRouter = express.Router()
const customerController = require('../controllers/customerController.js')




// POST login form -- authenticate user
customerRouter.post('/login', isLoggedin, passport.authenticate('local-login', {
    successRedirect : '/customer', // redirect to the homepage
    failureRedirect : '/customer/login', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
}));

// POST - user submits the signup form -- signup a new user
customerRouter.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/customer', // redirect to the homepage
    failureRedirect : '/customer/register', // redirect to signup page
    failureFlash : true // allow flash messages
}));

// LOGOUT
customerRouter.post('/logout', isAuthenticated, function(req, res) {
    req.session.email = null;
    req.session.type = null;
    req.logout();
    req.flash('');
    res.redirect('/');
});


// Login and register page
customerRouter.get('/login',(req,res)=>{
    res.render("customer_login", {"FailMessage":req.session.message})
    req.session.message=null;
})
customerRouter.get('/register',(req,res)=>{
    res.render("register_page", {"FailMessage":req.session.message})
    req.session.message=null;
})

//showUserDetail on Customer Page
customerRouter.get('/', isAuthenticated, (req, res)=>customerController.showUserDetail(req, res))
//show all snacks
customerRouter.get('/menu', (req, res)=>customerController.getAllSnacks(req, res))
//show snacks availible for a vendor
customerRouter.get('/:van_id/menu', (req, res) => customerController.getSnacksFromVan(req, res))

//show single snack by id
customerRouter.get('/menu/:snack_id', (req, res)=>customerController.getSnackById(req, res, "public"))

customerRouter.get('/:van_id/menu/:snack_id', (req, res)=>customerController.getSnackById(req, res))

// Need this route?
//start a new order in current snack
customerRouter.get('/:van_id/menu/:snack_id/startOrder', isAuthenticated, (req, res) => customerController.startOrder(req, res))

//add an item to the cart
customerRouter.post('/:van_id/addCart/:snack_id', isAuthenticated, (req, res) => customerController.addCart(req, res))
customerRouter.post('/:van_id/removeCart/:snack_id', isAuthenticated, (req, res) => customerController.removeCart(req, res))

//create the order based on current cart
customerRouter.post('/:van_id/createOrder', isAuthenticated, (req, res) => customerController.createOrder(req, res))

// Add total price in orders?
//list all orders
customerRouter.get('/allOrders', isAuthenticated, (req, res) => customerController.listAllOrders(req, res))
//list order detail
customerRouter.get('/allOrders/:order_id', isAuthenticated, (req, res) => customerController.showOrderDetail(req, res))

//direct to cart page after press check out but not from my page
customerRouter.get('/:van_id/cart', isAuthenticated, (req, res) => customerController.showCart(req, res))

//TODO Check if 10 mins has passed before editing or cancel the order
//cancel an order
customerRouter.post('/allorders/:order_id/CancelOrder', isAuthenticated, (req, res) => customerController.cancelOrder(req, res))
//change an order
customerRouter.get('/allorders/:order_id/modifyOrder', isAuthenticated, (req, res) => customerController.changeOrder(req, res))


//Rate an order
customerRouter.post('/allorders/:order_id/:rating/rate', isAuthenticated, (req, res) => customerController.rateOrder(req, res))
// Edit page
customerRouter.get('/edit_profile',(req,res)=>{
    res.render("edit_profile", {"FailMessage":req.session.message})
    req.session.message=null;
})
// Edit page
customerRouter.get('/change_password',(req,res)=>{
    res.render("change_password", {"FailMessage":req.session.message})
    req.session.message=null;
})
//Change password
customerRouter.post('/changePassword', isAuthenticated, (req, res) => customerController.changePassword(req, res))
//Change username
customerRouter.post('/changeName', isAuthenticated, (req, res) => customerController.changeName(req, res))

//customerRouter.post('/addSnack', (req, res)=>customerController.addOneSnack(req, res))
//customerRouter.post('/updateSnack', (req, res)=>customerController.updateOneSnack(req, res))
//customerRouter.delete('/deleteSnack/:snack_id', (req, res)=>customerController.deleteOneSnack(req, res))


module.exports = customerRouter