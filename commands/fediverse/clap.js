exports.runQuery = function (matrixClient, room, userInput) {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses/${userInput}/favourite`,
    headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
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
