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
          + '+flood : turn on timeline<br>'
          + '+notify : show notifications</b></blockquote>'
          + '<blockquote><b>--- <i>docs by lint</i> ---</b></blockquote>');
};
