const API_BASE = '/api/computers';

const STATUS_LABELS = {
  active: 'ใช้งาน',
  repair: 'ส่งซ่อม',
  disposed: 'จำหน่าย',
};

const form = document.getElementById('computer-form');
const formTitle = document.getElementById('form-title');
const editIdInput = document.getElementById('edit-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const messageEl = document.getElementById('message');
const listEl = document.getElementById('computer-list');

function showMessage(text, type = 'info') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.hidden = false;
}

function hideMessage() {
  messageEl.hidden = true;
}

function getFormData() {
  return {
    asset_code: document.getElementById('asset_code').value.trim(),
    brand_model: document.getElementById('brand_model').value.trim(),
    cpu: document.getElementById('cpu').value.trim(),
    ram_gb: parseInt(document.getElementById('ram_gb').value, 10),
    room: document.getElementById('room').value.trim(),
    status: document.getElementById('status').value,
  };
}

function resetForm() {
  form.reset();
  editIdInput.value = '';
  formTitle.textContent = 'เพิ่มเครื่องคอมพิวเตอร์';
  submitBtn.textContent = 'บันทึก';
  cancelBtn.hidden = true;
}

function fillForm(computer) {
  document.getElementById('asset_code').value = computer.asset_code;
  document.getElementById('brand_model').value = computer.brand_model;
  document.getElementById('cpu').value = computer.cpu;
  document.getElementById('ram_gb').value = computer.ram_gb;
  document.getElementById('room').value = computer.room;
  document.getElementById('status').value = computer.status;
  editIdInput.value = computer.id;
  formTitle.textContent = 'แก้ไขเครื่องคอมพิวเตอร์';
  submitBtn.textContent = 'อัปเดต';
  cancelBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderStatus(status) {
  return `<span class="badge badge-${status}">${STATUS_LABELS[status] || status}</span>`;
}

function renderRows(computers) {
  if (!computers.length) {
    listEl.innerHTML = '<tr><td colspan="7" class="empty">ยังไม่มีข้อมูล</td></tr>';
    return;
  }

  listEl.innerHTML = computers.map((item) => `
    <tr>
      <td>${escapeHtml(item.asset_code)}</td>
      <td>${escapeHtml(item.brand_model)}</td>
      <td>${escapeHtml(item.cpu)}</td>
      <td>${item.ram_gb} GB</td>
      <td>${escapeHtml(item.room)}</td>
      <td>${renderStatus(item.status)}</td>
      <td class="actions">
        <button type="button" data-action="edit" data-id="${item.id}">แก้ไข</button>
        <button type="button" data-action="delete" data-id="${item.id}" class="danger">ลบ</button>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadComputers() {
  hideMessage();
  listEl.innerHTML = '<tr><td colspan="7" class="empty">กำลังโหลด...</td></tr>';

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
    const data = await res.json();
    renderRows(data);
  } catch (err) {
    listEl.innerHTML = '<tr><td colspan="7" class="empty">โหลดข้อมูลไม่สำเร็จ</td></tr>';
    showMessage(err.message, 'error');
  }
}

async function saveComputer(event) {
  event.preventDefault();
  hideMessage();

  const payload = getFormData();
  const editId = editIdInput.value;
  const url = editId ? `${API_BASE}/${editId}` : API_BASE;
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');

    showMessage(editId ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ', 'success');
    resetForm();
    await loadComputers();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function deleteComputer(id) {
  if (!window.confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) return;

  hideMessage();

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ลบข้อมูลไม่สำเร็จ');

    showMessage('ลบข้อมูลสำเร็จ', 'success');
    await loadComputers();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

listEl.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'delete') {
    await deleteComputer(id);
    return;
  }

  if (action === 'edit') {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'โหลดข้อมูลไม่สำเร็จ');
      fillForm(data);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }
});

form.addEventListener('submit', saveComputer);
cancelBtn.addEventListener('click', resetForm);
refreshBtn.addEventListener('click', loadComputers);

loadComputers();
