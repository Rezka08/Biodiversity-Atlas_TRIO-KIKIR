// ============================================
// QUIZ PAGE - GAMIFICATION
// ============================================

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let startTime = null;
let quizHistory = [];
let badges = [];

// ============================================
// QUIZ QUESTIONS DATA
// ============================================

const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "Spesies kadal terbesar di dunia yang hanya ditemukan di Indonesia adalah?",
        options: [
            "Monitor Air Asia",
            "Komodo Dragon",
            "Biawak Raksasa",
            "Iguana Indonesia"
        ],
        correct: 1,
        explanation: "Komodo Dragon (Varanus komodoensis) adalah kadal terbesar di dunia yang hanya ditemukan di Pulau Komodo, Rinca, Flores, dan Gili Motang di Nusa Tenggara. Komodo dapat mencapai panjang hingga 3 meter."
    },
    {
        id: 2,
        question: "Status konservasi Orangutan Sumatera menurut IUCN adalah?",
        options: [
            "Vulnerable (VU)",
            "Endangered (EN)",
            "Critically Endangered (CR)",
            "Least Concern (LC)"
        ],
        correct: 2,
        explanation: "Orangutan Sumatera memiliki status Critically Endangered (CR) karena populasinya yang tersisa hanya sekitar 14.000 individu di alam liar dan mengalami penurunan drastis akibat deforestasi."
    },
    {
        id: 3,
        question: "Burung nasional Indonesia yang menjadi simbol Garuda Pancasila adalah?",
        options: [
            "Burung Cenderawasih",
            "Elang Jawa",
            "Jalak Bali",
            "Burung Rangkong"
        ],
        correct: 1,
        explanation: "Elang Jawa (Nisaetus bartelsi) adalah burung nasional Indonesia dan menjadi simbol Garuda Pancasila. Spesies endemik ini hanya ditemukan di hutan-hutan Jawa."
    },
    {
        id: 4,
        question: "Rafflesia arnoldii terkenal sebagai?",
        options: [
            "Pohon tertinggi di dunia",
            "Bunga terbesar di dunia",
            "Tanaman karnivora terbesar",
            "Lumut tertua di dunia"
        ],
        correct: 1,
        explanation: "Rafflesia arnoldii adalah bunga tunggal terbesar di dunia dengan diameter hingga 1 meter dan berat mencapai 11 kg. Bunga ini bersifat parasit dan hanya mekar selama 5-7 hari."
    },
    {
        id: 5,
        question: "Berapa jumlah populasi Badak Jawa yang tersisa di alam liar?",
        options: [
            "Sekitar 500 individu",
            "Sekitar 250 individu",
            "Sekitar 76 individu",
            "Sekitar 1000 individu"
        ],
        correct: 2,
        explanation: "Badak Jawa adalah salah satu mamalia besar paling langka dengan hanya sekitar 76 individu yang tersisa di Taman Nasional Ujung Kulon, menjadikannya satu-satunya habitat tersisa."
    },
    {
        id: 6,
        question: "Hewan endemik Sulawesi yang dikenal dengan hidung panjang adalah?",
        options: [
            "Bekantan",
            "Tarsius",
            "Anoa",
            "Babirusa"
        ],
        correct: 0,
        explanation: "Bekantan (Nasalis larvatus) adalah primata endemik Kalimantan (bukan Sulawesi) yang terkenal dengan hidung panjangnya, terutama pada jantan dewasa. Hidung ini berfungsi sebagai resonator suara."
    },
    {
        id: 7,
        question: "Lumba-lumba air tawar yang hanya hidup di Sungai Mahakam adalah?",
        options: [
            "Dolphin Mahakam",
            "Pesut Mahakam",
            "Lumba Kalimantan",
            "Orca Mahakam"
        ],
        correct: 1,
        explanation: "Pesut Mahakam (Orcaella brevirostris) adalah populasi lumba-lumba air tawar yang terisolasi di Sungai Mahakam dengan populasi hanya sekitar 70-80 individu, menjadikannya salah satu cetacea paling terancam."
    },
    {
        id: 8,
        question: "Burung endemik Bali yang hampir punah di alam liar adalah?",
        options: [
            "Merak Bali",
            "Jalak Bali",
            "Elang Bali",
            "Nuri Bali"
        ],
        correct: 1,
        explanation: "Jalak Bali (Leucopsar rothschildi) adalah satu-satunya spesies endemik Pulau Bali dengan populasi di alam liar hanya sekitar 50-100 individu, terutama di Taman Nasional Bali Barat."
    },
    {
        id: 9,
        question: "Harimau Sumatera dapat dibedakan dari subspesies harimau lain karena?",
        options: [
            "Paling besar ukurannya",
            "Paling kecil ukurannya",
            "Warna paling terang",
            "Tidak punya garis"
        ],
        correct: 1,
        explanation: "Harimau Sumatera adalah subspesies harimau terkecil dengan populasi sekitar 400-600 individu. Ukurannya yang lebih kecil merupakan adaptasi terhadap habitat hutan hujan tropis Sumatera."
    },
    {
        id: 10,
        question: "Tujuan utama konservasi keanekaragaman hayati adalah?",
        options: [
            "Menghasilkan uang dari pariwisata",
            "Menjaga keseimbangan ekosistem untuk generasi mendatang",
            "Memelihara hewan langka di kebun binatang",
            "Membuat museum satwa"
        ],
        correct: 1,
        explanation: "Konservasi keanekaragaman hayati bertujuan menjaga keseimbangan ekosistem dan memastikan keberlanjutan spesies untuk generasi mendatang, bukan sekadar kepentingan ekonomi atau estetika."
    }
];

