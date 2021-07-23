module.exports = {
  matrix: {
    domain: 'https://your_homeserver.com',
    user: '@your_user:your_homeserver.com',
    password: 'your_password',
    domains: [ 'your_homeserver.com' ],
    manualVerify: false,
  },
  fediverse: {
    domain: 'https://your_federation.com',
    username: '',
    password: '',
    client_name: 'ligh7hau5',
    subject: '',
    tipping: false,
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
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)',
    domains: {
      redirect: [ 'nitter.fdn.fr', 'nitter.snopyta.org', 'nitter.net' ],
      original:  [ 'nitter.net', 'www.nitter.net', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com', 'm.twitter.com' ]
    },
    check: '(✅)',
  },
  invidious: {
    userAgent: 'Mozilla/4.0 (compatible; Beep Boop)',
    domains: {
      redirect: [ 'invidious.fdn.fr', 'invidious.snopyta.org', 'invidious.xyz', 'inv.riverside.rocks', 'vid.puffyan.us', 'y.com.cm' ],
      original:  [ 'youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com' ]
    }
  }
};
