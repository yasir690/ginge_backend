// const {Redis} = require("ioredis");
// // const client = new Redis("redis-18433.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com:18433");
// const client = new Redis({
//     port: 6379,
//     host: '127.0.0.1',
//     // username: "default", // needs Redis >= 6
//     // password: "xuSTcQPLvQPkFsUCRTbwy7aHiXl3sKk1",
//     // db: 0, // Defaults to 0
//   });
// module.exports = client;

const { Redis } = require("ioredis");

let reconnectAttempts = 0;
const maxReconnectAttempts = 3;

const client = new Redis({
    port: 6379,
    host: '127.0.0.1',
    db: 0,
    reconnectOnError: (err) => {
        console.error("Reconnect on error:", err);
        // Trigger reconnection only if attempts are below the limit
        return reconnectAttempts < maxReconnectAttempts;
    }
});

// Handle connection errors
client.on("error", (err) => {
    console.error("Redis connection error:", err);
    // Disconnect if reconnection attempts reach the limit
    if (reconnectAttempts >= maxReconnectAttempts) {
        console.log("Max reconnection attempts reached. Disconnecting...");
        client.disconnect();
    }
});

// Handle successful connection and reset attempts counter
client.on("connect", () => {
    console.log("Connected to Redis successfully!");
    reconnectAttempts = 0; // Reset attempts on successful connection
});

// Increment attempt counter and log on reconnection attempt
client.on("reconnecting", (delay) => {
    reconnectAttempts++;
    console.log(`Reconnecting to Redis... Attempt ${reconnectAttempts} of ${maxReconnectAttempts}`);
    // If attempts exceed max, disconnect
    if (reconnectAttempts >= maxReconnectAttempts) {
        console.log("Max reconnection attempts exceeded. Disconnecting...");
        client.disconnect();
    }
});

// Handle disconnection
client.on("end", () => {
    console.log("Disconnected from Redis.");
});

module.exports = client;