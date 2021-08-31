// Van Schema, set information of van
const mongoose = require("mongoose")
const bcrypt = require('bcrypt-nodejs')

const vanSchema = new mongoose.Schema({
    readyForOrder:      {type: Boolean,     default: false                                      },
    name:               {type: String,                      required: true,     unique: true    },
    password:           {type: String,                      required: true                      },
    availability:       {type: Array,       default: []                                         },
    lat:                {type: String,                                                          },
    long:               {type: String,                                                          },
    address:            {type: String                                                           },
    sumScore:           {type: Number,      default: 5                                          },
    sumRatings:         {type: Number,      default: 1                                          }
})

// Method to generate respective hash code from plain text password
vanSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}
  
// Method to check password is validate
vanSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

const Van = mongoose.model("Van", vanSchema)

module.exports = Van