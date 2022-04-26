exports.runQuery = function (roomId, event, userInput) {
  const instance = axios.create({
    baseURL: config.fediverse.domain,
    method: 'GET',
    headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
  });
  instance.get(`/api/v1/statuses/${userInput}/context`)
    .then(async (response) => {
      let story = [];
      const original = await instance.get(`/api/v1/statuses/${userInput}`);
      const ancestors = response.data.ancestors;
      const descendants = response.data.descendants;
      story = [...story, ancestors, original.data, descendants];
      const book = story.flat();
      await fediverse.utils.thread(roomId, event, '<br><hr><h3>...Beginning thread...</h3><hr><br>');
      for (const [i, entry] of book.entries()) {
        entry.label = 'thread';
        fediverse.utils.formatter(entry, roomId, event)
      }
      await fediverse.utils.thread(roomId, event, '<br><hr><h3>...Thread ended...</h3><hr><br>');
    })
    .catch((e) => {
      matrix.utils.addReact(event, '❌');
      matrix.utils.sendError(event, roomId, e);
    });
};
