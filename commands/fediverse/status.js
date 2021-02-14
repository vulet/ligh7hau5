exports.runQuery = function (roomId, event, userInput) {
  axios({
    method: 'GET',
    url: `${config.fediverse.domain}/api/v1/statuses/${userInput}`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
  })
    .then((response) => {
      response.label = 'status';
      fediverse.utils.formatter(response, roomId);
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      matrix.utils.sendError(event, roomId, e);
    });
};
