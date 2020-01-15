require('dotenv').config();

const toBase64 = require('base64-arraybuffer');

const { 
    tweeting, 
    fetchTweet, 
    insert, 
    fetchLike, 
    select, 
    getBuffer, 
    uploadImage, 
    tweetingMedia,
    chunkedMedia, 
    downloadFile,
    follow,
    unfollow,
    update
} = require('./helpers/helpers.js');

// Hallo
const sayang = 'c_jessijkt48';

let like  = async () => {
    try {
        let likeList = await fetchLike(sayang);

        for (let i = 0; i < likeList.length; i++) {
            let data = await select('like', {
                tweet_id: likeList[i].id_str
            })
    
            if (!data.length) {
                await insert('like', {
                    tweet_id: likeList[i].id_str,
                    tweet_text: likeList[i].text,
                    screen_name: likeList[i].user.screen_name,
                    created_at: likeList[i].created_at
                });
    
                await tweeting(`(Like) https://twitter.com/${likeList[i].user.screen_name}/status/${likeList[i].id_str}`);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

let tweet = async () => {
    try {
        let tweetList = await fetchTweet(sayang);

        for (let i = 0; i < tweetList.length; i++) {

            if (tweetList[i].retweeted_status) {

                let data = await select('retweet', {
                    tweet_id: tweetList[i].id_str
                })

                if (!data.length) {
                    await insert('retweet', {
                        tweet_id: tweetList[i].id_str,
                        retweet_id: tweetList[i].user.id_str,
                        retweet_text: tweetList[i].user.text,
                        created_at: tweetList[i].created_at
                    });
        
                    await tweeting(`(Re-Tweet) https://twitter.com/${tweetList[i].user.screen_name}/status/${tweetList[i].id_str}`);
                }

            }

            else {

                let data = await select('tweet', {
                    tweet_id: tweetList[i].id_str
                })

                if (!data.length) {
                    if (tweetList[i].entities.media) {
                        let media = [];
            
                        for (let j = 0; j < tweetList[i].extended_entities.media.length; j++) {
                    
                            if (tweetList[i].extended_entities.media[j].type == 'photo') {
                                let buffer = await getBuffer(tweetList[i].extended_entities.media[j].media_url);
                    
                                let base64 = toBase64.encode(buffer);
                    
                                let imgId = await uploadImage(base64);
                                
                                media.push(imgId);
                            }
                    
                        }
            
                        let res = await tweetingMedia(`(${tweetList[i].in_reply_to_status_id_str ? 'Reply To' : 'Tweet'}) ${tweetList[i].text}`, media);
                        
                        await insert('tweet', {
                            tweet_id: tweetList[i].id_str,
                            tweet_text: tweetList[i].text,
                            is_reply: tweetList[i].in_reply_to_status_id_str ? true : false,
                            bot_tweet_id: res.id_str,
                            created_at: tweetList[i].created_at
                        });
                    }
            
                    else {
                        let res = await tweeting(`(${tweetList[i].in_reply_to_status_id_str ? 'Reply To' : 'Tweet'}) ${tweetList[i].text}`);
                        
                        await insert('tweet', {
                            tweet_id: tweetList[i].id_str,
                            tweet_text: tweetList[i].text,
                            is_reply: tweetList[i].in_reply_to_status_id_str ? true : false,
                            bot_tweet_id: res.id_str,
                            created_at: tweetList[i].created_at
                        });
                    }
                }

            }

        }
    } catch (err) {
        console.log(err)
    }
}

let following = async () => {
    try {
        let followingList = await follow(sayang);

        for (let i = 0; i < followingList.length; i++) {
            let data = await select('following', {
                user_id: followingList[i].id_str
            })
    
            if (!data.length) {
                await insert('following', {
                    user_id: followingList[i].id_str,
                    screen_name: followingList[i].screen_name,
                    unfollowed: false
                })
    
                await tweeting(`(Following) @${followingList[i].screen_name}`);
            }
    
            else if (data[0].unfollowed) {
                await update('following', {
                    user_id: followingList[i].id_str
                }, {
                    unfollowed: false
                });
    
                await tweeting(`(Following Lagi) @${followingList[i].screen_name}`);
            }
        }
    
        let followingDB = await unfollow();
    
        for (let j = 0; j < followingDB.length; j++) {
            let check = true;
    
            for (let k = 0; k < followingList.length; k++) {
    
                if (followingDB[j].user_id == followingList[k].id_str) {
                    check = false;
                }
    
            }
    
            if (check) {
                await update('following', {
                    user_id: followingDB[j].user_id
                }, {
                    unfollowed: true
                });
    
                await tweeting(`(Unfollowing) @${followingDB[j].screen_name}`);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

let main = async () => {
    console.log('====================================== START ======================================');

    console.log('running tweet...')
    await tweet();
    console.log('running following...')
    await following();

    console.log('====================================== END ======================================');
};

(async() => {
    await main();
    await like();
    
    setInterval(async () => {
        await main();
    }, 1000*60*1);
    
    setInterval(async () => {
        console.log('running like...')
        await like();
    }, 1000*20*1);
})();