'use strict';

var User = require('../models/user');
var Stock = require('../models/stock');
var Chart = require('../models/chart');
var https = require('https');

function callApi (value) {
	
	
	return new Promise (function (resolve, reject){
		
	var options = {
        hostname: 'www.alphavantage.co',
        path: '/query?function=TIME_SERIES_DAILY&symbol=' + value + '&apikey=' + process.env.ALPHA_KEY
      };
      
    var request = https.request(options, function(response){
      var json = "";
      response.on('data', function(data) {
        json += data;
      });
      response.on('end', function() {
        json = JSON.parse(json);
        if (json["Error Message"]) reject(json);
        resolve(json);
      });
    });
    
    request.end();
    
	});
	
}

function saveApiToDB(stockJson) {
		
	return new Promise(function (resolve, reject) {
		
		var valuesArray = [];
		var dateArray = [];
		
      for (var day in stockJson['Time Series (Daily)']){
      	dateArray.push(day);
      	valuesArray.push(stockJson['Time Series (Daily)'][day]['1. open']);
      }

      var date = new Date(stockJson['Meta Data']['3. Last Refreshed']).getTime();
      	 Stock
      	 .findOneAndUpdate({'stockName': stockJson['Meta Data']['2. Symbol']}, {'lastUpdated':date, 'data': valuesArray}, {upsert: true, new: true})
      	 .then(function (doc){

      	 	Chart
      		.findOneAndUpdate({}, {'dateLabelArray': dateArray, $addToSet: {'stocks': doc._id}}, {upsert: true})
      		.exec(function(err, result) {
      			if (err) throw err;
				resolve(doc);
      	});
      	
      });
		
		
	});	
      		
}








function server (passport) {
	this
		.checkTokens = function(req, res){
			var obj = (req.user).toObject();
		if	(obj.tokens) return res.render('profile', { user: req.user });
		req.logout();
		return res.redirect('/login');
		};
    this
        .githubRoute = passport.authenticate('github');
    
    this
        .githubCallback = passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .googleRoute = passport.authenticate('google', { scope: ['profile'] });
	    
	this
	    .googleCallback = passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .twitterRoute = passport.authenticate('twitter');
	    
	this
	    .twitterCallback = passport.authenticate('twitter', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this
	    .facebookRoute = passport.authenticate('facebook');
	    
	this
	    .facebookCallback = passport.authenticate('facebook', {
		successRedirect: '/',
		failureRedirect: '/login' });
	
	this.unlinkGithub = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.github = undefined;
			currentUser.save(function(err,doc){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkGoogle = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.google = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkTwitter = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.twitter = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	
	this.unlinkFacebook = function(req, res) {
		var currentUser = req.user;
			currentUser.tokens.facebook = undefined;
			currentUser.save(function(err){
				if (err) throw err;
				res.redirect("/profile");
			});
	};
	this.deleteAccount = function(req, res) {
		User
			.findByIdAndRemove({'_id': req.user._id})
			.exec(function(err, doc){
				if (err) throw err;
				res.redirect('/index');
			});
	};
	this.getChart = function(req, res) {
		Chart
			.findOne({})
			.populate('stocks')
			.exec(function(err, doc) {
				if (err) throw err;
				if (!doc) {
					return res.json("");
				}
				
				if (doc.lastUpdated && Date.now() - doc.lastUpdated <= 135000000) {
					return res.json(doc);
				}
				
						var stockArray = [];
						for (var i = 0, l = doc.stocks.length; i < l; i++) {
							stockArray.push(doc.stocks[i].stockName);
						}
						
						Promise.all(stockArray.map(callApi)).then(function(value){
							
							var d2 = new Date(value[0]['Meta Data']['3. Last Refreshed']).getTime();
							
							Promise.all(value.map(saveApiToDB)).then(function(r) {
								
								console.log(d2);
								if (Date.now() - d2 >= 135000000) {
									d2 += 86400000;
								}
								console.log(d2);
									Chart
										.findOneAndUpdate({}, {'lastUpdated': d2})
										.populate('stocks')
										.exec(function(err, result) {
											if (err) throw err;
											return res.json(result);
										});

								}).catch(console.error);
								
						});
					});

	};
	this.addToStock = function(req, res) {

	var test = req.params.stock.toUpperCase();
		
    
    if (test === "" || /[^A-Z\-\.]|[\-\.]{2,}?|[A-Z\-\.]{6,}/.test(test)){
      return res.json({'error': "invalid entry"});
    }
    
    Stock
    	.findOne({'stockName': test}, function(err, doc) {
    		if (err) throw err;
    		if (doc) { return res.json({'error': "already in chart"}); }
    	});
    
    
      
      callApi(test).then(function(value, rejection){
			saveApiToDB(value).then(function(r){
      		res.json(r);
      	});
      	}).catch(function(reason) {
      		res.json({'error': "invalid entry"});
    console.error( 'onRejected function called: ', reason );
	});
		
		
	};
    
    this.deleteStock = function(req, res) {
    	Stock
    		.deleteOne({ 'stockName': req.params.stock })
    		.then(function() {
    	
    	Chart
    		.findOne({},{new: true})
    		.populate('stocks')
    		.exec(function(err, doc){
    			if (err) throw err;
    			return res.json(doc);
    		});
    			
   	});
    	
    };
    
    
    
    
    
    
    
    
    
    
    
}
module.exports = server;