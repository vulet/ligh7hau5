const { JSDOM } = require('jsdom');

const headers = ({ domain, userAgent }) => ({
  Host: `${domain}`,
  'User-Agent': `${userAgent}`,
});

const nitter = async (instance, url) => {
  const req = await instance({ method: 'GET', url });
  if (req.statusText !== 'OK') throw req;
  const dom = new JSDOM(req.data);
  const { document } = dom.window;
  const tweet = document.querySelector('#m');
  const stats = tweet.querySelectorAll('.tweet-body > .tweet-stats .icon-container');
  const quote = tweet.querySelector('.tweet-body > .quote');
  const isReply = tweet.querySelector('.tweet-body > .replying-to');
  const replies = document.querySelectorAll('.main-thread > .before-tweet > .timeline-item');
  const { defaults } = instance;
  return {
    url: defaults.baseURL,
    text: tweet.querySelector('.tweet-body > .tweet-content').innerHTML,
    date: tweet.querySelector('.tweet-body > .tweet-published').textContent,
    name: tweet.querySelector('.tweet-body > div .fullname').textContent,
    check: !!tweet.querySelector('.tweet-body > div .fullname .icon-ok'),
    handle: tweet.querySelector('.tweet-body > div .username').textContent,
    hasAttachments: !!tweet.querySelector('.tweet-body > .attachments'),
    quote: quote ? {
      path: quote.querySelector('a.quote-link').href,
      text: quote.querySelector('.quote-text') ? quote.querySelector('.quote-text').innerHTML : '',
    } : null,
    isReply: isReply && replies.length > 0 ? replies[replies.length - 1].classList.contains('unavailable') ? 'unavailable' : {
      path: replies[replies.length - 1].querySelector('a.tweet-link').href,
      text: replies[replies.length - 1].querySelector('.tweet-content').innerHTML,
    } : null,
    stats: {
      replies: stats[0].textContent.trim(),
      retweets: stats[1].textContent.trim(),
      favorites: stats[2].textContent.trim(),
    },
  };
};

const card = (tweet, check, path) =>
`<a href="${tweet.url}/${tweet.handle.replace(/^@/, '')}"><b>${tweet.name}</b></a> ` +
(tweet.check ? `${check} ` : '') +
`<a href="${tweet.url}${path}"><b>${tweet.date}</b></a> ` +
`<span>🗨️ ${tweet.stats.replies}</span> ` +
`<span>🔁 ${tweet.stats.retweets}</span> ` +
`<span>❤️ ${tweet.stats.favorites}</span> ` +
`<br /><blockquote><b><i>${tweet.text.replace('\n', '<br />')}</i></b></blockquote>` +
(tweet.hasAttachments ? '<blockquote><b>This tweet has attached media.</b></blockquote>' : '') +
(tweet.isReply ? tweet.isReply === 'unavailable' ? '<blockquote>Replied Tweet is unavailable</blockquote>' : `<blockquote><b><a href="${tweet.url}${tweet.isReply.path}">Replied Tweet</a></b><br /><b><i>${tweet.isReply.text.replace('\n', '<br />')}</i></b></blockquote>` : '') +
(tweet.quote ? `<blockquote><b><a href="${tweet.url}${tweet.quote.path}">Quoted Tweet</a></b><br /><b><i>${tweet.quote.text.replace('\n', '<br />')}</i></b></blockquote>` : '');

const getInstance = config =>
  axios.create({
    baseURL: `https://${config.domain}`,
    headers: headers(config),
    transformResponse: [],
    timeout: 10 * 1000,
  });

const run = async (roomId, userInput) => {
  const tweet = await nitter(getInstance(config.nitter), userInput)
    .catch(_ => nitter(getInstance(Object.assign(config.nitter, { domain: config.nitter.fallback })), userInput));
  return matrixClient.sendHtmlNotice(roomId, '', card(tweet, config.nitter.check, userInput));
};

exports.runQuery = async (roomId, event, userInput) => {
  try {
    const url = new URL(userInput);
    if (!config.nitter.domains.includes(url.hostname)) throw '';
    if (!/^\/[^/]+\/status\/\d+\/?$/.test(url.pathname)) throw '';
    return await run(roomId, url.pathname);
  } catch (e) {
    return matrixClient.sendHtmlNotice(roomId, 'Sad!', '<strong>Sad!</strong>').catch(() => {});
  }
};
