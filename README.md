# ligh7hau5

The ligh7hau5 project is used on the Matrix protocol to communicate with the Fediverse. It is also used to proxy popular media networks(Twitter, YouTube, etc) to alternative front ends(Nitter, Invidious, etc). This repository can be ran locally, as on a RPi, or on a VPS.
# Archive (+archive URL)

This command will send a given URL to archive.is, and return an archive.is URL. This can be beneficial in two ways. One, archive.is receives your traffic instead of the URL that you wish to archive. Two, you are creating a historical context of a given URL with a dated attribute. Additionally, if there are changes that have occurred on a page, since the time of last archive, you can also use the rearchive(+rearchive URL) command. If you wish to use a different archiver, this can be configured, see the config.example.js file.
# Social Media (+proxy URL)

This command is given a Twitter or YouTube post, and then returned a respective Nitter/Invidious URL. Additionally, some data is returned about what the URL is, such as: title, description, etc. Instances can also be configured like in the above, see the config.example.js file.
# Fediverse

The ligh7hau5 works as a lite client for the Fediverse. It was built to communicate with a Pleroma instance, but it most likely works on Mastodon as well. Assuming you already have a registered account in regards to the bot, just change the config.js file and fediverse_auth.json will fill out once the bot starts.

Commands for the Fediverse include:

`+flood : turn on timeline in channel`

`+notify : show notifications in channel`

`+post <your message> : post`

`+reply <post id> <message> : reply to message`

`+media <URL> <optional message> : post media`

`+redact <post id> : delete post`

`+follow <user id> : follow`

`+unfollow <user id> : unfollow`

`+copy <post id> : repeat/repost/retweet`

`+clap <post id> : favorite`

`+boo <post id> : unfavorite`

# Installation

First, set up your config.js file, you can see config.example.js as an example. The Matrix & Fediverse login information is then used to populate keys/matrix_auth and keys/fediverse_auth during your initial login. These tokens are then used on sequential logins.

1. `git clone https://github.com/vulet/ligh7hau5`
2. `cd ligh7hau5 && yarn install`
3. `node main.js`

# Contributors
CryptoMooners
