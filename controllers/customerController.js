const mongoose = require('mongoose')
const { findOneAndDelete } = require('../models/order')

//database model import
const Snack = mongoose.model('Snack')
const Order = mongoose.model("Order")
const User = mongoose.model('User')
const Van = mongoose.model('Van')

const legalChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const legalNum = "0123456789"

const notDisplayingOrderStatus = ["cancelled", "inCart"]
const modifyOrderTimeLimit = 10
const delayOrderTimeLimit = 15

// list all snack in database
const getAllSnacks = async(req, res, anchor)=>{
  try{
    const snacks = await Snack.find().lean()
    return res.render("menu_public", {"snacks":snacks})
  }catch(err){
    res.status(400)
    return res.send("Database query failed")
  }
}

const getSnacksFromVan = async (req, res) => {
  try {
    const van = await Van.findOne({_id : req.params.van_id}).lean()
    const vanAvailability = van.availability
    let snacks = await Snack.find().lean()
    snacks = snacks.filter( (snack) => {
      return vanAvailability.includes(snack.snack_id)
    })

    try{
      const user = await User.findOne({email:req.session.email}).lean()
      let cart = (await Order.findOne({user_id : user._id.toString(), van_id: van.name, status:"inCart"}).lean()).goods

      const anchor = req.session.anchor

      req.session.anchor = null
      

      return res.render("menu_van", {"snacks":snacks, "cart":cart, "total":findTotal(cart), "anchor":anchor})
    }catch(err){
      var cart = []
      return res.render("menu_van", {"snacks":snacks, "cart":cart, "total":findTotal(cart)})
    }
  } catch (err) {
    res.status(400)
    return res.send("Database query failed")
  }
}


// get single snack in database by its id
const getSnackById = async(req, res, type)=>{
  try{
    const oneSnack = await Snack.findOne({"snack_id": req.params.snack_id}).lean()
    if(oneSnack === null){
      alert("Snack Not Found")
      return res.send("Snack Not Found")
    }
    return res.render("snack_detail", {"snack":oneSnack, "type":type})
  }catch(err){
    res.status(400)
    return res.send("Database query failed")
  }
}

// // start an order with current snack by id
// const startOrder = async (req, res) => {
//   try {
//       const oneSnack = await Snack.findOne( {"snack_id": req.params.snack_id})
//       if(oneSnack == null) {
//           res.status(404)
//           return res.send('Snack not found')
//       }
//       const order = await Order.create(
//         {items: oneSnack}
//       )
//       return res.send(order)
//   } catch (err) {
//       res.status(400)
//       return res.send("Database query failed")
//   }
// }



// add an item to the current user's cart
const addCart = async (req, res) => {
  try {
      const user = await User.findOne({email:req.session.email})
      if(user == null) {
        res.status(404)
        return res.send('Please login')
      }
      var oneSnack = await Snack.findOne( {"snack_id": req.params.snack_id})
      if(oneSnack == null) {
          res.status(404)
          return res.send('Snack not found')
      }
      // Try finding a inCart order, if none exist, create a new one
      const van = await Van.findOne({_id : req.params.van_id}).lean()
      var inCartOrder = await Order.findOne({user_id : user._id, van_id: van.name, status:"inCart"})

      if(inCartOrder == null) {
        cart = [{
          item: oneSnack,
          quantity: 1,
          price: oneSnack.price
        }]
        await Order.create({
          status: "inCart",
          goods: cart,
          total: oneSnack.price,
          van_id: van.name,
          user_id: user._id,
          timestamp: new Date().getTime()
        })
      }else {
        // a in cart order already exist
        let newCart = inCartOrder.goods.filter(elem=>elem["item"]["_id"].toString()===oneSnack._id.toString())
        if(newCart.length>0){
          let index = inCartOrder.goods.indexOf(newCart[0])
          let quantity = inCartOrder.goods[index].quantity+1
          inCartOrder.goods.splice(index, 1)
          inCartOrder.goods.push({
            item: oneSnack, 
            quantity: quantity,
            price: oneSnack.price
          })
        }else{
          inCartOrder.goods.push({
          item: oneSnack,
          quantity: 1,
          price: oneSnack.price
          })
        }
        inCartOrder.total = findTotal(inCartOrder.goods)
        await inCartOrder.save()
      }

    res.status(200)
    req.session.anchor = req.params.snack_id
    return res.redirect('../menu')      

  } catch (err) {
    res.status(400)
    return res.send("Database query failed")
  }
}


