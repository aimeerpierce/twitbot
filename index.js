//HEROKU SETUP
var express = require("express");
var app = express();
app.get('/', function(req, res){ res.send('The bot is running.'); });
app.listen(process.env.PORT || 5000);




//bot settings //data-list-id = 772592495414751232
var settings = {me: 'bhangraGirls319', list: 'MyRetweets', acceptRegex: '', rejectRegex: '(RTx|@)', 
					keys: {consumer_key: process.env.TWITTER_CONSUMER_KEY, 
					consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        			access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        			access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET}
				};

//pass on users in list
function getListAccounts(callback) {
	var users = [];

	tu.listMembers({owner_screen_name: settings.me, slug: settings.list}, 
		function(error, data) {
			if(!error) {
				for(var i = 0; i < data.users.length; i++) {
					users.push(data.users[i].id_str);
					console.log(data.users[i].id_str);
				}
				callback(users);
			} else {
				console.log(error);
				console.log(data);

			}
		});
}

//after retweet
function retweet(error) {
	if(error) {
		console.error("failed retweet ");
		console.error(error);
	}
}

//handling a tweet
function handleTweet(tweet) {
	//reject tweets if they are retweets, fit rejectRegex, or doesn't match acceptRejex
	var rejectRegex = new RegExp(config.regexReject, 'i');
	var acceptRegex = new RegExp(config.acceptRegex, 'i');
	if(tweet.retweeted) {
		return;
	}
	if(config.rejectRegex !== '' && rejectRegex.test(tweet.text)) {
		return;
	}
	if(acceptRegex.test(tweet.text)) {
		console.log(tweet);
		console.log("RT: " + tweet.text);
		tu.retweet({id:tweet.id_str}, retweet);
	}
}

//retweeting selections
function listenAndRetweet(users) {
	tu.filter({
		follow: users
	}, function(stream) {
		console.log("listening");
		stream.on('tweet', handleTweet);
	});
}

//use tuiter node module
var tu = require('tuiter')(settings.keys);
getListAccounts(listenAndRetweet);