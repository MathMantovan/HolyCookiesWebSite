let cart = [];
let address = null;

// ── Cart ──────────────────────────────────────────────────────────────────────

function addToCart(name, price, quantity) {
    if (quantity < 1) return;
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    updateBadge();
    renderCart();
    openCart();
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateBadge();
    renderCart();
}

function updateBadge() {
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    const badge = document.getElementById('cart-badge');
    badge.textContent = total;
    badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-muted">Seu carrinho está vazio.</p>';
        totalEl.textContent = 'R$ 0,00';
        return;
    }

    let total = 0;
    let html = '<ul class="list-group list-group-flush">';
    cart.forEach((item, idx) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                    <div class="fw-semibold">${item.name}</div>
                    <div class="text-muted small">R$ ${fmt(item.price)} × ${item.quantity}</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">R$ ${fmt(subtotal)}</span>
                    <button class="btn btn-sm btn-outline-danger remove-btn" onclick="removeFromCart(${idx})">✕</button>
                </div>
            </li>`;
    });
    html += '</ul>';

    container.innerHTML = html;
    totalEl.textContent = 'R$ ' + fmt(total);
}

function openCart() {
    const el = document.getElementById('cartOffcanvas');
    bootstrap.Offcanvas.getOrCreateInstance(el).show();
}

function fmt(value) {
    return value.toFixed(2).replace('.', ',');
}

// ── CEP lookup ────────────────────────────────────────────────────────────────

function maskCep(value) {
    return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
}

async function searchCep() {
    const raw = document.getElementById('cep-input').value.replace(/\D/g, '');
    const errorEl = document.getElementById('cep-error');
    const loadingEl = document.getElementById('cep-loading');
    const resultEl = document.getElementById('address-result');

    errorEl.style.display = 'none';
    resultEl.style.display = 'none';
    address = null;

    if (raw.length !== 8) {
        errorEl.textContent = 'Digite um CEP com 8 dígitos.';
        errorEl.style.display = 'block';
        return;
    }

    loadingEl.style.display = 'block';

    try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();

        if (data.erro) {
            errorEl.textContent = 'CEP não encontrado. Verifique e tente novamente.';
            errorEl.style.display = 'block';
            return;
        }

        address = data;
        document.getElementById('address-display').textContent =
            `${data.logradouro}, ${data.bairro} — ${data.localidade}/${data.uf}`;
        document.getElementById('address-number').value = '';
        document.getElementById('address-complement').value = '';
        resultEl.style.display = 'block';
    } catch {
        errorEl.textContent = 'Erro ao buscar o CEP. Tente novamente.';
        errorEl.style.display = 'block';
    } finally {
        loadingEl.style.display = 'none';
    }
}

// ── WhatsApp message builder ──────────────────────────────────────────────────

function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('Adicione ao menos um item ao carrinho antes de finalizar.');
        return;
    }

    const number = document.getElementById('address-number').value.trim();
    const complement = document.getElementById('address-complement').value.trim();

    let msg = ' *Pedido Holy Cookies*\n\n';

    msg += '*Itens:*\n';
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        msg += `• ${item.name} (x${item.quantity}) — R$ ${fmt(subtotal)}\n`;
    });
    msg += `\n*Total: R$ ${fmt(total)}*`;

    if (address) {
        msg += '\n\n*Endereço de entrega:*\n';
        msg += `${address.logradouro}`;
        if (number) msg += `, ${number}`;
        if (complement) msg += ` — ${complement}`;
        msg += `\n${address.bairro} — ${address.localidade}/${address.uf}`;
        msg += `\nCEP: ${address.cep}`;
    } else {
        msg += '\n\n_(Endereço não informado)_';
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/5511982416636?text=${encoded}`, '_blank');
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const qtyInput = btn.closest('.card-body').querySelector('.qty-input');
        const quantity = parseInt(qtyInput.value) || 1;
        addToCart(name, price, quantity);
    });

    document.getElementById('cep-search-btn').addEventListener('click', searchCep);

    document.getElementById('cep-input').addEventListener('input', function () {
        this.value = maskCep(this.value);
    });

    document.getElementById('cep-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') searchCep();
    });
});
