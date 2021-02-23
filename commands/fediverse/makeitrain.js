exports.runQuery = async function (roomId, event, notice) {
  if (config.fediverse.tipping === false) return matrixClient.sendHtmlNotice(roomId, `Tipping is not enabled.`, `<code>Tipping is not enabled.</code>`);
  const loadingString = `Making it rain for notice: ${notice}...`;
  const original = await matrixClient.sendHtmlNotice(roomId, `${loadingString}`, `<code>${loadingString}</code>`);
  const users = await fediverse.utils.getStatusMentions(notice, event, original);
  if (!users) return matrix.utils.editNoticeHTML(roomId, original, `<code>No eligible users found.</code>`);
  const rain = (users) => {
    amount = users.length * 0.00000001337 // by per user:
    if (users.length === 1) return amount * 100000 // 0.001337
    if (users.length <= 5) return amount * 10000 // 0.0001337
    if (users.length <= 10) return amount * 1000 // 0.00001337
    if (users.length <= 100) return amount * 100 // 0.000001337
    return amount
  }
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
    data: { status: `@10grans@fedi.cc makeitrain ${rain(users)} to ${users.join(' ')}` },
  })
    .then(() => {
      matrix.utils.addReact(event, '✅');
      return matrix.utils.editNoticeHTML(roomId, original, `<code>Raining ${rain(users)} 10grans on: 🌧${users.join(', ')}🌧</code>`);
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      return matrix.utils.editNoticeHTML(roomId, original, `<code>${e}</code>`)
    });
};
