module.exports = {
  matrix: {
    domain: 'https://your_homeserver.com',
    user: 'your_user',
    password: 'your_password',
    domains: [ 'your_homeserver.com' ],
    mimetypes: [ 'image/png', 'image/jpeg', 'video/webm', 'image/jpg', 'video/mp4', 'audio/mp3' ],
    subject: ''
  },
  fediverse: {
    domain: 'https://your_federation.com',
    token: 'your_federation_token',
  },
  archive: {
    domain: 'archive.is',
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)'
  },
  nitter: {
    domain: 'nitter.net',
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)',
    domains: [ 'nitter.net', 'www.nitter.net', 'twitter.com', 'wwww.twitter.com' ],
    check: '(âœ“)'
  },
  invidious: {
    domain: 'invidious.fdn.fr',
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)',
    domains: [ 'invidious.snopyta.org', 'invidious.xyz', 'youtube.com', 'www.youtube.com' ]
  }
};
