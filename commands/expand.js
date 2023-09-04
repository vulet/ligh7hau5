exports.runQuery = async (roomId, event, userInput) => {
  return matrix.utils.fetchEncryptedOrNot(roomId, { event_id: userInput })
    .then(event => matrix.utils.expandReact(event))
    .catch(e => {
      matrixClient.sendHtmlNotice(roomId, 'Sad!', '<strong>Sad!</strong>')
    })
    .catch(() => {});
  };

