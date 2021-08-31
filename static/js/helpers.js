var register = function(Handlebars) {
  var helpers = { // add all helpers as key: value pairs
      // an example of listfood helper to iterate over


      // Convert Timestamp to Local Time
      prettifyDate: function (timestamp) { 
        var date = new Date(timestamp);
        var out = (date.toLocaleString())
        // Hours part from the timestamp
        return out
      },

      // check if string equals
      ifEquals: function(arg1, arg2, options) {
          return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
      },

      // get limit number of items in loop
      limit: function (arr, limit) {
        if (!Array.isArray(arr)) { return []; }
        return arr.slice(0, limit);
      },

      // get orders that in progress
      IfinProgress: function (status) {
        if ((status=="cancelled") || (status=="complete")) {
           return false; 
        }
        return true;
      },

      findQuantityInCart: function(index, snack_id, cart){
        var quan = 0;
        for (var i=0;i<cart.length;i++){
            if (cart[i].item.snack_id === snack_id){
                quan = cart[i].quantity;
            }
        }
        return quan;
      },

      ifSnackAvailable: function(snack, currentAva, options) {
        console.log(currentAva)
        return currentAva.includes(snack.snack_id) ? options.fn(this) : options.inverse(this)
      },




  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    // register helpers
    // for each helper defined above (we have only one, listfood)
    for (var prop in helpers) {
        // we register helper using the registerHelper method
        Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
      // just return helpers object if we can't register helpers here
      return helpers;
  }

};


function isLoggedin(req, res, next) {
  if (req.session.type == 'van'){
    req.session.message = "Already logged in as Vendor"
    return res.render("notification", {"FailMessage": "Already Logged In As Vendor", "message": "Please Go to Vendor Page", "link":"/vendor"})
  }
  if (req.session.type == 'user') {
    req.session.message = "Already logged in as Customer"
    return res.render("notification", {"FailMessage": "Already Logged In As Customer", "message": "Please Go to Customer Page", "link":"/customer"})
  }
  else{
    return next()
  }
}

function isAuthenticated(req, res, next) {
  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLEp
  if (req.session.email){
      return next();
  }

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  req.session.message = "Please Login First"
  res.redirect('/customer/login');
}

function VanIsAuthenticated(req, res, next) {
  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLEp
  if (req.session.name){
      return next();
  }

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  req.session.message = "Please Login First"
  res.redirect('/vendor/login');
}


// export helpers to be used in our express app
module.exports.register = register;
module.exports.helpers = register(null);    
module.exports.isAuthenticated = isAuthenticated;
module.exports.VanIsAuthenticated =  VanIsAuthenticated;
module.exports.isLoggedin = isLoggedin;