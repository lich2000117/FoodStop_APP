const mongoose = require('mongoose')
const { session } = require('passport')

//database model import
const Order = require('../models/order')
const Van = require('../models/van')
const {Snack} = require('../models/snack')

const showVanDetail = async (req, res) => {
    try {
        const van = await Van.findOne({name: req.session.name}).lean()
        const orders = await Order.find({van_id: req.session.name ,status : "outstanding"}).lean()
        res.status(200)
        res.render("vendor_page", {"van": van, "orders":orders})
    }catch (err) {

    }
}

//set Van status by parsing the location and its status
const setVanLocation = async (req, res) => {
    try {
        var van = await Van.findOne({name: req.session.name})

        van.lat = req.params.lat.toString()
        van.long = req.params.long.toString()
        van.address = req.params.address
        await van.save()
    
        return res.redirect("/vendor")
    }catch (err) {
        res.status(400)
        res.send("Database Query Failed")
    }
}

const openForBusiness = async (req, res) => {
    try {
        var van = await Van.findOne({name: req.session.name})
        van.readyForOrder = true
        const allSnacks = await Snack.find().lean()
        var ava = []
        for(var i = 0; i < allSnacks.length; i++) {
            ava.push(allSnacks[i].snack_id)
        }
        van.availability = ava

        await van.save()
        res.status(200)
        return res.redirect("/vendor/menu")
    
    }catch (err) {
        res.status(400)
        res.send("Database Query Failed")
    }
}

const closeForTheDay = async (req, res) => {
    try {
        var van = await Van.findOne({name: req.session.name})
        van.readyForOrder = false

        await van.save()
        res.status(200)
        return res.redirect("/vendor")
    }catch (err) {
        res.status(400)
        res.send("Database Query Failed")
    }
}

// list all orders not yet fulfilled
const listOutstandingOrders = async (req, res, message) => {
    try {
        const orders = await Order.find({van_id: req.session.name ,status : "outstanding"}).lean()
        return res.render("orders_page", {"orders":orders, "router":"vendor", "lstName":req.session.name, "Title": "Outstanding Orders", SuccessMessage: message})
    } catch (err) {
        res.status(400)
        res.send("Database query failed")
    }
}

// get all orders by using its ID, including not fullfilled
const getAllOrders = async(req,res)=>{
    try{
        var AllOrders = await Order.find({van_id : req.session.name}).lean()
        AllOrders =  AllOrders.filter( (order) => {
            const notDisplayingOrderStatus = ["cancelled", "inCart"]
            return !notDisplayingOrderStatus.includes(order.status)
        })

        return res.render("orders_page", {"orders":AllOrders, "router":"vendor", "lstName":req.session.name, "Title": "Order History"})
    }catch(err){
      res.status(400)
      return res.send("Database query failed")
    }
}

// get all orders by using its ID, including not fullfilled
const getSingleOrderByID = async(req,res)=>{
    try {
        const order = await Order.findOne({"_id": req.params._id}).lean()
        if(order == null) {
          res.status(404)
          return res.send('Order not found')
        }
        return res.render("order_detail", {"order":order, "type": "vendor"})
      } catch (err) {
          res.status(400)
          return res.send("Database query failed")
        }
}

// mark a single order as fulfilled by using its ID
const setOrderStatus = async (req, res) => {
    try {
        let currentOrder = await Order.findOne({"_id":req.params._id})
        currentOrder.status = req.params.status
        await currentOrder.save()
        return listOutstandingOrders(req, res, req.params.status + " Success!")
    } catch (err){
        res.status(400)
        return res.send("Database query failed")
    }
}

const providedMenu = async (req, res) => {
    try {
        const snacks = await Snack.find().lean()
        const currentAva = (await Van.findOne({'name': req.session.name}).lean()).availability

        res.render("vendor_menu", {"snacks":snacks, "currentAva": currentAva})
    }catch (err) {

    }
}

// Set a snack's availability
const setAvailability = async (req, res, type) => {
    try {
        // Update the van's availability
        var currentAva = (await Van.findOne({'name': req.session.name}).lean()).availability
        const oneSnack = req.params.snack_id
        if(type == "available" && !currentAva.includes(oneSnack)) {
            currentAva.push(oneSnack)
        }else if(type == "unavailable" && currentAva.includes(oneSnack)) {
            currentAva.splice(currentAva.indexOf(oneSnack), 1)
        }

        var van = await Van.findOne({'name': req.session.name})
        van.availability = currentAva
        await van.save()
        
        res.status(200)
        return res.redirect("/vendor/menu")
        
    }catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

const getRating = async (req, res) => {
    try{
        const van = Van.findOne({name: req.params.vanName})
        if(van == null) {
            res.status(404)
            return res.send('Vendor not found')
        }
        else {
            return Math.round((van.sumScore/van.sumRatings)*100)/100
        }
    }catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

module.exports = {
    showVanDetail,
    openForBusiness,
    closeForTheDay,
    setVanLocation,
    listOutstandingOrders,
    setOrderStatus,
    getAllOrders,
    getSingleOrderByID,
    providedMenu,
    setAvailability,
    getRating
}