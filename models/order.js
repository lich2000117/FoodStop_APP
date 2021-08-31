//Order Schema, storing order detail

const mongoose = require("mongoose")
const Snack = require("./snack")


const orderSchema = new mongoose.Schema({
    status: {
        type: String, 
        enum: ['outstanding', 'fulfilled', 'complete', 'cancelled', 'inCart'],
        default: 'outstanding'
    }, //default outstanding
    // items: {type: Snack.snackSchema}, //d2 ver of items
    user_id: {type: String, required: true},
    // Van name
    van_id: {type: String, required: true},
    goods: {type: Array, default: []}, //d3 ver of items
    total: {type: Number, required: true},
    delayed: {type: Boolean, default: false},
    timestamp: {type: Number},
    rating:{type: Number, min:0, max:5}
})
const Order = mongoose.model("Order", orderSchema)

//export
module.exports = Order