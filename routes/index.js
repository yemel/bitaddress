'use strict';

var bitcore = require('bitcore');
var express = require('express');

var router = express.Router();

/* Controller */
function getRandomPath() {
  var indexes = [0,0,0,0].map(function(){
    return parseInt(Math.random() * 10000 % bitcore.HDPrivateKey.Hardened);
  });
  return 'm/' + indexes.join('/');
}

var PRIV = new bitcore.HDPrivateKey();
function getAddress(xpriv, path) {
  var derived = xpriv.derive(path).privateKey;
  return derived.toAddress().toString();
}

function createUser(username) {
  var xpriv = new bitcore.HDPrivateKey();
  var user = {
    name: username,
    email: username + '@gmail.com',
    xpriv: xpriv.toString(),
    payto: xpriv.privateKey.toAddress().toString()
  };
  return user;
}


/* GET home page. */
router.get('/', function(req, res) {
  res.render('home');
});

router.get('/users', function(req, res) {
  var Users = req.db.get('users');
  Users.find({}, {}, function(err, users) {
    res.render('users', {users: users});
  });
});

router.get('/addresses', function(req, res) {
  var Addresses = req.db.get('addresses');
  Addresses.find({}, {}, function(err, addresses) {
    res.render('addresses', {addresses: addresses});
  });
});

router.get('/user/:username', function(req, res) {
  var Users = req.db.get('users');
  var Addresses = req.db.get('addresses');

  Users.findOne({name: req.params.username}, onUser);

  function onUser(err, user) {
    if (err) throw err;

    var xpriv = new bitcore.HDPrivateKey(user.xpriv);
    var path = getRandomPath();
    var address = getAddress(xpriv, path);

    Addresses.insert({
      address: address,
      path: path,
      user: user._id
    }, onInsert);
  }

  function onInsert(err, address) {
    if (err) throw err;
    res.render('index', { title: address.address });
  }
});

router.get('/create/:username', function(req, res) {
  var Users = req.db.get('users');
  var user = createUser(req.params.username);
  Users.insert(user, function(err, user) {
    console.log(err);
    res.redirect('/users');
  });
});

module.exports = router;
