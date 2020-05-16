const axios = require('axios');
const fs = require('fs');

exports.runQuery = function (matrixClient, room, registrar) {
  setInterval(() => {
    axios({
      method: 'GET',
      url: `${registrar.config.fediverse}/api/v1/notifications`,
      headers: { Authorization: `Bearer ${registrar.config.fediverseToken}` },
    }).then((notifications) => {
      const event = fs.readFileSync('notification.json', 'utf8');
      fs.writeFileSync('notification.json', notifications.data[0].created_at, 'utf8');

      if (event !== notifications.data[0].created_at) {
        if (notifications.data[0].type === 'follow') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<hr><b><a href="${registrar.config.fediverse}/${notifications.data[0].account.id}">
            ${notifications.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has followed you.</b></font>
          <br><i>${notifications.data[0].account.note}</i><hr>`);
        } else if (notifications.data[0].type === 'favourite') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<hr><b><a href="${registrar.config.fediverse}/${notifications.data[0].account.id}">
            ${notifications.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has <a href="${notifications.data[0].status.uri}">favorited</a>
          your post:</b></font>
          <br><i><b>${notifications.data[0].status.content}</i></b><hr>`);
        } else if (notifications.data[0].type === 'mention') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<hr><b><a href="${registrar.config.fediverse}/${notifications.data[0].account.id}">
            ${notifications.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has <a href="${notifications.data[0].status.uri}">mentioned</a>
          you:</b></font><br>
          <i><b>${notifications.data[0].status.content}</i></b>
          <br>(id: ${notifications.data[0].status.id})</i></b><hr>`);
        } else if (notifications.data[0].type === 'reblog') {
          matrixClient.sendHtmlNotice(room.roomId,
            '',
            `<hr><b><a href="${registrar.config.fediverse}/${notifications.data[0].account.id}">
            ${notifications.data[0].account.acct}</a></b>
          <font color="#03b381"><b>has <a href="${notifications.data[0].status.uri}">repeated</a>
          your post:</b></font><br>
          <i><b>${notifications.data[0].status.content}</i></b><hr>`);
        }
      }
    });
  }, 8000);
};
