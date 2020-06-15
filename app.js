'use strict';
const Twit = require('twit');
const cron = require('cron').CronJob;

const twitter = new Twit({
  consumer_key: process.env.TWIBOT_CONSUMER_KEY,
  consumer_secret: process.env.TWIBOT_CONSUMER_SECRET,
  access_token: process.env.TWIBOT_ACCESS_TOKEN,
  access_token_secret: process.env.TWIBOT_ACCESS_TOKEN_SECRET
});

let tweetsIds = [];//「RT企画」が含まれるツイートIDを抽出



// リツイート企画のツイートを配列(tweetsIds)に入れる→配列のIDをリツイート
function retweetIncludeRtproject() {
  twitter.get('/search/tweets', { q:'%23RT企画', count: '3', result_type:'recent'}, function(error, tweets, response) {
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

// リツイートする
function retweet(tweetsIds) {
  console.log(tweetsIds);
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


