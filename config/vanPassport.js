// JWT password key
require('dotenv').config()

// Local strategy for authentication
const LocalStrategy = require('passport-local').Strategy

const Van = require('../models/van.js')

const JWT = require('passport-jwt')
const JwtStrategy = JWT.Strategy
const ExtractJwt = JWT.ExtractJwt

module.exports = function(passport) {
    
    // Store user object id to achieve information exchange from session
    passport.serializeUser(function(van, done) {
        done(null, van._id)
    })

    passport.deserializeUser(function(_id, done) {
        Van.findById(_id, function(err, van) {
            done(err, van)
        })
    })

    // Login startegy
    passport.use('van-local-login', new LocalStrategy( {
            usernameField: 'name', 
            passwordField: 'password',
            passReqToCallback: true},
        
        function(req, name, password, done){
            process.nextTick(function() {
                Van.findOne({'name': name}, function(err, van) {
                    // Handling case of authentication failure
                    if(err) {
                        req.session.message = "Login Error"
                        return done(null, false, req.flash('loginMessage', 'Login Error!'))
                    }
                    if(!van) {
                        req.session.message = "Please Check Your Email and Password."
                        return done(null, false, req.flash('loginMessage', 'No user found.'))
                    }
                    if(!van.validPassword(password)) {
                        req.session.message = "Please Check Your Email and Password."
                        return done(null, false, req.flash('loginMessage', 'Wrong Password!'))
                    }

                    // Successful login
                    else{
                        req.session.name = name
                        req.session.type = "van"
                        return done(null, van, req.flash('loginMessage', 'Login successful'))
                    }

                })
            })

        }))

    // Sign up strategy
    passport.use('van-local-signup', new LocalStrategy( {
            usernameField: 'name', 
            passwordField: 'password',
            passReqToCallback: true},
        
        function(req, name, password, done) {
            process.nextTick(function() {
                Van.findOne({'name': name}, function(err, van) {
                    // Handling case of invalid registration
                    if(err) {
                        console.log(err)
                        return done(err)
                    }
                    if(van) {
                        return done(null, false, req.flash('signupMessage', 'Email already existed.'))
                    }

                    // Successful signup
                    else{
                        var newVan = new Van()
                        newVan.name = name
                        newVan.password = newVan.generateHash(password)

                        newVan.save(function(err) {
                            if(err) {
                                throw(err)
                            }
                            return done(null, newVan)
                        })

                        req.session.name = name
                        req.session.type = "van"
                    }
    
                })
            })
    }))
}