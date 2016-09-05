
// START HEROKU SETUP
var express = require("express");
var app = express();
app.get('/', function(req, res){ res.send('The robot is happily running.'); });
app.listen(process.env.PORT || 5000);
// END HEROKU SETUP


// Listbot config
//
// Config.keys uses environment variables so sensitive info is not in the repo.
var config = {
    me: 'bhangraGirls319', // The authorized account with a list to retweet.
    myList: 'MyRetweets', // The list we want to retweet.
    regexFilter: '', // Accept only tweets matching this regex pattern.
    regexReject: '',//(RT|@)', // AND reject any tweets matching this regex pattern.

    keys: {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    },
};


// Get the members of our list, and pass them into a callback function.
function getListMembers(callback) {
    var memberIDs = [];

    Twitter.listMembers({owner_screen_name: config.me,
        slug: config.myList
    },
    function(error, data){
        if (!error) {
            for (var i=0; i < data.users.length; i++) {
                memberIDs.push(data.users[i].id_str);
            }

            // This callback is designed to run listen(memberIDs).
            callback(memberIDs);
        } else {
            console.log(error);
            console.log(data);
        }
    });
}

// What to do after we retweet something.
function onReTweet(err) {
    if(err) {
        console.error("retweeting failed :(");
        console.error(err);
    }
}

// What to do when we get a tweet.
function onTweet(tweet) {
    // Reject the tweet if:
    //  1. it's flagged as a retweet
    //  2. it matches our regex rejection criteria
    //  3. it doesn't match our regex acceptance filter
    var regexReject = new RegExp(config.regexReject, 'i');
    var regexFilter = new RegExp(config.regexFilter, 'i');
    //if (tweet.retweeted) {
    //    return;
    //}
    if (config.regexReject !== '' && regexReject.test(tweet.text)) {
        return;
    }
    //if (regexFilter.test(tweet.text)) {
        console.log(tweet.in_reply_to_screenname);
        console.log("RT: " + tweet.text);
        // Note we're using the id_str property since javascript is not accurate
        // for 64bit ints.
        Twitter.retweet({
            id: tweet.id_str
        }, onReTweet);
    //}
}

// Function for listening to twitter streams and retweeting on demand.
function listen(listMembers) {
    Twitter.filter({
        follow: listMembers
    }, function(stream) {
        console.log("listening to stream");
        stream.on('tweet', onTweet);
    });
}

// The application itself.
// Use the tuiter node module to get access to twitter.
var Twitter = require('tuiter')(config.keys);

// var client = new Twitter({
// 	consumer_key:'4pKGaC8RTPbGFFh0tovxpkS9F',
// 	consumer_secret: 'SqKWYkwHtz9kg5sk9E7prWI4Eg3h7mfDXktOJIE9CGnDyVW3Nm',
// 	access_token_key: '771489853858918400-djkiab7VNgQY4ttdO9HDnS32233zNcD',
// 	access_token_secret: 'J9SLNWD7Z5QyiPqnlZfwiCTDQGl:DXilgZO3LuStbWcFHT'
// });
// var params = {screen_name: 'nodejs'};
// client.get('statuses/user_timeline', params, function(error, tweets, response) {
//   if (!error) {
//     console.log(tweets);
//   }
// });
// Run the application. The callback in getListMembers ensures we get our list
// of twitter streams before we attempt to listen to them via the twitter API.
getListMembers(listen);