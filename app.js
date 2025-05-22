// DOM Elements
const form = document.getElementById("exchangeForm");
const exchangeHouseSelect = document.getElementById("exchangeHouse");
const paymentMethodSelect = document.getElementById("paymentMethod");
const receiveMethodSelect = document.getElementById("receiveMethod");
const exchangeRateInput = document.getElementById("exchangeRate");
const sendAmountInput = document.getElementById("sendAmount");
const receiveAmountDiv = document.getElementById("receiveAmount");
const serviceFeeInput = document.getElementById("serviceFeeInput");
const incentiveCheckbox = document.getElementById("incentiveCheckbox");
const sendDateInput = document.getElementById("sendDate");
const receiveDateInput = document.getElementById("receiveDate");
const transactionsList = document.getElementById("transactionsList");

// Format number in Bangladeshi style (e.g., 55,20,000.00)
function formatBDT(number) {
  const fixedNumber = Number(number).toFixed(2);
  const [whole, decimal] = fixedNumber.toString().split(".");
  let result = "";
  let len = whole.length;
  if (len > 3) {
    let last3 = whole.substring(len - 3);
    let rest = whole.substring(0, len - 3);
    result = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  } else {
    result = whole;
  }
  return `৳${result}.${decimal}`;
}

// Format number in Bangladeshi style for USD (e.g., 55,20,000.00)
function formatBDNumber(number) {
  const fixedNumber = Number(number).toFixed(2);
  const [whole, decimal] = fixedNumber.toString().split(".");
  let result = "";
  let len = whole.length;
  if (len > 3) {
    let last3 = whole.substring(len - 3);
    let rest = whole.substring(0, len - 3);
    result = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  } else {
    result = whole;
  }
  return `${result}.${decimal}`;
}

// Modal Elements
const newHouseModal = document.getElementById("newHouseModal");
const newHouseNameInput = document.getElementById("newHouseName");
const addNewHouseBtn = document.getElementById("addNewHouse");
const saveNewHouseBtn = document.getElementById("saveNewHouse");
const cancelNewHouseBtn = document.getElementById("cancelNewHouse");

// Local Storage Keys
const TRANSACTIONS_KEY = "banglaXchange_transactions";
const EXCHANGE_HOUSES_KEY = "banglaXchange_houses";

// Initialize custom exchange houses from local storage
function initializeExchangeHouses() {
  const customHouses = JSON.parse(localStorage.getItem(EXCHANGE_HOUSES_KEY) || "[]");
  customHouses.forEach((house) => {
    const option = new Option(house, house.toLowerCase());
    exchangeHouseSelect.add(option);
  });
}

// Initialize transactions array
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Calculate receive amount
function calculateReceiveAmount() {
  const sendAmount = parseFloat(sendAmountInput.value) || 0;
  const exchangeRate = parseFloat(exchangeRateInput.value) || 0;
  let receiveAmount = sendAmount * exchangeRate;
  if (incentiveCheckbox.checked) {
    receiveAmount += receiveAmount * 0.025;
  }
  receiveAmountDiv.textContent = `You'll Receive: ${formatBDT(receiveAmount)}`;
  return receiveAmount;
}

