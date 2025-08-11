let currentBalance = 0;
let transactions = [];
let userName = "";
let chart;

function updateBalance() {
  document.getElementById("balance").textContent = `$${currentBalance.toFixed(
    2
  )}`;
  localStorage.setItem("balance", currentBalance);
}

function updateHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  transactions.slice(0, 10).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.text;
    list.appendChild(li);
  });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateChart();
}

function deposit() {
  const amount = parseFloat(prompt("Enter deposit amount:"));
  if (!isNaN(amount) && amount > 0) {
    currentBalance += amount;
    transactions.unshift({
      text: `Deposited $${amount.toFixed(2)}`,
      type: "deposit",
      amount,
    });
    updateBalance();
    updateHistory();
  } else {
    alert("Invalid amount!");
  }
}

function withdraw() {
  const amount = parseFloat(prompt("Enter withdrawal amount:"));
  if (!isNaN(amount) && amount > 0) {
    if (amount <= currentBalance) {
      currentBalance -= amount;
      transactions.unshift({
        text: `Withdrew $${amount.toFixed(2)}`,
        type: "withdraw",
        amount,
      });
      updateBalance();
      updateHistory();
    } else {
      alert("Insufficient balance!");
    }
  } else {
    alert("Invalid amount!");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function login() {
  const nameInput = document.getElementById("username").value.trim();
  if (nameInput !== "") {
    userName = nameInput;
    localStorage.setItem("userName", userName);
    document.getElementById(
      "welcomeUser"
    ).textContent = `Welcome, ${userName}!`;
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("accountSection").style.display = "block";
    updateBalance();
    updateHistory();
  } else {
    alert("Please enter your name.");
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    currentBalance = 0;
    transactions = [];
    updateBalance();
    updateHistory();
    document.getElementById("accountSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("username").value = "";
  }
}

function updateChart() {
  const depositSum = transactions
    .filter((t) => t.type === "deposit")
    .reduce((acc, t) => acc + t.amount, 0);
  const withdrawSum = transactions
    .filter((t) => t.type === "withdraw")
    .reduce((acc, t) => acc + t.amount, 0);

  if (!chart) {
    const ctx = document.getElementById("transactionChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Deposits", "Withdrawals"],
        datasets: [
          {
            label: "Amount ($)",
            data: [depositSum, withdrawSum],
            backgroundColor: ["#2e8b57", "#d9534f"],
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } else {
    chart.data.datasets[0].data = [depositSum, withdrawSum];
    chart.update();
  }
}

// Load saved data
window.onload = () => {
  if (localStorage.getItem("userName")) {
    userName = localStorage.getItem("userName");
    currentBalance = parseFloat(localStorage.getItem("balance")) || 0;
    transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    document.getElementById(
      "welcomeUser"
    ).textContent = `Welcome, ${userName}!`;
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("accountSection").style.display = "block";
    updateBalance();
    updateHistory();
  }

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
};

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  isDark = !isDark;

  const icon = document.querySelector(".toggle-btn i");
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
}