// Badge definitions
const BADGE_DEFINITIONS = [
    {
        id: 'first_quiz',
        name: 'Pemula',
        icon: '🌱',
        description: 'Selesaikan kuis pertama',
        condition: (history) => history.length >= 1
    },
    {
        id: 'perfect_score',
        name: 'Sempurna',
        icon: '🏆',
        description: 'Dapatkan skor 100%',
        condition: (history) => history.some(q => q.score === 100)
    },
    {
        id: 'five_quizzes',
        name: 'Pembelajar',
        icon: '📚',
        description: 'Selesaikan 5 kuis',
        condition: (history) => history.length >= 5
    },
    {
        id: 'speed_master',
        name: 'Cepat Kilat',
        icon: '⚡',
        description: 'Selesaikan kuis dalam 60 detik',
        condition: (history) => history.some(q => q.timeTaken <= 60)
    },
    {
        id: 'conservation_expert',
        name: 'Ahli Konservasi',
        icon: '🌿',
        description: 'Skor rata-rata 80%+',
        condition: (history) => {
            if (history.length === 0) return false;
            const avg = history.reduce((sum, q) => sum + q.score, 0) / history.length;
            return avg >= 80;
        }
    },
    {
        id: 'comeback_king',
        name: 'Pantang Menyerah',
        icon: '💪',
        description: 'Main 3x berturut-turut',
        condition: (history) => history.length >= 3
    }
];

// ============================================
// INITIALIZE
// ============================================

function initQuiz() {
    // Load quiz history from localStorage
    quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    badges = JSON.parse(localStorage.getItem('badges') || '[]');
    
    // Update stats
    updateStartScreenStats();
    
    // Event listeners
    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('quitBtn').addEventListener('click', quitQuiz);
    document.getElementById('retryBtn').addEventListener('click', restartQuiz);
}

function updateStartScreenStats() {
    const totalQuizzes = quizHistory.length;
    const averageScore = totalQuizzes > 0 
        ? Math.round(quizHistory.reduce((sum, q) => sum + q.score, 0) / totalQuizzes)
        : 0;
    const badgesEarned = badges.length;
    
    document.getElementById('totalQuizzes').textContent = totalQuizzes;
    document.getElementById('averageScore').textContent = averageScore + '%';
    document.getElementById('badgesEarned').textContent = badgesEarned + '/' + BADGE_DEFINITIONS.length;
}

// ============================================
// START QUIZ
// ============================================

function startQuiz() {
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    startTime = Date.now();
    
    // Shuffle questions
    quizData = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    
    // Hide start screen, show quiz card
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizCard').classList.add('active');
    
    // Load first question
    loadQuestion();
}

// ============================================
// LOAD QUESTION
// ============================================

