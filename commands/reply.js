const axios = require('axios');

exports.runQuery = function (matrixClient, room, address, flaggedInput, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
    data: { status: flaggedInput, in_reply_to_id: address },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      `${response.data.content} ${response.data.url}`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
