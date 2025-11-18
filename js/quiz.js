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
    // MULTIPLE CHOICE QUESTIONS
    {
        id: 1,
        type: 'multiple-choice',
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
        type: 'multiple-choice',
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
        type: 'multiple-choice',
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
        type: 'multiple-choice',
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
        type: 'multiple-choice',
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
        type: 'multiple-choice',
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
        id: 7,
        type: 'multiple-choice',
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

    // TRUE/FALSE QUESTIONS
    {
        id: 8,
        type: 'true-false',
        question: "Bekantan adalah hewan endemik Sulawesi yang dikenal dengan hidung panjangnya.",
        options: ["Benar", "Salah"],
        correct: 1,
        explanation: "SALAH. Bekantan (Nasalis larvatus) adalah primata endemik Kalimantan, bukan Sulawesi. Bekantan terkenal dengan hidung panjangnya, terutama pada jantan dewasa. Hidung ini berfungsi sebagai resonator suara."
    },
    {
        id: 9,
        type: 'true-false',
        question: "Harimau Sumatera adalah subspesies harimau terkecil di dunia.",
        options: ["Benar", "Salah"],
        correct: 0,
        explanation: "BENAR. Harimau Sumatera adalah subspesies harimau terkecil dengan populasi sekitar 400-600 individu. Ukurannya yang lebih kecil merupakan adaptasi terhadap habitat hutan hujan tropis Sumatera."
    },
    {
        id: 10,
        type: 'true-false',
        question: "Komodo dapat ditemukan di seluruh wilayah Indonesia.",
        options: ["Benar", "Salah"],
        correct: 1,
        explanation: "SALAH. Komodo hanya ditemukan di beberapa pulau di Nusa Tenggara Timur, yaitu Pulau Komodo, Rinca, Flores, dan Gili Motang. Mereka tidak tersebar di seluruh Indonesia."
    },
    {
        id: 11,
        type: 'true-false',
        question: "Taman Nasional Ujung Kulon adalah satu-satunya habitat Badak Jawa di dunia.",
        options: ["Benar", "Salah"],
        correct: 0,
        explanation: "BENAR. Taman Nasional Ujung Kulon di Banten adalah satu-satunya habitat tersisa Badak Jawa (Rhinoceros sondaicus) di dunia, dengan populasi sekitar 76 individu."
    },

    // IMAGE-BASED QUESTIONS
    {
        id: 12,
        type: 'image-quiz',
        question: "Hewan apakah yang ditampilkan pada gambar ini?",
        image: "assets/images/species/sp006.jpg",
        options: [
            "Kukang",
            "Tarsius",
            "Lutung",
            "Monyet Ekor Panjang"
        ],
        correct: 1,
        explanation: "Ini adalah Tarsius, primata terkecil di dunia yang endemik di Sulawesi. Tarsius memiliki mata besar yang khas dan merupakan hewan nokturnal. Mereka dapat memutar kepala hampir 180 derajat."
    },
    {
        id: 13,
        type: 'image-quiz',
        question: "Spesies apakah ini?",
        image: "assets/images/species/sp005.jpg",
        options: [
            "Banteng",
            "Kerbau",
            "Anoa",
            "Bison"
        ],
        correct: 2,
        explanation: "Ini adalah Anoa, sapi liar terkecil di dunia yang endemik di Sulawesi. Anoa memiliki status Endangered dan populasinya terus menurun akibat perburuan dan hilangnya habitat."
    },
    {
        id: 14,
        type: 'image-quiz',
        question: "Burung apakah yang terlihat pada gambar?",
        image: "assets/images/species/sp003.jpg",
        options: [
            "Merak",
            "Cenderawasih",
            "Kasuari",
            "Jalak Bali"
        ],
        correct: 1,
        explanation: "Ini adalah Burung Cenderawasih (Bird of Paradise), burung endemik Papua yang terkenal dengan bulu-bulunya yang indah dan tarian kawinnya yang unik. Ada lebih dari 40 spesies Cenderawasih di dunia."
    },
    {
        id: 15,
        type: 'multiple-choice',
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
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="badge-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>',
        description: 'Selesaikan kuis pertama',
        condition: (history) => history.length >= 1
    },
    {
        id: 'perfect_score',
        name: 'Sempurna',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="badge-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>',
        description: 'Dapatkan skor 100%',
        condition: (history) => history.some(q => q.score === 100)
    },
    {
        id: 'five_quizzes',
        name: 'Pembelajar',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="badge-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>',
        description: 'Selesaikan 5 kuis',
        condition: (history) => history.length >= 5
    },
    {
        id: 'speed_master',
        name: 'Cepat Kilat',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="badge-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>',
        description: 'Selesaikan kuis dalam 60 detik',
        condition: (history) => history.some(q => q.timeTaken <= 60)
    },
    {
        id: 'conservation_expert',
        name: 'Ahli Konservasi',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="badge-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>',
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
        icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="badge-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>',
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

    // Handle image for image-quiz type
    const questionImage = document.getElementById('questionImage');
    if (question.type === 'image-quiz' && question.image) {
        questionImage.src = question.image;
        questionImage.style.display = 'block';
    } else {
        questionImage.style.display = 'none';
    }

    // Hide explanation
    document.getElementById('explanation').classList.remove('active');

    // Load options based on question type
    const optionsContainer = document.getElementById('answerOptions');

    // Add CSS class based on question type for styling
    optionsContainer.className = 'answer-options';
    if (question.type === 'true-false') {
        optionsContainer.classList.add('true-false-options');
    }

    optionsContainer.innerHTML = question.options.map((option, index) => {
        // For true-false questions, use checkmark/cross icons
        if (question.type === 'true-false') {
            const icon = index === 0
                ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="true-false-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="true-false-svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
            return `
                <div class="answer-option true-false-option" data-index="${index}">
                    <span class="true-false-icon">${icon}</span>
                    <span class="answer-text">${option}</span>
                </div>
            `;
        }
        // For multiple choice and image quiz, use letter labels
        return `
            <div class="answer-option" data-index="${index}">
                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                <span class="answer-text">${option}</span>
            </div>
        `;
    }).join('');

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
// HELPER FUNCTIONS
// ============================================

function formatTime(seconds) {
    if (seconds < 60) {
        return seconds + 's';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
        return minutes + 'm';
    }

    return `${minutes}m ${remainingSeconds}s`;
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
    document.getElementById('timeTaken').textContent = formatTime(timeTaken);
    
    // Results message
    let message = '';
    let icon = '';
    if (scorePercentage === 100) {
        message = 'Sempurna! Anda adalah ahli keanekaragaman hayati!';
        icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 80px; height: 80px; color: #278E29; margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>';
    } else if (scorePercentage >= 80) {
        message = 'Luar biasa! Pengetahuan Anda sangat baik!';
        icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 80px; height: 80px; color: #278E29; margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    } else if (scorePercentage >= 60) {
        message = 'Bagus! Terus tingkatkan pengetahuan Anda!';
        icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 80px; height: 80px; color: #278E29; margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>';
    } else if (scorePercentage >= 40) {
        message = 'Cukup baik! Masih ada ruang untuk belajar lebih banyak!';
        icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 80px; height: 80px; color: #278E29; margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>';
    } else {
        message = 'Jangan menyerah! Coba lagi dan pelajari lebih lanjut!';
        icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 80px; height: 80px; color: #278E29; margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>';
    }

    document.getElementById('resultsMessage').textContent = message;
    document.getElementById('resultsIcon').innerHTML = icon;
    
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