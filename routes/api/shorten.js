const express = require('express');
const router = express.Router();
const md5 = require('md5');
const redis = require('../../config/redis');

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
router.post('/', async (req, res) => {
  const { originUrl } = req.body;
  let hashId = md5(originUrl).slice(0, 8);
  
  try {
    const findDoc = await URL.findOne({hashId: hashId}).exec();

    if(findDoc) {
      res.status(200).send({
        originUrl: findDoc.originUrl,
        hashUrl: findDoc.hashId
      });
    }
    else {
      console.log('This is a new URL 🤔.');

      // TODO: When hashId is overlaping?
      
      const urlHashed = new URL({
        hashId: hashId,
        originUrl: originUrl,
      });

      const saveDoc = await urlHashed.save();

      if(saveDoc) { console.log('Saved in MongoDB 😎.'); }
      else { console.log('Not saved in MongoDB 🤭.') }
      const redisSaveDoc = await redis.set(
        urlHashed.hashId, 
        originUrl, 
        'EX', 60 * 60 * 24 * 30
      ); 

      if(redisSaveDoc) { console.log('Cached in Redis 😎.') }
      else { console.log('Not cached in Redis 🤭.') }

      res.status(200).send({
        originUrl: originUrl,
        hashUrl: urlHashed.hashId
      })
    }
  }
  catch(err) { console.log(err); }
});

module.exports = router;