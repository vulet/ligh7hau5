module.exports = {
  matrix: {
    domain: 'https://your_homeserver.com',
    user: 'your_user',
    password: 'your_password',
    domains: [ 'your_homeserver.com' ]
  },
  fediverse: {
    domain: 'https://your_federation.com',
    token: 'your_federation_token',
    subject: '',
    mimetypes: {
      whitelist: [],
      blacklist: []
    }
  },
  archive: {
    domain: 'archive.is',
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)'
  },
  nitter: {
    domain: 'nitter.net',
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)',
    domains: [ 'nitter.net', 'www.nitter.net', 'twitter.com', 'www.twitter.com' ],
    check: '(✅)'
  },
  invidious: {
    domain: 'invidious.fdn.fr',
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)',
    domains: [ 'invidious.snopyta.org', 'invidious.xyz', 'youtube.com', 'www.youtube.com' ]
  }
};
