const qs = require('qs');
const crypto = require('crypto');
const FormData = require('form-data');

const emojis = { public: '🌐', unlisted: '📝', private: '🔒️', direct: '✉️' };
exports.visibilityEmoji = (v) => emojis[v] || v;

const mediaPathRegex = /^\/_matrix\/media\/r0\/download\/[^/]+\/[^/]+\/?$/;

const decryptMedia = (media, file) => {
  const { v, key: { alg, ext, k, }, iv } = file;

  if (v !== 'v2' || ext !== true || alg !== 'A256CTR')
    throw new Error('Unsupported file encryption');

  const key = Buffer.from(k, 'base64');
  const _iv = Buffer.from(iv, 'base64');
  const cipher = crypto.createDecipheriv('aes-256-ctr', key, _iv);
  const data = Buffer.concat([ cipher.update(media.data), cipher.final() ]);
  return Object.assign({}, media, { data });
};

const getMediaInfoFromEvent = async (roomId, event_id) => {
  const event = await matrix.utils.fetchEncryptedOrNot(roomId, { event_id });
  if (event.getType() !== 'm.room.message') throw new Error('Invalid type');
  const content = event.getContent();
  if (content.msgtype !== 'm.image') throw new Error('Invalid msgtype');
  if (content.url) return { url: getMediaUrl(content.url) };
  if (content.file) return {
    url: getMediaUrl(content.file.url),
    filename: content.body,
    mimetype: content.info ? content.info.mimetype : null,
    file: content.file
  };
  throw new Error('Invalid event');
};

const getMediaUrl = string => {
  let url = new URL(string);
  if (url.protocol === 'mxc:' && url.hostname && url.pathname)
    url = new URL(`${config.matrix.domain}/_matrix/media/r0/download/${url.hostname}${url.pathname}`);
  if (url.protocol !== 'https:' ||
     !config.matrix.domains.includes(url.hostname) ||
     !mediaPathRegex.test(url.pathname))
      throw new Error('Invalid URL');
  return url.toString();
};

const getMedia = async (roomId, string) => {
  let opts = {};
  if (string.startsWith('mxe://'))
    opts = await getMediaInfoFromEvent(roomId, string.substring(6));
  else
    opts.url = getMediaUrl(string);
  const media = await mediaDownload(opts);
  return opts.file ? decryptMedia(media, opts.file) : media;
};

const getFilename = (header) => {
  if (typeof header !== 'string') return null;
  try {
    const m = header.match(/inline; filename(?:=(.+)|\*=utf-8''(.+))/);
    return !m ? null : m[2] && decodeURIComponent(m[2]) || m[1];
  } catch (e) {
    return null;
  }
};

const mediaDownload = async (opts) => {
  const { whitelist, blacklist } = config.fediverse.mimetypes;
  const media = await axios({ method: 'GET', url: opts.url, responseType: 'arraybuffer' });
  const filename = opts.filename || getFilename(media.headers['content-disposition']);
  const mimetype = opts.mimetype || media.headers['content-type'];
  if (media.statusText !== 'OK' || blacklist.includes(mimetype)) throw media;
  if (whitelist.length && !whitelist.includes(mimetype)) throw media;
  return { data: media.data, filename, mimetype };
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

const run = async (roomId, event, content, replyId, mediaURL, subject, visibility) => {
  let mediaId = null;
  if (mediaURL) {
    const media = await getMedia(roomId, mediaURL);
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
      visibility: visibility || undefined,
      media_ids: mediaURL && [mediaId] || undefined,
      in_reply_to_id: replyId || undefined,
      spoiler_text: subject || undefined,
    }, { arrayFormat: 'brackets' }),
  });
  return fediverse.utils.sendEventWithMeta(roomId, `<a href="${response.data.url}">${response.data.id}</a>`, `redact ${response.data.id}`);
};

exports.runQuery = async (roomId, event, userInput, { isReply, hasMedia, hasSubject, visibility }) => {
  try {
    const chunks = userInput.trim().split(' ');
    if (!chunks.length || chunks.length < !!isReply + !!hasMedia) throw '';
    let replyId = null;
    let mediaURL = null;
    const subject = hasSubject ? config.fediverse.subject : null;
    if (isReply) replyId = chunks.shift();
    if (hasMedia) mediaURL = chunks.shift();
    return await run(roomId, event, chunks.join(' '), replyId, mediaURL, subject, visibility);
  } catch (e) {
    return matrixClient.sendHtmlNotice(roomId, 'Sad!', '<strong>Sad!</strong>').catch(() => {});
  }
};
