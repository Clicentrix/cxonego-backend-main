import * as admin from "firebase-admin";
import { join } from "path";
import * as fetch from "node-fetch";
// const firbaseKeyJson = join(__dirname, "../../firebaseCloudMessaging.json");
// const serviceAccount = require(firbaseKeyJson);

// Initialize Firebase Admin SDK if not already initialized

export const sendNotificationtoCustomer = (
  title: string,
  message: string,
  fcm: string,
): Promise<number> => {
  const notification = {
    title: title,
    text: message,
  };
  const fcmToken: Array<string> = [];
  fcmToken.push(fcm);
  const notification_body = {
    notification: notification,
    registration_ids: fcmToken,
  };
  return new Promise<number>((resolve, reject) => {
    fetch("https://fcm.googleapis.com/fcm/send", {
      method: "post",
      headers: {
        Authorization:
          "key" +
          "BAhh0zTv6mc713gP_0EFqyVwM0m_8BrIWpG3lyYDPb9VnR3gwjGdQY8tXIytHMkMdlXnTwCZgGQFP7JQmOCM-WQ",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification_body),
    })
      .then((data) => resolve(data.status as number))
      .catch((error) => reject(error.status as number));
  });
};
