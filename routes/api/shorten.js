const express = require('express');
const router = express.Router();
const uniqid = require('uniqid');
const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost');

const URL = require('../../models/Urls');


// @route GET /api/shorten/test
// @desc Test shorten api end point connection
// @access Public
router.get('/test', (req, res) => {
  res.json({
    message: 'Api is working 🤩.'
  });
});


// @route POST /api/shorten
// @desc Post a URL to get shorten URL
// @access Public 
router.post('/', (req, res) => {
  const { originUrl } = req.body;

  URL.findOne({originUrl: originUrl}, (err, doc) => {
    if(doc) {
      console.log('URL found in DB 🤩.');

      res.send({
        originUrl: doc.originUrl,
        hashUrl: doc._id,
        status: 200,
        statusTxt: 'OK'
      });
    }
    else {
      console.log('This is a new URL 🤩.');

      const hashId = uniqid()
      const urlHashed = new URL({
        _id: hashId,
        originUrl: originUrl,
      })
      
      urlHashed.save((err) => {
        if(err) {
          return console.error(err);
        }
        else {
          console.log('URL saved in MongoDB 🤩.');
          redis.set(urlHashed._id, originUrl, (err, res) => {
            if(err) { console.log(err); }
            else {
              console.log('URL cached in Redis 🤩.');
            }
          });
          res.send({
            originUrl: originUrl,
            hashUrl: urlHashed._id,
            status: 200,
            statusTxt: 'OK'
          })
        }
      });
    }
  });
});

module.exports = router;