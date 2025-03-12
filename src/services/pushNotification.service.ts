const firebase = require("firebase-admin");
// const serviceAccount = require("./fir-stoarage-sdk.json");
// const serviceAccount = require("../../cxonegoFirebase.json");

import * as dotenv from "dotenv";
import moment = require("moment");
dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_x509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_x509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
}

const messaging = firebase.messaging();
export async function sendMulticastNotifications(
  tokens: string[],
  subject: string,
  datetime: string,
  description: string
) {
  try {    
    if (tokens.length <= 500) {
      // Send notifications using sendMulticast for up to 500 tokens
      messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: "CX-One-Go Activity reminder",
          body: `${subject}\n${datetime}`,
        },
      });
    } else {
      const chunks = [];
      for (let i = 0; i < tokens.length; i += 500) {
        chunks.push(tokens.slice(i, i + 500));
      }
      for (const chunk of chunks) {
        await sendMulticastNotifications(chunk, subject, datetime, description);
      }
    }
  } catch (err) {
    console.error(
      "Error caught in catch block: ",
      JSON.stringify(err, null, 2)
    );
    console.error("Error code: ", err.code);
    console.error("Error message: ", err.message);
    console.error("Error stack: ", err.stack);
  }
}

export const sendExpiryNotification = async (
  tokens: string[],
  title: string,
  description: string
) => {
  // console.log("tokens : ", tokens);
  if (tokens.length === 0) {
    return;
  }
  await messaging.sendEachForMulticast({
    tokens,
    // Customize your notification message content here
    notification: {
      title: "CXOneGo",
      body: `${title}`,
    },
    data: {
      description: `${description}`,
    },
  });
  // console.log("Successfully sent notifications:", response.successCount);
  // console.log("Failed tokens:", response.failureCount);
  // console.log("response is : ",response);
};
