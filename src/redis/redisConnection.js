const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    14820,
    "redis-14820.c274.us-east-1-3.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("K6ZPFXVfQ9lVouHNthcGLFqsPl5Zq2MY", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


module.exports = { SET_ASYNC, GET_ASYNC };