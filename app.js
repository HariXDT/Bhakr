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
const database = getDatabase(app);

class CounterMoneyApp {
  constructor() {
    this.counter = 0;
    this.totalAmount = 0;
    this.counterHistory = [];
    this.moneyHistory = [];
    this.currentDate = new Date().toISOString().split('T')[0];

    this.initElements();
    this.bindEvents();
    this.setCurrentDate();
    this.loadFirebaseData();
    this.log("App initialized with Firebase");
  }

  initElements() {
    this.tabs = document.querySelectorAll('.tab');
    this.tabContents = document.querySelectorAll('.tab-content');

    this.counterValue = document.getElementById('counterValue');
    this.currentDateElement = document.getElementById('currentDate');
    this.lastUpdated = document.getElementById('lastUpdated');
    this.saveCountBtn = document.getElementById('saveCountBtn');
    this.dateInput = document.getElementById('dateInput');
    this.setDateBtn = document.getElementById('setDateBtn');
    this.counterHistoryContainer = document.getElementById('counterHistoryContainer');

    this.totalAmountElement = document.getElementById('totalAmount');
    this.transactionCount = document.getElementById('transactionCount');
    this.averageAmount = document.getElementById('averageAmount');
    this.amountInput = document.getElementById('amountInput');
    this.descriptionInput = document.getElementById('descriptionInput');
    this.addMoneyBtn = document.getElementById('addMoneyBtn');
    this.quickAdd5 = document.getElementById('quickAdd5');
    this.quickAdd10 = document.getElementById('quickAdd10');
    this.quickAdd20 = document.getElementById('quickAdd20');
    this.clearMoneyBtn = document.getElementById('clearMoneyBtn');
    this.moneyHistoryContainer = document.getElementById('moneyHistoryContainer');

    this.logContainer = document.getElementById('logContainer');
  }

  bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    this.saveCountBtn.addEventListener('click', () => this.saveCount());
    this.setDateBtn.addEventListener('click', () => this.setDate());

    this.addMoneyBtn.addEventListener('click', () => this.addMoney());
    this.quickAdd5.addEventListener('click', () => this.quickAddMoney(5));
    this.quickAdd10.addEventListener('click', () => this.quickAddMoney(10));
    this.quickAdd20.addEventListener('click', () => this.quickAddMoney(20));
    this.clearMoneyBtn.addEventListener('click', () => this.clearMoney());

    this.amountInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addMoney();
    });
  }

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    this.dateInput.value = today;
    this.currentDate = today;
    this.currentDateElement.textContent = today;
  }

  switchTab(tabName) {
    this.tabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    this.tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    this.log(`Switched to ${tabName} tab`);
  }

  loadFirebaseData() {
    onValue(ref(database, 'daily_counter/current/count'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.counter = data.value || 0;
        this.counterValue.textContent = this.counter;
        this.lastUpdated.textContent = new Date().toLocaleString();
        this.log(`Counter updated from Firebase: ${this.counter}`);
      }
    });

    onValue(ref(database, 'counterHistory'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.counterHistory = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));
        this.renderCounterHistory();
      }
    });

    onValue(ref(database, 'moneyHistory'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.moneyHistory = Object.values(data);
        this.updateMoneyData();
      }
    });
  }

  async saveCount() {
    const date = this.dateInput.value || this.currentDate;
    const countData = {
      date: date,
      count: this.counter,
      timestamp: serverTimestamp()
    };
    try {
      await set(ref(database, `counterHistory/${date}`), countData);
      this.log(`Saved counter ${this.counter} for ${date}`);
      this.showSuccess(`Saved count for ${date}`);
    } catch (e) {
      this.showError("Failed to save count: " + e.message);
    }
  }

  setDate() {
    const selected = this.dateInput.value;
    if (!selected) {
      this.showError("Please select a date.");
      return;
    }
    this.currentDate = selected;
    this.currentDateElement.textContent = selected;
    this.showSuccess(`Date set to ${selected}`);
  }

  renderCounterHistory() {
    if (!this.counterHistory.length) {
      this.counterHistoryContainer.innerHTML = "<p>No history available.</p>";
      return;
    }
    this.counterHistoryContainer.innerHTML = this.counterHistory.map(item => `
      <div class="history-item">
        <span class="history-date">${item.date}</span>
        <span class="history-count">${item.count}</span>
      </div>`).join('');
  }

  async addMoney() {
    const amount = parseFloat(this.amountInput.value);
    const description = this.descriptionInput.value.trim();
    if (isNaN(amount) || amount <= 0) {
      this.showError("Enter a valid amount.");
      return;
    }
    const entry = {
      amount,
      description: description || "No description",
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    };
    try {
      await push(ref(database, 'moneyHistory'), entry);
      this.amountInput.value = '';
      this.descriptionInput.value = '';
      this.showSuccess(`Added $${amount.toFixed(2)}`);
    } catch (e) {
      this.showError("Failed to add money: " + e.message);
    }
  }

  async quickAddMoney(amount) {
    const entry = {
      amount,
      description: `Quick add ${amount}`,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    };
    try {
      await push(ref(database, 'moneyHistory'), entry);
      this.showSuccess(`Quick added $${amount}`);
    } catch (e) {
      this.showError("Failed to quick add: " + e.message);
    }
  }

  async clearMoney() {
    if (!confirm("Clear all money history?")) return;
    try {
      await set(ref(database, 'moneyHistory'), null);
      this.showSuccess("Money history cleared.");
    } catch (e) {
      this.showError("Failed to clear: " + e.message);
    }
  }

  updateMoneyData() {
    const total = this.moneyHistory.reduce((sum, m) => sum + m.amount, 0);
    const count = this.moneyHistory.length;
    const avg = count > 0 ? total / count : 0;

    this.totalAmountElement.textContent = `$${total.toFixed(2)}`;
    this.transactionCount.textContent = count;
    this.averageAmount.textContent = `$${avg.toFixed(2)}`;

    this.moneyHistoryContainer.innerHTML = this.moneyHistory.slice().reverse().map(item => `
      <div class="history-item">
        <div>
          <div class="history-date">${new Date(item.timestamp).toLocaleString()}</div>
          <div style="font-size: 0.9em; color: #666;">${item.description}</div>
        </div>
        <span class="history-amount">${item.amount.toFixed(2)}</span>
      </div>`).join('');
  }

  showSuccess(msg) {
    this.log("SUCCESS: " + msg);
    this.showMessage(msg, "success-message", 3000);
  }

  showError(msg) {
    this.log("ERROR: " + msg);
    this.showMessage(msg, "error-message", 5000);
  }

  showMessage(msg, className, duration) {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = msg;
    document.querySelector('.container').prepend(div);
    setTimeout(() => div.remove(), duration);
  }

  log(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${msg}`;
    this.logContainer.appendChild(entry);
    this.logContainer.scrollTop = this.logContainer.scrollHeight;
    if (this.logContainer.children.length > 100) {
      this.logContainer.firstChild.remove();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new CounterMoneyApp());
