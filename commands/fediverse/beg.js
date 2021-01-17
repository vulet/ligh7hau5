const axios = require('axios');

exports.runQuery = function (matrixClient, room, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${registrar.fediverse_auth.access_token}` },
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