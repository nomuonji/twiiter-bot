'use strict';
const Twit = require('twit');
const cron = require('cron').CronJob;
const http = require('http');

console.log('app.jsを実行しました');

const twitter = new Twit({
  consumer_key: process.env.TWIBOT_CONSUMER_KEY,
  consumer_secret: process.env.TWIBOT_CONSUMER_SECRET,
  access_token: process.env.TWIBOT_ACCESS_TOKEN,
  access_token_secret: process.env.TWIBOT_ACCESS_TOKEN_SECRET
});

let tweetsIds = [];//「RT企画」が含まれるツイートIDを抽出
let botTweetsIDs = [];//botのツイートID用

// リツイート企画のツイートを配列(tweetsIds)に入れる→配列のIDをリツイート
function retweetIncludeRtproject() {
  tweetsIds = [];
  twitter.get('/search/tweets', { q:'%23RT企画', count: '5', result_type:'recent'}, function(error, tweets, response) {
    if (error) console.log(error);

    tweets.statuses.forEach((tweet) => {
      if(tweet.text.includes('RT @')){
        tweetsIds.push(tweet.retweeted_status.id_str);
      } else {
        tweetsIds.push(tweet.id_str);
      }
      
    })

    console.log(tweetsIds);
    retweet(tweetsIds);

  });
}

// botのツイートIDを配列に入れる→配列のIDをリツイート
function retweetBotTweets() {
  botTweetsIDs = [];
  twitter.get('/statuses/user_timeline.json?user_id=1209181292626997256&count=1', {}, function(error, tweets, response) {
    if(error) console.log(error);

    tweets.forEach((tweet) => {
      botTweetsIDs.push(tweet.id_str);
    })

    console.log(botTweetsIDs);
    retweet(botTweetsIDs);

  })
}

// リツイートする
function retweet(tweetsIds) {

  tweetsIds.forEach((tweetsId) => {
    twitter.post(`/statuses/retweet/${tweetsId}`,{}, function(error, tweets, response) {
      if (error) console.log(error);
    });
  })
  console.log('リツイート完了しました！');
  
}


const cronJob = new cron({
  cronTime: '00 0-59/15 * * * *',//15分ごとに実行
  start: true,
  onTick: function() {
    retweetIncludeRtproject();
  }
});

const cronJob2 = new cron({
  cronTime: '00 30 5,9,12,14,18,20 * * *',//5:30,9:30,12:30,14:30,18:30,20:30に実行
  start: true,
  onTick: function() {
    retweetBotTweets();
  }
});

const port = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.write('This app is twiiter bot.');
  res.end();
});

server.listen(port,() => {
  console.log("Listening on" + port);
});