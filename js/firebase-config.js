// Configuração do Firebase
// Substitua os valores abaixo pelos dados do seu projeto Firebase
// (Console Firebase > Configurações do projeto > Seus apps > Configuração do SDK)
const firebaseConfig = {
  apiKey: "AIzaSyBz2BwlZm6r6zWwtgJXojA4y7LcKFT4QUw",
  authDomain: "painel-central-creator.firebaseapp.com",
  projectId: "painel-central-creator",
  storageBucket: "painel-central-creator.firebasestorage.app",
  messagingSenderId: "419602787902",
  appId: "1:419602787902:web:aa9d565822f1bc09436b6f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
