import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCcZG2x0pTYk5LEb6V9NA9FupqBWBm1z60',
  authDomain: 'shanghai-rummy-3cb96.firebaseapp.com',
  projectId: 'shanghai-rummy-3cb96',
  storageBucket: 'shanghai-rummy-3cb96.firebasestorage.app',
  messagingSenderId: '240674124728',
  appId: '1:240674124728:web:d8463af363fe82b1fc554d',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