function loadQuestion() {
    const question = quizData[currentQuestionIndex];
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('questionNumber').textContent = 
        `Pertanyaan ${currentQuestionIndex + 1} dari ${quizData.length}`;
    document.getElementById('currentScore').textContent = score;
    
    // Update question
    document.getElementById('questionText').textContent = question.question;
    
    // Hide explanation
    document.getElementById('explanation').classList.remove('active');
    
    // Load options
    const optionsContainer = document.getElementById('answerOptions');
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <div class="answer-option" data-index="${index}">
            <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
            <span class="answer-text">${option}</span>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.answer-option').forEach(option => {
        option.addEventListener('click', () => selectAnswer(option));
    });
    
    // Disable next button
    document.getElementById('nextBtn').disabled = true;
}

// ============================================
// SELECT ANSWER
// ============================================

function selectAnswer(selectedOption) {
    // Prevent multiple selections
    const options = document.querySelectorAll('.answer-option');
    if (Array.from(options).some(opt => opt.classList.contains('disabled'))) {
        return;
    }
    
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const question = quizData[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;
    
    // Mark selected
    selectedOption.classList.add('selected');
    
    // Show correct/incorrect
    options.forEach((option, index) => {
        option.classList.add('disabled');
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    // Update score
    if (isCorrect) {
        correctAnswers++;
        score += 10;
        document.getElementById('currentScore').textContent = score;
    } else {
        incorrectAnswers++;
    }
    
    // Show explanation
    document.getElementById('explanationText').textContent = question.explanation;
    document.getElementById('explanation').classList.add('active');
    
    // Enable next button
    document.getElementById('nextBtn').disabled = false;
}

// ============================================
// NEXT QUESTION
// ============================================

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// ============================================
// SHOW RESULTS
// ============================================

function showResults() {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const scorePercentage = (correctAnswers / quizData.length) * 100;
    
    // Save to history
    const quizResult = {
        date: new Date().toISOString(),
        score: Math.round(scorePercentage),
        correct: correctAnswers,
        incorrect: incorrectAnswers,
        timeTaken: timeTaken
    };
    quizHistory.push(quizResult);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    
    // Check for new badges
    checkAndAwardBadges();
    
    // Hide quiz card, show results
    document.getElementById('quizCard').classList.remove('active');
    document.getElementById('quizResults').classList.add('active');
    
    // Update results
    document.getElementById('finalScore').textContent = `${correctAnswers}/${quizData.length}`;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('incorrectAnswers').textContent = incorrectAnswers;
    document.getElementById('timeTaken').textContent = timeTaken + 's';
    
    // Results message
    let message = '';
    let icon = '';
    if (scorePercentage === 100) {
        message = 'Sempurna! Anda adalah ahli keanekaragaman hayati!';
        icon = '🏆';
    } else if (scorePercentage >= 80) {
        message = 'Luar biasa! Pengetahuan Anda sangat baik!';
        icon = '🎉';
    } else if (scorePercentage >= 60) {
        message = 'Bagus! Terus tingkatkan pengetahuan Anda!';
        icon = '👍';
    } else if (scorePercentage >= 40) {
        message = 'Cukup baik! Masih ada ruang untuk belajar lebih banyak!';
        icon = '📚';
    } else {
        message = 'Jangan menyerah! Coba lagi dan pelajari lebih lanjut!';
        icon = '💪';
    }
    
    document.getElementById('resultsMessage').textContent = message;
    document.getElementById('resultsIcon').textContent = icon;
    
    // Show badges
    renderBadges();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// BADGES SYSTEM
// ============================================

function checkAndAwardBadges() {
    BADGE_DEFINITIONS.forEach(badgeDef => {
        if (!badges.includes(badgeDef.id) && badgeDef.condition(quizHistory)) {
            badges.push(badgeDef.id);
            console.log('New badge earned:', badgeDef.name);
        }
    });
    localStorage.setItem('badges', JSON.stringify(badges));
}

function renderBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    
    badgesGrid.innerHTML = BADGE_DEFINITIONS.map(badgeDef => {
        const isUnlocked = badges.includes(badgeDef.id);
        return `
            <div class="badge ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon">${badgeDef.icon}</div>
                <div class="badge-name">${badgeDef.name}</div>
                <div class="badge-description">${badgeDef.description}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// QUIT & RESTART
// ============================================

function quitQuiz() {
    if (confirm('Apakah Anda yakin ingin keluar? Progress akan hilang.')) {
        location.reload();
    }
}

function restartQuiz() {
    document.getElementById('quizResults').classList.remove('active');
    document.getElementById('quizStart').style.display = 'block';
    updateStartScreenStats();
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', initQuiz);