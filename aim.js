let aimScore = 0;
let aimClicks = 0;
let aimTimeLeft = 30;
let aimStarted = false;
let aimEnded = false;
let aimMoveTimeout = null;

// Tự động đọc tốc độ chuột đã lưu từ lần trước (nếu chưa có thì mặc định là 1.00)
let savedSens = parseFloat(localStorage.getItem('aim_saved_sens'));
let aimSens = (!isNaN(savedSens) && savedSens >= 0.05 && 10 >= savedSens) ? savedSens : 1.00;

let camYaw = 0;
let camPitch = 0;
let targetYaw = 0;
let targetPitch = 0;

const sensRange = document.getElementById('aim-sens-range');
const sensInput = document.getElementById('aim-sens-input');

// Hiển thị ngay thông số độ nhạy đã lưu lên thanh trượt và ô nhập
sensInput.value = aimSens.toFixed(2);
if (3.0 >= aimSens) sensRange.value = aimSens;

sensRange.addEventListener('input', () => {
    aimSens = parseFloat(sensRange.value) || 1.00;
    sensInput.value = aimSens.toFixed(2);
    localStorage.setItem('aim_saved_sens', aimSens.toFixed(2));
});

sensInput.addEventListener('change', () => {
    let val = parseFloat(sensInput.value);
    if (isNaN(val) || 0.05 > val) val = 0.05;
    if (val > 10) val = 10;
    aimSens = val;
    sensInput.value = val.toFixed(2);
    if (3.0 >= val) sensRange.value = val;
    localStorage.setItem('aim_saved_sens', aimSens.toFixed(2));
});

function restartAimWithLock() {
    const wasFullscreen = !!document.fullscreenElement;
    initAimLab();
    if (wasFullscreen) {
        const arena = document.getElementById('aim-arena');
        if (arena.requestPointerLock) arena.requestPointerLock();
    }
}

document.getElementById('restart-aim').addEventListener('click', restartAimWithLock);

document.getElementById('back-aim').addEventListener('click', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
});

function getAimConfig() {
    const diffKey = document.getElementById('aim-diff').value;
    if (diffKey === 'easy') return { delay: 1800, size: 58 };
    if (diffKey === 'hard') return { delay: 750, size: 38 };
    return { delay: 1100, size: 48 };
}

function initAimLab() {
    clearInterval(aimTimer);
    clearTimeout(aimMoveTimeout);
    if (document.pointerLockElement) document.exitPointerLock();

    aimScore = 0;
    aimClicks = 0;
    aimStarted = false;
    aimEnded = false;
    camYaw = 0;
    camPitch = 0;

    const mode = document.getElementById('aim-mode').value;
    const timeEl = document.getElementById('aim-time');
    timeEl.classList.remove('time-warning');

    if (mode === 'timed') {
        aimTimeLeft = 30;
        timeEl.innerText = '30s';
    } else {
        aimTimeLeft = 999999;
        timeEl.innerText = '∞';
    }

    document.getElementById('aim-score').innerText = '0';
    document.getElementById('aim-acc').innerText = '100';

    setupAimArena();
    spawnAimTarget();
}

function setupAimArena() {
    const arena = document.getElementById('aim-arena');
    arena.innerHTML = '';

    const world = document.createElement('div');
    world.id = 'aim-world';
    world.className = 'aim-world';

    const faces = new Array('wall-front', 'wall-left', 'wall-right', 'wall-floor', 'wall-ceiling');
    faces.forEach(cls => {
        const f = document.createElement('div');
        f.className = 'room-face ' + cls;
        world.appendChild(f);
    });

    const target = document.createElement('div');
    target.id = 'fps-target';
    target.className = 'aim-target';
    world.appendChild(target);

    arena.appendChild(world);

    const crosshair = document.createElement('div');
    crosshair.className = 'aim-crosshair';
    arena.appendChild(crosshair);

    const overlay = document.createElement('div');
    overlay.id = 'aim-overlay';
    overlay.className = 'aim-overlay';
    overlay.innerHTML = '🖱️ Bấm vào phòng tập để khóa chuột & ngắm bắn<br>(Phòng tập 3D Greybox — Nhấn ESC để thả chuột)';
    arena.appendChild(overlay);
}

function renderAimWorld() {
    const world = document.getElementById('aim-world');
    if (!world) return;
    world.style.transform = 'translateZ(550px) rotateX(' + (-camPitch) + 'deg) rotateY(' + camYaw + 'deg)';
}

