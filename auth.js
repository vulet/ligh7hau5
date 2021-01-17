const sdk = require('matrix-js-sdk');
const axios = require('axios');
const fs = require('fs');
const registrar = require('./registrar.js');

module.exports.getMatrixToken = async () => {
  matrixClient = sdk.createClient(registrar.config.matrix.domain);
  matrixClient.loginWithPassword(registrar.config.matrix.user, registrar.config.matrix.password)
    .then((response) => {
      fs.writeFileSync('matrix_auth.json', JSON.stringify(response, null, 2));
      matrixClient.startClient();
    });
};

module.exports.matrixTokenLogin = async () => {
  matrixClient = sdk.createClient({
    baseUrl: registrar.config.matrix.domain,
    accessToken: registrar.matrix_auth.access_token,
    userId: registrar.matrix_auth.user_id,
    timelineSupport: true,
  });
  matrixClient.startClient();
};

module.exports.registerFediverseApp = async () => {
  axios.post(`${registrar.config.fediverse.domain}/api/v1/apps`,
    {
      client_name: registrar.config.fediverse.client_name,
      redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: 'read write follow push',
    })
    .then((response) => {
      axios.post(`${registrar.config.fediverse.domain}/oauth/token`,
        {
          username: registrar.config.fediverse.username,
          password: registrar.config.fediverse.password,
          client_id: response.data.client_id,
          client_secret: response.data.client_secret,
          scope: 'read write follow push',
          grant_type: 'password',
          redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        })
        .then((tokens) => {
          fs.writeFileSync('fediverse_auth.json', JSON.stringify(tokens.data, null, 2));
        })
        .catch((e) => {
          console.log(e);
        });
    }).catch((e) => {
      console.log(e);
    });
};
