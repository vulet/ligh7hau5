const axios = require('axios');

exports.runQuery = function (matrixClient, room, address, flaggedInput, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${registrar.config.fediverse.token}` },
    data: { status: `@10grans@fedi.cc tip `+ flaggedInput + ` to `+address },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      `<b>
      <blockquote><i>Tipping ${response.data.content}<br>
      (id: ${response.data.id}</a>)
      </blockquote><br>`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};