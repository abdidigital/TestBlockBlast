document.addEventListener('DOMContentLoaded', () => {
    // === Elemen DOM ===
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const piecesContainer = document.getElementById('block-pieces');

    // === Konfigurasi Game ===
    const GRID_SIZE = 8;
    const blockColors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
    const blockShapes = {
        'dot': { shape: [[1]], color: blockColors[0] },
        'I2': { shape: [[1, 1]], color: blockColors[1] },
        'I3': { shape: [[1, 1, 1]], color: blockColors[1] },
        'L2': { shape: [[1, 0], [1, 1]], color: blockColors[2] },
        'L3': { shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: blockColors[2] },
        'square': { shape: [[1, 1], [1, 1]], color: blockColors[3] },
        'T': { shape: [[1, 1, 1], [0, 1, 0]], color: blockColors[4] },
    };

    // === State Game ===
    let score = 0;
    let gameGrid = []; // Array 2D untuk menyimpan status papan
    let draggedPiece = null; // Menyimpan info blok yang sedang diseret

    // === INISIALISASI GAME ===
    function initializeGame() {
        createGridState();
        createGridUI();
        generateNewPieces();
    }

    // Membuat state internal papan (0 = kosong, 1 = terisi)
    function createGridState() {
        gameGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    }

    // Membuat UI papan permainan di HTML
    function createGridUI() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 40px)`;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                gameBoard.appendChild(cell);
            }
        }
    }

    // === LOGIKA BLOK ===
    function generateNewPieces() {
        piecesContainer.innerHTML = '';
        const shapeKeys = Object.keys(blockShapes);

        for (let i = 0; i < 3; i++) {
            const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
            const pieceData = blockShapes[randomKey];
            const pieceElement = createPieceElement(pieceData);
            piecesContainer.appendChild(pieceElement);
        }
    }

    function createPieceElement(pieceData) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece');
        pieceElement.draggable = true;
        pieceElement.dataset.shape = JSON.stringify(pieceData.shape);
        pieceElement.dataset.color = pieceData.color;

        // Render bentuk blok secara visual
        const shape = pieceData.shape;
        pieceElement.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;

        shape.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('piece-cell');
                if (cell === 1) {
                    cellDiv.classList.add(pieceData.color);
                }
                pieceElement.appendChild(cellDiv);
            });
        });
        return pieceElement;
    }

    // === LOGIKA DRAG & DROP ===
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('piece')) {
            draggedPiece = e.target;
            // Sedikit delay agar browser sempat 'mengambil' gambar blok
            setTimeout(() => e.target.style.visibility = 'hidden', 0);
        }
    });

    document.addEventListener('dragend', (e) => {
        if (draggedPiece) {
            draggedPiece.style.visibility = 'visible';
            draggedPiece = null;
        }
    });

    gameBoard.addEventListener('dragover', (e) => {
        e.preventDefault(); // Wajib agar event 'drop' bisa berfungsi
    });

    gameBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!draggedPiece || !e.target.classList.contains('grid-cell')) return;

        const shape = JSON.parse(draggedPiece.dataset.shape);
        const color = draggedPiece.dataset.color;
        const targetCell = e.target;
        const startRow = parseInt(targetCell.dataset.row);
        const startCol = parseInt(targetCell.dataset.col);

        if (canPlaceBlock(shape, startRow, startCol)) {
            placeBlock(shape, startRow, startCol, color);
            draggedPiece.remove(); // Hapus blok dari pilihan
            updateScore(shape.flat().reduce((a, b) => a + b, 0)); // Skor per blok
            clearLines();

            if (piecesContainer.children.length === 0) {
                generateNewPieces();
            }
            checkGameOver();
        }
    });

    // === FUNGSI UTAMA GAME ===
    function canPlaceBlock(shape, startRow, startCol) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    const boardRow = startRow + r;
                    const boardCol = startCol + c;
                    // Cek apakah di luar papan atau sudah terisi
                    if (boardRow >= GRID_SIZE || boardCol >= GRID_SIZE || gameGrid[boardRow][boardCol] === 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function placeBlock(shape, startRow, startCol, color) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    const boardRow = startRow + r;
                    const boardCol = startCol + c;
                    gameGrid[boardRow][boardCol] = 1; // Update state
                    const cell = gameBoard.querySelector(`[data-row='${boardRow}'][data-col='${boardCol}']`);
                    cell.classList.add(color, 'filled'); // Update UI
                }
            }
        }
    }

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = score;
    }

    function clearLines() {
        let linesToClear = { rows: [], cols: [] };

        // Cek baris penuh
        for (let r = 0; r < GRID_SIZE; r++) {
            if (gameGrid[r].every(cell => cell === 1)) {
                linesToClear.rows.push(r);
            }
        }

        // Cek kolom penuh
        for (let c = 0; c < GRID_SIZE; c++) {
            if (gameGrid.every(row => row[c] === 1)) {
                linesToClear.cols.push(c);
            }
        }

        // Membersihkan baris
        linesToClear.rows.forEach(r => {
            updateScore(10); // Skor bonus
            for (let c = 0; c < GRID_SIZE; c++) {
                gameGrid[r][c] = 0;
                const cell = gameBoard.querySelector(`[data-row='${r}'][data-col='${c}']`);
                cell.className = 'grid-cell';
            }
        });

        // Membersihkan kolom
        linesToClear.cols.forEach(c => {
            updateScore(10); // Skor bonus
            for (let r = 0; r < GRID_SIZE; r++) {
                gameGrid[r][c] = 0;
                const cell = gameBoard.querySelector(`[data-row='${r}'][data-col='${c}']`);
                cell.className = 'grid-cell';
            }
        });
    }

    function checkGameOver() {
        const availablePieces = piecesContainer.getElementsByClassName('piece');
        if (availablePieces.length === 0) return;

        for (let piece of availablePieces) {
            const shape = JSON.parse(piece.dataset.shape);
            // Cek apakah ada satu saja tempat yang mungkin untuk blok ini
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (canPlaceBlock(shape, r, c)) {
                        return; // Game belum berakhir
                    }
                }
            }
        }
        
        // Jika loop selesai tanpa return, berarti game over
        setTimeout(() => {
            alert(`Game Over! Skor Akhir: ${score}`);
            initializeGame(); // Mulai ulang game
        }, 200);
    }

    // === Mulai Game ===
    initializeGame();
});
            
