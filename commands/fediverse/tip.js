exports.runQuery = function (roomId, address, flaggedInput, event) {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
    data: { status: `@10grans@fedi.cc tip ${flaggedInput} to ${address}` },
  })
    .then(() => {
      matrix.utils.addReact(event, '✅');
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      matrix.utils.sendError(event, roomId, e);
    });
};
