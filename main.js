const registrar = require('./registrar.js');
const auth = require('./auth.js');

registrar.matrix_auth.access_token ? auth.matrixTokenLogin() : auth.getMatrixToken();
if (!registrar.fediverse_auth.access_token && registrar.config.fediverse.username) auth.registerFediverseApp();

matrixClient.on('RoomMember.membership', (event, member) => {
  if (member.membership === 'invite' && member.userId === matrixClient.credentials.userId) {
    matrixClient.joinRoom(member.roomId).done(() => {
      console.log('Auto-joined %s', member.roomId);
    });
  }
  if (member.membership === 'leave' && member.userId === matrixClient.credentials.userId) {
    matrixClient.forget(member.roomId).then(() => {
      console.log('Kicked %s', member.roomId);
    });
  }
});

matrixClient.on('Room.timeline', (event, room, toStartOfTimeline) => {
  if (toStartOfTimeline) return;
  if (event.getType() !== 'm.room.message') return;
  if (event.getSender() === matrixClient.credentials.userId) return;
  if (event.event.unsigned.age > 10000) return;
  if (event.event.content.body.charAt(0) === '+') {
    console.log(`Logs: ${event.event.sender} -  ${event.event.content.body}`);
    let args = event.event.content.body.slice(1).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    const userInput = args.join(' ');
    const flaggedInput = userInput.substr(userInput.indexOf(' ') + 1);
    const address = args.slice(0, 1).join(' ').replace(/"/g, '');

    args = [];

    switch(command) {
      case 'config':
        return;
      case 'help': case 'beg': case 'flood': case 'notify':
        args.push(matrixClient, room, registrar);
        break;
      case 'tip':
        args.push(matrixClient, room, address, flaggedInput, registrar);
        break;
      case 'archive': case 'rearchive':
        args.push(matrixClient, room, userInput, !!~command.indexOf('re'), registrar);
        command = 'archive';
        break;
      case 'post': case 'reply': case 'media': case 'mediareply':
      case 'random': case 'randomreply': case 'randommedia': case 'randommediareply':
        args.push(matrixClient, room, userInput, registrar, {
          isReply: !!~command.indexOf('reply'),
          hasMedia: !!~command.indexOf('media'),
          hasSubject: !!~command.indexOf('random'),
        });
        command = 'media';
        break;
      case 'proxy':
        try {
          const url = new URL(userInput);
          command = registrar.config.invidious.domains.includes(url.hostname)
          ? 'invidious'
          : registrar.config.nitter.domains.includes(url.hostname)
              ? 'nitter'
              : 'proxy';
        } catch(e) {}
        //fallthrough
      default:
        args.push(matrixClient, room, userInput, registrar);
    }

    registrar[command] && registrar[command].runQuery.apply(null, args);
  }
});
