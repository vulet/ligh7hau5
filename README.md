# Plemara   
Plemara acts as a [Matrix](https://matrix.org/docs/spec/) bridge to the Fediverse. This application should allow you to do most actions on the Fediverse including livefeed, posting, subscribing, etc. via Matrix. Configuration for the app can be found in [config.js](https://github.com/vulet/plemara/blob/master/config.js). You will need to provide a Matrix username and password for the bridge to work, this can be done through an account made on @matrix.org, or your own homeserver. For the Fediverse side, you will need an access_token, this can be created through the CURL steps below. You would replace `fediverse.site` with where you would like to run the bridge from.

# Installation
1. `git clone https://github.com/vulet/plemara`
2. `cd plemara && yarn install`
3. `node main.js`
# Generating an access_token
1. `curl -X POST -d "client_name=<NAME HERE>&redirect_uris=urn:ietf:wg:oauth:2.0:oob&scopes=write follow read&website=http://fediverse.site" https://fediverse.site/api/v1/apps`

Result:
```json
{"client_id":"result",
"client_secret":"result",
"id":"result",
"name":"result",
"redirect_uri":"urn:ietf:wg:oauth:2.0:oob",
"website":"http://fediverse.site",
"vapid_key":"vapid_key"}
```

2. `curl -X POST -d "client_id=sekret&client_secret=sekret&scope=write follow read&grant_type=password&username=sekret@email.com&password=sekret" https://fediverse.site/oauth/token`

Result:
```json
{"token_type":"Bearer",
"scope":"write read",
"me":"https://fediverse.site/users/<your username>",
"access_token":"result"}
```

The access_token from the above command is then stored in the [config.js](https://github.com/vulet/plemara/blob/master/config.js) file.
# Images 
![Bridge](https://civseed.com/_matrix/media/v1/download/civseed.com/wwLEtYGUUfYanovmSSAxdTJI)