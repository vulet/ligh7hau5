const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse}/api/v1/statuses/${userInput}/unpin`,
    headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
          '',
          `Unpinned:
          <blockquote>${registrar.config.fediverse}/notice/${userInput}`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
