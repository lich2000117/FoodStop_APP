//Vendor Router
// url:  /Vendor/.....
const express = require('express')

require('../models')
const { VanIsAuthenticated } = require("../static/js/helpers");
const { isLoggedin } = require("../static/js/helpers");

// Use passport strategy pre-defined
const vanPassport = require('passport');
require('../config/vanPassport')(vanPassport);

const vendorRouter = express.Router()
const vendorController = require('../controllers/vendorController')

// POST login form -- authenticate user
vendorRouter.post('/login', isLoggedin, vanPassport.authenticate('van-local-login', {
    successRedirect : '/vendor', // redirect to the homepage
    failureRedirect : '/vendor/login', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
}));

// POST - user submits the signup form -- signup a new user
vendorRouter.post('/signup', vanPassport.authenticate('van-local-signup', {
    successRedirect : '/', // redirect to the homepage
    failureRedirect : '/login', // redirect to signup page
    failureFlash : true // allow flash messages
}));

// LOGOUT
vendorRouter.post('/logout', VanIsAuthenticated, function(req, res) {
    req.session.name = null;
    req.session.type = null;
    req.logout();
    req.flash('');
    res.redirect('/');
});




// Login page
vendorRouter.get('/login',(req,res)=>{
    res.render("vendor_login", {"FailMessage":req.session.message})
    req.session.message=null;
})

vendorRouter.get('/', VanIsAuthenticated, (req, res) => vendorController.showVanDetail(req, res))
//set Van location
vendorRouter.get('/setVanLocation/:lat/:long/:address', VanIsAuthenticated,  (req, res) => vendorController.setVanLocation(req, res))
// open business
vendorRouter.get('/openBusiness', VanIsAuthenticated,  (req, res) => vendorController.openForBusiness(req, res))
// close business
vendorRouter.get('/closeBusiness', VanIsAuthenticated,  (req, res) => vendorController.closeForTheDay(req, res))

// list all orders that are outstanding
vendorRouter.get('/allorders/outstanding', VanIsAuthenticated,  (req, res) => vendorController.listOutstandingOrders(req, res))
// set order status
vendorRouter.post('/allorders/:_id/setStatus/:status', VanIsAuthenticated,  (req, res) => vendorController.setOrderStatus(req, res))

vendorRouter.get('/allorders/', VanIsAuthenticated,  (req, res) => vendorController.getAllOrders(req, res))
vendorRouter.get('/allorders/:_id', VanIsAuthenticated,  (req, res) => vendorController.getSingleOrderByID(req, res))

vendorRouter.get('/menu', VanIsAuthenticated,  (req, res) => vendorController.providedMenu(req, res))

vendorRouter.get('/menu/:snack_id/available', VanIsAuthenticated,  (req, res) => vendorController.setAvailability(req, res, "available"))
vendorRouter.get('/menu/:snack_id/unavailable', VanIsAuthenticated,  (req, res) => vendorController.setAvailability(req, res, "unavailable"))
vendorRouter.get('/rating/:vanName', VanIsAuthenticated, (req, res) => vendorController.getRating(req, res))



module.exports = vendorRouter