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
          <blockquote><i><a href="${registrar.config.fediverse}/notice/${response.data.id}">
          ${response.data.content}</a></i>
          </blockquote>`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
