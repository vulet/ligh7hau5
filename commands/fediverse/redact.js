exports.runQuery = function (matrixClient, room, userInput) {
  axios({
    method: 'DELETE',
    url: `${config.fediverse.domain}/api/v1/statuses/${userInput}`,
    headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      '<blockquote>Redacted.</blockquote');
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
