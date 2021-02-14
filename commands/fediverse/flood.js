exports.runQuery = function (roomId) {
  setInterval(() => {
    axios({
      method: 'GET',
      url: `${config.fediverse.domain}/api/v1/timelines/home`,
      headers: { Authorization: `Bearer ${fediverse.auth.access_token}` },
    })
      .then((res) => {
        let past = JSON.parse(localStorage.getItem('timeline'));
        if (past.length === 0) past = res.data;
        const events = res.data;
        const len = events.length;
        for (let i = len - 1; i >= 0; i--) {
          if (past.findIndex((x) => x.created_at === events[i].created_at) === -1) {
            if (events[i].created_at < past.slice(18, 19)[0].created_at) return;
            events[i].label = 'status';
            fediverse.utils.formatter(events[i], roomId);
          }
        }
        localStorage.setItem('timeline', JSON.stringify(events, null, 2));
      })
      .catch((e) => {
        matrix.utils.sendError(null, roomId, e);
      });
  }, 30000);
};
