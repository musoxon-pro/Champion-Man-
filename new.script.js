// ==================== AOS INIT ====================
AOS.init({ duration: 800, once: true, offset: 50 });

// ==================== NAVBAR SCROLL ====================
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

// ==================== BITRIX24 WEBHOOK ====================
const BITRIX_WEBHOOK = 'https://naturalmedik.bitrix24.kz/rest/10/t1rkgccuexw4j4fc/crm.lead.add.json';

// ==================== TELEFON VALIDATSIYASI ====================
function validatePhone(phone) {
    const clean = phone.replace(/\D/g, '');
    const pattern = /^(90|91|93|94|95|97|98|99|33|88|77|50|55)\d{7}$/;
    if (clean.length !== 9) return { ok: false, msg: '❌ Telefon 9 raqam bo\'lishi kerak' };
    if (!pattern.test(clean)) return { ok: false, msg: '❌ Faqat O\'zbekiston raqamlari' };
    return { ok: true, clean };
}

// Telefon input formatlash
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

// ==================== BITRIX24 GA YUBORISH ====================
async function sendToBitrix24(name, surname, age, region, phone) {
    const leadData = {
        fields: {
            TITLE: `Champion Man - ${name} ${surname || ''}`,
            NAME: name,
            LAST_NAME: surname || '',
            AGE: age,
            PHONE: [{ VALUE: `+998${phone}`, VALUE_TYPE: 'WORK' }],
            COMMENTS: `Viloyat: ${region}\nYosh: ${age}\nTelefon: +998${phone}\nMahsulot: Champion Man`,
            SOURCE_ID: 'WEB'
        }
    };
    
    try {
        const response = await fetch(BITRIX_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });
        
        const result = await response.json();
        
        if (result.error) {
            console.error('Bitrix24 xatosi:', result.error_description);
            return { ok: false, message: result.error_description };
        }
        
        return { ok: true, result };
    } catch (error) {
        console.error('Bitrix24 ulanish xatosi:', error);
        return { ok: false, message: error.message };
    }
}

// ==================== FORMA YUBORISH ====================
if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const surname = document.getElementById('surname').value.trim();
        const age = document.getElementById('age').value.trim();
        const region = document.getElementById('region').value;
        const phoneRaw = document.getElementById('phone').value.trim();
        
        // Validatsiya
        if (!name) {
            statusDiv.innerHTML = '❌ Ismingizni kiriting!';
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        if (!age || age < 18 || age > 100) {
            statusDiv.innerHTML = '❌ Yoshingiz 18-100 oralig\'ida bo\'lishi kerak!';
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        if (!region) {
            statusDiv.innerHTML = '❌ Viloyatingizni tanlang!';
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        const phoneCheck = validatePhone(phoneRaw);
        if (!phoneCheck.ok) {
            statusDiv.innerHTML = phoneCheck.msg;
            statusDiv.style.color = '#e74c3c';
            return;
        }
        
        // Yuklash holati
        statusDiv.innerHTML = '⏳ Yuborilmoqda...';
        statusDiv.style.color = '#3498db';
        if (submitBtn) submitBtn.disabled = true;
        
        // Faqat Bitrix24 ga yuborish
        const result = await sendToBitrix24(name, surname, age, region, phoneCheck.clean);
        
        if (result.ok) {
            statusDiv.innerHTML = '✅ Soʻrovingiz qabul qilindi! Tez orada bogʻlanamiz.';
            statusDiv.style.color = '#27ae60';
            setTimeout(() => {
                closeModal();
                if (submitBtn) submitBtn.disabled = false;
            }, 2500);
        } else {
            statusDiv.innerHTML = '❌ Xatolik yuz berdi. Qaytadan urining.';
            statusDiv.style.color = '#e74c3c';
            if (submitBtn) submitBtn.disabled = false;
            console.error('Yuborishda xatolik:', result.message);
        }
    };
}
