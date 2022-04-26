const { MatrixEvent } = require('matrix-js-sdk/lib/models/event');

const sendError = async (event, roomId, e) => {
  e.response ? error = `Error(${e.response.status}): ${e.response.data.error}`
    : e.data ? error = `Error(${e.errcode}): ${e.data.error}`
      : error = `Error: ${e.syscall}, ${e.code}`;
  return matrixClient.sendHtmlNotice(roomId,
    ' ', error);
};

const addReact = async (event, key) => {
  const roomId = event.event.room_id;
  return matrixClient.sendEvent(event.event.room_id, 'm.reaction', {
    'm.relates_to': {
      rel_type: 'm.annotation',
      event_id: event.getId(),
      key,
    },
  }).catch((e) => sendError(null, roomId, e));
};

const eventHandler = (args, roomId, command, event) => {
  const userInput = args.join(' ');
  const flaggedInput = userInput.substr(userInput.indexOf(' ') + 1);
  const address = args.slice(0, 1).join(' ').replace(/"/g, '');

  args = [];

  switch (command) {
    case 'config':
      return;
    case 'help': case 'flood': case 'notify':
      args.push(roomId);
      break;
    case 'unflood': case 'unnotify':
      args.push(roomId, true);
      command = command.substring(2);
      break;
    case 'tip': case 'makeitrain':
      args.push(roomId, event, address, flaggedInput);
      break;
    case 'archive': case 'rearchive':
      args.push(roomId, userInput, !!~command.indexOf('re'));
      command = 'archive';
      break;
    case 'post': case 'reply': case 'media': case 'mediareply':
    case 'random': case 'randomreply': case 'randommedia': case 'randommediareply':
      args.push(roomId, event, userInput, {
        isReply: !!~command.indexOf('reply'),
        hasMedia: !!~command.indexOf('media'),
        hasSubject: !!~command.indexOf('random'),
      });
      command = 'post';
      break;
    case 'proxy': case 'p':
      try {
        const url = new URL(userInput);
        const invidio = config.invidious.domains;
        const nitter = config.nitter.domains;
        command = invidio.redirect.includes(url.hostname) || invidio.original.includes(url.hostname)
          ? 'invidious'
          : nitter.redirect.includes(url.hostname) || nitter.original.includes(url.hostname)
            ? 'nitter'
            : 'proxy';
      } catch (e) { sendError(event, roomId, e); }
      // fallthrough
    default:
      args.push(roomId, event, userInput);
  }
  registrar[command] && registrar[command].runQuery.apply(null, args);
};

/**
matrixClient.fetchRoomEvent() does not return an Event class
however, this class is necessary for decryption, so reinstate it.
afterwards, decrypt.
*/
const fetchEncryptedOrNot = async (roomId, event) => {
  const fetchedEvent = await matrixClient.fetchRoomEvent(roomId, event.event_id)
  const realEvent = new MatrixEvent(fetchedEvent);
  if (realEvent.isEncrypted()) {
    await matrixClient.decryptEventIfNeeded(realEvent, { emit: false, isRetry: false });
  }
  return realEvent;
}

module.exports.sendError = sendError;

module.exports.addReact = addReact;

module.exports.eventHandler = eventHandler;

module.exports.fetchEncryptedOrNot = fetchEncryptedOrNot

module.exports.editNoticeHTML = (roomId, event, html, plain) => matrixClient.sendMessage(roomId, {
  body: ` * ${plain || html.replace(/<[^<]+?>/g, '')}`,
  formatted_body: ` * ${html}`,
  format: 'org.matrix.custom.html',
  msgtype: 'm.notice',
  'm.new_content': {
    body: plain || html.replace(/<[^<]+?>/g, ''),
    formatted_body: html,
    format: 'org.matrix.custom.html',
    msgtype: 'm.notice',
  },
  'm.relates_to': {
    rel_type: 'm.replace',
    event_id: event.event_id,
  },
});

module.exports.handleReact = async (event) => {
  const roomId = event.event.room_id;
  if (!event.getContent()['m.relates_to']) return;
  const reaction = event.getContent()['m.relates_to'];
  const metaEvent = await fetchEncryptedOrNot(roomId, reaction);
  if (!metaEvent.getContent().meta || metaEvent.event.sender !== config.matrix.user) return;
  const args = metaEvent.getContent().meta.split(' ');
  isMeta = ['status', 'reblog', 'mention', 'redact', 'unreblog'];
  if (!isMeta.includes(args[0])) return;
  let command = [];
  args.shift().toLowerCase();
  if (reaction.key === '🔁') command = 'copy';
  if (reaction.key === '👏') command = 'clap';
  if (reaction.key === '🗑️️') command = 'redact';
  if (reaction.key === '🌧️') command = 'makeitrain';
  if (reaction.key === '➕') command = 'unroll';
  eventHandler(args, roomId, command, event);
};

module.exports.handleReply = async (event) => {
  const roomId = event.event.room_id;
  if(!event.event.content['m.relates_to']['m.in_reply_to']) return;
  const reply = event.event.content['m.relates_to']['m.in_reply_to'];
  const metaEvent = await fetchEncryptedOrNot(roomId, reply);
  if (!metaEvent.getContent().meta || metaEvent.event.sender !== config.matrix.user) return;
  const args = metaEvent.getContent().meta.split(' ');
  args.push(event.getContent().formatted_body.trim().split('</mx-reply>')[1]);
  isMeta = ['status', 'reblog', 'mention', 'redact', 'unreblog'];
  if (!isMeta.includes(args[0])) return;
  args.shift().toLowerCase();
  command = 'reply';
  eventHandler(args, roomId, command, event);
};

module.exports.selfReact = async (event) => {
  if (event.getType() !== 'm.room.message') return;
  if (event.event.unsigned.age > 10000) return;
  if (!event.getContent().meta) return;
  const { meta } = event.getContent();
  const type = meta.split(' ')[0];
  if (type === 'redact' || type === 'unreblog') addReact(event, '🗑️️');
  if (type === 'status' || type === 'reblog' || type === 'mention') {
    addReact(event, '➕');
    addReact(event, '🔁');
    addReact(event, '👏');
    if (config.fediverse.tipping === true) addReact(event, '🌧️');
  }
};

module.exports.retryPromise = async (argList, promiseFn) => {
  let err;
  for(var arg of argList) {
    try {
      return await promiseFn(arg);
    } catch(e) { err = e; }
  }
  throw err || new Error('retryPromise error');
};
