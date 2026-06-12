// 1. Sticky Header & Active Link On Scroll
const header = document.getElementById('header');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    // Efek background header saat scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Indikator navigasi aktif saat scroll di section tertentu
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// 2. Mobile Responsive Menu Toggle (Hamburger)
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Tutup menu saat link diklik (di tampilan mobile)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// 3. Filter Galeri Produk
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Ubah kelas aktif pada tombol filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        productCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                // Efek fade-in halus saat produk difilter
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// 4. Integrasi Form Hubungi Kami (Simulasi Sukses)
const contactForm = document.getElementById('contact-form');
const formAlert = document.getElementById('form-alert');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Ambil data form
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const subject = document.getElementById('form-subject').value;
    const message = document.getElementById('form-message').value;

    // Beri notifikasi sukses tanpa menggunakan browser alert() bawaan
    formAlert.classList.add('success');
    formAlert.textContent = `Terima kasih, ${name}! Pesan Anda mengenai "${subject}" berhasil terkirim. Tim ShoeVint akan membalas Anda melalui email (${email}) dalam waktu 1x24 jam.`;

    // Reset Form setelah berhasil terkirim
    contactForm.reset();

    // Hilangkan alert sukses secara otomatis setelah 8 detik
    setTimeout(() => {
        formAlert.classList.remove('success');
        formAlert.textContent = '';
    }, 8000);
});