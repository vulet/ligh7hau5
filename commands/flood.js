const axios = require('axios');
const fs = require('fs');

exports.runQuery = function (matrixClient, room, registrar) {
  setInterval(() => {
    axios({
      method: 'GET',
      url: `${registrar.config.fediverse}/api/v1/timelines/home`,
      headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
    }).then((events) => {
      const event = fs.readFileSync('timeline.json', 'utf8');
      fs.writeFileSync('timeline.json', events.data[0].created_at, 'utf8');
      if (event !== events.data[0].created_at) {
        if (events.data[0].reblog === null) {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${registrar.config.fediverse}/notice/${events.data[0].id}">${events.data[0].account.acct}</a>
              <blockquote><i>${events.data[0].content}<br>
              (id: ${events.data[0].id}</a>)
              </blockquote><br>`);
        } else {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${registrar.config.fediverse}/${events.data[0].account.id}">
            ${events.data[0].account.acct}</a>
            <font color="#7886D7">has <a href="${registrar.config.fediverse}/notice/${events.data[0].id}">repeated</a>:
            <blockquote><a href="${events.data[0].reblog.account.url}">${events.data[0].reblog.account.acct}</a></blockquote>
            <blockquote>${events.data[0].content}<br>
            (id: ${events.data[0].id})
            </blockquote><br>`);
        }
      }
    });
  }, 8000);
};
