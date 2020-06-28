exports.runQuery = function (matrixClient, room) {
  matrixClient.sendHtmlNotice(room.roomId,
    '',
    '<blockquote><b>+plemara [your message] : post<br>'
          + '+redact [post id] : delete post<br>'
          + '+fren [user id] : follow<br>'
          + '+unfren [user id] : unfollow<br>'
          + '+copy [post id] : repeat/repost/retweet<br>'
          + '+reply [post id] [content] : reply to post<br>'
          + '+tip [@user@fedi.url] [amount] : tip 10grans'
          + '+beg : beg for 10grans'
          + '+clap [post id] : favorite<br>'
          + '+boo [post id] : unfavorite</blockquote>'
          + '<blockquote><b>channel commands<br>'
          + '+flood : turn on timeline in channel<br>'
          + '+notify : show notifications in channel</b>'
          + '+archive [URL] : archive content<br>'
          + '+rearchive [URL] : re-archive content<br>'
          + '+nitter [status URL] : redirect twitter to nitter, also embed tweet<br>'
          + '+invidious [video URL] : redirect youtube to invidious, also embed description<br></blockquote>'
          + '<blockquote><b>--- <i>contributors🐱</i> ---</b>'
          + '--- <i>cryptomooners</i> ---</blockquote>'
          + '<blockquote><b>--- <i>docs by lint</i> ---</b></blockquote>');
};
