const API = 'http://localhost:8080/api/transactions';

  /* ─── STATE ─── */
  let transactions = [];
  let summary = { income: 0, expense: 0, balance: 0 };
  let filter = 'ALL';
  let editMode = false;
  let selectedType = 'INCOME';

  /* ─── UTILS ─── */
  const fmt = n => {
    const abs = Math.abs(n);
    if (abs >= 1000) return (n < 0 ? '-' : '') + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (n < 0 ? '-$' : '$') + abs.toFixed(2);
  };

  const catEmoji = c => {
    const map = {
      'salary':'💼','freelance':'🖥️','investment':'📈','gift':'🎁',
      'food':'🍔','transport':'🚌','housing':'🏠','entertainment':'🎬',
      'healthcare':'💊','shopping':'🛍️','education':'📚','utilities':'⚡',
    };
    return map[(c||'').toLowerCase()] || '💰';
  };

  function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${type === 'success' ? '✓' : '✗'}</span> ${msg}`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  /* ─── FETCH DATA ─── */
  async function loadData() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      transactions = data.transactions || [];
      summary = { income: data.income || 0, expense: data.expense || 0, balance: data.balance || 0 };
      updateSummary();
      renderList();
    } catch (e) {
      document.getElementById('tx-list').innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.95 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
          <p>Could not connect to the API.<br>Make sure your Spring Boot server is running on <b>localhost:8080</b>.</p>
        </div>`;
    }
  }

  function updateSummary() {
    document.getElementById('total-income').textContent  = fmt(summary.income);
    document.getElementById('total-expense').textContent = fmt(summary.expense);
    document.getElementById('total-balance').textContent = fmt(summary.balance);
  }

  /* ─── RENDER LIST ─── */
  function renderList() {
    const list = document.getElementById('tx-list');
    let filtered = transactions;
    if (filter !== 'ALL') filtered = transactions.filter(t => t.type === filter);

    if (!filtered.length) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75"/>
          </svg>
          <p>No transactions yet.<br>Hit <b>+ Add</b> to get started.</p>
        </div>`;
      return;
    }

    list.innerHTML = filtered
      .slice()
      .reverse()
      .map(t => {
        const isIncome = t.type === 'INCOME';
        return `
        <div class="tx-item" data-id="${t.id}">
          <div class="tx-badge ${isIncome ? 'income' : 'expense'}">${catEmoji(t.category)}</div>
          <div class="tx-info">
            <div class="tx-title">${escHtml(t.title)}</div>
            <div class="tx-meta">
              <span class="tx-cat">${escHtml(t.category || 'Uncategorised')}</span>
              <span>${t.date || '—'}</span>
            </div>
          </div>
          <div class="tx-amount ${isIncome ? 'income' : 'expense'}">
            ${isIncome ? '+' : '-'}${fmt(t.amount)}
          </div>
          <div class="tx-actions">
            <button class="icon-btn edit" aria-label="Edit" onclick="openEdit(${t.id})">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5Z"/>
              </svg>
            </button>
            <button class="icon-btn del" aria-label="Delete" onclick="deleteTransaction(${t.id})">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 4h12M5 4V2.5h6V4M6 7v5M10 7v5M3.5 4l.667 9.5h7.666L12.5 4"/>
              </svg>
            </button>
          </div>
        </div>`;
      }).join('');
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─── MODAL ─── */
  function openModal(title = 'Add transaction') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('tx-title').focus();
  }

  function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('tx-form').reset();
    document.getElementById('tx-id').value = '';
    editMode = false;
    setType('INCOME');
  }

  function setType(type) {
    selectedType = type;
    document.getElementById('btn-type-income').className  = 'type-btn' + (type === 'INCOME'  ? ' selected-income'  : '');
    document.getElementById('btn-type-expense').className = 'type-btn' + (type === 'EXPENSE' ? ' selected-expense' : '');
  }

  document.getElementById('btn-open-add').addEventListener('click', () => openModal('Add transaction'));
  document.getElementById('btn-modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

  document.getElementById('btn-type-income').addEventListener('click',  () => setType('INCOME'));
  document.getElementById('btn-type-expense').addEventListener('click', () => setType('EXPENSE'));

  /* ─── FILTER TABS ─── */
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      renderList();
    });
  });

  /* ─── OPEN EDIT ─── */
  window.openEdit = function(id) {
    const t = transactions.find(x => x.id === id);
    if (!t) return;
    editMode = true;
    document.getElementById('tx-id').value = t.id;
    document.getElementById('tx-title').value = t.title;
    document.getElementById('tx-amount').value = t.amount;
    document.getElementById('tx-category').value = t.category;
    setType(t.type);
    openModal('Edit transaction');
  };

  /* ─── DELETE CONFIRM MODAL ─── */
let pendingDeleteId = null;

document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
  document.getElementById('confirm-overlay').style.display = 'none';
  pendingDeleteId = null;
});
document.getElementById('confirm-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    document.getElementById('confirm-overlay').style.display = 'none';
    pendingDeleteId = null;
  }
});

window.deleteTransaction = function(id) {
  pendingDeleteId = id;
  document.getElementById('confirm-overlay').style.display = 'flex';
};

document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.textContent = 'Deleting…';
  try {
    const res = await fetch(`${API}/${pendingDeleteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    document.getElementById('confirm-overlay').style.display = 'none';
    toast('Transaction deleted');
    await loadData();
  } catch {
    toast('Failed to delete', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete';
    pendingDeleteId = null;
  }
});

  /* ─── SUBMIT FORM ─── */
  document.getElementById('tx-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    const id    = document.getElementById('tx-id').value;
    const body  = {
      title:    document.getElementById('tx-title').value.trim(),
      amount:   parseFloat(document.getElementById('tx-amount').value),
      category: document.getElementById('tx-category').value,
      type:     selectedType,
    };

    try {
      let res;
      if (editMode && id) {
        res = await fetch(`${API}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      toast(editMode ? 'Transaction updated' : 'Transaction added');
      closeModal();
      await loadData();
    } catch (err) {
      toast('Failed to save: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save transaction';
    }
  });

  /* ─── INIT ─── */
  loadData();