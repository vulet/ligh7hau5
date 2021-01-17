const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios({
    method: 'DELETE',
    url: `${registrar.config.fediverse.domain}/api/v1/statuses/${userInput}`,
    headers: { Authorization: `Bearer ${registrar.fediverse_auth.access_token}` },
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
