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
  const tweet = dom.window.document.querySelector('#m');
  const stats = tweet.querySelectorAll('.tweet-body > .tweet-stats .icon-container');
  const quote = tweet.querySelector('.tweet-body > .quote a.quote-link');
  return {
    text: tweet.querySelector('.tweet-body > .tweet-content').innerHTML,
    date: tweet.querySelector('.tweet-body > .tweet-published').textContent,
    name: tweet.querySelector('.tweet-body > div .fullname').textContent,
    handle: tweet.querySelector('.tweet-body > div .username').textContent,
    hasAttachments: !!tweet.querySelector('.tweet-body > .attachments'),
    quote: quote ? quote.href : null,
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
(tweet.quote ? `<blockquote><b><a href="${base}${tweet.quote}">Quoted Tweet</a></b></blockquote>` : '');

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
 
exports.runQuery = (client, room, userInput, registrar) => {
  let url = null;
  try {
    url = new URL(userInput);
    if(!registrar.config.nitter.domains.includes(url.hostname)) throw '';
    if(!/^\/[^/]+\/status\/\d+\/?$/.test(url.pathname)) throw '';
  } catch(e) {
    return client.sendHtmlNotice(roomId, 'Sad!', `<strong>Sad!</strong>`).catch(()=>{});
  }
  return run(client, room, url.pathname, registrar);
};
