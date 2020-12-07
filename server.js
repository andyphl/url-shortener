const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const URL = require('./models/Urls')

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());


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

  URL.findOne({ _id: hashId }, (err, doc) => {
    if(doc) {
      res.redirect(doc.originUrl);
    }
    else {
      res.redirect('http://localhost:3000/');
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