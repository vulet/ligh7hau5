const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios({
    method: 'DELETE',
    url: `${registrar.config.fediverse}/api/v1/statuses/${userInput}`,
    headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      '<blockquote>Redacted.</blockquote');
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
