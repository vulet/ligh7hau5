exports.runQuery = async function (roomId, event, userInput) {
  const loadingString = `Searching for ${userInput}...`;
  const original = await matrixClient.sendHtmlNotice(roomId, `${loadingString}`, `<code>${loadingString}</code>`);
  const found = [];
  const suggest = [];
  axios({
    method: 'GET',
    url: `${config.fediverse.domain}/api/v2/search?q=${userInput}&type=accounts`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
  }).then((findUserId) => {
    const results = findUserId.data.accounts;
    const len = results.length;
    for (let i = 0; i < len; i++) results[i].acct !== userInput ? suggest.push(results[i].acct) : found.push(results[i]);
    if (found.length > 0) return fediverse.utils.follow(roomId, found, event, original);
    if (suggest.length > 0) msg = `<code>${userInput} was not found, suggesting:</code><blockquote>${suggest.join('<br>')}</blockquote>`;
    if (suggest.length === 0) msg = `<code>No results found for: ${userInput}.</code>`;
    return matrix.utils.editNoticeHTML(roomId, original, msg);
  });
};
