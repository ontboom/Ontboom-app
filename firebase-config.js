// Firebase connection for the Ontboom web app
const firebaseConfig = {
  apiKey: "AIzaSyAIFOvwIKl55Xi_UXGF6EfSh5DitrXnNio",
  authDomain: "ontboom.firebaseapp.com",
  projectId: "ontboom",
  storageBucket: "ontboom.firebasestorage.app",
  messagingSenderId: "200930869002",
  appId: "1:200930869002:web:d4bf3f351ac1adf70204f3"
};

firebase.initializeApp(firebaseConfig);
window.ontboomFirebase = {
  app: firebase.app(),
  auth: firebase.auth(),
  db: firebase.firestore()
};
