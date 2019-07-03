const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios.get(`${registrar.config.fediverse}/api/v1/accounts/${userInput}`).then((findUID) => {
    axios({
      method: 'POST',
      url: `${registrar.config.fediverse}/api/v1/accounts/${findUID.data.id}/unfollow`,
      headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
    })
      .then((response) => {
        matrixClient.sendHtmlNotice(room.roomId,
          '',
          `Unsubscribed:
          <blockquote>${registrar.config.fediverse}/${response.data.id}`);
      });
  }).catch((e) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '', `${e}`);
  });
};
