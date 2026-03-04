import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Importamos el motor de archivos

const firebaseConfig = {
  apiKey: "AIzaSyAk_siIkT3cDnDWWFKUGXGw-A_92A-IBQE",
  authDomain: "cumple-aurora.firebaseapp.com",
  projectId: "cumple-aurora",
  storageBucket: "cumple-aurora.firebasestorage.app",
  messagingSenderId: "265905960800",
  appId: "1:265905960800:web:fecae9066280e0e4bb1005",
  measurementId: "G-33BCD60177"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos Storage y lo EXPORTAMOS para que la Cámara lo pueda usar
export const storage = getStorage(app);