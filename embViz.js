// this is the main script for server backend.
// Created by Blaz Skrlj and Nika Erzen of IJS Ljubljana.

var express = require("express");
var fs = require('fs');
const bodyParser = require('body-parser')
//var oftenUsed = require('./node_src/often_used.js');
//const paths = require('./dbconfig');

var app = express();
var router = express.Router();


var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    };
};

app.use(enableCORS);

app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000000}));

router.use(function (req,res,next) {
	console.log("/" + req.method);
	next();
});

app.use("/",router);

app.listen(3310, function (err) {
	if (err) {
		throw err
	}
	console.log('Server started on port 3310.');
})
