var appInstance = require("firebase-admin");
var serviceAccount = require("./shooterhub-c71a9-firebase-adminsdk-xwpos-0fd395b1f2");
appInstance.initializeApp({
  credential: appInstance.credential.cert(serviceAccount),
});
module.exports = { appInstance };
