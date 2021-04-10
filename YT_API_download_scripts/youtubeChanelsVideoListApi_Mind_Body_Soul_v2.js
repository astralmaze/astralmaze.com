require('dotenv').config();
const https = require('https');
const fs = require('fs');

const {Pool} = require('pg');

// var jsn = require("./YTvideosChanelsListItems.json");
//jsn = JSON.parse(jsn);

//console.log(jsn);



const axios = require('axios');

global.ACCESS_TOKEN=process.env.API_KEY;
global.PUBLIC_PATH=process.env.PUBLIC_PATH;



const pool= new Pool({
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASS,
            host: process.env.DB_HOST
})
pool.query('SELECT NOW()', (err,res) => {
    console.log(err,res);
})

console.log(process.env.DB_USER);

var ChannelId = "UCn9sZkMMcSgcoKW-phDYZsQ";
var ChannelName ="mindbodysoul";
// var interviewed= process.argv.slice(3);



var jsn=[];
var video_Object={};
var nextPageToken="";
YT_multiple_calls();

async function YT_multiple_calls(){

                            
                            await axios.get('https://www.googleapis.com/youtube/v3/search?order=date&maxResults=100&part=snippet,id&channelId='+ChannelId+'&key=' + global.ACCESS_TOKEN).then(response => {
                                console.log('> main response:', JSON.stringify(response.data));

                                if (typeof response.data.nextPageToken !== 'undefined' && response.data.nextPageToken ) {
                                  nextPageToken=response.data.nextPageToken;
                                  console.log('> nextPageToken:', nextPageToken);
                                } else { nextPageToken=""; }



                                console.log('> response:', response.data.items);

                              response.data.items.map(async (itemMap, index) => {

                                                                               if (itemMap.id.kind==="youtube#video") {
                                                                                 var title=itemMap.snippet.title;
                                                                                 var videoId=itemMap.id.videoId;
                                                                                 console.log(title);
                                                                                 console.log(videoId);
                                                                                 video_Object ={
                                                                                             "videoId": videoId,
                                                                                             "title" : title,
                                                                                             "index": index
                                                                                               };
                                                                                var data=[videoId];
                                                                                const postgresRes= await pool.query(' select exists(select 1 from public.channels where videoid=$1);', data);
                                                                                console.log(postgresRes.rows[0].exists);
                                                                                if (!postgresRes.rows[0].exists) { getYTVideo(videoId,ChannelId,ChannelName) }





                                                                                 // jsn.push(video_Object);


                                                                               }


                                                } );


                              }).catch(error => {
                                console.log(error);
                            });

                    while (nextPageToken!=="") {

                      await axios.get('https://www.googleapis.com/youtube/v3/search?pageToken='+ nextPageToken +'&order=date&maxResults=100&part=snippet,id&channelId='+ChannelId+'&key=' + ACCESS_TOKEN).then(response => {
                          //console.log('> response:', JSON.stringify(response.data.items));

                          if (typeof response.data.nextPageToken !== 'undefined' && response.data.nextPageToken ) {
                            nextPageToken=response.data.nextPageToken;
                            console.log('> nextPageToken:', nextPageToken);
                          } else { nextPageToken=""; }



                          console.log('> response:', response.data.items);

                        response.data.items.map(async (itemMap, index) => {

                                                                         if (itemMap.id.kind==="youtube#video") {
                                                                           var title=itemMap.snippet.title;
                                                                           var videoId=itemMap.id.videoId;
                                                                           console.log(title);
                                                                           console.log(videoId);
                                                                           video_Object ={
                                                                                       "videoId": videoId,
                                                                                       "title" : title,
                                                                                       "index": index
                                                                                         };
                                                                                         var data=[videoId];
                                                                                         const postgresRes= await pool.query(' select exists(select 1 from public.channels where videoid=$1);', data);
                                                                                         console.log(postgresRes.rows[0].exists);
                                                                                         if (!postgresRes.rows[0].exists) { getYTVideo(videoId,ChannelId,ChannelName) }


                                                                         }


                                          } );


                        }).catch(error => {
                          console.log(error);
                      });



              }

/*      fs.writeFile('./YTvideosChanelsListItems_Astral_Club.json', JSON.stringify(jsn), function (err) {
      if (err) return console.log(err);
      console.log('Hello World > helloworld.txt');
      });
*/

}



// GET https://www.googleapis.com/youtube/v3/channels?part=snippet&id=UCpVk_OmMmRs0RnmOQTHXyrA&key=[YOUR_API_KEY] HTTP/1.1



axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&id='+ChannelId+'&key=' + global.ACCESS_TOKEN).then(response => {
    //console.log('> response:', JSON.stringify(response.data.items));
    console.log('> response:', response.data.items);
    console.log('> tag:',  JSON.stringify(response.data.items[0].snippet.localized));

    var thumbnail=response.data.items[0].snippet.thumbnails.default.url;



const file = fs.createWriteStream(global.PUBLIC_PATH+"/thumb/channels-logos/"+ChannelId+".jpg");
const request = https.get(thumbnail, function(response) {
  response.pipe(file);
});

}).catch(error => {
    console.log(error);
});





async function getYTVideo(videoId, ChannelId, ChannelName){

                      var video_Object={};

                      
                  await    axios.get('https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+videoId+'&key=' + global.ACCESS_TOKEN).then( async function foo(response) {
                          //console.log('> response:', JSON.stringify(response.data.items));
                          console.log('> response:', response.data.items);
                          console.log('> tag:',  JSON.stringify(response.data.items[0].snippet.localized));
                          var title=response.data.items[0].snippet.title;
                          var description=response.data.items[0].snippet.description;
                          var publishedDate= response.data.items[0].snippet.publishedAt;
                          //var publishedDate=publishedAt.substring(0, 9);
                          var thumbnail=response.data.items[0].snippet.thumbnails.medium.url;
                          var channelTitle = response.data.items[0].snippet.channelTitle;
                          var tags= response.data.items[0].snippet.tags;
                          console.log(title);
                          console.log(description);
                          console.log(publishedDate);
                          console.log(thumbnail);

                          video_Object ={
                                      "videoId": videoId,
                                      "defaultAudioLanguage": "en",
                                      "title" : title,
                                      "publishedDate" : publishedDate,
                                      "channelTitle" : channelTitle,
                                      "tags" : tags,
                                      "myComments_en": "",
                                      "myComments_fr": "",
                                      "description" : description

                                    };

                                      var data=[videoId,"en",title,publishedDate,channelTitle,tags,"","",description,"true",ChannelId,ChannelName];
                        const postgresRes= await pool.query('INSERT INTO channels ("videoid","defaultAudioLanguage","title","publishedDate","channelTitle","tags","myComments_en","myComments_fr","description","includedinjson","channelId","channelname") Values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', data);
                      //console.log('> response:',  JSON.stringify(video_Object));

                    //  jsnOutput.push(video_Object);



                      const file =  fs.createWriteStream(global.PUBLIC_PATH+"/thumb/topics/"+videoId+".jpg");
                         const request =  https.get(thumbnail, async function(response) {
                        response.pipe(file);

                    /*  await  fs.writeFile('./src/YTvideosChanels_Astral_Club.json', JSON.stringify(jsnOutput), function (err) {
                        if (err) return console.log(err);
                        console.log('Hello World > helloworld.txt');
                        return;
                      }); */

                      });

                      }).catch(error => {
                          console.log(error);
                      });

}
