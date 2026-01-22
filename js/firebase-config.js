/**
 * FIREBASE CONFIGURATION
 * Jóvenes Fuente de Luz - Formulario de Registro
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnhKEtOo8wLxS8vV5nU5rgIF28Pzt2D-E",
    authDomain: "fuente-de-luz-form.firebaseapp.com",
    projectId: "fuente-de-luz-form",
    storageBucket: "fuente-de-luz-form.firebasestorage.app",
    messagingSenderId: "107726009922",
    appId: "1:107726009922:web:cc2f9565386727df34dfdb",
    measurementId: "G-70PCB8BXLW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();

console.log('🔥 Firebase initialized successfully');
