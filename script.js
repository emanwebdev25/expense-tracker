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


function calculateTotalExpenses() {
    let total = 0;

   

    for (let expense of expenses) {
        let name = expense.name.toLowerCase();

        total += Number(expense.amount);
    }

    totalExpenses.textContent = `Rs. ${total}`;
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
}

function displayExpenses() {
    expenseList.innerHTML = "";

    let searchText = searchInput.value.toLowerCase();
    let selectedCategory = filterSelect.value;

    for (let expense of expenses) {

        let name = expense.name.toLowerCase();

        if (!name.includes(searchText)) {
            continue;
        }

        if (selectedCategory !== "all" && expense.category !== selectedCategory) {
            continue;
        }

        let expenseItem = document.createElement("div");

        expenseItem.innerHTML = `
            <h3>${expense.name}</h3>
            <p>Rs. ${expense.amount}</p>
            <p>${expense.category}</p>
            <p>${expense.date}</p>
            <button class="delete-btn">Delete</button>
            <button class="edit-btn">Edit</button>
        `;

        expenseList.appendChild(expenseItem);
    }
}


form.addEventListener("submit", function (event) {
    event.preventDefault();

    let name = document.querySelector("#name").value;
    let amount = document.querySelector("#amount").value;
    let category = document.querySelector("#category").value;
    let date = document.querySelector("#date").value;



    let expense = {
        name,
        amount,
        category,
        date
    };

    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    calculateTotalExpenses();
    calculateBalance();

    let expenseItem = document.createElement("div");

    expenseItem.innerHTML = `
        <h3>${expense.name}</h3>
        <p>Rs. ${expense.amount}</p>
        <p>${expense.category}</p>
        <p>${expense.date}</p>
        <button class="delete-btn">Delete</button>
        <button class="edit-btn">Edit</button>
    `;

    let deleteButton = expenseItem.querySelector(".delete-btn");

    deleteButton.addEventListener("click", function () {
        let index = expenses.indexOf(expense);
        expenses.splice(index, 1);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        calculateTotalExpenses();
        calculateBalance();
        expenseList.removeChild(expenseItem);
    });
    let editButton = expenseItem.querySelector(".edit-btn");

    editButton.addEventListener("click", function () {

        let newName = prompt("Enter new expense name:", expense.name);
        let newAmount = prompt("Enter new amount:", expense.amount);
        let newCategory = prompt("Enter new category:", expense.category);
        let newDate = prompt("Enter new date:", expense.date);

        // Update the expense object
        expense.name = newName;
        expense.amount = newAmount;
        expense.category = newCategory;
        expense.date = newDate;

        // Update the displayed values on the page
        expenseItem.querySelector("h3").textContent = expense.name;

        let paragraphs = expenseItem.querySelectorAll("p");

        paragraphs[0].textContent = `Rs. ${expense.amount}`;
        paragraphs[1].textContent = expense.category;
        paragraphs[2].textContent = expense.date;



        localStorage.setItem("expenses", JSON.stringify(expenses));

        calculateTotalExpenses();
        calculateBalance();
    });

    expenseList.appendChild(expenseItem);

    console.log(expenses);
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
    let date = document.querySelector("#income-date").value;

    let income = {
        source,
        amount,
        date
    };

    incomes.push(income);
    localStorage.setItem("incomes", JSON.stringify(incomes));
    calculateTotalIncome();
    calculateBalance();

    console.log(incomes);
});
displayExpenses();
calculateTotalExpenses();
calculateTotalIncome();
calculateBalance();

searchInput.addEventListener("input", function () {
    displayExpenses();
});
filterSelect.addEventListener("change", function () {
    displayExpenses();
});