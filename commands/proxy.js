
const msg = 'Invalid proxy domain!';
exports.runQuery = (roomId, event, userInput) =>
  matrixClient.sendHtmlNotice(roomId, msg, `<b>${msg}</b>`).catch(() => {});
