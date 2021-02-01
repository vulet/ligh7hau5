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

const run = async (matrixClient, { roomId }, userInput) => {
  const instance = axios.create({
    baseURL: `https://${config.invidious.domain}/api/v1/videos/`,
    headers: headers(config.invidious),
    transformResponse: [],
    timeout: 10 * 1000
  });
  const video = await invidious(instance, userInput);
  return await matrixClient.sendHtmlNotice(roomId, '', card(video, `https://${config.invidious.domain}`, userInput));
}

exports.runQuery = async (client, room, userInput) => {
  try {
    const url = new URL(userInput);
    if(!config.invidious.domains.includes(url.hostname)) throw '';
    if(/^\/[\w-]{11}$/.test(url.pathname))
      return await run(client, room, url.pathname.slice(1));
    const params = new URLSearchParams(url.search).get("v");
    if(!/^[\w-]{11}$/.test(params)) throw '';
    return await run(client, room, params);
  } catch(e) {
    console.log(e);
    return client.sendHtmlNotice(room.roomId, 'Sad!', `<strong>Sad!</strong>`).catch(()=>{});
  }
};
