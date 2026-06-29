// ================================================================
//  LUXEBAG — script.js
//  Fitur: Auth, Proteksi Belanja, Keranjang, Riwayat Pemesanan
// ================================================================

// ===================== DATA & STATE =====================
let users = [
    { nama: 'Demo Customer', email: 'demo@luxebag.com', password: 'demo123', phone: '081234567890' }
];

let currentUser = null;
let cart = [];
let orderHistory = []; // riwayat pesanan per user

// Load sesi & data saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = sessionStorage.getItem('luxebagUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavbarAuthState();
        // Load riwayat dari sessionStorage
        const savedHistory = sessionStorage.getItem('luxebagHistory_' + currentUser.email);
        if (savedHistory) orderHistory = JSON.parse(savedHistory);
    }
    updateCartUI();
    // Sembunyikan semua tombol keranjang & ganti tampilan jika belum login
    updateProductButtons();
});

// ===================== AUTH MODAL =====================
function openAuthModal(tab = 'login') {
    switchAuthTab(tab);
    ['loginErrorMsg','loginSuccessMsg','registerErrorMsg','registerSuccessMsg'].forEach(id => {
        document.getElementById(id).classList.add('d-none');
    });
    new bootstrap.Modal(document.getElementById('authModal')).show();
}

function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('panelLogin').classList.toggle('d-none', !isLogin);
    document.getElementById('panelRegister').classList.toggle('d-none', isLogin);
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    document.getElementById('authSubtitle').textContent = isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru gratis';
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon  = btn.querySelector('i');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.className = isHidden ? 'bi bi-eye-slash' : 'bi bi-eye';
}

// ===================== LOGIN =====================
function loginUser() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginErrorMsg').classList.add('d-none');
    document.getElementById('loginSuccessMsg').classList.add('d-none');

    if (!email || !password) {
        showAuthError('loginErrorMsg', 'Email dan kata sandi harus diisi.');
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        showAuthError('loginErrorMsg', 'Email atau kata sandi salah. Silakan coba lagi.');
        return;
    }

    currentUser = user;
    sessionStorage.setItem('luxebagUser', JSON.stringify(user));

    // Load riwayat user ini
    const savedHistory = sessionStorage.getItem('luxebagHistory_' + user.email);
    orderHistory = savedHistory ? JSON.parse(savedHistory) : [];

    updateNavbarAuthState();
    updateProductButtons();

    document.getElementById('loginSuccessMsg').classList.remove('d-none');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        if (modal) modal.hide();
    }, 1100);
}

// ===================== REGISTER =====================
function registerUser() {
    const nama     = document.getElementById('regNama').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const phone    = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm  = document.getElementById('regPasswordConfirm').value;

    document.getElementById('registerErrorMsg').classList.add('d-none');
    document.getElementById('registerSuccessMsg').classList.add('d-none');

    if (!nama || !email || !phone || !password || !confirm) {
        showAuthError('registerErrorMsg', 'Semua kolom wajib diisi.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthError('registerErrorMsg', 'Format email tidak valid.');
        return;
    }
    if (password.length < 6) {
        showAuthError('registerErrorMsg', 'Kata sandi minimal 6 karakter.');
        return;
    }
    if (password !== confirm) {
        showAuthError('registerErrorMsg', 'Konfirmasi kata sandi tidak cocok.');
        return;
    }
    if (users.find(u => u.email === email)) {
        showAuthError('registerErrorMsg', 'Email sudah terdaftar. Silakan masuk.');
        return;
    }

    users.push({ nama, email, phone, password });
    document.getElementById('registerSuccessMsg').classList.remove('d-none');
    ['regNama','regEmail','regPhone','regPassword','regPasswordConfirm'].forEach(id => {
        document.getElementById(id).value = '';
    });

    setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('registerSuccessMsg').classList.add('d-none');
        document.getElementById('loginEmail').value = email;
    }, 1500);
}

// ===================== LOGOUT =====================
function logoutUser() {
    sessionStorage.removeItem('luxebagUser');
    currentUser = null;
    cart = [];
    orderHistory = [];
    updateNavbarAuthState();
    updateCartUI();
    updateProductButtons();
    showToastMessage('<i class="bi bi-door-open text-warning me-2"></i> Anda telah keluar dari akun.');
}

// ===================== UPDATE NAVBAR =====================
function updateNavbarAuthState() {
    const loggedIn = !!currentUser;
    document.getElementById('navLoginBtn').classList.toggle('d-none', loggedIn);
    document.getElementById('navUserMenu').classList.toggle('d-none', !loggedIn);

    if (loggedIn) {
        document.getElementById('navUserName').textContent       = currentUser.nama.split(' ')[0];
        document.getElementById('dropdownUserName').textContent  = currentUser.nama;
        document.getElementById('dropdownUserEmail').textContent = currentUser.email;
    }
}

// ===================== PROTEKSI TOMBOL PRODUK =====================
// Sembunyikan tombol "Keranjang" dan tampilkan overlay login jika belum login
function updateProductButtons() {
    const loggedIn = !!currentUser;
    // Overlay login pada tiap produk
    document.querySelectorAll('.login-overlay').forEach(el => {
        el.classList.toggle('d-none', loggedIn);
    });
    // Tombol keranjang per produk
    document.querySelectorAll('.btn-add-cart').forEach(el => {
        el.classList.toggle('d-none', !loggedIn);
    });
}

