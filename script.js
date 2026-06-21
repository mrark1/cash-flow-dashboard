let salary = 0;
let expenses = [];
let chart;
let currentCurrency = "INR";

// Currency Conversion Rates
const currencyRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011
};

// DOM Elements
const salaryInput = document.getElementById("salaryInput");
const setSalaryBtn = document.getElementById("setSalaryBtn");

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const addExpenseBtn = document.getElementById("addExpenseBtn");

const salaryDisplay = document.getElementById("salaryDisplay");
const expenseDisplay = document.getElementById("expenseDisplay");
const balanceDisplay = document.getElementById("balanceDisplay");

const expenseList = document.getElementById("expenseList");
const errorMsg = document.getElementById("errorMsg");
const warning = document.getElementById("warning");

const currencySelect = document.getElementById("currencySelect");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

// Load Saved Data
loadData();

// Set Salary
setSalaryBtn.addEventListener("click", () => {

    const value = Number(salaryInput.value);

    if (value <= 0) {
        showError("Please enter a valid salary.");
        return;
    }

    salary = value;

    saveData();
    renderDashboard();
});

// Add Expense
addExpenseBtn.addEventListener("click", () => {

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);

    if (name === "" || amount <= 0) {
        showError("Please enter valid expense details.");
        return;
    }

    expenses.push({
        name,
        amount
    });

    expenseName.value = "";
    expenseAmount.value = "";

    saveData();
    renderDashboard();
});

// Currency Change
currencySelect.addEventListener("change", (e) => {

    currentCurrency = e.target.value;
    renderDashboard();

});

// PDF Download
downloadPdfBtn.addEventListener("click", generatePDF);

// Format Currency
function formatCurrency(amount) {

    const converted =
        amount * currencyRates[currentCurrency];

    return `${currentCurrency} ${converted.toFixed(2)}`;
}

// Render Dashboard
function renderDashboard() {

    const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    const remainingBalance =
        salary - totalExpenses;

    // Update Summary
    salaryDisplay.textContent =
        formatCurrency(salary);

    expenseDisplay.textContent =
        formatCurrency(totalExpenses);

    balanceDisplay.textContent =
        formatCurrency(remainingBalance);

    // Warning Logic
    if (
        salary > 0 &&
        remainingBalance < salary * 0.10
    ) {

        warning.classList.remove("hidden");

        warning.innerHTML =
            "⚠ Warning! Remaining balance is below 10% of your salary.";

        balanceDisplay.classList.add("low-balance");

    } else {

        warning.classList.add("hidden");

        balanceDisplay.classList.remove("low-balance");

    }

    // Render Expense List
    expenseList.innerHTML = "";

    expenses.forEach((expense, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${expense.name}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>
                <button
                    class="delete-btn"
                    onclick="deleteExpense(${index})">
                    Delete
                </button>
            </td>
        `;

        expenseList.appendChild(row);

    });

    updateChart(
        remainingBalance,
        totalExpenses
    );
}

// Delete Expense
function deleteExpense(index) {

    expenses.splice(index, 1);

    saveData();
    renderDashboard();
}

// Save LocalStorage
function saveData() {

    localStorage.setItem(
        "salary",
        salary
    );

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

// Load LocalStorage
function loadData() {

    salary =
        Number(
            localStorage.getItem("salary")
        ) || 0;

    expenses =
        JSON.parse(
            localStorage.getItem("expenses")
        ) || [];

    renderDashboard();
}

// Error Handler
function showError(message) {

    errorMsg.textContent = message;

    setTimeout(() => {
        errorMsg.textContent = "";
    }, 3000);
}

// Chart.js
function updateChart(
    balance,
    totalExpenses
) {

    const ctx =
        document.getElementById(
            "expenseChart"
        );

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: [
                "Remaining Balance",
                "Total Expenses"
            ],

            datasets: [{
                data: [
                    balance,
                    totalExpenses
                ]
            }]
        }

    });
}

// PDF Generator
function generatePDF(){

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(37,99,235);
    doc.rect(0,0,210,30,"F");

    doc.setTextColor(255,255,255);
    doc.setFontSize(22);
    doc.text("Cash Flow Dashboard Report",15,20);

    doc.setTextColor(0,0,0);

    doc.setFontSize(14);
    doc.text(`Generated By: ARPIT RAJ KATIYAR`,20,45);

    doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        20,
        55
    );

    doc.line(20,60,190,60);

    doc.text(`Total Salary: ₹${salary}`,20,75);

    let totalExpenses = expenses.reduce(
        (sum,item)=>sum+item.amount,
        0
    );

    doc.text(
        `Total Expenses: ₹${totalExpenses}`,
        20,
        85
    );

    doc.text(
        `Remaining Balance: ₹${salary-totalExpenses}`,
        20,
        95
    );

    doc.setFontSize(16);
    doc.text("Expense Details",20,115);

    let y = 130;

    expenses.forEach((expense,index)=>{

        doc.setFontSize(12);

        doc.text(
            `${index+1}. ${expense.name}`,
            25,
            y
        );

        doc.text(
            `₹${expense.amount}`,
            150,
            y
        );

        y += 10;
    });

    // Footer
    doc.setFillColor(37,99,235);
    doc.rect(0,280,210,17,"F");

    doc.setTextColor(255,255,255);

    doc.setFontSize(10);

    doc.text(
        "Cash Flow Dashboard | Developed By ARPIT RAJ KATIYAR",
        20,
        290
    );

    doc.save("CashFlowDashboard_Report.pdf");
}
