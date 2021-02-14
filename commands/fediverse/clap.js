exports.runQuery = function (roomId, event, userInput) {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses/${userInput}/favourite`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
  })
    .then(() => {
      matrix.utils.addReact(event, '✅');
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      matrix.utils.sendError(event, roomId, e);
    });
};
