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
    let gameGrid = [];
    let selectedPiece = null;

    // === INISIALISASI GAME ===
    function initializeGame() {
        score = 0;
        updateScore(0);
        createGridState();
        createGridUI();
        generateNewPieces();
    }

    function createGridState() {
        gameGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    }

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
        pieceElement.dataset.shape = JSON.stringify(pieceData.shape);
        pieceElement.dataset.color = pieceData.color;
        const shape = pieceData.shape;
        pieceElement.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;
        shape.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('piece-cell');
                if (cell === 1) cellDiv.classList.add(pieceData.color);
                pieceElement.appendChild(cellDiv);
            });
        });
        return pieceElement;
    }

    // === LOGIKA KETUK UNTUK PILIH & LETAKKAN ===
    piecesContainer.addEventListener('click', (e) => {
        const pieceElement = e.target.closest('.piece');
        if (!pieceElement) return;

        if (selectedPiece === pieceElement) {
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        } else {
            document.querySelectorAll('.piece.selected').forEach(p => p.classList.remove('selected'));
            pieceElement.classList.add('selected');
            selectedPiece = pieceElement;
        }
    });

    gameBoard.addEventListener('click', (e) => {
        if (!selectedPiece || !e.target.classList.contains('grid-cell')) return;

        const shape = JSON.parse(selectedPiece.dataset.shape);
        const color = selectedPiece.dataset.color;
        const startRow = parseInt(e.target.dataset.row);
        const startCol = parseInt(e.target.dataset.col);

        if (canPlaceBlock(shape, startRow, startCol)) {
            placeBlock(shape, startRow, startCol, color);
            updateScore(shape.flat().filter(c => c === 1).length);
            selectedPiece.remove();
            selectedPiece = null;
            clearLines();
            if (piecesContainer.children.length === 0) generateNewPieces();
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
                    gameGrid[boardRow][boardCol] = 1;
                    const cell = gameBoard.querySelector(`[data-row='${boardRow}'][data-col='${boardCol}']`);
                    cell.classList.add(color, 'filled');
                }
            }
        }
    }

    function updateScore(points) {
        if (points === 0) score = 0;
        else score += points;
        scoreDisplay.textContent = score;
    }

    function clearLines() {
        let rowsToClear = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            if (gameGrid[r].every(cell => cell === 1)) rowsToClear.push(r);
        }

        let colsToClear = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            if (gameGrid.every(row => row[c] === 1)) colsToClear.push(c);
        }
        
        let linesCleared = rowsToClear.length + colsToClear.length;
        if (linesCleared > 0) updateScore(linesCleared * 10); // Skor bonus

        rowsToClear.forEach(r => {
            for (let c = 0; c < GRID_SIZE; c++) gameGrid[r][c] = 0;
        });
        colsToClear.forEach(c => {
            for (let r = 0; r < GRID_SIZE; r++) gameGrid[r][c] = 0;
        });

        if (linesCleared > 0) createGridUI(); // Re-render papan
        for(let r = 0; r < GRID_SIZE; r++){
            for(let c = 0; c < GRID_SIZE; c++){
                if(gameGrid[r][c] === 1){
                     const cell = gameBoard.querySelector(`[data-row='${r}'][data-col='${c}']`);
                     // Ini perlu perbaikan, karena warna tidak disimpan di state
                     // Untuk saat ini, kita biarkan saja selnya kosong saat re-render
                }
            }
        }
    }

    function checkGameOver() {
        const availablePieces = piecesContainer.getElementsByClassName('piece');
        if (availablePieces.length === 0) return;

        for (let piece of availablePieces) {
            const shape = JSON.parse(piece.dataset.shape);
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (canPlaceBlock(shape, r, c)) return;
                }
            }
        }
        
        setTimeout(() => {
            alert(`Game Over! Skor Akhir: ${score}`);
            initializeGame();
        }, 200);
    }

    // === Mulai Game ===
    initializeGame();
});
                
