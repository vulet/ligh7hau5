global.Olm = require('olm');
global.sdk = require('matrix-js-sdk');
global.axios = require('axios');
global.config = require('./config.js');
global.auth = require('./auth.js');

const { LocalStorage } = require('node-localstorage');
global.localStorage = new LocalStorage('./keys');
if (!localStorage.getItem('matrix_auth')) {
  localStorage.clear();
  localStorage.setItem('matrix_auth', '[]');
}
if (!localStorage.getItem('fediverse_auth')) localStorage.setItem('fediverse_auth', '[]');
if (!localStorage.getItem('timeline')) localStorage.setItem('timeline', '[]');
if (!localStorage.getItem('notifications')) localStorage.setItem('notifications', '[]');


global.fediverse = {
  auth: JSON.parse(localStorage.getItem('fediverse_auth')),
  utils: require('./commands/fediverse/utils.js'),
};
global.matrix = {
  auth: JSON.parse(localStorage.getItem('matrix_auth')),
  utils: require('./utils.js'),
};

module.exports = {
  config: require('./config.js'),
  archive: require('./commands/archive.js'),
  invidious: require('./commands/invidious.js'),
  nitter: require('./commands/nitter.js'),
  beg: require('./commands/fediverse/beg.js'),
  boo: require('./commands/fediverse/boo.js'),
  clap: require('./commands/fediverse/clap.js'),
  copy: require('./commands/fediverse/copy.js'),
  flood: require('./commands/fediverse/flood.js'),
  follow: require('./commands/fediverse/follow.js'),
  help: require('./commands/help.js'),
  makeitrain: require('./commands/fediverse/makeitrain.js'),
  mordy: require('./commands/fediverse/mordy.js'),
  notify: require('./commands/fediverse/notify.js'),
  pin: require('./commands/fediverse/pin.js'),
  post: require('./commands/fediverse/post.js'),
  redact: require('./commands/fediverse/redact.js'),
  status: require('./commands/fediverse/status.js'),
  tip: require('./commands/fediverse/tip.js'),
  unfollow: require('./commands/fediverse/unfollow.js'),
  unpin: require('./commands/fediverse/unpin.js'),
  unreblog: require('./commands/fediverse/unreblog.js')
};
