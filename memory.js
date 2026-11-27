const allIcons = new Array('🚀', '🍕', '🎧', '🐶', '🌵', '⚡', '💎', '🎮', '🦊', '🍔', '🎸', '🛸', '🎯', '🏆', '🦄');
const memLevels = new Array(
    { pairs: 6, cols: 4, size: '72px', font: '2rem', time: 35 },
    { pairs: 6, cols: 4, size: '72px', font: '2rem', time: 25 },
    { pairs: 8, cols: 4, size: '72px', font: '2rem', time: 45 },
    { pairs: 8, cols: 4, size: '72px', font: '2rem', time: 35 },
    { pairs: 10, cols: 5, size: '64px', font: '1.75rem', time: 55 },
    { pairs: 10, cols: 5, size: '64px', font: '1.75rem', time: 45 },
    { pairs: 12, cols: 6, size: '56px', font: '1.5rem', time: 65 },
    { pairs: 12, cols: 6, size: '56px', font: '1.5rem', time: 55 },
    { pairs: 15, cols: 6, size: '54px', font: '1.4rem', time: 75 },
    { pairs: 15, cols: 6, size: '54px', font: '1.4rem', time: 60 }
);

let currentLevelIdx = 0;
let flippedCards = new Array();
let memMatches = 0;
let memTimeLeft = 0;
let lockBoard = false;

document.getElementById('back-memory').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
});

document.getElementById('fullscreen-memory').addEventListener('click', () => {
    const sec = document.getElementById('game-memory');
    if (!document.fullscreenElement) sec.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
});

document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-memory');
    if (btn) btn.innerText = document.fullscreenElement === document.getElementById('game-memory') ? '🗗 Thu nhỏ' : '⛶ Toàn màn hình';
});

function showMemModal(title, msg, btnText, nextLevel) {
    const modal = document.getElementById('modal-memory');
    modal.style.display = 'flex';
    modal.innerHTML =
        '<div class="aim-result-box">' +
            '<h3>' + title + '</h3>' +
            '<p>' + msg + '</p>' +
            '<button type="button" class="action-btn" id="modal-mem-btn" style="margin-top:14px;">' + btnText + '</button>' +
        '</div>';
    document.getElementById('modal-mem-btn').addEventListener('click', () => startMemoryLevel(nextLevel));
}

function startMemoryLevel(levelIdx) {
    clearInterval(memTimer);
    document.getElementById('modal-memory').style.display = 'none';
    currentLevelIdx = levelIdx;
    const cfg = memLevels.at(levelIdx);
    const board = document.getElementById('board-memory');
    
    board.innerHTML = '';
    board.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', ' + cfg.size + ')';

    let levelIcons = allIcons.slice(0, cfg.pairs);
    let deck = levelIcons.concat(levelIcons).sort(() => Math.random() - 0.5);

    flippedCards = new Array();
    memMatches = 0;
    memTimeLeft = cfg.time;
    lockBoard = false;

    const timeEl = document.getElementById('mem-time');
    timeEl.innerText = memTimeLeft;
    timeEl.classList.remove('time-warning');

    document.getElementById('mem-level').innerText = (levelIdx + 1) + '/10';
    document.getElementById('mem-matches').innerText = '0/' + cfg.pairs;

    memTimer = setInterval(() => {
        memTimeLeft--;
        timeEl.innerText = memTimeLeft;
        if (10 >= memTimeLeft) timeEl.classList.add('time-warning');
        if (0 >= memTimeLeft) {
            clearInterval(memTimer);
            lockBoard = true;
            showMemModal('⏱️ Hết Giờ!', 'Bạn dừng bước ở Màn ' + (levelIdx + 1) + '/10.', 'Chơi Lại Từ Màn 1', 0);
        }
    }, 1000);

    deck.forEach(icon => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.width = cfg.size;
        card.style.height = cfg.size;
        card.style.fontSize = cfg.font;
        card.dataset.icon = icon;
        card.innerText = icon;

        card.addEventListener('click', () => {
            if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;
            card.classList.add('flipped');
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                lockBoard = true;
                const c1 = flippedCards.at(0);
                const c2 = flippedCards.at(1);

                if (c1.dataset.icon === c2.dataset.icon) {
                    c1.classList.add('matched');
                    c2.classList.add('matched');
                    memMatches++;
                    document.getElementById('mem-matches').innerText = memMatches + '/' + cfg.pairs;
                    flippedCards = new Array();
                    lockBoard = false;

                    if (memMatches === cfg.pairs) {
                        clearInterval(memTimer);
                        setTimeout(() => {
                            if (memLevels.length > currentLevelIdx + 1) {
                                showMemModal('🎉 Hoàn Thành Màn ' + (currentLevelIdx + 1) + '!', 'Thời gian còn dư: <strong>' + memTimeLeft + 's</strong>', 'Sang Màn ' + (currentLevelIdx + 2), currentLevelIdx + 1);
                            } else {
                                showMemModal('🏆 Phá Đảo 10/10 Màn!', 'Bạn đã chinh phục toàn bộ thử thách trí nhớ!', 'Chơi Lại Từ Đầu', 0);
                            }
                        }, 300);
                    }
                } else {
                    setTimeout(() => {
                        c1.classList.remove('flipped');
                        c2.classList.remove('flipped');
                        flippedCards = new Array();
                        lockBoard = false;
                    }, 600);
                }
            }
        });
        board.appendChild(card);
    });
}
