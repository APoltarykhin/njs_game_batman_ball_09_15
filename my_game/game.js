// Получаем доступ к холсту и его контексту для рисования
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Настройки игры
let score = 0;
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 3,
    dx: 3,
    dy: 3,
    lastDirectionChangeTime: 0,
    directionChangeInterval: 2000
};

// Создаем объект для фоновых изображений
const images = {
    batman: new Image(),
    cityBg: new Image()
};
images.batman.src = 'btmn.png'; // Твоя картинка Бэтмена
images.cityBg.src = 'gtm.png';  // Твоя картинка города

// ПЕРЕМЕННЫЕ ДЛЯ НОВОЙ ЛОГИКИ ФОНА
let bgOffset = 0; // Текущее смещение фона
const bgSpeed = 0.5; // Коэффициент скорости фона относительно скорости Бэтмена

// Функция для случайного изменения направления
function changeDirection() {
    let randomAngle = Math.random() * Math.PI * 2;
    ball.dx = Math.cos(randomAngle) * ball.speed;
    ball.dy = Math.sin(randomAngle) * ball.speed;
}

// ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТРИСОВКИ ФОНА
function drawBackground() {
    // 1. Рисуем градиентное небо (основа)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#0c1445');
    skyGradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Рисуем статичные звезды
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 12345) % canvas.width;
        const y = (i * 4321) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }

    // 3. ЛОГИКА БЕСКОНЕЧНОГО ГОРОДА (УПРОЩЕННАЯ И НАДЕЖНАЯ)
    const cityY = canvas.height - images.cityBg.height;

    // Сдвигаем фон. Если Бэтмен летит ВПРАВО (ball.dx > 0), фон должен ехать ВЛЕВО.
    bgOffset -= ball.dx * bgSpeed;

    // ВАЖНОЕ ИСПРАВЛЕНИЕ:
    // Мы хотим, чтобы левый край картинки города никогда не появлялся на экране.
    // Поэтому мы будем рисовать фон не с позиции bgOffset, а с позиции,
    // которая всегда находится в диапазоне от 0 до ширины картинки.
    // Это создаст эффект "бесконечного зацикленного" фона без видимых швов.

    // Вычисляем видимое смещение в пределах ширины картинки
    let visibleOffset = bgOffset % images.cityBg.width;
    // Если смещение отрицательное, преобразуем его в положительное
    if (visibleOffset < 0) {
        visibleOffset += images.cityBg.width;
    }

    // Теперь visibleOffset всегда между 0 и images.cityBg.width.
    // Рисуем две копии города:
    // 1. Основная копия: сдвинута на -visibleOffset, чтобы левый край никогда не показывался
    // 2. Вторая копия: сразу справа от основной
    ctx.drawImage(images.cityBg, -visibleOffset, cityY);
    ctx.drawImage(images.cityBg, images.cityBg.width - visibleOffset, cityY);
}

// Функция рисования Бэтмена
function drawBall() {
    const imgSize = 40;
    if (images.batman.complete) {
        ctx.drawImage(images.batman, ball.x - imgSize/2, ball.y - imgSize/2, imgSize, imgSize);
    } else {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#0095dd';
        ctx.fill();
        ctx.closePath();
    }
}

// Функция отрисовки счета
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Счет: ' + score, 10, 25);
}

// Основная функция отрисовки
function draw(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground(); // Сначала рисуем фон
    drawBall();       // Затем Бэтмена
    drawScore();      // И счет

    // Двигаем Бэтмена
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Проверяем столкновение со стенками
    if(ball.x + 20 > canvas.width || ball.x - 20 < 0) {
        ball.dx *= -1;
    }
    if(ball.y + 20 > canvas.height || ball.y - 20 < 0) {
        ball.dy *= -1;
    }
    
    // Логика таймера для смены направления
    if (!ball.lastDirectionChangeTime) {
        ball.lastDirectionChangeTime = timestamp;
    }
    const elapsed = timestamp - ball.lastDirectionChangeTime;
    if (elapsed > ball.directionChangeInterval) {
        changeDirection();
        ball.lastDirectionChangeTime = timestamp;
    }

    requestAnimationFrame(draw);
}

// Обработчик клика по Бэтмену
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const imgSize = 40;
    const halfSize = imgSize / 2;

    if (clickX > ball.x - halfSize && clickX < ball.x + halfSize &&
        clickY > ball.y - halfSize && clickY < ball.y + halfSize) {
        score++;
        ball.speed += 0.5;
        ball.directionChangeInterval = Math.max(500, ball.directionChangeInterval - 100);
        changeDirection();
        ball.lastDirectionChangeTime = performance.now();
    }
});

// Запускаем игру после загрузки картинки Бэтмена!
images.batman.onload = function() {
    changeDirection();
    requestAnimationFrame(draw);
};