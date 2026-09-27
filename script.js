let expenses = [];

let incomes = [];

let savedExpenses = localStorage.getItem("expenses");

let savedIncomes = localStorage.getItem("incomes");

if (savedExpenses) {
    expenses = JSON.parse(savedExpenses);
}

if (savedIncomes) {
    incomes = JSON.parse(savedIncomes);
}

let form = document.querySelector("#expense-form");

let expenseList = document.querySelector("#expense-list");

let totalBalance = document.querySelector("#total-balance");

let totalIncome = document.querySelector("#total-income");

let totalExpenses = document.querySelector("#total-expenses");

let incomeForm = document.querySelector("#income-form");

let searchInput = document.querySelector(".search-input");

let filterSelect = document.querySelector(".filter-select");

let typeFilter = document.querySelector("#type-filter");

let sortSelect = document.querySelector("#sort-select");

let monthlyExpenses = document.querySelector("#monthly-expenses");

let budgetInput = document.querySelector("#budget");

let saveBudgetButton = document.querySelector("#save-budget");

let budgetProgress = document.querySelector("#budget-progress");

let budgetSpent = document.querySelector("#budget-spent");

let budgetRemaining = document.querySelector("#budget-remaining");

let themeToggle = document.querySelector("#theme-toggle");

let editModal = document.querySelector("#edit-modal");

let closeModal = document.querySelector("#close-modal");

let editForm = document.querySelector("#edit-form");

let editName = document.querySelector("#edit-name");

let editAmount = document.querySelector("#edit-amount");

let editCategory = document.querySelector("#edit-category");

let editDate = document.querySelector("#edit-date");

let editingTransaction = null;

let transactionCount = document.querySelector("#transaction-count");

function calculateTotalExpenses() {
    let total = 0;

    for (let expense of expenses) {
        total += Number(expense.amount);
    }

    totalExpenses.textContent = `Rs. ${total}`;
}


function calculateMonthlyExpenses() {
    let total = 0;

    let currentMonth = new Date().getMonth();

    let currentYear = new Date().getFullYear();

    for (let expense of expenses) {
        let expenseDate = new Date(expense.date);

        if (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        ) {
            total += Number(expense.amount);
        }
    }

    monthlyExpenses.textContent = `Rs. ${total}`;
}


function calculateSpendingOverview() {
    let spendingOverview = document.querySelector("#spending-overview");

    let months = [];

    let today = new Date();

    for (let i = 5; i >= 0; i--) {
        let date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
        );

        months.push({
            name: date.toLocaleString("en-US", { month: "short" }),
            month: date.getMonth(),
            year: date.getFullYear(),
            total: 0
        });
    }

    for (let expense of expenses) {
        let expenseDate = new Date(expense.date);

        for (let month of months) {
            if (
                expenseDate.getMonth() === month.month &&
                expenseDate.getFullYear() === month.year
            ) {
                month.total += Number(expense.amount);
            }
        }
    }

    let highestAmount = 0;

    for (let month of months) {
        if (month.total > highestAmount) {
            highestAmount = month.total;
        }
    }

    spendingOverview.innerHTML = "";

    for (let month of months) {
        let percentage = highestAmount > 0
            ? (month.total / highestAmount) * 100
            : 0;

        let monthItem = document.createElement("div");

        monthItem.className = "month-item";

        monthItem.innerHTML = `
            <div class="month-info">
                <strong>${month.name}</strong>
                <span>Rs. ${month.total}</span>
            </div>

            <div class="month-bar">
                <div style="width: ${percentage}%"></div>
            </div>
        `;

        spendingOverview.appendChild(monthItem);
    }
}


function updateBudget() {
    let savedBudget = localStorage.getItem("budget");

    if (!savedBudget) {
        budgetSpent.textContent = "Rs. 0 spent";
        budgetRemaining.textContent = `Rs. ${remaining} remaining`;

        if (remaining < 0) {
            budgetRemaining.textContent = `Rs. ${Math.abs(remaining)} over budget`;
            budgetRemaining.style.color = "var(--orange)";
        } else {
            budgetRemaining.textContent = `Rs. ${remaining} remaining`;
            budgetRemaining.style.color = "";
        }

        budgetProgress.style.width = `${percentage}%`;

        if (spent > budget) {
            budgetProgress.style.background = "var(--orange)";
        } else {
            budgetProgress.style.background = "var(--olive)";
        }
        return;
    }

    let budget = Number(savedBudget);

    let spent = Number(
        monthlyExpenses.textContent.replace("Rs. ", "")
    );

    let remaining = budget - spent;

    let percentage = budget > 0
        ? (spent / budget) * 100
        : 0;

    if (percentage > 100) {
        percentage = 100;
    }

    budgetInput.value = budget;

    budgetSpent.textContent = `Rs. ${spent} spent`;

    let budgetPercentage = budget > 0
        ? Math.round((spent / budget) * 100)
        : 0;

    budgetSpent.textContent = `Rs. ${spent} spent (${budgetPercentage}%)`;

    budgetRemaining.textContent = `Rs. ${remaining} remaining`;

    budgetProgress.style.width = `${percentage}%`;
}


