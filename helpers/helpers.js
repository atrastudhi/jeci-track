const Twit = require('twit');
const axios = require('axios');
const knex = require('knex')(require('../config/knex.js'));
const fs = require('fs');

let T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_SECRET
});

module.exports = {

    tweeting: (tweet) => {
        return new Promise((resolve, reject) => {
            T.post('statuses/update', { status: tweet }, (err, data, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    },

    fetchTweet: (user) => {
        return new Promise((resolve, reject) => {
            T.get('statuses/user_timeline', { screen_name: user, count: 50 }, function(err, data, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                };
            });
        });
    },

    fetchLike: (user) => {
        return new Promise((resolve, reject) => {
            T.get('favorites/list', { screen_name: user, count: 5 }, function(err, data, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                };
            });
        });
    },

    insert: async (table, data) => {
        try {
            await knex(table).insert(data);
            console.log(`inserted table ${JSON.stringify(data)}`);
        } catch (err) {
            console.log(err);
        }
    },

    select: async (table, condition) => {
        try {
            let data = await knex(table).where(condition).select();

            return data;
        } catch (err) {
            console.log(err);
        }
    },

    getBuffer: async (link) => {
        try {
            let { data } = await axios.get(link, {
                responseType: 'arraybuffer'
            })

            return data
        } catch (err) {
            console.log(err);
        }
    },

    uploadImage: (base64) => {
        return new Promise((resolve, reject) => {
            T.post('media/upload', { media_data: base64 }, (err, data, response) => {
                if (err) return reject(err)
                else return resolve(data.media_id_string)
            })
        })
    },

    tweetingMedia: (tweet, ids) => {
        return new Promise((resolve, reject) => {
            T.post('statuses/update', { status: tweet, media_ids: ids }, (err, data, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    },

    chunkedMedia: (path) => {
        return new Promise((resolve, reject) => {
          T.postMediaChunked({ file_path: path }, function (err, data, response) {
            if (err) reject(err)
            else {
              setTimeout(async () => {
                resolve(data.media_id_string)
              }, 30000)
            }
          })
        })
    },

    downloadFile: async (url) => {  
        const writer = fs.createWriteStream('./vid/video.mp4')
      
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
        });
      
        response.data.pipe(writer);
      
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        });
    },

    follow: async (user) => {
        return new Promise((resolve, reject) => {
            T.get('friends/list', { screen_name: user, count: 200 }, function(err, data, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.users);
                };
            });
        });
    },

    unfollow: async () => {
        return await knex('following').select();
    },

    update: async (table, condition, data) => {
        await knex(table).where(condition).update(data);
        console.log(`updated ${JSON.stringify(condition)}`)
    }

}