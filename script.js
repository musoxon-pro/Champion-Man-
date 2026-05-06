// ========== AOS INIT ==========
AOS.init({ duration: 800, once: true, offset: 50 });

// ========== FRIZ LAG TUZATILGAN ==========
let ticking = false;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            if (window.scrollY > 10) {
                navbar.style.background = 'rgba(255,255,255,0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.background = 'rgba(255,255,255,0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
            }
            ticking = false;
        });
        ticking = true;
    }
});

// ========== SCROLLNI BLOKLASH FUNKSIYALARI ==========
function disableScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
}

function enableScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

// ========== MOBILE MENU ==========
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuBtn.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (menuBtn) menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// ========== COUNTER ANIMATION ==========
const counters = document.querySelectorAll('.counter');
let counted = false;

function startCounters() {
    if(counted) return;
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50;
        const update = () => {
            if(current < target) {
                current += increment;
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
    if(stats && stats.getBoundingClientRect().top < window.innerHeight - 100) {
        startCounters();
    }
});

// ========== TELEGRAM BOT SOZLAMALARI ==========
const BOT_TOKEN = '7670335502:AAHo-2YvIqREbv0CaC5dr5eUL-sFWX2Bp4g';
const CHAT_ID = '1408342614';

// ========== TELEFON VALIDATSIYASI ==========
function validateUzbPhone(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
   // const uzbPatterns = /^(90|91|93|94|95|97|98|99|33|88|77|00|05|55|50)\d{7}$/;
    
    if (cleanNumber.length !== 9) {
        return { valid: false, message: '❌ Telefon raqam 9 raqamdan iborat bo\'lishi kerak' };
    }
    
    if (!uzbPatterns.test(cleanNumber)) {
        return { valid: false, message: '❌ Faqat O\'zbekiston raqamlari qabul qilinadi' };
    }
    
    return { valid: true, cleanNumber };
}

const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 9);
    });
}

// ========== MODAL ==========
const modal = document.getElementById('orderModal');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('orderForm');
const statusDiv = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

function openModal() {
    modal.style.display = 'block';
    disableScroll();
    statusDiv.textContent = '';
    form.reset();
    if (phoneInput) phoneInput.value = '';
}

function closeModal() {
    modal.style.display = 'none';
    enableScroll();
}

const heroOrderBtn = document.getElementById('heroOrderBtn');
const navOrderBtn = document.getElementById('navOrderBtn');
const ctaOrderBtn = document.getElementById('ctaOrderBtn');

if (heroOrderBtn) heroOrderBtn.onclick = openModal;
if (navOrderBtn) navOrderBtn.onclick = (e) => { e.preventDefault(); openModal(); };
if (ctaOrderBtn) ctaOrderBtn.onclick = openModal;

if (closeBtn) closeBtn.onclick = closeModal;

window.onclick = (e) => { 
    if(e.target == modal) closeModal();
};

// ========== XABAR YUBORISH ==========
async function sendToTelegram(name, surname, phone, product) {
    let message = `🆕 YANGI ZAKAZ!\n━━━━━━━━━━━━━━━━━━━━━\n📦 Mahsulot: ${product}\n👤 Ism: ${name}`;
    if (surname) message += `\n👨 Familiya: ${surname}`;
    message += `\n📞 Telefon: +998${phone}\n🕐 Vaqt: ${new Date().toLocaleString('uz-UZ')}\n━━━━━━━━━━━━━━━━━━━━━\n🌿 100% Tabiiy mahsulot | Anti-fishing`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });
        return await response.json();
    } catch (error) {
        console.error('Xatolik:', error);
        return { ok: false, error: error.message };
    }
}

// ========== FORMA YUBORISH ==========
if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const surname = document.getElementById('surname').value.trim();
        const phoneRaw = document.getElementById('phone').value.trim();
        
        if (!name) {
            statusDiv.innerHTML = '❌ Ismingizni kiriting!';
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        if (name.length < 2) {
            statusDiv.innerHTML = '❌ Ism 2 harfdan kam bo\'lmasligi kerak!';
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        const phoneValidation = validateUzbPhone(phoneRaw);
        if (!phoneValidation.valid) {
            statusDiv.innerHTML = phoneValidation.message;
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        statusDiv.innerHTML = '⏳ Yuborilmoqda...';
        statusDiv.style.color = '#3498db';
        if (submitBtn) submitBtn.disabled = true;
        
        const result = await sendToTelegram(name, surname, phoneValidation.cleanNumber, 'Champion Man');
        
        if (result.ok) {
            statusDiv.innerHTML = '✅ Zakaz qabul qilindi! Tez orada bog\'lanamiz.';
            statusDiv.style.color = '#27ae60';
            setTimeout(() => {
                closeModal();
                form.reset();
                if (phoneInput) phoneInput.value = '';
                if (submitBtn) submitBtn.disabled = false;
            }, 2000);
        } else {
            statusDiv.innerHTML = '❌ Xatolik yuz berdi. Qaytadan urining.';
            statusDiv.style.color = '#e74c3c';
            if (submitBtn) submitBtn.disabled = false;
            console.error('Telegram xatosi:', result);
        }
    };
}