saveBudgetButton.addEventListener("click", function () {
    let budget = budgetInput.value;

    if (budget === "" || Number(budget) <= 0) {
        return;
    }

    localStorage.setItem("budget", budget);

    updateBudget();
    saveBudgetButton.textContent = "Saved ✓";

    setTimeout(function () {
        saveBudgetButton.textContent = "Save Budget";
    }, 1500);
});


function calculateCategoryBreakdown() {
    let categoryBreakdown = document.querySelector("#category-breakdown");

    let categories = {
        food: 0,
        transport: 0,
        shopping: 0,
        bills: 0,
        other: 0
    };

    for (let expense of expenses) {
        if (categories[expense.category] !== undefined) {
            categories[expense.category] += Number(expense.amount);
        }
    }

    categoryBreakdown.innerHTML = "";

    let total = 0;

    for (let categoryName in categories) {
        total += categories[categoryName];
    }

    for (let category in categories) {
        let amount = categories[category];

        let percentage = total > 0
            ? (amount / total) * 100
            : 0;

        if (amount === 0) {
            continue;
        }

        let categoryItem = document.createElement("div");

        categoryItem.innerHTML = `
            <div>
                <strong>${category}</strong>
                <span>Rs. ${amount}</span>
            </div>

            <div class="category-bar">
                <div style="width: ${percentage}%"></div>
            </div>
        `;

        categoryBreakdown.appendChild(categoryItem);
    }

    if (categoryBreakdown.innerHTML === "") {
        categoryBreakdown.innerHTML = "<p>No category data yet.</p>";
    }
}


function calculateBalance() {
    let income = 0;

    for (let incomeItem of incomes) {
        income += Number(incomeItem.amount);
    }

    let expense = 0;

    for (let expenseItem of expenses) {
        expense += Number(expenseItem.amount);
    }

    let balance = income - expense;

    totalBalance.textContent = `Rs. ${balance}`;

    if (balance < 0) {
        totalBalance.style.color = "var(--orange)";
    } else {
        totalBalance.style.color = "var(--olive)";
    }
}

let today = new Date().toISOString().split("T")[0];

document.querySelector("#date").value = today;

document.querySelector("#income-date").value = today;

