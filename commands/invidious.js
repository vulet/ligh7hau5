const invidious = async (instance, url) => {
  const req = await instance({ method: 'GET', url });
  if (req.statusText !== 'OK') throw req;
  const { headers } = instance.defaults;
  const video = JSON.parse(req.data);
  return {
    url: headers['Host'],
    name: video.title,
    date: video.publishedText,
    description: video.descriptionHtml,
    author: video.author,
    views: video.viewCount,
    likes: video.likeCount,
    dislikes: video.dislikeCount,
  };
};

const card = (video, path) =>
`<a href="https://${video.url}/${path}"><b>${video.name}</a></b><blockquote><b><i>` +
((video.description.length > 300) ? `${video.description.substr(0, 300)}&hellip;` : ``)+
((video.description === '<p></p>') ? `No description.`: ``)+
((video.description.length < 300 && video.description !== '<p></p>') ? `${video.description}` : ``)+
`<br /><span>🔍️ ${video.views.toLocaleString()}</span> ` +
`<span>❤️ ${video.likes.toLocaleString()}</span> ` +
`<span>❌ ${video.dislikes.toLocaleString()}</span>`+
`<br />(${video.date})</b> <br />
 </blockquote>`;

const getInstance = (domain, config) =>
  axios.create({
    baseURL: `https://${domain}/api/v1/videos`,
    headers: {
      Host: `${domain}`,
      'User-Agent': `${config.userAgent}`,
    },
    transformResponse: [],
    timeout: 10 * 1000,
  });

const run = async (roomId, userInput) => {
  const cfg = config.invidious;
  const video = await matrix.utils.retryPromise(cfg.domains.redirect, domain => invidious(getInstance(domain, cfg), userInput));
  return matrixClient.sendHtmlNotice(roomId, '', card(video, userInput));
};

exports.runQuery = async (roomId, event, userInput) => {
  try {
    const url = new URL(userInput);
    const { redirect, original } = config.invidious.domains;
    if (!redirect.includes(url.hostname) && !original.includes(url.hostname)) throw '';
    if (/^\/[\w-]{11}$/.test(url.pathname)) return await run(roomId, url.pathname.slice(1));
    const params = new URLSearchParams(url.search).get('v');
    if (!/^[\w-]{11}$/.test(params)) throw '';
    return await run(roomId, params);
  } catch (e) {
    return matrixClient.sendHtmlNotice(roomId, 'Sad!', '<strong>Sad!</strong>').catch(() => {});
  }
};