function spawnAimTarget() {
    if (aimEnded) return;
    clearTimeout(aimMoveTimeout);

    const target = document.getElementById('fps-target');
    if (!target) return;

    const cfg = getAimConfig();
    target.style.width = cfg.size + 'px';
    target.style.height = cfg.size + 'px';
    target.style.marginLeft = (-cfg.size / 2) + 'px';
    target.style.marginTop = (-cfg.size / 2) + 'px';

    targetYaw = Math.floor(Math.random() * 44) - 22;
    targetPitch = Math.floor(Math.random() * 26) - 13;

    target.style.transform = 'rotateY(' + (-targetYaw) + 'deg) rotateX(' + targetPitch + 'deg) translateZ(-520px)';
    renderAimWorld();

    if (aimStarted && !aimEnded) {
        aimMoveTimeout = setTimeout(spawnAimTarget, cfg.delay);
    }
}

function startAimCountdown() {
    if (aimStarted || aimEnded) return;
    aimStarted = true;
    spawnAimTarget();

    const mode = document.getElementById('aim-mode').value;
    if (mode === 'endless') return;

    const timeEl = document.getElementById('aim-time');
    aimTimer = setInterval(() => {
        aimTimeLeft--;
        timeEl.innerText = aimTimeLeft + 's';
        if (10 >= aimTimeLeft) timeEl.classList.add('time-warning');
        if (0 >= aimTimeLeft) finishAimGame('⏱️ Hết Giờ!');
    }, 1000);
}

function finishAimGame(reasonText) {
    if (aimEnded) return;
    aimEnded = true;
    clearInterval(aimTimer);
    clearTimeout(aimMoveTimeout);
    if (document.pointerLockElement) document.exitPointerLock();

    let finalAcc = aimClicks > 0 ? Math.round((aimScore / aimClicks) * 100) : 0;
    const overlay = document.getElementById('aim-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.innerHTML =
            '<div class="aim-result-box">' +
                '<h3>' + reasonText + '</h3>' +
                '<p>🎯 Mục tiêu bắn trúng: <strong>' + aimScore + '</strong></p>' +
                '<p>📊 Độ chính xác: <strong>' + finalAcc + '%</strong></p>' +
                '<button type="button" class="action-btn" id="modal-replay-btn" style="margin-top:14px;">Chơi Lại Ngay</button>' +
            '</div>';

        const replayBtn = document.getElementById('modal-replay-btn');
        replayBtn.addEventListener('mousedown', (e) => e.stopPropagation());
        replayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            restartAimWithLock();
        });
    }
}

function updateAimStats() {
    document.getElementById('aim-score').innerText = aimScore;
    let acc = aimClicks > 0 ? Math.round((aimScore / aimClicks) * 100) : 100;
    document.getElementById('aim-acc').innerText = acc;
}

document.getElementById('aim-arena').addEventListener('mousedown', () => {
    if (aimEnded) return;
    const arena = document.getElementById('aim-arena');

    if (document.pointerLockElement !== arena) {
        arena.requestPointerLock();
        return;
    }

    startAimCountdown();
    aimClicks++;

    const cfg = getAimConfig();
    const hitAngle = (cfg.size / 2) / 9.2;
    const distAngle = Math.hypot(camYaw - targetYaw, camPitch - targetPitch);

    if (distAngle <= hitAngle) {
        aimScore++;
        updateAimStats();
        spawnAimTarget();
    } else {
        updateAimStats();
    }
});

document.addEventListener('mousemove', (e) => {
    const arena = document.getElementById('aim-arena');
    if (document.pointerLockElement === arena && !aimEnded) {
        camYaw += e.movementX * 0.12 * aimSens;
        camPitch += e.movementY * 0.12 * aimSens;

        if (camYaw > 42) camYaw = 42;
        if (-42 > camYaw) camYaw = -42;
        if (camPitch > 26) camPitch = 26;
        if (-26 > camPitch) camPitch = -26;

        renderAimWorld();
    }
});

document.addEventListener('pointerlockchange', () => {
    const arena = document.getElementById('aim-arena');
    const overlay = document.getElementById('aim-overlay');
    if (!overlay) return;

    if (document.pointerLockElement === arena) {
        overlay.style.display = 'none';
        startAimCountdown();
    } else if (!aimEnded) {
        overlay.style.display = 'flex';
    }
});

document.getElementById('aim-mode').addEventListener('change', initAimLab);
document.getElementById('aim-diff').addEventListener('change', initAimLab);
document.getElementById('stop-aim').addEventListener('click', () => finishAimGame('🏁 Kết Quả Luyện Tập'));

document.getElementById('fullscreen-aim').addEventListener('click', () => {
    const aimSection = document.getElementById('game-aim');
    if (!document.fullscreenElement) {
        aimSection.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
});

document.addEventListener('fullscreenchange', () => {
    const fsBtn = document.getElementById('fullscreen-aim');
    fsBtn.innerText = document.fullscreenElement ? '🗗 Thu nhỏ' : '⛶ Toàn màn hình';
});