// add an item to the current user's cart
const removeCart = async (req, res) => {
  try {
      const user = await User.findOne({email:req.session.email})
      if(user == null) {
        res.status(404)
        return res.send('Please login')
      }

      var oneSnack = await Snack.findOne( {"snack_id": req.params.snack_id})
      if(oneSnack == null) {
          res.status(404)
          return res.send('Snack not found')
      }

      // Try finding a inCart order, if none exist, create a new one
      const van = await Van.findOne({_id : req.params.van_id}).lean()
      var inCartOrder = await Order.findOne({user_id : user._id, van_id: van.name, status:"inCart"})
      
      if(inCartOrder == null) {
        // Do nothing
      }else {
        let newCart = inCartOrder.goods.filter(elem=>elem["item"]["_id"].toString()===oneSnack._id.toString())
        if(newCart.length==1){
          let index = inCartOrder.goods.indexOf(newCart[0])
          let quantity = inCartOrder.goods[index].quantity
          if (quantity==1){
            inCartOrder.goods.splice(index, 1)
          }
          else{
            quantity = inCartOrder.goods[index].quantity-1
            inCartOrder.goods.splice(index, 1)
            inCartOrder.goods.push({
              item: oneSnack, 
              quantity: quantity,
              price: oneSnack.price
            })
          }
        }
        inCartOrder.total = findTotal(inCartOrder.goods)
        await inCartOrder.save()
        if(inCartOrder.goods.length == 0) {
          await Order.findOneAndDelete({user_id : user._id, van_id: van.name, status:"inCart"})
        }
      }

    res.status(200)
    req.session.anchor = req.params.snack_id
    return res.redirect('../menu')
  } catch (err) {
      res.status(400)
      return res.send("Database query failed")
  }
}





const findTotal = (cart) => {
  var total = 0
  for(var i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].quantity
  }
  return total
}

// create a order based on current cart
const createOrder = async (req, res) => {
  try {
      const user = await User.findOne({email:req.session.email}).lean()
      if(user == null) {
        res.status(404)
        return res.send('Please login')
      }

      const van = await Van.findOne({_id: req.params.van_id}).lean()

      const newOrder = await Order.findOne({user_id: user._id.toString(), van_id: van.name, status: "inCart"})

      newOrder.timestamp = new Date().getTime()
      newOrder.status = "outstanding"

      await newOrder.save()
      
      res.status(200)
      return res.redirect("../allOrders/" + newOrder._id)

  } catch (err) {
      res.status(400)
      return res.send(err)
  }
}

// list all orders
const listAllOrders = async (req, res) => {
  try {
      const user = await User.findOne({email:req.session.email})
      if(user == null) {
        res.status(404)
        return res.send('Please login')
      }
      // For all orders, check if they are delayed and update them
      var orders = await Order.find({user_id: user._id})

      for(var i = 0; i < orders.length; i++) {
        if(orders[i].status == "outstanding" && !orders[i].delayed && orderDelayed(orders[i].timestamp)) {
          orders[i].delayed = true; 
          await orders[i].save()
        }
      }

      var orders = await Order.find({user_id: user._id}).lean()
      orders.sort((a,b)=>{-(a.timestamp - b.timestamp)})
      orders = orders.filter( order => {
        return !notDisplayingOrderStatus.includes(order.status)
      })

      return res.render("orders_page", {"orders":orders, "router":"customer", "lstName":user.lastName, "Title": "OrderHistory"})

  } catch (err) {
      res.status(400)
      return res.send("Database query failed")
  }
}

const orderDelayed = (orderedTime) => {
  const currentTime = new Date().getTime()
  const timeElapsed = currentTime - orderedTime
  // Convert miliseconds to minutes
  return timeElapsed/60000 > delayOrderTimeLimit
}

