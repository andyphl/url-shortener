const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost');
const cors = require('cors');

const URL = require('./models/Urls')

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// Redis connection
redis.on('error', (err) => console.log(err));


// MongoDB connection
const db = require('./config/keys').mongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected 🤩.'))
  .catch((err) => console.log(err));

// Routes
const shorten = require('./routes/api/shorten');
app.use('/api/shorten', shorten);

// Redirect
app.get('/:hash', (req, res) => {
  const hashId = req.params.hash;
  
  redis.get(hashId, (err, reply) => {
    if(reply) {
      console.log('URL found in Redis 🤩.')
      res.redirect(reply);
    }
    else {
      if(err) {
        console.log(err);
      }
      // Both not found and error lead to mongoDB search.
      URL.findOne({ _id: hashId }, (err, doc) => {
        if(doc) {
          res.redirect(doc.originUrl);
          // Expire after a mounth
          redis.set(hashId, doc.originUrl, 'EX', 60 * 60 * 24 * 30 , (err, res) => {
            if(err) { console.log(err); }
            else {
              console.log('URL cached in Redis 🤩.');
            }
          });
        }
        else {
          res.redirect('http://localhost:3000/');
        }
      });
    }
  });
})

// Path
app.get('/', (req, res) => {
  res.send('Hello world');
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port} 🤩.`);
});