const sendEventWithMeta = async (roomId, content, meta) => {
  await matrixClient.sendEvent(roomId, 'm.room.message', {
    body: content.replace(/<[^<]+?>/g, ''),
    msgtype: 'm.notice',
    formatted_body: content,
    meta: meta,
    format: 'org.matrix.custom.html',
  });
};

const hasAttachment = (res) => {
  if (res.status) res = res.status;
  if (!res.media_attachments) return '<br>';
  return res.media_attachments.map((media) => {
    const mediaURL = new URL(media.remote_url);
    media.name = new URLSearchParams(mediaURL.search).get('name') || 'Unknown file name.';
    return `File attachment: <a href="${media.remote_url}">${media.name}</a><br>`;
  }).join('<br>');
};

const notifyFormatter = (res, roomId) => {
  userDetails = `<b><a href="${config.fediverse.domain}/${res.account.id}">
  ${res.account.acct}</a>`;
  switch (res.type) {
    case 'follow':
      fediverse.auth.me !== res.account.url ? res.meta = 'follow' : res.meta = 'redact';
      meta = `${res.meta} ${res.account.id}`;
      content = `${userDetails}
       <font color="#03b381"><b>has followed you.</font>
       <blockquote><i>${res.account.note}</i></blockquote>`;
      sendEventWithMeta(roomId, content, meta);
      break;
    case 'favourite':
      fediverse.auth.me !== res.account.url ? res.meta = 'favourite' : res.meta = 'redact';
      meta = `${res.meta} ${res.status.id}`;
      content = `${userDetails}
       <font color="#03b381"><b>has <a href="${res.status.uri}">favorited</a>
       your post:</font>
       <blockquote><i>${res.status.content}</i><br>
       ${hasAttachment(res)}
       <br>(id: ${res.id}) ${registrar.post.visibilityEmoji(res.status.visibility)}
       </blockquote>`;
      sendEventWithMeta(roomId, content, res.meta);
      break;
    case 'mention':
      fediverse.auth.me !== res.account.url ? res.meta = 'mention' : res.meta = 'redact';
      meta = `${res.meta} ${res.status.id}`;
      content = `${userDetails}
       <font color="#03b381"><b>has <a href="${res.status.uri}">mentioned</a>
       you:</font><blockquote><i>${res.status.content}</i><br>
           ${hasAttachment(res)}
           <br>(id: ${res.id}) ${registrar.post.visibilityEmoji(res.status.visibility)}
           </blockquote>`;
      sendEventWithMeta(roomId, content, meta);
      break;
    case 'reblog':
      fediverse.auth.me !== res.account.url ? res.meta = 'reblog' : res.meta = 'redact';
      meta = `${res.meta} ${res.status.id}`;
      content = `${userDetails}
       <font color="#03b381"><b>has <a href="${res.status.uri}">repeated</a>
       your post:</font><blockquote><i>${res.status.content}</i><br>
           ${hasAttachment(res)}
           <br>(id: ${res.id}) ${registrar.post.visibilityEmoji(res.status.visibility)}
           </blockquote>`;
      sendEventWithMeta(roomId, content, meta);
      break;
    default:
      throw 'Unknown notification type.';
  }
};

const isOriginal = (res, roomId) => {
  if (res.data) res = res.data;
  userDetails = `<b><a href="${config.fediverse.domain}/${res.account.id}">
  ${res.account.acct}</a>`;
  fediverse.auth.me !== res.account.url ? res.meta = 'status' : res.meta = 'redact';
  meta = `${res.meta} ${res.id}`;
  content = `${userDetails}
    <blockquote><i>${res.content}</i><br>
    ${hasAttachment(res)}
    <br>(id: ${res.id}) ${registrar.post.visibilityEmoji(res.visibility)}
    </blockquote>`;
  sendEventWithMeta(roomId, content, meta);
};

const isReblog = (res, roomId) => {
  if (res.data) res = res.data;
  userDetails = `<b><a href="${config.fediverse.domain}/${res.account.id}">
  ${res.account.acct}</a>`;
  fediverse.auth.me !== res.account.url ? res.meta = 'status' : res.meta = 'unreblog';
  meta = `${res.meta} ${res.reblog.id}`;
  content = `${userDetails}
   <font color="#7886D7"><b>has <a href="${res.reblog.uri}">repeated</a>
   ${res.reblog.account.acct}'s post:</font>
   <blockquote><i>${res.content}</i><br>
   ${hasAttachment(res)}
   <br>(id: ${res.reblog.id}) ${registrar.post.visibilityEmoji(res.visibility)}
   </blockquote>`;
  sendEventWithMeta(roomId, content, meta);
};

module.exports.sendEventWithMeta = sendEventWithMeta;

module.exports.formatter = (res, roomId) => {
  const filtered = (res.label === 'notifications')
    ? notifyFormatter(res, roomId)
    : (res.reblog == null)
      ? isOriginal(res, roomId)
      : isReblog(res, roomId);
  return filtered;
};

module.exports.follow = (roomId, account, event, original) => {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/accounts/${account[0].id}/follow`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
  })
    .then(() => {
      matrix.utils.addReact(event, '✅');
      matrix.utils.editNoticeHTML(roomId, original, `<code>Followed ${account[0].acct}.</code>`);
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      matrix.utils.sendError(event, roomId, e);
    });
};

module.exports.unfollow = (roomId, account, event, original) => {
  axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/accounts/${account[0].id}/unfollow`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
  })
    .then(() => {
      matrix.utils.addReact(event, '✅');
      matrix.utils.editNoticeHTML(roomId, original, `<code>Unfollowed ${account[0].acct}.</code>`);
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      matrix.utils.sendError(event, roomId, e);
    });
};
