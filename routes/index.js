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
function getAddress(priv) {
  var path = getRandomPath();

  var derived = priv.derive(path).privateKey;
  return derived.toAddress().toString();
}


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/yemel', function(req, res) {
  var address = getAddress(PRIV);
  res.render('index', { title: address });
});

module.exports = router;
