let currentBalance = 0;
let transactions = [];
let userName = "";
let transactionChart; // Renamed for clarity
let categoryChart; // New chart variable

function updateBalance() {
  document.getElementById("balance").textContent = `$${currentBalance.toFixed(
    2
  )}`;
  localStorage.setItem("balance", currentBalance);
}

// Helper function to format transaction display
function formatTransaction(item) {
  const sign = item.type === "deposit" ? "+" : "-";
  const color =
    item.type === "deposit"
      ? "color: var(--secondary-color);"
      : "color: var(--danger-color);";

  const date = new Date(item.date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return `
              <div>
                  <span style="font-weight: 600;">${
                    item.description || item.type.toUpperCase()
                  }</span>
                  <span style="font-size: 0.8em; color: #9ca3af; margin-left: 10px;">(${
                    item.category
                  })</span>
              </div>
              <div style="${color} font-weight: 700;">
                  ${sign}$${item.amount.toFixed(2)}
              </div>
              <div style="font-size: 0.7em; color: #6b7280; margin-left: auto;">${date}</div>
          `;
}

function updateHistory(filteredTransactions = transactions) {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  // Sort by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  filteredTransactions.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = formatTransaction(item);
    list.appendChild(li);
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateCharts();
}

function filterTransactionsByDate() {
  const filterMonth = document.getElementById("filterMonth").value;

  if (!filterMonth) {
    updateHistory(transactions); // Show all if no filter
    return;
  }

  const [year, month] = filterMonth.split("-").map(Number);

  const filtered = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === year && tDate.getMonth() + 1 === month;
  });

  updateHistory(filtered);
}

function addTransaction() {
  const amount = parseFloat(document.getElementById("amountInput").value);
  const type = document.getElementById("typeInput").value;
  const category = document.getElementById("categoryInput").value;
  const description =
    document.getElementById("descriptionInput").value.trim() || category; // Use category as default description

  if (!isNaN(amount) && amount > 0) {
    if (type === "withdraw" && amount > currentBalance) {
      alert("Insufficient balance!");
      return;
    }

    if (type === "deposit") {
      currentBalance += amount;
    } else {
      currentBalance -= amount;
    }

    transactions.unshift({
      text: `${type === "deposit" ? "Deposited" : "Withdrew"} $${amount.toFixed(
        2
      )} (${category})`,
      type: type,
      amount: amount,
      category: category,
      description: description,
      date: new Date().toISOString(), // Add a date for sorting/filtering
    });

    // Clear inputs
    document.getElementById("amountInput").value = "";
    document.getElementById("descriptionInput").value = "";

    updateBalance();
    updateHistory();
  } else {
    alert("Invalid amount!");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));

  const icon = document.querySelector(".toggle-btn i");
  // Swap icon between sun and moon
  const isDark = document.body.classList.contains("dark");
  icon.classList.toggle("fa-moon", !isDark);
  icon.classList.toggle("fa-sun", isDark);

  // Redraw charts to update colors
  if (transactionChart) transactionChart.destroy();
  if (categoryChart) categoryChart.destroy();
  transactionChart = null;
  categoryChart = null;
  updateCharts();
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
    // Keep dark mode setting, but clear financial/user data
    localStorage.removeItem("userName");
    localStorage.removeItem("balance");
    localStorage.removeItem("transactions");

    currentBalance = 0;
    transactions = [];

    if (transactionChart) transactionChart.destroy();
    if (categoryChart) categoryChart.destroy();
    transactionChart = null;
    categoryChart = null;

    document.getElementById("accountSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("username").value = "";
  }
}

function updateCharts() {
  // --- Monthly Summary Chart (Bar) ---
  const depositSum = transactions
    .filter((t) => t.type === "deposit")
    .reduce((acc, t) => acc + t.amount, 0);
  const withdrawSum = transactions
    .filter((t) => t.type === "withdraw")
    .reduce((acc, t) => acc + t.amount, 0);

  if (transactionChart) {
    transactionChart.data.datasets[0].data = [depositSum, withdrawSum];
    transactionChart.update();
  } else {
    const ctx = document.getElementById("transactionChart").getContext("2d");
    transactionChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Deposits", "Withdrawals"],
        datasets: [
          {
            label: "Amount ($)",
            data: [depositSum, withdrawSum],
            backgroundColor: [
              getComputedStyle(document.documentElement).getPropertyValue(
                "--secondary-color"
              ) || "#10b981",
              getComputedStyle(document.documentElement).getPropertyValue(
                "--danger-color"
              ) || "#ef4444",
            ],
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: document.body.classList.contains("dark")
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
              borderColor: document.body.classList.contains("dark")
                ? "#555"
                : "#ccc",
            },
            ticks: {
              color: document.body.classList.contains("dark")
                ? "#f9fafb"
                : "#1f2937",
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: document.body.classList.contains("dark")
                ? "#f9fafb"
                : "#1f2937",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  // --- Spending by Category Chart (Doughnut) ---
  const spendingData = transactions
    .filter((t) => t.type === "withdraw")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const categoryLabels = Object.keys(spendingData);
  const categoryAmounts = Object.values(spendingData);

  const defaultColors = [
    "#FBBF24",
    "#34D399",
    "#60A5FA",
    "#F87171",
    "#9333EA",
    "#4B5563",
  ];

  if (categoryChart) {
    categoryChart.data.labels = categoryLabels;
    categoryChart.data.datasets[0].data = categoryAmounts;
    categoryChart.update();
  } else {
    const ctxCategory = document
      .getElementById("categoryChart")
      .getContext("2d");
    categoryChart = new Chart(ctxCategory, {
      type: "doughnut",
      data: {
        labels: categoryLabels,
        datasets: [
          {
            data: categoryAmounts,
            backgroundColor: defaultColors.slice(0, categoryLabels.length),
            borderColor: document.body.classList.contains("dark")
              ? "#374151"
              : "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: document.body.classList.contains("dark")
                ? "#f9fafb"
                : "#1f2937",
            },
          },
        },
      },
    });
  }
}

// Load saved data
window.onload = () => {
  // Initialize Moon/Sun icon based on stored theme
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark");
    document.querySelector(".toggle-btn i").classList.add("fa-sun");
  } else {
    document.querySelector(".toggle-btn i").classList.add("fa-moon");
  }

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
    // Charts are initialized inside updateHistory -> updateCharts
  }

  // Initial setup of the date filter input to the current month
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  document.getElementById("filterMonth").value = `${year}-${month}`;
  filterTransactionsByDate();
};
