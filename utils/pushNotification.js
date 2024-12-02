// const fcm=require('fcm-node');
// require('dotenv').config();
// const SERVER_KEY=process.env.SERVER_KEY;
// const FCM=new fcm(SERVER_KEY);
const axios = require("axios");

const { GoogleAuth } = require("google-auth-library");

const getAccessToken = async () => {
  const auth = new GoogleAuth({
    keyFile: "./ginge-77d8e-firebase-adminsdk-fjkcw-3b225c2d10.json",
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
};

const FCM_API_URL =
  "https://fcm.googleapis.com/v1/projects/ginge-77d8e/messages:send"; // Replace YOUR_PROJECT_ID

const sendNotification = async (notificationObj) => {
  try {
    // Get OAuth 2.0 access token
    const accessToken = await getAccessToken();
    // Define the notification message
    const message = {
      message: {
        token: notificationObj.deviceToken,
        notification: {
          title: notificationObj.title,
          body: notificationObj.body,
        },
      },
    };

    // await FCM.send(message,(err,res)=>{
    // if(err){
    //   console.log(err,'SomeThing Went Wrong');

    // }else{
    //     console.log(res,'Notification Sent');
    // }
    // });

    // Send the notification request
    const response = await axios.post(FCM_API_URL, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Notification Sent:", response.data);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = sendNotification;
