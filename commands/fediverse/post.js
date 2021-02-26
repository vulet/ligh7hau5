const qs = require('qs');
const FormData = require('form-data');

const emojis = { public: '🌐', unlisted: '📝', private: '🔒️', direct: '✉️' };
exports.visibilityEmoji = (v) => emojis[v] || v;

const getFilename = (header) => {
  if (typeof header !== 'string') return null;
  try {
    const m = header.match(/inline; filename(?:=(.+)|\*=utf-8''(.+))/);
    return !m ? null : m[2] && decodeURIComponent(m[2]) || m[1];
  } catch (e) {
    return null;
  }
};

const mediaDownload = async (url, { whitelist, blacklist }) => {
  const media = await axios({ method: 'GET', url, responseType: 'arraybuffer' });
  if (media.statusText !== 'OK' || blacklist.includes(media.headers['content-type'])) throw media;
  if (whitelist.length && !whitelist.includes(media.headers['content-type'])) throw media;
  return {
    data: media.data,
    filename: getFilename(media.headers['content-disposition']),
    mimetype: media.headers['content-type'],
  };
};

const mediaUpload = async ({ domain }, { data, filename, mimetype }) => {
  const form = new FormData();
  form.append('file', data, {
    filename: filename || 'upload',
    contentType: mimetype,
  });
  const upload = await axios({
    method: 'POST',
    url: `${domain}/api/v1/media`,
    headers: form.getHeaders({ Authorization: `Bearer ${fediverse.auth.access_token}` }),
    data: form,
  });
  if (upload.statusText !== 'OK') throw upload;
  return upload.data.id;
};

const run = async (roomId, event, content, replyId, mediaURL, subject) => {
  let mediaId = null;
  if (mediaURL) {
    const media = await mediaDownload(mediaURL, config.fediverse.mimetypes);
    mediaId = await mediaUpload(config.fediverse, media);
  }
  if (replyId) content = await fediverse.utils.getStatusMentions(replyId, event).then(m => m.concat(content).join(' '));
  const response = await axios({
    method: 'POST',
    url: `${config.fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({
      status: content,
      content_type: 'text/markdown',
      media_ids: mediaURL && [mediaId] || undefined,
      in_reply_to_id: replyId || undefined,
      spoiler_text: subject || undefined,
    }, { arrayFormat: 'brackets' }),
  });
  return fediverse.utils.sendEventWithMeta(roomId, `<a href="${response.data.url}">${response.data.id}</a>`, `redact ${response.data.id}`);
};

exports.runQuery = async (roomId, event, userInput, { isReply, hasMedia, hasSubject }) => {
  try {
    const chunks = userInput.trim().split(' ');
    if (!chunks.length || chunks.length < !!isReply + !!hasMedia) throw '';
    let replyId = null;
    let mediaURL = null;
    const subject = hasSubject ? config.fediverse.subject : null;
    if (isReply) {
      replyId = chunks[0];
      chunks.shift();
    }
    if (hasMedia) {
      let url = new URL(chunks[0]);
      chunks.shift();
      if (url.protocol === 'mxc:' && url.hostname && url.pathname)
        url = new URL(`${config.matrix.domain}/_matrix/media/r0/download/${url.hostname}${url.pathname}`);
      if (url.protocol !== 'https:') throw '';
      if (!config.matrix.domains.includes(url.hostname)) throw '';
      if (!/^\/_matrix\/media\/r0\/download\/[^/]+\/[^/]+\/?$/.test(url.pathname)) throw '';
      mediaURL = url.toString();
    }
    return await run(roomId, event, chunks.join(' '), replyId, mediaURL, subject);
  } catch (e) {
    return matrixClient.sendHtmlNotice(roomId, 'Sad!', '<strong>Sad!</strong>').catch(() => {});
  }
};
