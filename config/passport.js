// JWT password key
require('dotenv').config()

// Local strategy for authentication
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/user.js')
// const mongoose = require('mongoose')
// const User = mongoose.model('User')

const JWT = require('passport-jwt')
const JwtStrategy = JWT.Strategy
const ExtractJwt = JWT.ExtractJwt
const legalChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const legalNum = "0123456789"

module.exports = function(passport) {
    
    // Store user object id to achieve information exchange from session
    passport.serializeUser(function(user, done) {
        done(null, user._id)
    })

    passport.deserializeUser(function(_id, done) {
        User.findById(_id, function(err, user) {
            done(err, user)
        })
    })

    // Login startegy
    passport.use('local-login', new LocalStrategy( {
            usernameField: 'email', 
            passwordField: 'password',
            passReqToCallback: true},
        
        function(req, email, password, done){

            process.nextTick(function() {
                User.findOne({'email': email}, function(err, user) {
                    // Handling case of authentication failure
                    if(err) {
                        req.session.message = "Login Error"
                        return done(null, false, req.flash('loginMessage', 'Login Error!'))
                    }
                    if(!user) {
                        req.session.message = "Please Check Your Email or Password."
                        return done(null, false, req.flash('loginMessage', 'No user found.'))
                    }

                    if(password.length < 7) {
                        req.session.message = "Password should not be less than 8 characters"
                        console.log("Password should not be less than 8 characters")
                        return done(null, false, req.flash('signupMessage', "Password must not be less than 8 characters."))
                    }

                    var i
                    var haveChar = false
                    for(i = 0; i < password.length; i++) {
                        if(!legalChar.includes(password.slice(i, i+1)) && !legalNum.includes(password.slice(i, i+1))) {
                            req.session.message = "Password must contain alphabet character and number digit only."
                            console.log("Password must contain alphabet character and number digit only.")
                            return done(null, false, req.flash('signupMessage', "Password must contain alphabet character and number digit only."))
                        }
                        if(legalChar.includes(password.slice(i, i+1))) {
                            haveChar = true
                        }
                    }

                    if(!haveChar) {
                        req.session.message = "Password must have at least one alphabet character. "
                        console.log("Password must have at least one alphabet character. ")
                        return done(null, false, req.flash('signupMessage', "Password must have at least one alphabet character. "))
                    }

                    if(!user.validPassword(password)) {
                        req.session.message = "Please Check Your Email or Password."
                        return done(null, false, req.flash('loginMessage', 'Wrong Password!'))
                    }

                    // Successful login
                    else{
                        req.session.email = email
                        req.session.type = "user"
                        return done(null, user, req.flash('loginMessage', 'Login successful'))
                    }

                })
            })

        }))

    // Sign up strategy
    passport.use('local-signup', new LocalStrategy( {
            usernameField: 'email', 
            passwordField: 'password',
            passReqToCallback: true},
        
        function(req, email, password, done) {
            process.nextTick(function() {
                User.findOne({'email': email}, function(err, user) {
                    // Handling case of invalid registration
                    if(err) {
                        console.log(err)
                        req.session.message = "An Error Has Occured."
                        return done(err)
                    }
                    if(user) {
                        req.session.message = "Email already existed."
                        return done(null, false, req.flash('signupMessage', 'Email already existed.'))
                    }

                    if(password.length < 7) {
                        req.session.message = "Password should not be less than 8 characters"
                        console.log("Password should not be less than 8 characters")
                        return done(null, false, req.flash('signupMessage', "Password must not be less than 8 characters."))
                    }

                    var i
                    var haveChar = false
                    for(i = 0; i < password.length; i++) {
                        if(!legalChar.includes(password.slice(i, i+1)) && !legalNum.includes(password.slice(i, i+1))) {
                            req.session.message = "Password must contain alphabet character and number digit only."
                            console.log("Password must contain alphabet character and number digit only.")
                            return done(null, false, req.flash('signupMessage', "Password must contain alphabet character and number digit only."))
                        }
                        if(legalChar.includes(password.slice(i, i+1))) {
                            haveChar = true
                        }
                    }

                    if(!haveChar) {
                        req.session.message = "Password must have at least one alphabet character. "
                        console.log("Password must have at least one alphabet character. ")
                        return done(null, false, req.flash('signupMessage', "Password must have at least one alphabet character. "))
                    }

                    // Successful signup
                    var newUser = new User()
                    newUser.email = email
                    newUser.password = newUser.generateHash(password)
                    newUser.firstName = req.body.firstName
                    newUser.lastName = req.body.lastName

                    newUser.save(function(err) {
                        if(err) {
                            throw(err)
                        }
                        return done(null, newUser)
                    })

                    req.session.email = email
                    req.session.type = "user"
                    
    
                })
            })
    }))
}