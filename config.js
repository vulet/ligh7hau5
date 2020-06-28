module.exports = {
  matrix: {
    domain: 'https://your_homeserver.com',
    user: 'your_user',
    password: 'your_password',
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
    domains: [ 'nitter.net', 'www.nitter.net', 'twitter.com', 'wwww.twitter.com' ]
  },
  invidious: {
    domain: 'invidio.us',
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)',
    domains: [ 'invidio.us', 'www.invidio.us', 'youtube.com', 'www.youtube.com' ]
  }
};
