require('dotenv').config()
const mongoose = require("mongoose")

// Connection to Database using .env environment file
CONNECTION_STRING = 
"mongodb+srv://<username>:<password>@cluster0.ci1k6.mongodb.net/foodstopdb?retryWrites=true&w=majority"
MONGO_URL = CONNECTION_STRING.replace("<username>", process.env.MONGO_USERNAME).replace("<password>", process.env.MONGO_PASSWORD)

// Database Connection
mongoose.connect(MONGO_URL || "mongodb://localhost",{
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: "foodstopdb"
})


//set database connection
const db = mongoose.connection

db.on("error",err=>{
  console.log(err)
  process.exit(1)
})

db.once('open', async()=>{
  console.log(`Mongo connection started on ${db.host}: ${db.port}`)
})

//import models
require("./snack")
require("./order")
require("./van")
require("./user")