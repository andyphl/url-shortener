const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost');

module.exports = redis;