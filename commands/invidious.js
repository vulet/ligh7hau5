const axios = require('axios');

const headers = ({ domain, userAgent }) => ({
  'Host': `${domain}`,
  'User-Agent': `${userAgent}`
});

const invidious = async (instance, url) => {
  const req = await instance({ method: 'GET', url });
  if (req.statusText !== 'OK') throw req;
  const video = JSON.parse(req.data);
  return {
    name: video.title,
    date: video.publishedText,
    description: video.descriptionHtml,
    author: video.author,
    views: video.viewCount,
    likes: video.likeCount,
    dislikes: video.dislikeCount
  };
};

const card = (video, base, path) =>
`<a href="${base}/${path}"><b>${video.name}</a></b><blockquote><b><i>` +
((video.description.length > 300) ? `${video.description.substr(0, 300)}&hellip;` : ``)+
((video.description === '<p></p>') ? `No description.`: ``)+
((video.description.length < 300 && video.description !== '<p></p>') ? `${video.description}` : ``)+
`<br /><span>🔍️ ${video.views.toLocaleString()}</span> ` +
`<span>❤️ ${video.likes.toLocaleString()}</span> ` +
`<span>❌ ${video.dislikes.toLocaleString()}</span>`+
`<br />(${video.date})</b> <br />
 </blockquote>`;

const run = async (matrixClient, { roomId }, userInput, registrar) => {
  const config = registrar.config.invidious;
  const instance = axios.create({
    baseURL: `https://${config.domain}/api/v1/videos/`,
    headers: headers(config),
    transformResponse: [],
    timeout: 10 * 1000
  });
  const video = await invidious(instance, userInput);
  return await matrixClient.sendHtmlNotice(roomId, '', card(video, `https://${config.domain}`, userInput));
}

exports.runQuery = async (client, room, userInput, registrar) => {
  try {
    const url = new URL(userInput);
    if(!registrar.config.invidious.domains.includes(url.hostname)) throw '';
    const params = new URLSearchParams(url.search).get("v");
    if(!/([a-z0-9_-]{11})?$/.test(params)) throw '';
    return await run(client, room, params, registrar);
  } catch(e) {
    return client.sendHtmlNotice(room.roomId, 'Sad!', `<strong>Sad!</strong>`).catch(()=>{});
  }
};