function displayTransactions() {



    expenseList.innerHTML = "";

    let searchText = searchInput.value.toLowerCase();

    let selectedCategory = filterSelect.value;

    let selectedType = typeFilter.value;

    let selectedSort = sortSelect.value;

    let transactions = [];

    for (let expense of expenses) {
        transactions.push({
            type: "expense",
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            data: expense
        });
    }

    for (let income of incomes) {
        transactions.push({
            type: "income",
            name: income.source,
            amount: income.amount,
            category: "income",
            date: income.date,
            data: income
        });
    }


    transactions.sort(function (a, b) {

        if (selectedSort === "newest") {
            return new Date(b.date) - new Date(a.date);
        }

        if (selectedSort === "oldest") {
            return new Date(a.date) - new Date(b.date);
        }

        if (selectedSort === "highest") {
            return Number(b.amount) - Number(a.amount);
        }

        if (selectedSort === "lowest") {
            return Number(a.amount) - Number(b.amount);
        }
    });


    for (let transaction of transactions) {

        let name = transaction.name.toLowerCase();

        if (!name.includes(searchText)) {
            continue;
        }

        if (
            selectedCategory !== "all" &&
            transaction.category !== selectedCategory
        ) {
            continue;
        }

        if (
            selectedType !== "all" &&
            transaction.type !== selectedType
        ) {
            continue;
        }

        let transactionItem = document.createElement("div");

        transactionItem.className = transaction.type === "income"
            ? "income-transaction"
            : "expense-transaction";

        let amountSign = transaction.type === "income" ? "+" : "−";

        transactionItem.innerHTML = `
    <h3>${transaction.name}</h3>
    <p>${amountSign} Rs. ${transaction.amount}</p>
    <p>${transaction.category}</p>
    
    <p>${transaction.date}</p>
`;


        if (transaction.type === "expense") {

            transactionItem.innerHTML += `
        <button class="delete-btn">Delete</button>
        <button class="edit-btn">Edit</button>
    `;

            let deleteButton = transactionItem.querySelector(".delete-btn");

            deleteButton.addEventListener("click", function () {

                let confirmDelete = confirm(
                    `Delete "${transaction.data.name}"?`
                );

                if (!confirmDelete) {
                    return;
                }

                let index = expenses.indexOf(transaction.data);

                expenses.splice(index, 1);

                localStorage.setItem(
                    "expenses",
                    JSON.stringify(expenses)
                );

                calculateTotalExpenses();
                calculateBalance();
                calculateMonthlyExpenses();
                calculateCategoryBreakdown();
                calculateSpendingOverview();
                updateBudget();
                displayTransactions();
            });

            let editButton = transactionItem.querySelector(".edit-btn");

            editButton.addEventListener("click", function () {

                editingTransaction = transaction.data;

                editName.value = transaction.data.name;
                editAmount.value = transaction.data.amount;
                editCategory.value = transaction.data.category;
                editDate.value = transaction.data.date;

                editModal.classList.add("active");
            });
        } else {

            transactionItem.innerHTML += `
        <button class="delete-btn">Delete</button>
        <button class="edit-btn">Edit</button>
    `;

            let deleteButton = transactionItem.querySelector(".delete-btn");

            deleteButton.addEventListener("click", function () {

                let confirmDelete = confirm(
                    `Delete "${transaction.data.source}"?`
                );

                if (!confirmDelete) {
                    return;
                }

                let index = incomes.indexOf(transaction.data);

                incomes.splice(index, 1);

                localStorage.setItem(
                    "incomes",
                    JSON.stringify(incomes)
                );

                calculateTotalIncome();
                calculateBalance();
                displayTransactions();
            });

            let editButton = transactionItem.querySelector(".edit-btn");

            editButton.addEventListener("click", function () {

                let newSource = prompt(
                    "Enter new income source:",
                    transaction.data.source
                );

                let newAmount = prompt(
                    "Enter new amount:",
                    transaction.data.amount
                );

                let newDate = prompt(
                    "Enter new date:",
                    transaction.data.date
                );

                if (
                    newSource === null ||
                    newAmount === null ||
                    newDate === null
                ) {
                    return;
                }

                if (
                    newSource.trim() === "" ||
                    Number(newAmount) <= 0 ||
                    newDate.trim() === ""
                ) {
                    return;
                }

                transaction.data.source = newSource;
                transaction.data.amount = newAmount;
                transaction.data.date = newDate;

                localStorage.setItem(
                    "incomes",
                    JSON.stringify(incomes)
                );

                calculateTotalIncome();
                calculateBalance();
                displayTransactions();
            });
        }


        expenseList.appendChild(transactionItem);
    }

    let visibleTransactions = expenseList.children.length;

    transactionCount.textContent = `${visibleTransactions} transactions`;

    if (expenseList.innerHTML === "") {
        expenseList.innerHTML = `
    <div class="empty-state">
        <span>—</span>
        <h3>No transactions yet</h3>
        <p>Your financial activity will appear here.</p>
    </div>
`;
    }
}


form.addEventListener("submit", function (event) {
    event.preventDefault();

    let name = document.querySelector("#name").value;

    let amount = document.querySelector("#amount").value;

    if (Number(amount) <= 0) {
        return;
    }

    let category = document.querySelector("#category").value;

    let date = document.querySelector("#date").value;

    let expense = {
        name,
        amount,
        category,
        date
    };

    expenses.push(expense);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    calculateTotalExpenses();

    calculateBalance();

    calculateMonthlyExpenses();

    calculateCategoryBreakdown();

    calculateSpendingOverview();

    updateBudget();

    let addExpenseButton = form.querySelector("button");

    addExpenseButton.textContent = "Added ✓";

    setTimeout(function () {
        addExpenseButton.textContent = "Add Expense";
    }, 1500);

    displayTransactions();

    form.reset();
});


function calculateTotalIncome() {
    let total = 0;

    for (let income of incomes) {
        total += Number(income.amount);
    }

    totalIncome.textContent = `Rs. ${total}`;
}


incomeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let source = document.querySelector("#income-source").value;

    let amount = document.querySelector("#income-amount").value;

    if (Number(amount) <= 0) {
        return;
    }

    let date = document.querySelector("#income-date").value;

    let income = {
        source,
        amount,
        date
    };

    incomes.push(income);

    localStorage.setItem(
        "incomes",
        JSON.stringify(incomes)
    );

    let addIncomeButton = incomeForm.querySelector("button");

    addIncomeButton.textContent = "Added ✓";

    setTimeout(function () {
        addIncomeButton.textContent = "Add Income";
    }, 1500);

    calculateTotalIncome();

    calculateBalance();

    displayTransactions();

    incomeForm.reset();
});


displayTransactions();

calculateTotalExpenses();

calculateTotalIncome();

calculateBalance();

calculateMonthlyExpenses();

calculateCategoryBreakdown();

calculateSpendingOverview();

updateBudget();


searchInput.addEventListener("input", function () {
    displayTransactions();
});


filterSelect.addEventListener("change", function () {
    displayTransactions();
});


sortSelect.addEventListener("change", function () {
    displayTransactions();
});

let savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem("theme", "dark");

        themeToggle.textContent = "☀️ Light Mode";

    } else {

        localStorage.setItem("theme", "light");

        themeToggle.textContent = "🌙 Dark Mode";
    }
});


let exportButton = document.querySelector("#export-btn");

exportButton.addEventListener("click", function () {

    if (expenses.length === 0 && incomes.length === 0) {
        return;
    }

    let csv = "Type,Name,Amount,Category,Date\n";

    function cleanCSV(value) {
        return `"${String(value).replace(/"/g, '""')}"`;
    }


    for (let expense of expenses) {
        csv += `${cleanCSV("Expense")},${cleanCSV(expense.name)},${cleanCSV(expense.amount)},${cleanCSV(expense.category)},${cleanCSV(expense.date)}\n`;
    }


    for (let income of incomes) {
        csv += `${cleanCSV("Income")},${cleanCSV(income.source)},${cleanCSV(income.amount)},${cleanCSV("Income")},${cleanCSV(income.date)}\n`;
    }


    let blob = new Blob([csv], { type: "text/csv" });

    let url = URL.createObjectURL(blob);

    let link = document.createElement("a");

    link.href = url;

    link.download = "finance-report.csv";

    link.click();

    URL.revokeObjectURL(url);

    exportButton.textContent = "Exported ✓";

    setTimeout(function () {
        exportButton.textContent = "Export CSV";
    }, 1500);
});
let clearAllButton = document.querySelector("#clear-all-btn");

clearAllButton.addEventListener("click", function () {

    if (expenses.length === 0 && incomes.length === 0) {
        return;
    }

    let confirmClear = confirm(
        "Are you sure you want to clear all transactions?"
    );

    if (!confirmClear) {
        return;
    }

    expenses = [];
    incomes = [];

    localStorage.removeItem("expenses");
    localStorage.removeItem("incomes");

    calculateTotalExpenses();
    calculateTotalIncome();
    calculateBalance();
    calculateMonthlyExpenses();
    calculateCategoryBreakdown();
    calculateSpendingOverview();
    updateBudget();
    displayTransactions();
});
editForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (!editingTransaction) {
        return;
    }

    if (editingTransaction.source !== undefined) {

        editingTransaction.source = editName.value;
        editingTransaction.amount = editAmount.value;
        editingTransaction.date = editDate.value;

        localStorage.setItem(
            "incomes",
            JSON.stringify(incomes)
        );

        calculateTotalIncome();

    } else {

        editingTransaction.name = editName.value;
        editingTransaction.amount = editAmount.value;
        editingTransaction.category = editCategory.value;
        editingTransaction.date = editDate.value;

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );

        calculateTotalExpenses();
        calculateMonthlyExpenses();
        calculateCategoryBreakdown();
        calculateSpendingOverview();
        updateBudget();
    }

    calculateBalance();
    displayTransactions();

    editModal.classList.remove("active");

    editingTransaction = null;
});
closeModal.addEventListener("click", function () {

    editModal.classList.remove("active");

    editingTransaction = null;
});


editModal.addEventListener("click", function (event) {

    if (event.target === editModal) {

        editModal.classList.remove("active");

        editingTransaction = null;
    }
});
typeFilter.addEventListener("change", function () {
    displayTransactions();
});