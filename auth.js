const { LocalStorageCryptoStore } = require('matrix-js-sdk/lib/crypto/store/localStorage-crypto-store');

const matrixTokenLogin = async () => {
  matrixClient = sdk.createClient({
    baseUrl: config.matrix.domain,
    accessToken: matrix.auth.access_token,
    userId: matrix.auth.user_id,
    deviceId: matrix.auth.device_id,
    cryptoStore: new LocalStorageCryptoStore(localStorage),
  });
  matrixClient.initCrypto()
    .then(() => {
      if (!localStorage.getItem('crypto.device_data')) {
        return console.log(
          '====================================================\n'
          + 'New OLM Encryption Keys created, please restart ligh7hau5.\n'
          + '====================================================',
        );
      }
      matrixClient.setGlobalErrorOnUnknownDevices(config.matrix.manualVerify);
      matrixClient.startClient();
    });
};

module.exports.matrixTokenLogin = matrixTokenLogin;

module.exports.getMatrixToken = async () => {
  matrixClient = sdk.createClient({ baseUrl: config.matrix.domain });
  matrixClient.loginWithPassword(config.matrix.user, config.matrix.password)
    .then((response) => {
      matrix.auth = {
        user_id: response.user_id,
        access_token: response.access_token,
        device_id: response.device_id,
      };
      localStorage.setItem('matrix_auth', JSON.stringify(response, null, 2));
    }).then(() => matrixTokenLogin())
    .catch((e) => {
      console.log(e);
    });
};

module.exports.registerFediverseApp = async () => {
  axios.post(`${config.fediverse.domain}/api/v1/apps`,
    {
      client_name: config.fediverse.client_name,
      redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
      scopes: 'read write follow push',
    })
    .then((response) => {
      axios.post(`${config.fediverse.domain}/oauth/token`,
        {
          username: config.fediverse.username,
          password: config.fediverse.password,
          client_id: response.data.client_id,
          client_secret: response.data.client_secret,
          scope: 'read write follow push',
          grant_type: 'password',
          redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        })
        .then((tokens) => {
          localStorage.setItem('fediverse_auth', JSON.stringify(tokens.data, null, 2));
        })
        .catch((e) => {
          console.log(e);
        });
    }).catch((e) => {
      console.log(e);
    });
};
