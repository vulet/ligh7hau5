const axios = require('axios');
const fs = require('fs');

exports.runQuery = function (matrixClient, room, registrar) {
  setInterval(() => {
    axios({
      method: 'GET',
      url: `${registrar.config.fediverse.domain}/api/v1/timelines/home`,
      headers: { Authorization: `Bearer ${registrar.config.fediverse.token}` },
    }).then((events) => {
      const event = fs.readFileSync('timeline.json', 'utf8');
      fs.writeFileSync('timeline.json', events.data[0].created_at, 'utf8');
      if (event !== events.data[0].created_at) {
        if (events.data[0].reblog === null) {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${registrar.config.fediverse.domain}/notice/${events.data[0].id}">${events.data[0].account.acct}</a>
              <blockquote><i>${events.data[0].content}<br>
              ${events.data[0].media_attachments.map(media =>
                `<a href="${media.remote_url}">`+`${media.description}`+'</a>'
                ).join('<br>')}
              (id: ${events.data[0].id}</a>)
              </blockquote>`);
        } else {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${registrar.config.fediverse.domain}/${events.data[0].account.id}">
            ${events.data[0].account.acct}</a>
            <font color="#7886D7">has <a href="${registrar.config.fediverse.domain}/notice/${events.data[0].id}">repeated</a>:
            <blockquote><a href="${events.data[0].reblog.account.url}">${events.data[0].reblog.account.acct}</a></blockquote>
            <blockquote>${events.data[0].content}<br>
            ${events.data[0].media_attachments.map(media =>
                `<a href="${media.remote_url}">`+`Proxied image, no description available.`+'</a>'
                ).join('<br>')}
            <br>(id: ${events.data[0].id})
            </blockquote>`);
        }
      }
    });
  }, 8000);
};
