// Snack Schema storing information of snack

const mongoose = require('mongoose')

const snackSchema = new mongoose.Schema({
  snack_id: {type: String, required: true, unique: true, sparse: true},
  name: {type: String, required: true},
  price: {type: Number, required: true, min: 0},
  picture: {type: String},
  description: {type: String}
})
const Snack = mongoose.model("Snack", snackSchema)


module.exports = {Snack, snackSchema}