exports.runQuery = function (matrixClient, room, userInput) {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
    data: {
      status: `@mordekai ${userInput}`,
      content_type: `text/markdown`,
      visibility: 'unlisted',
      expires_in: '7200'
    },
  }).then((response) => {
    matrixClient.sendHtmlNotice(room.roomId,
      '',
      `<b>
      <blockquote><i>${response.data.content}<br>
      (id: ${response.data.id}</a>)
      </blockquote><br>`);
  })
    .catch((e) => {
      matrixClient.sendHtmlNotice(room.roomId,
        '', `${e}`);
    });
};
