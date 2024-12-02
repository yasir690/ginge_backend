const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const rootRouter = require("./routes/index");
const globalErrorMiddleware = require("./middleware/globalMiddleware");
const app = express();
const reqresinspector = require("express-req-res-inspector");
// const { createClient } = require('redis');
// const redis = require('redis');

const port = process.env.PORT;
const API_PRIFEX = process.env.API_PRIFEX;
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(reqresinspector());
app.use(API_PRIFEX, rootRouter);
app.use(globalErrorMiddleware);

// // Configure Redis client
// const redisClient = redis.createClient({
//   socket: {
//     host: '127.0.0.1',
//     port: 6379,
//   },
// });

// // Error handling
// redisClient.on('error', (err) => {
//   console.log('Error occurred while connecting or accessing Redis server:', err);
// });

// (async () => {
//   try {
//     // Connect to Redis
//     await redisClient.connect();

//     // Check if the key exists
//     const existingValue = await redisClient.get('customer_name');

//     if (!existingValue) {
//       // Set a new key if it doesn't exist
//       await redisClient.set('customer_name', 'John Doe');
//       console.log('Writing Property: customer_name');
//     } else {
//       console.log(`Reading property: customer_name - ${existingValue}`);
//     }

//     // Optional: Close the Redis client after operations
//     await redisClient.quit();
//   } catch (error) {
//     console.error('Redis operation error:', error);
//   }
// })();


app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
