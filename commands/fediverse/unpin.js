const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse.domain}/api/v1/statuses/${userInput}/unpin`,
    headers: { Authorization: `Bearer ${registrar.fediverse_auth.access_token}` },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
          '',
          `Unpinned:
          <blockquote><i><a href="${registrar.config.fediverse.domain}/notice/${response.data.id}">
          ${response.data.content}</a></i>
          </blockquote>`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
