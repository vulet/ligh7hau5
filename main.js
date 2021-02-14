global.registrar = require('./registrar.js');

matrix.auth.access_token ? auth.matrixTokenLogin() : auth.getMatrixToken();
if (!fediverse.auth.access_token && config.fediverse.username) auth.registerFediverseApp();

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

matrixClient.on('event', async (event) => {
  if (event.getSender() === matrixClient.credentials.userId) return matrix.utils.selfReact(event);
  if (!event.getContent()['m.relates_to']) return;
  if (event.event.unsigned.age > 10000) return;
  return event.getType() === 'm.room.message'
    ? matrix.utils.handleReply(event) : matrix.utils.handleReact(event);
});

matrixClient.on('Room.timeline', async (event, member, toStartOfTimeline) => {
  if (toStartOfTimeline) return;
  if (event.isEncrypted()) await event._decryptionPromise;
  if (event.getType() !== 'm.room.message') return;
  if (event.getSender() === matrixClient.credentials.userId) return;
  if (event.event.unsigned.age > 10000) return;
  roomId = event.event.room_id;
  content = event.getContent().body;
  if (content.charAt(0) === '+') {
    const args = content.slice(1).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    console.log(`Logs: ${event.event.sender} -  ${content}`);
    matrix.utils.eventHandler(args, roomId, command, event);
  }
});
