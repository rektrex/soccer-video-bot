'use strict';

const EventSource = require('eventsource');
const fetch = require('node-fetch');
const snoowrap = require('snoowrap');

const snoo = new snoowrap({
  userAgent: 'soccer video bot v1',
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  username: 'soccer-video-bot',
  password: process.env.password
});

const es = new EventSource('http://stream.pushshift.io/?type=comments&subreddit=soccer');
var gapiURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key={process.env.key}`;
const youtubeBaseURL = 'https://www.youtube.com/watch?v=';

es.addEventListener('rc', cmt => {
  var cmtData = JSON.parse(cmt.data);
  var cmtBody = cmtData.body;
  var cmtID = cmtData.id;
  if (cmtBody.startsWith('!soccer-video-bot')) {
    var searchQuery = cmtBody.slice(18);

    gapiURL += '&q=' + searchQuery;

    fetch(gapiURL)
      .then(data => data.json())
      .then(res => {
        var links = '';
        for (let item of res.items) {
          const videoURL = youtubeBaseURL + item.id.videoId;
          links += videoURL + '\n\n';
        }
        links += '\n\nThis comment was made by a bot. Report bugs [here](https://github.com/rektrex/soccer-video-bot/issues/new)';
        snoo.getComment(cmtID).reply(links);
      })
      .catch(error => console.log(error))
  }
});
