import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const database = getDatabase();
const dataRef1 = ref(database, 'daily_counter/current/count');
const totalCountRef = ref(database, 'daily_counter/current/total');
const monthlyGrossRef = ref(database, 'daily_counter/current/monthlyGross');
const lastUpdatedRef = ref(database, 'daily_counter/current/lastUpdated');

let totalCount = 0;
let monthlyGross = 0;

onValue(dataRef1, (snapshot) => {
    const count = snapshot.val();

    // Display current count
    document.getElementById('counter-value').innerHTML = count;

    // Multiply by 15 for income
    const income = count * 15;
    document.getElementById('Income-value').innerHTML = income + 'r';

    // Update totals
    totalCount += count;
    monthlyGross += income;

    // Display total count and monthly gross
    document.getElementById('total-count').innerHTML = totalCount;
    document.getElementById('monthly-gross').innerHTML = monthlyGross + 'r';

    // Save to Firebase
    set(totalCountRef, totalCount);
    set(monthlyGrossRef, monthlyGross);

    // Update last updated date
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('last-updated').innerHTML = currentDate;
    set(lastUpdatedRef, currentDate);
});
