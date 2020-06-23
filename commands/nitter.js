const axios = require('axios');
const { JSDOM } = require("jsdom");

const headers = ({ domain, userAgent }) => ({
  'Host': `${domain}`,
  'User-Agent': `${userAgent}`
});

const nitter = async (instance, url) => {
  const req = await instance({ method: 'GET', url });
  if (req.statusText !== 'OK') throw req;
  const dom = new JSDOM(req.data);
  const document = dom.window.document;
  const tweet = document.querySelector('#m');
  const stats = tweet.querySelectorAll('.tweet-body > .tweet-stats .icon-container');
  const quote = tweet.querySelector('.tweet-body > .quote');
  const isReply = tweet.querySelector('.tweet-body > .replying-to');
  const replies = document.querySelectorAll('.main-thread > .before-tweet > .timeline-item');
  return {
    text: tweet.querySelector('.tweet-body > .tweet-content').innerHTML,
    date: tweet.querySelector('.tweet-body > .tweet-published').textContent,
    name: tweet.querySelector('.tweet-body > div .fullname').textContent,
    handle: tweet.querySelector('.tweet-body > div .username').textContent,
    hasAttachments: !!tweet.querySelector('.tweet-body > .attachments'),
    quote: quote ? {
      path: quote.querySelector('a.quote-link').href,
      text: quote.querySelector('.quote-text').innerHTML,
    } : null,
    isReply: isReply && replies.length > 0 ? {
      path: replies[replies.length - 1].querySelector('a.tweet-link').href,
      text: replies[replies.length - 1].querySelector('.tweet-content').innerHTML,
    } : null,
    stats: {
      replies: stats[0].textContent.trim(),
      retweets: stats[1].textContent.trim(),
      favorites: stats[2].textContent.trim()
    }
  };
};

const card = (tweet, base, path) =>
`<a href="${base}/${tweet.handle.replace(/^@/, '')}"><b>${tweet.name}</b></a> ` +
`<a href="${base}${path}"><b>${tweet.date}</b></a> ` +
`<span>🗨️ ${tweet.stats.replies}</span> ` +
`<span>🔁 ${tweet.stats.retweets}</span> ` +
`<span>❤️ ${tweet.stats.favorites}</span> ` +
`<br /><blockquote><b><i>${tweet.text.replace('\n', '<br />')}</i></b></blockquote>` +
(tweet.hasAttachments ? '<blockquote><b>This tweet has attached media.</b></blockquote>' : '') +
(tweet.isReply ? `<blockquote><b><a href="${base}${tweet.isReply.path}">Replied Tweet</a></b><br /><b><i>${tweet.isReply.text.replace('\n', '<br />')}</i></b></blockquote>` : '') +
(tweet.quote ? `<blockquote><b><a href="${base}${tweet.quote.path}">Quoted Tweet</a></b><br /><b><i>${tweet.quote.text.replace('\n', '<br />')}</i></b></blockquote>` : '');
const run = async (matrixClient, { roomId }, userInput, registrar) => {
  const config = registrar.config.nitter;
  const instance = axios.create({
    baseURL: `https://${config.domain}`,
    headers: headers(config),
    transformResponse: [],
    timeout: 10 * 1000
  });
  const tweet = await nitter(instance, userInput);
  return await matrixClient.sendHtmlNotice(roomId, '', card(tweet, `https://${config.domain}`, userInput));
}

exports.runQuery = async (client, room, userInput, registrar) => {
  try {
    const url = new URL(userInput);
    if(!registrar.config.nitter.domains.includes(url.hostname)) throw '';
    if(!/^\/[^/]+\/status\/\d+\/?$/.test(url.pathname)) throw '';
    return await run(client, room, url.pathname, registrar);
  } catch(e) {
    return client.sendHtmlNotice(room.roomId, 'Sad!', `<strong>Sad!</strong>`).catch(()=>{});
  }
};
