global.registrar = require('./registrar.js');

matrix_auth.access_token ? auth.matrixTokenLogin() : auth.getMatrixToken();
if (!fediverse_auth.access_token && config.fediverse.username) auth.registerFediverseApp();

matrixClient.on('RoomMember.membership', (event, member) => {
  if (member.membership === 'invite' && member.userId === matrixClient.credentials.userId) {
    matrixClient.joinRoom(member.roomId).then(() => {
      console.log('Auto-joined %s', member.roomId);
    });
  }

  if (member.membership === 'leave' && member.userId === matrixClient.credentials.userId) {
    matrixClient.forget(member.roomId).then(() => {
      console.log('Kicked %s', member.roomId);
    });
  }
});

matrixClient.on('Room.timeline', async function (event, room, member, toStartOfTimeline) {
  if (toStartOfTimeline) return;
  if (event.isEncrypted()) await event._decryptionPromise;
  if (event.getType() !== 'm.room.message') return;
  if (event.getSender() === matrixClient.credentials.userId) return;
  if (event.event.unsigned.age > 10000) return;
  if (event.getContent().body.charAt(0) === '+') {
    console.log(`Logs: ${event.event.sender} -  ${event.getContent().body}`);
    let args = event.getContent().body.slice(1).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    const userInput = args.join(' ');
    const flaggedInput = userInput.substr(userInput.indexOf(' ') + 1);
    const address = args.slice(0, 1).join(' ').replace(/"/g, '');

    args = [];

    switch(command) {
      case 'config':
        return;
      case 'help': case 'beg': case 'flood': case 'asdf':
        args.push(matrixClient, room);
        break;
      case 'tip':
        args.push(matrixClient, room, address, flaggedInput);
        break;
      case 'archive': case 'rearchive':
        args.push(matrixClient, room, userInput, !!~command.indexOf('re'));
        command = 'archive';
        break;
      case 'post': case 'reply': case 'media': case 'mediareply':
      case 'random': case 'randomreply': case 'randommedia': case 'randommediareply':
        args.push(matrixClient, room, userInput, {
          isReply: !!~command.indexOf('reply'),
          hasMedia: !!~command.indexOf('media'),
          hasSubject: !!~command.indexOf('random'),
        });
        command = 'media';
        break;
      case 'proxy':
        try {
          const url = new URL(userInput);
          command = config.invidious.domains.includes(url.hostname)
            ? 'invidious'
            : config.nitter.domains.includes(url.hostname)
              ? 'nitter'
              : 'proxy';
        } catch(e) {}
        //fallthrough
      default:
        args.push(matrixClient, room, userInput);
    }
    registrar[command] && registrar[command].runQuery.apply(null, args);
  }
});
