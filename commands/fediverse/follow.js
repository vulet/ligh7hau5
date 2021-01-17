const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios.get(`${registrar.config.fediverse.domain}/api/v1/accounts/${userInput}`).then((findUID) => {
    axios({
      method: 'POST',
      url: `${registrar.config.fediverse.domain}/api/v1/accounts/${findUID.data.id}/follow`,
      headers: { Authorization: `Bearer ${registrar.fediverse_auth.access_token}` },
    })
      .then((response) => {
        matrixClient.sendHtmlNotice(room.roomId,
          '',
          `Subscribed:
          <blockquote>${registrar.config.fediverse.domain}/${response.data.id}`);
      });
  }).catch((e) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '', `${e}`);
  });
};
