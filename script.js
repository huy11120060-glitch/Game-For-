let currentGame = null;
let is2048Ready = false;
let memTimer = null;
let aimTimer = null;

function openGame(gameName) {
    currentGame = gameName;
    clearInterval(memTimer);
    clearInterval(aimTimer);

    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game-2048').classList.remove('active');
    document.getElementById('game-memory').classList.remove('active');
    document.getElementById('game-aim').classList.remove('active');

    document.getElementById('btn-2048').classList.remove('active');
    document.getElementById('btn-memory').classList.remove('active');
    document.getElementById('btn-aim').classList.remove('active');

    document.getElementById('game-' + gameName).classList.add('active');
    document.getElementById('btn-' + gameName).classList.add('active');

    if (gameName === '2048') {
        if (!is2048Ready) {
            init2048();
            is2048Ready = true;
        }
    } else if (gameName === 'memory') {
        startMemoryLevel(0);
    } else if (gameName === 'aim') {
        initAimLab();
    }
}

function goHome() {
    currentGame = null;
    clearInterval(memTimer);
    clearInterval(aimTimer);

    document.getElementById('game-2048').classList.remove('active');
    document.getElementById('game-memory').classList.remove('active');
    document.getElementById('game-aim').classList.remove('active');

    document.getElementById('btn-2048').classList.remove('active');
    document.getElementById('btn-memory').classList.remove('active');
    document.getElementById('btn-aim').classList.remove('active');

    document.getElementById('welcome-screen').style.display = 'flex';
}

document.getElementById('btn-2048').addEventListener('click', () => openGame('2048'));
document.getElementById('btn-memory').addEventListener('click', () => openGame('memory'));
document.getElementById('btn-aim').addEventListener('click', () => openGame('aim'));
document.getElementById('back-2048').addEventListener('click', goHome);
document.getElementById('back-memory').addEventListener('click', goHome);
document.getElementById('back-aim').addEventListener('click', goHome);
document.getElementById('restart-memory').addEventListener('click', () => startMemoryLevel(0));
document.getElementById('restart-aim').addEventListener('click', initAimLab);
