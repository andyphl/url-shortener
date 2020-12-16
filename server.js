const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const redis = require('./config/redis');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const URL = require('./models/Urls')

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, './client/build')))

// Redis connection
redis.on('error', (err) => console.log(err));


// MongoDB connection
const db = require('./config/keys').mongoURI;
mongoose.connect(db, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('MongoDB connected 🤩.'))
.catch((err) => console.log(err));

// Routes
const shorten = require('./routes/api/shorten');
app.use('/api/shorten', shorten);

// Redirect
app.get('/:hash', async (req, res) => {
  const hashId = req.params.hash;
  
  try {
    const redisGetCache = await redis.get(hashId);

    if(redisGetCache) {
      console.log('URL found in Redis 🤩.')
      res.redirect(redisGetCache);
    }
    else {
      const getDoc = await URL.findOne({hashId: hashId});

      if(getDoc) {
        console.log('URL found in MongoDB 🤩.')
        res.redirect(getDoc.originUrl);
        // Expire after a mounth
        const redisSaveCache = await redis.set(
          hashId, 
          getDoc.originUrl, 
        )
        
        if(redisSaveCache) { console.log('Cached in Redis 😎.'); }
        else { console.log('Not cached in Redis 🤭.'); }
      }
      else {
        res.redirect('http://localhost:3000/');
      }
    }
  }
  catch(error) {
    console.log(error);
  }
})

// Path
app.get('/', (req, res) => {
  res.send('Hello world');
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port} 🤩.`);
});

process.on('SIGTERM',() => {
  server.close(() => {
    console.log('Closed out remaining connections👋. ');
  });

  setTimeout(() => {
    console.error("Force shut down.");
    process.exit(1); 
  }, 30*1000);
});