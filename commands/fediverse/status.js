exports.runQuery = function (matrixClient, room, userInput, ) {
  axios({
    method: 'GET',
    url: `${config.fediverse.domain}/api/v1/statuses/${userInput}`,
    headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
  }).then((response) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '',
        `<b><a href="${config.fediverse.domain}/notice/${response.data.id}">${response.data.account.acct}</a>
        <blockquote><i>${response.data.content}<br>
        ${response.data.media_attachments.map(media =>
          `<a href="${media.remote_url}"><b>${media.description}</b></a>`)
        .join('<br>')}
        (id: ${response.data.id}</a>)
        </blockquote>`);
    });
};
