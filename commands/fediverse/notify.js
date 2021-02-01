exports.runQuery = function (matrixClient, room) {
  setInterval(() => {
    axios({
      method: 'GET',
      url: `${config.fediverse.domain}/api/v1/notifications`,
      headers: { Authorization: `Bearer ${fediverse_auth.access_token}` },
    }).then((events) => {
      let lastEvent = JSON.parse(localStorage.getItem('notifications'));
      localStorage.setItem('notifications', JSON.stringify(events.data[0].created_at, null, 2));
      if (lastEvent !== events.data[0].created_at) {
        if (events.data[0].type === 'follow') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${config.fediverse.domain}/${events.data[0].account.id}">
            ${events.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has followed you.</b></font>
          <br><i>${events.data[0].account.note}</i>`);
        } else if (events.data[0].type === 'favourite') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${config.fediverse.domain}/${events.data[0].account.id}">
            ${events.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has <a href="${events.data[0].status.uri}">favorited</a>
          your post:</b></font>
          <br><blockquote><i><b>${events.data[0].status.content}</i></b></blockquote>`);
        } else if (events.data[0].type === 'mention') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${config.fediverse.domain}/${events.data[0].account.id}">
            ${events.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has <a href="${events.data[0].status.uri}">mentioned</a>
          you:</b></font><br><blockquote><i><b>${events.data[0].status.content}
          <br>(id: ${events.data[0].status.id}) ${registrar.media.visibilityEmoji(events.data[0].status.visibility)}</i></b>
          </blockquote>`);
        } else if (events.data[0].type === 'reblog') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<b><a href="${config.fediverse.domain}/${events.data[0].account.id}">
            ${events.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has <a href="${events.data[0].status.uri}">repeated</a>
          your post:</b></font><br>
          <blockquote><i><b>${events.data[0].status.content}</i></b></blockquote>`);
        }
      }
    });
  }, 8000);
};
