import * as firebase from "firebase/app";
import "firebase/messaging";

const config = {
    messagingSenderId: process.env.REACT_APP_MESSAGING_ID,
    projectId: process.env.REACT_APP_PROJECT_ID,
    apiKey: process.env.REACT_APP_API_KEY,
    appId: process.env.REACT_APP_APP_ID
};

firebase.initializeApp(config);

let messaging;

// we need to check if messaging is supported by the browser
messaging = firebase.messaging();

export { messaging };