// ===================== CART CLICK (navbar) =====================
function handleCartClick() {
    if (!currentUser) {
        openAuthModal('login');
        setTimeout(() => showAuthError('loginErrorMsg', '⚠️ Silakan masuk untuk mengakses keranjang belanja.'), 400);
        return;
    }
    new bootstrap.Modal(document.getElementById('cartModal')).show();
}

// ===================== RIWAYAT PEMESANAN =====================
function openOrderHistory() {
    renderOrderHistory();
    new bootstrap.Modal(document.getElementById('orderHistoryModal')).show();
}

function renderOrderHistory() {
    const container = document.getElementById('orderHistoryContainer');

    if (orderHistory.length === 0) {
        container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-clock-history fs-1 text-muted mb-3 d-block"></i>
            <h6 class="fw-bold">Belum ada riwayat pesanan</h6>
            <p class="text-muted small">Mulai belanja sekarang dan riwayat pemesanan Anda akan tampil di sini.</p>
        </div>`;
        return;
    }

    let html = '';
    // Tampilkan terbaru dulu
    [...orderHistory].reverse().forEach(order => {
        const itemList = order.items.map(i =>
            `<span class="badge bg-light text-dark border me-1 mb-1">${i.name} ×${i.quantity}</span>`
        ).join('');

        const statusColor = { 'Diproses': 'warning', 'Dikirim': 'info', 'Selesai': 'success' };
        const color = statusColor[order.status] || 'secondary';

        html += `
        <div class="order-history-card p-3 mb-3 rounded-3 border">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <span class="fw-bold text-dark small">${order.id}</span>
                    <span class="badge bg-${color} text-dark ms-2 small">${order.status}</span>
                </div>
                <span class="text-muted" style="font-size:0.78rem;">${order.tanggal}</span>
            </div>
            <div class="mb-2">${itemList}</div>
            <div class="d-flex justify-content-between align-items-center">
                <div class="text-muted small">
                    <i class="bi bi-truck me-1"></i>${order.kurir} &nbsp;|&nbsp;
                    <i class="bi bi-credit-card me-1"></i>${order.metode}
                </div>
                <span class="fw-bold text-success">${formatRupiah(order.total)}</span>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

function saveOrderHistory(order) {
    orderHistory.push(order);
    if (currentUser) {
        sessionStorage.setItem('luxebagHistory_' + currentUser.email, JSON.stringify(orderHistory));
    }
}

// ===================== CART =====================
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function addToCart(id, name, price, category) {
    if (!currentUser) {
        openAuthModal('login');
        setTimeout(() => showAuthError('loginErrorMsg', '⚠️ Silakan masuk untuk menambahkan produk ke keranjang.'), 400);
        return;
    }
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ id, name, price, category, quantity: 1 });

    updateCartUI();
    new bootstrap.Toast(document.getElementById('liveToast')).show();
}

function updateCartUI() {
    const container       = document.getElementById('cartItemsContainer');
    const emptyState      = document.getElementById('cartEmptyState');
    const checkoutSection = document.getElementById('checkoutFormSection');
    const cartCountEl     = document.getElementById('cartCount');
    const totalText       = document.getElementById('cartTotalText');
    const cartFooter      = document.getElementById('cartFooter');

    const totalCount = cart.reduce((t, i) => t + i.quantity, 0);
    cartCountEl.textContent = totalCount;

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        checkoutSection.classList.add('d-none');
        totalText.textContent = 'Rp 0';
        cartFooter.classList.add('d-none');
        return;
    }

    emptyState.classList.add('d-none');
    checkoutSection.classList.remove('d-none');
    cartFooter.classList.remove('d-none');

    let html = '', grandTotal = 0;
    const imgMap = {
        1: 'images/giselle-tote.jpg',
        2: 'images/vanguard-rucksack.jpg',
        3: 'images/aura-clutch.jpg',
        4: 'images/nomad-sling.jpg',
        5: 'images/heritage-backpack.jpg',
        6: 'images/amelia-crossbody.jpg'
    };

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;
        html += `
        <div class="row align-items-center mb-3 pb-3 border-bottom">
            <div class="col-2 text-center"><img src="${imgMap[item.id] || ''}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"></div>
            <div class="col-10 col-md-4">
                <h6 class="fw-bold mb-1">${item.name}</h6>
                <span class="text-muted small">${formatRupiah(item.price)}</span>
            </div>
            <div class="col-6 col-md-3 mt-2 mt-md-0 d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateQty(${item.id}, -1)">-</button>
                <span class="mx-3 fw-bold">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateQty(${item.id}, 1)">+</button>
            </div>
            <div class="col-6 col-md-3 mt-2 mt-md-0 text-end">
                <span class="fw-bold me-2">${formatRupiah(itemTotal)}</span>
                <button class="btn btn-sm btn-link text-danger p-0" onclick="removeItem(${item.id})">
                    <i class="bi bi-trash-fill fs-5"></i>
                </button>
            </div>
        </div>`;
    });

    // Auto-isi nama & HP
    if (currentUser) {
        const namaEl  = document.getElementById('checkoutNama');
        const phoneEl = document.getElementById('checkoutPhone');
        if (namaEl && !namaEl.value)   namaEl.value  = currentUser.nama;
        if (phoneEl && !phoneEl.value) phoneEl.value = currentUser.phone || '';
    }

    container.innerHTML = html;
    totalText.textContent = formatRupiah(grandTotal);
}

