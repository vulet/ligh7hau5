const axios = require('axios');

exports.runQuery = function (matrixClient, room, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
    data: { status: `@10grans@fedi.cc beg` },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      `<b>
      <blockquote><i>You have begged for 10grans.<br>
      (id: ${response.data.id}</a>)
      </blockquote><br>`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};