// 1. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

// 2. SPA НАВИГАЦИЯ (Переключение страниц без перезагрузки)
function nav(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(l => {
            if (l.getAttribute('onclick').includes(id)) l.classList.add('active');
        });
    }, 50);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. КАЛЬКУЛЯТОР И ВАЛИДАЦИЯ
const phoneInput = document.getElementById('phone');
const areaInput = document.getElementById('area');
const nameInput = document.getElementById('name');
const sendBtn = document.getElementById('send-btn');

function updateCalc() {
    const typePrice = parseInt(document.getElementById('type').value);
    const areaVal = areaInput.value.replace(/\D/g, ''); // Только цифры
    const area = parseInt(areaVal) || 0;
    
    document.getElementById('v-m2').innerText = typePrice.toLocaleString() + " ₽";
    document.getElementById('v-total').innerText = (typePrice * area).toLocaleString() + " ₽";
    
    validateForm();
}

// Маска телефона и ограничение 10 цифр
phoneInput.oninput = (e) => {
    let value = e.target.value;
    if (!value.startsWith('+7')) value = '+7' + value.replace(/\D/g, '');
    
    let digits = value.slice(2).replace(/\D/g, '');
    if (digits.length > 10) digits = digits.substring(0, 10);
    
    e.target.value = '+7' + digits;
    validateForm();
};

nameInput.oninput = validateForm;
areaInput.oninput = updateCalc;

function validateForm() {
    const phoneDigits = phoneInput.value.slice(2).replace(/\D/g, '');
    const isPhoneValid = phoneDigits.length === 10;
    const isNameValid = nameInput.value.trim().length > 1;
    const isAreaValid = areaInput.value.length > 0;
    
    sendBtn.disabled = !(isPhoneValid && isNameValid && isAreaValid);
}

// 4. СИНХРОНИЗАЦИЯ С TELEGRAM
async function sendOrder() {
    const status = document.getElementById('status');
    status.innerText = "ОТПРАВЛЯЕМ...";
    
    const clientName = nameInput.value;
    const clientPhone = phoneInput.value;
    const objectType = document.getElementById('type').options[document.getElementById('type').selectedIndex].text;
    const objectArea = areaInput.value;
    const finalPrice = document.getElementById('v-total').innerText;
    const clientTZ = document.getElementById('tz').value || "Не указано";

    // Твои данные
    const BOT_TOKEN = '8024983218:AAEOib7wTWosOWoB-shxkYmV_4iZMdvE3sk';
    const CHAT_ID = '1044406442';

    const message = `🚀 *НОВАЯ ЗАЯВКА V15*\n\n` +
                    `👤 Имя: ${clientName}\n` +
                    `📞 Тел: ${clientPhone}\n` +
                    `🏗 Тип: ${objectType}\n` +
                    `📏 Площадь: ${objectArea} м²\n` +
                    `💰 Смета: ${finalPrice}\n` +
                    `📝 ТЗ: ${clientTZ}`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (response.ok) {
            status.innerText = "✅ ОТПРАВЛЕНО УСПЕШНО!";
            // Очистка формы
            nameInput.value = "";
            areaInput.value = "";
            document.getElementById('tz').value = "";
            phoneInput.value = "+7";
            updateCalc();
        } else {
            status.innerText = "❌ ОШИБКА ОТПРАВКИ";
        }
    } catch (error) {
        status.innerText = "❌ ОШИБКА СЕТИ";
    }
}

// 5. АНИМАЦИЯ ФОНА (Plexus Effect)
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let points = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    points = [];
    for (let i = 0; i < 40; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7
        });
    }
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(0, 242, 255, 0.3)";
    ctx.lineWidth = 1;

    points.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        for (let j = i + 1; j < points.length; j++) {
            let dist = Math.hypot(p.x - points[j].x, p.y - points[j].y);
            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(drawCanvas);
}

window.addEventListener('resize', initCanvas);
initCanvas();
drawCanvas();

// 6. БЕЗОПАСНОСТЬ (Блокировка F12 и Ctrl+U)
document.onkeydown = (e) => {
    if (e.keyCode === 123 || (e.ctrlKey && e.keyCode === 85)) return false;
};