function updateQty(id, modifier) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += modifier;
        if (item.quantity <= 0) removeItem(id);
        else updateCartUI();
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function processCheckout(event) {
    event.preventDefault();
    const name    = document.getElementById('checkoutNama').value;
    const phone   = document.getElementById('checkoutPhone').value;
    const address = document.getElementById('checkoutAlamat').value;
    const kurir   = document.getElementById('checkoutKurir').value;
    const metode  = document.getElementById('checkoutMetode').value;

    if (!name || !phone || !address || !kurir || !metode) return;

    const finalTotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0);
    const txId       = '#TX-' + Math.floor(100000 + Math.random() * 900000);
    const now        = new Date();
    const tanggal    = now.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });

    // Simpan ke riwayat
    saveOrderHistory({
        id: txId,
        tanggal,
        items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total: finalTotal,
        kurir,
        metode,
        penerima: name,
        alamat: address,
        status: 'Diproses'
    });

    // Isi receipt
    document.getElementById('rName').textContent    = name;
    document.getElementById('rKurir').textContent   = kurir;
    document.getElementById('rMetode').textContent  = metode;
    document.getElementById('rTotal').textContent   = formatRupiah(finalTotal);
    document.getElementById('receiptId').textContent = txId;

    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    cartModal.hide();

    cart = [];
    updateCartUI();
    document.getElementById('checkoutForm').reset();

    new bootstrap.Modal(document.getElementById('receiptModal')).show();
}

function closeReceiptModal() {
    bootstrap.Modal.getInstance(document.getElementById('receiptModal')).hide();
}

// ===================== FILTER & SEARCH =====================
function filterCategory(category, buttonElement) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    buttonElement.classList.add('active');
    let found = false;
    document.querySelectorAll('.product-item').forEach(p => {
        const show = category === 'semua' || p.getAttribute('data-category') === category;
        p.classList.toggle('d-none', !show);
        if (show) found = true;
    });
    document.getElementById('emptySearchMessage').classList.toggle('d-none', found);
}

function searchProducts() {
    const query = document.getElementById('searchProduct').value.toLowerCase().trim();
    document.querySelectorAll('.filter-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    let found = false;
    document.querySelectorAll('.product-item').forEach(p => {
        const show = p.getAttribute('data-name').includes(query);
        p.classList.toggle('d-none', !show);
        if (show) found = true;
    });
    document.getElementById('emptySearchMessage').classList.toggle('d-none', found);
}

// ===================== GALLERY MODAL =====================
function openGalleryModal(title, category, text) {
    document.getElementById('galleryModalTitle').textContent = title;
    document.getElementById('galleryModalText').textContent  = text;
    const configs = {
        jinjing:   { bg: 'linear-gradient(135deg, #1e3c72, #2a5298)', icon: 'bi-bag-heart' },
        selempang: { bg: 'linear-gradient(135deg, #f857a6, #ff5858)', icon: 'bi-emoji-sunglasses' },
        ransel:    { bg: 'linear-gradient(135deg, #4776e6, #8e54e9)', icon: 'bi-compass' },
        pesta:     { bg: 'linear-gradient(135deg, #111, #444)',        icon: 'bi-gem' }
    };
    const cfg = configs[category] || configs.pesta;
    const ic  = document.getElementById('galleryModalIcon');
    ic.style.background = cfg.bg;
    ic.innerHTML = `<i class="bi ${cfg.icon} text-white display-3"></i>`;
    new bootstrap.Modal(document.getElementById('galleryDetailModal')).show();
}

// ===================== CONTACT FORM =====================
function validateContactForm(event) {
    event.preventDefault();
    const form   = document.getElementById('contactForm');
    const alertEl = document.getElementById('contactSuccessAlert');
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        alertEl.classList.add('d-none');
    } else {
        form.classList.remove('was-validated');
        alertEl.classList.remove('d-none');
        form.reset();
        setTimeout(() => alertEl.classList.add('d-none'), 6000);
    }
}

// ===================== HELPERS =====================
function showAuthError(elId, msg) {
    const el = document.getElementById(elId);
    el.innerHTML = `<i class="bi bi-exclamation-circle me-1"></i> ${msg}`;
    el.classList.remove('d-none');
}

function showToastMessage(html) {
    document.getElementById('liveToast').querySelector('.toast-body').innerHTML = html;
    new bootstrap.Toast(document.getElementById('liveToast')).show();
}

// ===================== SCROLL NAV =====================
window.addEventListener('scroll', () => {
    let current = 'beranda';
    document.querySelectorAll('section').forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
});