// Save transaction
function saveTransaction(e) {
  e.preventDefault();
  const transaction = {
    id: Date.now(),
    exchangeHouse: exchangeHouseSelect.value,
    paymentMethod: paymentMethodSelect.value,
    receiveMethod: receiveMethodSelect.value,
    exchangeRate: parseFloat(exchangeRateInput.value),
    sendAmount: parseFloat(sendAmountInput.value),
    serviceFee: parseFloat(serviceFeeInput.value) || 0,
    receiveAmount: calculateReceiveAmount(),
    incentive: incentiveCheckbox.checked,
    sendDate: sendDateInput.value,
    receiveDate: receiveDateInput.value,
    timestamp: new Date().toISOString(),
  };
  transactions.unshift(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  displayTransactions();
  resetForm();
}

// Delete transaction
function deleteTransaction(id) {
  const updatedTransactions = transactions.filter((t) => t.id !== id);
  transactions = updatedTransactions;
  localStorage.setItem("transactions", JSON.stringify(transactions));
  displayTransactions();
}

// Display transactions
function displayTransactions() {
  const transactionList = document.getElementById("transactionsList");
  if (!transactionList) return;

  transactionList.innerHTML = transactions
    .map((transaction) => {
      // Capitalize helper
      function capitalize(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      const completedClass = transaction.completed ? "bg-green-50" : "";
      return `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow ${completedClass}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-semibold text-primary">${capitalize(transaction.exchangeHouse)}</h3>
                        <p class="text-sm text-gray-600">Sent: $${formatBDNumber(transaction.sendAmount)} | Rate: ${transaction.exchangeRate.toFixed(2)} | Fee: $${transaction.serviceFee.toFixed(2)}</p>
                        <p class="text-sm font-medium text-primary">Received: ${formatBDT(transaction.receiveAmount)}${transaction.incentive ? " (includes 2.5% incentive)" : ""}</p>
                    </div>
                    <div class="flex flex-row items-center gap-x-2">
                      <button onclick="editTransaction(${transaction.id})" aria-label="Edit" title="Edit" class="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12" />
                        </svg>
                      </button>
                      <button onclick="markTransactionComplete(${transaction.id})" aria-label="Mark as Complete" title="Mark as Complete" class="text-green-600 hover:text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button onclick="confirmDeleteTransaction(${transaction.id})" class="text-red-500 hover:text-red-700" aria-label="Delete" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                </div>
                <div class="text-sm text-gray-600">
                    <p>Send Date: ${new Date(transaction.sendDate).toLocaleDateString()}</p>
                    <p>Receive Date: ${new Date(transaction.receiveDate).toLocaleDateString()}</p>
                    <p>Payment: ${capitalize(transaction.paymentMethod)} | Receive: ${capitalize(transaction.receiveMethod)}</p>
                </div>
            </div>
        `;
    })
    .join("");
}

// Reset form with default values
function resetForm() {
  form.reset();
  serviceFeeInput.value = "0";
  receiveAmountDiv.textContent = "You'll Receive: 0.00 BDT";
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  sendDateInput.value = today;
  receiveDateInput.value = tomorrow;
}

// Modal functions
function showModal() {
  newHouseModal.classList.remove("hidden");
  newHouseNameInput.focus();
}

function hideModal() {
  newHouseModal.classList.add("hidden");
  newHouseNameInput.value = "";
}

function saveNewHouse() {
  const houseName = newHouseNameInput.value.trim();
  if (houseName) {
    const customHouses = JSON.parse(localStorage.getItem(EXCHANGE_HOUSES_KEY) || "[]");
    customHouses.push(houseName);
    localStorage.setItem(EXCHANGE_HOUSES_KEY, JSON.stringify(customHouses));

    const option = new Option(houseName, houseName.toLowerCase());
    exchangeHouseSelect.add(option);
    hideModal();
  }
}

// Event Listeners
form.addEventListener("submit", saveTransaction);
sendAmountInput.addEventListener("input", calculateReceiveAmount);
exchangeRateInput.addEventListener("input", calculateReceiveAmount);
incentiveCheckbox.addEventListener("change", calculateReceiveAmount);
form.addEventListener("reset", resetForm);
addNewHouseBtn.addEventListener("click", showModal);
saveNewHouseBtn.addEventListener("click", saveNewHouse);
cancelNewHouseBtn.addEventListener("click", hideModal);

// Initialize
initializeExchangeHouses();
displayTransactions();

// Set default dates
const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
sendDateInput.value = today;
receiveDateInput.value = tomorrow;

// Toast and modal helpers
function showToast(message, color = "green") {
  let toast = document.createElement("div");
  toast.className = `fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white bg-${color}-600 animate-fadeIn`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

function showConfirm(message, onConfirm) {
  let modal = document.createElement("div");
  modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40";
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
      <div class="mb-4 text-lg text-gray-800">${message}</div>
      <div class="flex justify-center gap-4">
        <button id="confirmYes" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Yes</button>
        <button id="confirmNo" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#confirmYes").onclick = () => {
    onConfirm();
    modal.remove();
  };
  modal.querySelector("#confirmNo").onclick = () => {
    modal.remove();
  };
}

window.markTransactionComplete = function (id) {
  transactions = transactions.map((t) => (t.id === id ? { ...t, completed: true } : t));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  displayTransactions();
  showToast("Transaction marked as complete!", "green");
};

window.confirmDeleteTransaction = function (id) {
  showConfirm("Are you sure you want to delete this transaction?", () => {
    deleteTransaction(id);
    showToast("Transaction deleted!", "red");
  });
};

window.editTransaction = function (id) {
  const t = transactions.find((tr) => tr.id === id);
  if (!t) return;
  exchangeHouseSelect.value = t.exchangeHouse;
  paymentMethodSelect.value = t.paymentMethod;
  receiveMethodSelect.value = t.receiveMethod;
  exchangeRateInput.value = t.exchangeRate;
  sendAmountInput.value = t.sendAmount;
  serviceFeeInput.value = t.serviceFee;
  incentiveCheckbox.checked = t.incentive;
  sendDateInput.value = t.sendDate;
  receiveDateInput.value = t.receiveDate;
  // Optionally scroll to form
  form.scrollIntoView({ behavior: "smooth" });
};

// Add fadeIn animation for toast
const style = document.createElement("style");
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} } .animate-fadeIn { animation: fadeIn 0.3s; }`;
document.head.appendChild(style);
