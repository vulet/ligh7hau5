const sendError = async (event, roomId, e) => {
  e.response ? error = `Error(${e.response.status}): ${e.response.data.error}`
    : e.data ? error = `Error(${e.errcode}): ${e.data.error}`
      : error = `Error: ${e.syscall}, ${e.code}`;
  return matrixClient.sendHtmlNotice(roomId,
    '', error);
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
    case 'tip':
      args.push(roomId, address, flaggedInput);
      break;
    case 'archive': case 'rearchive':
      args.push(roomId, userInput, !!~command.indexOf('re'));
      command = 'archive';
      break;
    case 'post': case 'reply': case 'media': case 'mediareply':
    case 'random': case 'randomreply': case 'randommedia': case 'randommediareply':
      args.push(roomId, userInput, {
        isReply: !!~command.indexOf('reply'),
        hasMedia: !!~command.indexOf('media'),
        hasSubject: !!~command.indexOf('random'),
      });
      command = 'post';
      break;
    case 'proxy':
      try {
        const url = new URL(userInput);
        command = config.invidious.domains.includes(url.hostname)
          ? 'invidious'
          : config.nitter.domains.includes(url.hostname)
            ? 'nitter'
            : 'proxy';
      } catch (e) { sendError(event, roomId, e); }
      // fallthrough
    default:
      args.push(roomId, event, userInput);
  }
  registrar[command] && registrar[command].runQuery.apply(null, args);
};

module.exports.sendError = sendError;

module.exports.addReact = addReact;

module.exports.eventHandler = eventHandler;

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
  const reaction = event.getContent()['m.relates_to'];
  if (!reaction) return;
  const metaEvent = await matrixClient.fetchRoomEvent(roomId, reaction.event_id);
  if (!metaEvent.content.meta || metaEvent.sender !== config.matrix.user) return;
  const args = metaEvent.content.meta.split(' ');
  isMeta = ['status', 'reblog', 'mention', 'redact', 'unreblog'];
  if (!isMeta.includes(args[0])) return;
  let command = [];
  args.shift().toLowerCase();
  if (reaction.key === '🔁') command = 'copy';
  if (reaction.key === '👏') command = 'clap';
  if (reaction.key === '🗑️️') command = 'redact';
  eventHandler(args, roomId, command, event);
};

module.exports.handleReply = async (event) => {
  const roomId = event.event.room_id;
  const reply = event.getContent()['m.relates_to']['m.in_reply_to'];
  if (!reply) return;
  const metaEvent = await matrixClient.fetchRoomEvent(roomId, reply.event_id);
  if (!metaEvent.content.meta || metaEvent.sender !== config.matrix.user) return;
  const args = metaEvent.content.meta.split(' ');
  args.push(event.event.content.formatted_body.trim().split('</mx-reply>')[1]);
  isMeta = ['status', 'reblog', 'mention', 'redact', 'unreblog'];
  if (!isMeta.includes(args[0])) return;
  args.shift().toLowerCase();
  command = 'reply';
  eventHandler(args, roomId, command, event);
};

module.exports.selfReact = async (event) => {
  if (event.getType() !== 'm.room.message') return;
  if (event.event.unsigned.age > 10000) return;
  const { meta } = event.getContent();
  if (!meta) return;
  const type = meta.split(' ')[0];
  if (type === 'redact' || type === 'unreblog') addReact(event, '🗑️️');
  if (type === 'status' || type === 'reblog' || type === 'mention') {
    addReact(event, '🔁');
    addReact(event, '👏');
  }
};
