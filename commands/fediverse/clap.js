const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios({
    method: 'POST',
    url: `${registrar.config.fediverse.domain}/api/v1/statuses/${userInput}/favourite`,
    headers: { Authorization: `Bearer ${registrar.fediverse_auth.access_token}` },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      `You have clapped: <a href="${response.data.url}">${response.data.account.acct}</a>:
      <blockquote>${response.data.content}`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};