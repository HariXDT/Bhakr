// app.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, get, push, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Replace with your Firebase configuration
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdNfFMtD6ZzLhGnM1dS2dcSp5cSs48Zko",
  authDomain: "counter-af2ec.firebaseapp.com",
  databaseURL: "https://counter-af2ec-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "counter-af2ec",
  storageBucket: "counter-af2ec.firebasestorage.app",
  messagingSenderId: "65958989193",
  appId: "1:65958989193:web:1d21e12c1843326bede558",
  measurementId: "G-0L44XCFK5F"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase();
const dataRef1 = ref(database, 'daily_counter/current/count');
const totalCountRef = ref(database, 'daily_counter/current/total');
const monthlyGrossRef = ref(database, 'daily_counter/current/monthlyGross');
const lastUpdatedRef = ref(database, 'daily_counter/current/lastUpdated');

onValue(dataRef1, (snapshot) => {
    const humi = snapshot.val();
    document.getElementById('counter-value').innerHTML = humi;
});


onValue(dataRef1, (snapshot) => {
    const humi1 = snapshot.val();

    // Show original value (optional)
    document.getElementById('counter-value').innerHTML = humi1;

    // Multiply by 15
    const multipliedValue = humi1 * 15;

    // Display multiplied value in the element with id="currentDate"
    document.getElementById('Income-value').innerHTML = multipliedValue;
});

let totalCount = 0;
let monthlyGross = 0;

onValue(dataRef1, (snapshot) => {
    const count = snapshot.val();

    // Display current count
    document.getElementById('counter-value').innerHTML = count;

    // Multiply by 15 for income
    const income = count * 15;
    document.getElementById('Income-value').innerHTML = income + '₹';

    // Update totals
    totalCount += count;
    monthlyGross += income;

    // Display total count and monthly gross
    document.getElementById('Tincome').innerHTML = totalCount;
    document.getElementById('GCrpss').innerHTML = monthlyGross + '₹';

    // Save to Firebase
    set(totalCountRef, totalCount);
    set(monthlyGrossRef, monthlyGross);

    // Update last updated date
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('last-updated').innerHTML = currentDate;
    set(lastUpdatedRef, currentDate);
});
