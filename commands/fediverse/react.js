const run = async (roomId, event, id, emoji, remove) => {
  axios({
    method: remove ? 'DELETE' : 'PUT',
    url: `${config.fediverse.domain}/api/v1/pleroma/statuses/${id}/reactions/${emoji}`,
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

exports.runQuery = async (roomId, event, userInput, remove) => {
  try {
    const chunks = userInput.trim().split(' ');
    if (chunks.length !== 2) throw '';
    const id = encodeURIComponent(chunks[0]);
    const emoji = encodeURIComponent(chunks[1]);
    return run(roomId, event, id, emoji, remove);
  } catch (e) {
    return matrixClient.sendHtmlNotice(roomId, 'Sad!', '<strong>Sad!</strong>').catch(() => {});
  }
};
