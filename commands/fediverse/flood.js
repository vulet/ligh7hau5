exports.runQuery = function (matrixClient, room) {
  setInterval(() => {
    axios({
      method: 'GET',
      url: `${config.fediverse.domain}/api/v1/timelines/home`,
      headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
    }).then((events) => {
      let lastEvent = JSON.parse(localStorage.getItem('timeline'));
      localStorage.setItem('timeline', JSON.stringify(events.data[0].created_at, null, 2));

      if (lastEvent !== events.data[0].created_at) {
        if (events.data[0].reblog === null) {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${config.fediverse.domain}/notice/${events.data[0].id}">${events.data[0].account.acct}</a>
              <blockquote><i>${events.data[0].content}</i><br>
              ${events.data[0].media_attachments.map(media =>
                `<a href="${media.remote_url}">`+`${media.description}`+'</a>'
                ).join('<br>')}
              (id: ${events.data[0].id}) ${registrar.media.visibilityEmoji(events.data[0].visibility)}
              </blockquote>`);
        } else {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${config.fediverse.domain}/${events.data[0].account.id}">
            ${events.data[0].account.acct}</a>
            <font color="#7886D7">has <a href="${config.fediverse.domain}/notice/${events.data[0].id}">repeated</a>:
            <blockquote><a href="${events.data[0].reblog.account.url}">${events.data[0].reblog.account.acct}</a></blockquote>
            <blockquote>${events.data[0].content}<br>
            ${events.data[0].media_attachments.map(media =>
                `<a href="${media.remote_url}">`+`Proxied image, no description available.`+'</a>'
                ).join('<br>')}
            <br>(id: ${events.data[0].id}) ${registrar.media.visibilityEmoji(events.data[0].visibility)}
            </blockquote>`);
        }
      }
    });
  }, 8000);
};
