const qs = require('qs');
const axios = require('axios');
const FormData = require('form-data');

const mediaDownload = async (url, types) => {
  const media = await axios({ method: 'GET', url, responseType: 'arraybuffer' });
  if (media.statusText !== 'OK' || !types.includes(media.headers['content-type'])) throw media;
  return {
    data: media.data,
    //filename: //TODO,
    mimetype: media.headers['content-type']
  };
};

const mediaUpload = async ({ domain, token }, { data, mimetype }) => {
  const form = new FormData();
  form.append('file', data, {
    filename: 'upload',
    contentType: mimetype,
  });
  const upload = await axios({
    method: 'POST',
    url: `${domain}/api/v1/media`,
    headers: form.getHeaders({ Authorization: `Bearer ${token}` }),
    data: form,
  });
  if(upload.statusText !== 'OK') throw upload;
  return upload.data.id;
};

const run = async (matrixClient, { roomId }, content, replyId, mediaURL, subject, registrar) => {
  let mediaId = null;
  const fediverse = registrar.config.fediverse;
  if(mediaURL) {
    const media = await mediaDownload(mediaURL, registrar.config.matrix.mimetypes);
    mediaId = await mediaUpload(fediverse, media);
  }
  const response = await axios({
    method: 'POST',
    url: `${fediverse.domain}/api/v1/statuses`,
    headers: { Authorization: `Bearer ${fediverse.token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    data : qs.stringify({
      status: content,
      content_type: `text/markdown`,
      media_ids: mediaURL && [ mediaId ] || undefined,
      in_reply_to_id: replyId || undefined,
      spoiler_text: subject || undefined
    }, { arrayFormat: 'brackets' })
  });
  return matrixClient.sendHtmlNotice(roomId, '', `<a href="${response.data.url}">${response.data.id}</a>`);
}

exports.runQuery = async (client, room, userInput, registrar, { isReply, hasMedia, hasSubject }) => {
  try {
    const chunks = userInput.trim().split(' ');
    if(!chunks.length || chunks.length < !!isReply + !!hasMedia) throw '';
    let replyId = null;
    let mediaURL = null;
    const subject = hasSubject ? registrar.config.matrix.subject : null;
    if(isReply) {
      replyId = chunks[0];
      chunks.shift();
    }
    if(hasMedia) {
      const url = new URL(chunks[0]);
      chunks.shift();
      if(url.protocol !== 'https:') throw '';
      if(!registrar.config.matrix.domains.includes(url.hostname)) throw '';
      if(!/^\/_matrix\/media\/r0\/download\/[^/]+\/[^/]+\/?$/.test(url.pathname)) throw '';
      mediaURL = url.toString();
    }
    return await run(client, room, chunks.join(' '), replyId, mediaURL, subject, registrar);
  } catch(e) {
    return client.sendHtmlNotice(room.roomId, 'Sad!', `<strong>Sad!</strong>`).catch(()=>{});
  }
};
