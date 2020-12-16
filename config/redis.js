const asyncRedisClient = require('async-redis').createClient;
const redis = asyncRedisClient(6379, 'localhost');

module.exports = redis;