const orderModfiable = (orderedTime) => {
  const currentTime = new Date().getTime()
  const timeElapsed = currentTime - orderedTime
  return timeElapsed/60000 < modifyOrderTimeLimit
}

//Show current Cart of current user
const showCart = async (req, res) => {
  try {
    const user = await User.findOne({email:req.session.email}).lean()
    if(user == null) {
      res.status(404)
      return res.send('User not found')
    }
    const van = await Van.findOne({_id : req.params.van_id}).lean()
    const order = await Order.findOne({user_id: user._id.toString(), van_id: van.name, status: "inCart"})

    let cart = order.goods
    if(cart.length===0){
      res.status(400)
      return res.render('notification',{"message":"Cart is empty"})
    }
    return res.render("cart_detail", {"cart":cart, "total": findTotal(cart)})
  } catch (err) {
    res.status(400)
    return res.send("Database query failed")
  }
}


//Show order Detail
const showOrderDetail = async (req, res, message) => {
  try {
    var order = await Order.findOne({"_id": req.params.order_id})
    if(order.status == "outstanding" && !order.delayed && orderDelayed(order.timestamp)) {
      order.delayed = true;
      await order.save()
    }

    order = await Order.findOne({"_id": req.params.order_id}).lean()
    if(order == null) {
      res.status(404)
      return res.send('Order not found')
    }
    return res.render("order_detail", {"order":order, "type": "customer", SuccessMessage: message})
  } catch (err) {
      res.status(400)
      return res.send("Database query failed")
    }
}

//Show User Detail
const showUserDetail = async (req, res) => {
  try {
    const customer = await User.findOne({email:req.session.email}).lean()
    if(customer == null) {
      res.status(404)
      return res.send('Customer not found')
    }
    // Show Outstanding orders
    const orders = await Order.find({user_id: customer._id, status: "outstanding"}).lean()
    return res.render('customer_page', {'customer':customer, 'orders': orders})
  } catch (err) {
      res.status(400)
      return res.send('Database query failed')
    }
}

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({_id: req.params.order_id})
    if(order.status == "outstanding" && orderModfiable(order.timestamp)) {
      order.status = "cancelled"
      await order.save()
      return showOrderDetail(req, res, "Order Cancelled Successfully.")
    }else {
      return showOrderDetail(req, res, "Ordered " + modifyOrderTimeLimit + " minutes ago, can't cancel")
    }
    
  } catch (err) {
    res.status(400)
    return res.send('Database query failed')
  }
}

const changeOrder = async (req, res) => {
  try {
    const user = await User.findOne({email:req.session.email})
    if(user == null) {
      res.status(404)
      return res.send('Please login')
    }
    const oldOrder = await Order.findOne({_id: req.params.order_id}).lean()
    const van_name = oldOrder.van_id
    if(oldOrder.status == "outstanding" && orderModfiable(oldOrder.timestamp)) {
      // Try finding a inCart order, if none exist, create a new one
      const van = await Van.findOne({name : van_name}).lean()
      var inCartOrder = await Order.findOne({user_id : user._id, van_id: van.name, status:"inCart"})

      if(inCartOrder == null) {
        const order = await Order.findOne({_id: req.params.order_id})
        order.status = "inCart"
        await order.save()
      }else {
        const order = await Order.findOne({_id: req.params.order_id})
        inCartOrder.goods = order.goods
        await inCartOrder.save()
        await Order.findOneAndDelete({_id: req.params.order_id})
      }
      res.redirect("/customer/" + van._id + "/menu")
    }else {
      return showOrderDetail(req, res, "Ordered " + modifyOrderTimeLimit + " minutes ago, can't modify")
    }



  }catch (err) {
    console.log(err)
    res.status(400)
    return res.send('Database query failed')
  }
}

const rateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({_id: req.params.order_id})
    const van = await Van.findOne({name: order.van_id})
    if (order == null) {
      res.status(404)
      return res.send("Order not found")
    }
    if (order.rating != null) {
      res.status(400)
      return res.send("Already rated")
    }
    if (req.params.rating < 0 && req.params.rating > 5) {
      res.status(400)
      res.send("Rating score must be within 0 to 5")
    }
    if (order.status == "complete") {
      order.rating = req.params.rating
      van.sumScore += req.params.rating
      van.sumRatings += 1
      await order.save()
      await van.save()
      res.status(200)
      
      return showOrderDetail(req, res, "Successfully rated")
    }else {
      res.status(400)
      return res.send("Order must be completed before rating")
    }
  } catch (err) {
    res.status(400)
    return res.send("Database query failed")
  }
}

const changePassword = async (req, res) => {
  try {
    const newPassword = req.body.password
    const user = await User.findOne({email:req.session.email})
    if(user == null) {
      req.session.message="No User Found"
      return res.render("change_password", {"FailMessage":req.session.message})
    }
    if(!user.validPassword(req.body.oldPassword)) {
      res.status(401)
      req.session.message="Old Password incorrect"
      return res.render("change_password", {"FailMessage":req.session.message})
    }

    if(newPassword.length < 7) {
      res.status(400)
      req.session.message="Password must not be less than 8 characters."
      return res.render("change_password", {"FailMessage":req.session.message})
  }

    var i
    var haveChar = false
    for(i = 0; i < newPassword.length; i++) {
      if(!legalChar.includes(newPassword.slice(i, i+1)) && !legalNum.includes(newPassword.slice(i, i+1))) {
        res.status(400)
        req.session.message="Password must contain alphabet character and number digit only."
        return res.render("change_password", {"FailMessage":req.session.message})
      }
      if(legalChar.includes(newPassword.slice(i, i+1))) {
        haveChar = true
      }
    }

    if(!haveChar) {
      res.status(400)
      req.session.message="Password must have at least one alphabet character."
      return res.render("change_password", {"FailMessage":req.session.message})
    }

    else {
      user.password = user.generateHash(newPassword)
      await user.save()
      req.session.email = null;
      req.session.type = null;
      req.logout();
      req.session.message="Password successfully changed"
      return res.render("customer_login", {"SuccessMessage":req.session.message})
    }
  }catch (err) {
    res.status(400)
    return res.send("Database query failed")
  }
}

const changeName = async (req, res) => {
  try {
    const user = await User.findOne({email:req.session.email})
    if(user == null) {
      res.status(404)
      return res.render("customer_login", {"FailMessage":"Please Login first!"})
    }
    else {
      user.firstName = req.body.firstName
      user.lastName = req.body.lastName
      await user.save()
      res.status(200)
      return res.render("edit_profile", {"SuccessMessage":"Change Success!"})
    }
  }catch (err){
    res.status(400)
    return res.send("Database query failed")
  }
}



// Add One Snack to the database
// const addOneSnack = async(req, res)=>{
//   try{
//     const snack = await Snack.create(
//       req.body
//     )
//     return res.send(snack)
//   }catch(err){
//     res.status(400)
//     return res.send(err)
//   }
// }


// update single snack in database by its id
// const updateOneSnack = async(req, res) =>{
//   try{
//     const snack = await Snack.findOneAndUpdate(
//       {"snack_id": req.body.snack_id},
//       req.body,
//       {new: true}
//     )
//     if(snack === null){
//       res.status(404)
//       return res.send("Snack not found")
//     }
//     return res.send(snack)
//   }catch(err){
//     res.status(400)
//     return res.send("Database update failed")
//   }
// }

// Delete a snack in database
// const deleteOneSnack = async(req, res)=>{
//   try{
//     const snack = await Snack.deleteOne(
//       {"snack_id": req.params.snack_id}
//     )
//     return res.send({"ok":snack.ok, num_deleted:snack.n})
//   }catch(err){
//     res.status(400)
//     return res.send("Database delete failed")
//   }
// }

module.exports = {
  //addOneSnack,
  getAllSnacks,
  getSnackById,
  //updateOneSnack,
  //deleteOneSnack,
  // startOrder,
  addCart,
  createOrder,
  listAllOrders,
  showCart,
  showOrderDetail,
  showUserDetail,
  cancelOrder,
  changeOrder,
  removeCart,
  rateOrder,
  getSnacksFromVan,
  changePassword,
  changeName
}