document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const gridSize = 8;
    let score = 0;

    // 1. Inisialisasi Papan Permainan
    function createBoard() {
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = Math.floor(i / gridSize);
            cell.dataset.col = i % gridSize;
            gameBoard.appendChild(cell);
        }
    }

    // 2. Definisi Bentuk Blok (contoh sederhana)
    // '1' berarti bagian dari blok, '0' berarti kosong
    const blocks = {
        square: [
            [1, 1],
            [1, 1]
        ],
        L_shape: [
            [1, 0],
            [1, 0],
            [1, 1]
        ]
        // ... definisikan bentuk lainnya
    };

    // 3. Logika Inti (fungsi yang perlu dibuat)
    function generateRandomBlocks() {
        // TODO: Ambil 3 blok acak dari `blocks` dan tampilkan di div #block-pieces
    }

    function handleDragStart(event) {
        // TODO: Logika saat mulai menyeret blok
    }

    function handleDrop(event) {
        // TODO: Logika saat blok dilepaskan di papan
        // - Periksa apakah penempatan valid
        // - Update tampilan papan
        // - Panggil checkLines()
        // - Update skor
        // - Cek kondisi game over
    }

    function checkLines() {
        // TODO:
        // - Periksa setiap baris dan kolom.
        // - Jika ada yang penuh, hapus, dan geser blok di atasnya (jika perlu).
        // - Tambahkan skor bonus.
    }

    // --- Inisialisasi Game ---
    createBoard();
    generateRandomBlocks();

    // --- Integrasi Telegram ---
    const tg = window.Telegram.WebApp;
    tg.ready(); // Memberi tahu Telegram bahwa aplikasi sudah siap

    // Contoh mengirim skor ke bot
    function sendScore() {
        // Anda bisa mengirim data ke bot melalui backend
        // tg.sendData(JSON.stringify({ score: score }));
        tg.HapticFeedback.notificationOccurred('success'); // Memberi getaran
    }
});
