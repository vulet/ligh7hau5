const sdk = require('matrix-js-sdk');
const axios = require('axios');
const registrar = require('./registrar.js');

const auth = {
  type: 'm.login.password',
  user: registrar.config.matrix.user,
  password: registrar.config.matrix.password,
};

axios.post(`${registrar.config.matrix.domain}/_matrix/client/r0/login`, auth).then((response) => {
  CreateClient(response.data.access_token, response.data.user_id);
}).catch((e) => {
  console.log(e);
});

let CreateClient = (token, user_id) => {
  const matrixClient = sdk.createClient({
    baseUrl: registrar.config.matrix.domain,
    accessToken: token,
    userId: user_id,
    timelineSupport: true,
  });

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
      const args = event.event.content.body.slice(1).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
      const userInput = args.join(' ');
      const flaggedInput = userInput.substr(userInput.indexOf(' ') + 1);
      const address = args.slice(0, 1).join(' ').replace(/"/g, '');

      if (command === 'boo') {
        registrar.boo.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'beg') {
        registrar.beg.runQuery(matrixClient, room, registrar);
      }

      if (command === 'clap') {
        registrar.clap.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'copy') {
        registrar.copy.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'flood') {
        registrar.flood.runQuery(matrixClient, room, registrar);
      }

      if (command === 'fren') {
        registrar.fren.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'help') {
        registrar.help.runQuery(matrixClient, room);
      }

      if (command === 'pin') {
        registrar.pin.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'plemara') {
        registrar.plemara.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'notify') {
        registrar.notify.runQuery(matrixClient, room, registrar);
      }

      if (command === 'redact') {
        registrar.redact.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'reply') {
        registrar.reply.runQuery(matrixClient, room, address, flaggedInput, registrar);
      }

      if (command === 'tip') {
        registrar.tip.runQuery(matrixClient, room, address, flaggedInput, registrar);
      }

      if (command === 'unfren') {
        registrar.unfren.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'unpin') {
        registrar.unpin.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'mordy') {
        registrar.mordy.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'archive') {
        registrar.archive.runQuery(matrixClient, room, userInput, false, registrar);
      }

      if (command === 'rearchive') {
        registrar.archive.runQuery(matrixClient, room, userInput, true, registrar);
      }

      if (command === 'nitter') {
        registrar.nitter.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'invidious') {
        registrar.invidious.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'media') {
        registrar.media.runQuery(matrixClient, room, userInput, registrar);
      }

      if (command === 'status') {
        registar.status.runQuery(matrixClient, room, userInput, registrar);
      }

    }
  });

  matrixClient.startClient();
  module.exports = matrixClient;
};
