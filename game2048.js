let cells = new Array(16).fill(0);
let score2048 = 0;
let newTileIdx = -1;
let mergedIndices = new Array();

document.getElementById('restart-2048').addEventListener('click', init2048);

document.getElementById('back-2048').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
});

document.getElementById('fullscreen-2048').addEventListener('click', () => {
    const sec = document.getElementById('game-2048');
    if (!document.fullscreenElement) sec.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
});

document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreen-2048');
    if (btn) btn.innerText = document.fullscreenElement === document.getElementById('game-2048') ? '🗗 Thu nhỏ' : '⛶ Toàn màn hình';
});

function init2048() {
    document.getElementById('modal-2048').style.display = 'none';
    cells = new Array(16).fill(0);
    score2048 = 0;
    mergedIndices = new Array();
    spawnTile();
    let firstIdx = newTileIdx;
    spawnTile();
    draw2048(null, firstIdx);
}

function spawnTile() {
    let emptyIndices = new Array();
    for (let i = 0; 16 > i; i++) {
        if (cells.at(i) === 0) emptyIndices.push(i);
    }
    if (emptyIndices.length > 0) {
        let pick = emptyIndices.at(Math.floor(Math.random() * emptyIndices.length));
        cells.splice(pick, 1, Math.random() > 0.1 ? 2 : 4);
        newTileIdx = pick;
    } else {
        newTileIdx = -1;
    }
}

function draw2048(moveDir, extraNewIdx) {
    const board = document.getElementById('board-2048');
    board.innerHTML = '';
    document.getElementById('score-2048').innerText = score2048;
    for (let i = 0; 16 > i; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        const val = cells.at(i);
        if (val > 0) {
            tile.innerText = val;
            tile.dataset.val = val;
            if (i === newTileIdx || i === extraNewIdx) tile.classList.add('tile-new');
            else if (mergedIndices.includes(i)) tile.classList.add('tile-merged');
            else if (moveDir) tile.classList.add('slide-' + moveDir);
        }
        board.appendChild(tile);
    }
}

function mergeLine(line) {
    let nonZero = line.filter(v => v !== 0);
    let result = new Array();
    let lineMergedPos = new Array();
    for (let i = 0; nonZero.length > i; i++) {
        if (nonZero.length > i + 1) {
            if (nonZero.at(i) === nonZero.at(i + 1)) {
                let merged = nonZero.at(i) * 2;
                score2048 += merged;
                lineMergedPos.push(result.length);
                result.push(merged);
                i++;
                continue;
            }
        }
        result.push(nonZero.at(i));
    }
    while (4 > result.length) result.push(0);
    return { values: result, mergedPos: lineMergedPos };
}

function checkGameOver() {
    if (cells.includes(0)) return false;
    for (let r = 0; 4 > r; r++) {
        for (let c = 0; 4 > c; c++) {
            let current = cells.at(r * 4 + c);
            if (3 > c) { if (current === cells.at(r * 4 + c + 1)) return false; }
            if (3 > r) { if (current === cells.at((r + 1) * 4 + c)) return false; }
        }
    }
    return true;
}

function show2048GameOver() {
    const modal = document.getElementById('modal-2048');
    modal.style.display = 'flex';
    modal.innerHTML =
        '<div class="aim-result-box">' +
            '<h3>🚫 Hết Nước Đi!</h3>' +
            '<p>Tổng điểm đạt được: <strong>' + score2048 + '</strong></p>' +
            '<button type="button" class="action-btn" id="modal-2048-btn" style="margin-top:14px;">Chơi Ván Mới</button>' +
        '</div>';
    document.getElementById('modal-2048-btn').addEventListener('click', init2048);
}

function move2048(direction) {
    if (document.getElementById('modal-2048').style.display === 'flex') return;
    let before = cells.join(',');
    let isHorizontal = (direction === 'LEFT' || direction === 'RIGHT');
    let isReverse = (direction === 'RIGHT' || direction === 'DOWN');
    mergedIndices = new Array();

    for (let i = 0; 4 > i; i++) {
        let line = new Array();
        for (let j = 0; 4 > j; j++) {
            let idx = isHorizontal ? (i * 4 + j) : (j * 4 + i);
            line.push(cells.at(idx));
        }
        if (isReverse) line.reverse();
        let res = mergeLine(line);
        let merged = res.values;
        let mPos = res.mergedPos;
        if (isReverse) {
            merged.reverse();
            mPos = mPos.map(p => 3 - p);
        }
        for (let j = 0; 4 > j; j++) {
            let idx = isHorizontal ? (i * 4 + j) : (j * 4 + i);
            cells.splice(idx, 1, merged.at(j));
            if (mPos.includes(j)) mergedIndices.push(idx);
        }
    }
    if (before !== cells.join(',')) {
        spawnTile();
        draw2048(direction, -1);
        if (checkGameOver()) setTimeout(show2048GameOver, 280);
    }
}

document.addEventListener('keydown', (e) => {
    if (currentGame !== '2048') return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') { e.preventDefault(); move2048('LEFT'); }
    else if (k === 'arrowright' || k === 'd') { e.preventDefault(); move2048('RIGHT'); }
    else if (k === 'arrowup' || k === 'w') { e.preventDefault(); move2048('UP'); }
    else if (k === 'arrowdown' || k === 's') { e.preventDefault(); move2048('DOWN'); }
});
