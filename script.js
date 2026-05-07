// ==================== AOS INIT ====================
AOS.init({ duration: 800, once: true, offset: 50 });

// ==================== NAVBAR (SCROLL EFECT) ====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.style.padding = window.scrollY > 50 ? '10px 0' : '15px 0';
});

// ==================== MOBILE MENU ====================
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn) {
    menuBtn.onclick = () => {
        navLinks.classList.toggle('active');
        menuBtn.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    };
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.onclick = () => {
            navLinks.classList.remove('active');
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        };
    });
}

// ==================== COUNTER ANIMATION ====================
const counters = document.querySelectorAll('.counter');
let counted = false;

function startCounters() {
    if (counted) return;
    counters.forEach(counter => {
        const target = +counter.dataset.target;
        let current = 0;
        const step = target / 50;
        const update = () => {
            if (current < target) {
                current += step;
                counter.textContent = Math.ceil(current);
                setTimeout(update, 20);
            } else {
                counter.textContent = target;
            }
        };
        update();
    });
    counted = true;
}

window.addEventListener('scroll', () => {
    const stats = document.querySelector('.stats');
    if (stats && stats.getBoundingClientRect().top < window.innerHeight - 100) {
        startCounters();
    }
});

// ==================== TELEGRAM BOT ====================
const BOT_TOKEN = '8772794106:AAHWLntSm79O9S2C7fhpIV6PGS-QStqPvhI';
const CHAT_ID = '1408342614';

// Telefon validatsiyasi (faqat O'zbekiston raqamlari)
function validatePhone(phone) {
    const clean = phone.replace(/\D/g, '');
    const pattern = /^(90|91|93|94|95|97|98|99|33|88|77|50|55)\d{7}$/;
    if (clean.length !== 9) return { ok: false, msg: '❌ Telefon 9 raqam bo\'lishi kerak' };
    if (!pattern.test(clean)) return { ok: false, msg: '❌ Faqat O\'zbekiston raqamlari' };
    return { ok: true, clean };
}

// Input formatlash
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.oninput = (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9); };
}

// ==================== MODAL ====================
const modal = document.getElementById('orderModal');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('orderForm');
const statusDiv = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    statusDiv.textContent = '';
    if (form) form.reset();
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

document.getElementById('navOrderBtn')?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
document.getElementById('ctaOrderBtn')?.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);
window.onclick = (e) => { if (e.target === modal) closeModal(); };

// ==================== FORM SUBMIT ====================
if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const surname = document.getElementById('surname').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!name) {
            statusDiv.innerHTML = '❌ Ismingizni kiriting!';
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        const phoneCheck = validatePhone(phone);
        if (!phoneCheck.ok) {
            statusDiv.innerHTML = phoneCheck.msg;
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        statusDiv.innerHTML = '⏳ Yuborilmoqda...';
        statusDiv.style.color = '#3498db';
        if (submitBtn) submitBtn.disabled = true;
        
        let msg = `🆕 YANGI BUYURTMA!\n━━━━━━━━━━━━━━━━━━━━━\n📦 Mahsulot: Champion Man\n👤 Ism: ${name}`;
        if (surname) msg += `\n👨 Familiya: ${surname}`;
        msg += `\n📞 Telefon: +998${phoneCheck.clean}\n🕐 Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
        
        try {
            const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
            });
            const data = await res.json();
            
            if (data.ok) {
                statusDiv.innerHTML = '✅ Buyurtma qabul qilindi!';
                statusDiv.style.color = '#27ae60';
                setTimeout(() => { closeModal(); if (submitBtn) submitBtn.disabled = false; }, 2000);
            } else {
                throw new Error();
            }
        } catch (err) {
            statusDiv.innerHTML = '❌ Xatolik yuz berdi. Qaytadan urining.';
            statusDiv.style.color = '#e74c3c';
            if (submitBtn) submitBtn.disabled = false;
        }
    };
}
