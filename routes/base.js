const express   = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/index").User;
const Deck = require("../models/index").Deck;
const Card = require("../models/index").Card;

const passport = require('passport');

const isAuthenticated = function (req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error', 'You have to be logged in to access the page.')
    res.redirect('/entry')
};


router.get("/", isAuthenticated, function(req, res) {
    User.findAll({})
    .then(function(data) {
        res.render("index")
    })
    .catch(function(err) {
        console.log(err);
        res.send("error")
    });
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/decks',
    failureRedirect: '/entry',
    failureFlash: true
}));

router.get("/entry", function(req, res) {
    res.render("entry");
});

router.post("/signup", function(req, res) {
    let name = req.body.name
    let username = req.body.username
    let password = req.body.passwordHash


    if (!username || !password) {
        req.flash('error', "Please, fill in all the fields.")
        res.redirect('/entry')
    }

    let salt = bcrypt.genSaltSync(10)
    let hashedPassword = bcrypt.hashSync(password, salt)

    let newUser = {
        name: name,
        username: username,
        passwordHash: hashedPassword,
        salt: salt,
    }

    User.create(newUser)
    .then(function() {
        res.redirect('/')})
    .catch(function(error) {
        req.flash('error', "Please, choose a different username.")
        res.redirect('/entry')
    });

});

router.post('/', passport.authenticate('local', {
    successRedirect: '/decks',
    failureRedirect: '/',
    failureFlash: true
}));

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

router.post("/deck/create", function(req, res){
    Deck.create({
        title: req.body.title,
        description: req.body.description,
        userId: 1
    })
    .then(function(data){
        res.render("index")
    })

})

router.get("/decks", function(req, res){
    Deck.findAll({})
    .then(function(data){
        res.render("index", {data:data})
    })
})


module.exports = router;
