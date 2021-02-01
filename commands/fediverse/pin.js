exports.runQuery = function (matrixClient, room, userInput) {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses/${userInput}/pin`,
    headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
          '',
          `Pinned:
          <blockquote><i><a href="${config.fediverse.domain}/notice/${response.data.id}">
          ${response.data.content}</a></i>
          </blockquote>`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
