// for getting and saving photos

var request = require('request');
var fs = require('fs');
var path = require('path');

var saveDir = process.env.SAVE_DIR || '.';

function getAndSave(url) {
    console.log('GET ' + url);
    request(
        {method: 'GET', url: url, encoding: null},
        function (error, response, body){
            if(!error && response.statusCode === 200){
                var msec = new Date().getTime();
                var extname = path.extname(url);
                var filename = '' + msec + extname;
                var savePath = saveDir + '/' + filename;
                console.log('SAVE as ' + savePath);
                fs.writeFileSync(savePath, body, 'binary');
            }
        }
    );
}

// for streaming twitter timeline

var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// start streaming

console.log('Start streaming.');
console.log('Photos are saved to the directory: ' + saveDir);

client.stream('user', function(stream) {
    stream.on('data', function(event) {
        var media = event && event.extended_entities && event.extended_entities.media;
        if (media) {
            media.forEach(function(val) {
                getAndSave(val.media_url_https);
            });
        }

    });
    stream.on('error', function(error) {
        throw error;
    });
});
