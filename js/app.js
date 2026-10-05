const STORAGE_KEY = 'expenses';

let expenses = [];
let editingExpenseId = null;

const form = document.querySelector('#expense-form');
const amountInput = document.querySelector('#amount');
const descriptionInput = document.querySelector('#description');
const categoryInput = document.querySelector('#category');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-edit');
const expenseList = document.querySelector('#expense-list');
const totalExpenses = document.querySelector('#total-expenses');
const totalTransactions = document.querySelector('#total-transactions');
const listStatus = document.querySelector('#list-status');

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2
});

function loadExpenses() {
  try {
    const savedExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expenses = Array.isArray(savedExpenses) ? savedExpenses.filter(isExpense) : [];
  } catch {
    expenses = [];
  }
}

function isExpense(expense) {
  return expense
    && typeof expense.id === 'string'
    && typeof expense.amount === 'number' && expense.amount > 0
    && typeof expense.description === 'string' && expense.description.trim()
    && typeof expense.category === 'string' && expense.category
    && typeof expense.date === 'string';
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function getFormData() {
  return {
    amount: Number(amountInput.value),
    description: descriptionInput.value.trim(),
    category: categoryInput.value
  };
}

function validateForm() {
  descriptionInput.value = descriptionInput.value.trim();
  form.classList.add('was-validated');
  return form.checkValidity();
}

function resetForm() {
  form.reset();
  form.classList.remove('was-validated');
  editingExpenseId = null;
  submitButton.textContent = 'Add expense';
  cancelButton.classList.add('d-none');
}

function renderExpenses() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalExpenses.textContent = currency.format(total);
  totalTransactions.textContent = expenses.length;
  listStatus.textContent = expenses.length ? `${expenses.length} saved` : '';

  if (!expenses.length) {
    expenseList.innerHTML = `
      <div class="empty-state">
        <h3 class="h5">No expenses yet</h3>
        <p class="text-secondary mb-0">Add your first expense using the form above.</p>
      </div>`;
    return;
  }

  const rows = expenses.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((expense) => `
      <tr>
        <td class="fw-semibold">${escapeHtml(expense.description)}</td>
        <td><span class="badge category-badge rounded-pill">${escapeHtml(expense.category)}</span></td>
        <td class="amount-cell">${currency.format(expense.amount)}</td>
        <td class="text-secondary">${formatDate(expense.date)}</td>
        <td>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary edit-button" data-id="${expense.id}">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-danger delete-button" data-id="${expense.id}">Delete</button>
          </div>
        </td>
      </tr>`)
    .join('');

  expenseList.innerHTML = `
    <div class="table-wrap">
      <table class="table expense-table table-hover mb-0">
        <caption class="visually-hidden">Saved expenses</caption>
        <thead><tr>
          <th scope="col">Description</th><th scope="col">Category</th>
          <th scope="col">Amount</th><th scope="col">Date</th><th scope="col">Actions</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function formatDate(date) {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? 'Unknown date' : value.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function addExpense() {
  if (!validateForm()) return;

  expenses.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
    ...getFormData(),
    date: new Date().toISOString()
  });
  saveExpenses();
  renderExpenses();
  resetForm();
}

function editExpense(id) {
  const expense = expenses.find((item) => item.id === id);
  if (!expense) return;

  editingExpenseId = id;
  amountInput.value = expense.amount;
  descriptionInput.value = expense.description;
  categoryInput.value = expense.category;
  submitButton.textContent = 'Update expense';
  cancelButton.classList.remove('d-none');
  amountInput.focus();
}

function updateExpense() {
  if (!validateForm()) return;

  expenses = expenses.map((expense) => expense.id === editingExpenseId
    ? { ...expense, ...getFormData() }
    : expense);
  saveExpenses();
  renderExpenses();
  resetForm();
}

function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses();
  renderExpenses();
  if (editingExpenseId === id) resetForm();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  editingExpenseId ? updateExpense() : addExpense();
});

cancelButton.addEventListener('click', resetForm);

expenseList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  button.classList.contains('edit-button')
    ? editExpense(button.dataset.id)
    : deleteExpense(button.dataset.id);
});

loadExpenses();
renderExpenses();
