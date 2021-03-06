exports.runQuery = function (roomId, event, userInput) {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
    data: {
      status: `@mordekai ${userInput}`,
      content_type: 'text/markdown',
      visibility: 'unlisted',
      expires_in: '7200',
    },
  })
    .then(() => {
      matrix.utils.addReact(event, '✅');
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      matrix.utils.sendError(event, roomId, e);
    });
};
