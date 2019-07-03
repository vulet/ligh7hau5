const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
    data: { status: userInput },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      `<b>
      <blockquote><i>${response.data.content}<br>
      (id: ${response.data.id}</a>)
      </blockquote><br>`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
