const axios = require('axios');
const fediverse_auth = JSON.parse(localStorage.getItem('fediverse_auth'));

exports.runQuery = function (matrixClient, room, userInput) {
  axios.get(`${config.fediverse.domain}/api/v1/accounts/${userInput}`).then((findUID) => {
    axios({
      method: 'POST',
      url: `${config.fediverse.domain}/api/v1/accounts/${findUID.data.id}/follow`,
      headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
    })
      .then((response) => {
        matrixClient.sendHtmlNotice(room.roomId,
          '',
          `Subscribed:
          <blockquote>${config.fediverse.domain}/${response.data.id}`);
      });
  }).catch((e) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '', `${e}`);
  });
};
