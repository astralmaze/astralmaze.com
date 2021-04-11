require('dotenv').config();
const https = require('https');
const fs = require('fs');

const {Pool} = require('pg');

//var jsnInput = require("./YTvideosChanelsListItems_Brian.json");

//var jsnOutput = require("./src/YTvideosChanels_Astral_Club_v2.json");
//jsn = JSON.parse(jsn);

//console.log(jsn);



const axios = require('axios');

// var channelName="jonwesley";

//var videoId = process.argv.slice(2);
// var interviewed= process.argv.slice(3);

console.log('starting');

const pool= new Pool({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST
})
pool.query('SELECT NOW()', (err,res) => {
    console.log(err,res);
})




var channels_list=['thegerusoproject','astralclub','nickdutch','astralprojectiontv','consciousnessawake','windofthesoul','drterencepalmer','toddacamesis','nancitrivellato','misswee','realityhackerz','outofbody','quantumkimmy','luciddreamtricks','miscellaneous','florentinastralprojection','mindbodysoul'];

channels_list.map(channelName => { toto(channelName); });

//toto();

async function toto(channelName) {

  try {
            var data=['true',channelName];
            const postgresRes= await  pool.query('SELECT * FROM public.channels WHERE includedinjson = $1 AND channelname=$2 ORDER BY "publishedDate" DESC;', data);
        console.log(postgresRes.rows);

        await  fs.writeFile('../src/YTvideosChannels_'+channelName+'.json', JSON.stringify(postgresRes.rows), function (err) {
          if (err) return console.log(err);
          console.log('Hello World > helloworld.txt');
          return;
        });



        }
        catch (e)
        {
          console.log(e);
        }
}

