const axios = require('axios');

exports.runQuery = function (matrixClient, room, userInput, registrar) {
  axios({
    method: 'GET',
    url: `${registrar.config.fediverse.domain}/api/v1/statuses/${userInput}`,
    headers: { Authorization: `Bearer ${registrar.config.fediverse.token}` },
  }).then((response) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '',
        `<b><a href="${registrar.config.fediverse.domain}/notice/${response.data.id}">${response.data.account.acct}</a>
        <blockquote><i>${response.data.content}<br>
        ${response.data.media_attachments.map(media =>
          `<a href="${media.remote_url}"><b>${media.description}</b></a>`)
        .join('<br>')}
        (id: ${response.data.id}</a>)
        </blockquote>`);
    });
};
