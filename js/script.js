// ============================================
// GLOBAL STATE & CONFIGURATION
// ============================================

const CONFIG = {
    dataPath: 'data/species.json',
    itemsPerPage: 12,
    animationDuration: 300
};

let speciesData = [];

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        // Remove existing listener if any (prevent duplicate listeners)
        themeToggle.removeEventListener('click', toggleTheme);
        // Add new listener
        themeToggle.addEventListener('click', toggleTheme);
        console.log('✅ Theme toggle initialized');
    } else {
        console.warn('⚠️ Theme toggle button not found - navbar might not be loaded yet');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Add smooth transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);

    // Dispatch custom event for charts and other components to listen
    window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: newTheme }
    }));
}

// ============================================
// MOBILE NAVIGATION
// ============================================

// Store click handler to remove it later if needed
let mobileNavClickHandler = null;
let mobileNavOutsideClickHandler = null;

function initMobileNav() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        // Remove existing listeners if any
        if (mobileNavClickHandler) {
            mobileMenuToggle.removeEventListener('click', mobileNavClickHandler);
        }
        if (mobileNavOutsideClickHandler) {
            document.removeEventListener('click', mobileNavOutsideClickHandler);
        }

        // Create new handler
        mobileNavClickHandler = () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        };

        // Add click handler
        mobileMenuToggle.addEventListener('click', mobileNavClickHandler);

        // Close menu when clicking outside
        mobileNavOutsideClickHandler = (e) => {
            if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        };

        document.addEventListener('click', mobileNavOutsideClickHandler);

        console.log('✅ Mobile navigation initialized');
    } else {
        console.warn('⚠️ Mobile nav elements not found - navbar might not be loaded yet');
    }
}

// ============================================
// LOAD SPECIES DATA
// ============================================

// Get approved submissions from localStorage and convert to species format
function getApprovedSubmissions() {
    try {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const approvedSubmissions = submissions.filter(s => s.status === 'approved');

        // Convert submissions to species format (matching species.json structure)
        return approvedSubmissions.map(submission => {
            const shortDesc = submission.observationNotes
                ? submission.observationNotes.substring(0, 100) + (submission.observationNotes.length > 100 ? '...' : '')
                : 'Temuan spesies baru dari kontribusi pengguna.';

            const longDesc = submission.observationNotes ||
                `Spesies ini dilaporkan oleh ${submission.userName} pada ${new Date(submission.submittedAt).toLocaleDateString('id-ID')}. ` +
                `Lokasi penemuan: ${submission.locationName || 'Tidak disebutkan'}. ` +
                `Observasi ini telah diverifikasi dan disetujui oleh tim admin.`;

            return {
                id: submission.id,
                commonName: submission.speciesName || 'Spesies Baru',
                scientificName: submission.speciesName || 'Species Unknown',
                conservationStatus: 'Least Concern', // Default status for user submissions
                habitat: [submission.locationName || 'unknown'], // Array format like species.json
                tags: ['user-submission', 'approved', 'new-discovery'],
                shortDescription: shortDesc,
                longDescription: longDesc,
                images: [
                    {
                        file: submission.image, // Base64 image data
                        credit: `Submitted by ${submission.userName}`,
                        license: 'User Contribution'
                    }
                ],
                locations: [
                    {
                        name: submission.locationName || 'Lokasi tidak disebutkan',
                        lat: parseFloat(submission.location?.lat || 0),
                        lng: parseFloat(submission.location?.lng || 0),
                        precision: 'exact'
                    }
                ],
                quickFacts: submission.quickFacts || {
                    size: 'Tidak disebutkan',
                    diet: 'Tidak disebutkan',
                    lifespan: 'Tidak disebutkan',
                    reproduction: 'Tidak disebutkan'
                },
                conservationActions: 'Data tambahan diperlukan untuk menentukan status konservasi dan aksi yang tepat.',
                isUserSubmission: true, // Mark as user submission
                submittedBy: submission.userName,
                submittedAt: submission.submittedAt,
                approvedAt: submission.reviewedAt
            };
        });
    } catch (error) {
        console.error('Error loading approved submissions:', error);
        return [];
    }
}

async function loadSpeciesData() {
    try {
        console.log('Loading species data from:', CONFIG.dataPath);
        const response = await fetch(CONFIG.dataPath);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        speciesData = data.species;

        // Load approved submissions from localStorage and add to species data
        const approvedSubmissions = getApprovedSubmissions();
        if (approvedSubmissions.length > 0) {
            console.log('✅ Adding', approvedSubmissions.length, 'approved submissions to catalog');
            speciesData = [...speciesData, ...approvedSubmissions];
        }

        console.log('Successfully loaded', speciesData.length, 'species (including approved submissions)');
        return speciesData;
    } catch (error) {
        console.error('Error loading species data:', error);

        // Check for CORS error
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            console.error('⚠️ CORS ERROR DETECTED! ⚠️');
            console.error('Solusi: Jalankan website dengan local server, jangan buka file HTML langsung!');
            console.error('Gunakan: python3 -m http.server 8000');
            console.error('Lalu buka: http://localhost:8000');
        }

        // Even if JSON loading fails, try to load approved submissions
        const approvedSubmissions = getApprovedSubmissions();
        if (approvedSubmissions.length > 0) {
            console.log('✅ Loaded', approvedSubmissions.length, 'approved submissions (JSON failed to load)');
            speciesData = approvedSubmissions;
            return speciesData;
        }

        return [];
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format conservation status for display
function formatConservationStatus(status) {
    const statusMap = {
        'Critically Endangered': { abbr: 'CR', class: 'status-cr' },
        'Endangered': { abbr: 'EN', class: 'status-en' },
        'Vulnerable': { abbr: 'VU', class: 'status-vu' },
        'Near Threatened': { abbr: 'NT', class: 'status-nt' },
        'Least Concern': { abbr: 'LC', class: 'status-lc' }
    };
    return statusMap[status] || { abbr: status, class: '' };
}

// Get conservation status priority (for sorting)
function getStatusPriority(status) {
    const priorities = {
        'Critically Endangered': 1,
        'Endangered': 2,
        'Vulnerable': 3,
        'Near Threatened': 4,
        'Least Concern': 5
    };
    return priorities[status] || 999;
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to element
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Format habitat name
function formatHabitat(habitat) {
    const habitatMap = {
        'rainforest': '🌳 Hutan Hujan',
        'coastal': '🏖️ Pesisir',
        'mangrove': '🌴 Mangrove',
        'mountain-forest': '⛰️ Hutan Pegunungan',
        'savanna': '🌾 Savana',
        'freshwater': '💧 Air Tawar',
        'peat-swamp': '🌿 Rawa Gambut',
        'lowland-forest': '🌲 Hutan Dataran Rendah',
        'forest': '🌳 Hutan',
        'grassland': '🌾 Padang Rumput',
        'coral-reef': '🐠 Terumbu Karang',
        'river': '🏞️ Sungai',
        'wetland': '💦 Lahan Basah',
        'urban': '🏙️ Urban',
        'agricultural': '🌾 Pertanian'
    };
    return habitatMap[habitat] || habitat;
}

// Get tag icon
function getTagIcon(tag) {
    const iconMap = {
        'endemic': '⭐',
        'mammal': '🦁',
        'bird': '🦅',
        'reptile': '🦎',
        'amphibian': '🐸',
        'fish': '🐟',
        'insect': '🦋',
        'plant': '🌺',
        'nocturnal': '🌙',
        'migratory': '✈️',
        'primate': '🐵',
        'carnivore': '🥩',
        'herbivore': '🌿',
        'marine': '🌊'
    };
    return iconMap[tag] || '';
}

// Create species card HTML
function createSpeciesCard(species) {
    const statusInfo = formatConservationStatus(species.conservationStatus);
    const primaryTag = species.tags[0] || '';

    // Detect user submission and use base64 image data
    const isUserSubmission = species.tags.includes('user-submission');
    const imageSrc = isUserSubmission && species.images?.[0]?.file
        ? species.images[0].file
        : `assets/images/species/${species.id}.jpg`;

    return `
        <div class="species-card" data-species-id="${species.id}" onclick="openSpeciesModal('${species.id}')">
            <div class="species-image">
                <img src="${imageSrc}"
                     alt="${species.commonName}"
                     onerror="this.src='assets/images/placeholder.jpg'">
                <div class="species-tags">
                    ${primaryTag ? `<span class="species-tag">${getTagIcon(primaryTag)} ${primaryTag}</span>` : ''}
                </div>
            </div>
            <div class="species-info">
                <div class="species-header">
                    <h3 class="species-name">${species.commonName}</h3>
                    <p class="species-scientific">${species.scientificName}</p>
                </div>
                <p class="species-description">${species.shortDescription}</p>
                <div class="species-meta">
                    <span class="status-badge ${statusInfo.class}">${statusInfo.abbr}</span>
                    <span class="species-link">Lihat Detail →</span>
                </div>
            </div>
        </div>
    `;
}

// Counter animation
function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger counter animation for stat cards
                if (entry.target.classList.contains('stat-card')) {
                    const countElement = entry.target.querySelector('.stat-number');
                    const targetValue = parseInt(entry.target.getAttribute('data-count'));
                    if (countElement && targetValue) {
                        animateCounter(countElement, targetValue);
                    }
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.stat-card, .species-card, .step-card').forEach(el => {
        observer.observe(el);
    });
}

// Search functionality with autocomplete
function initSearch() {
    const searchInput = document.getElementById('heroSearch');
    const suggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput || !suggestions) return;
    
    const debouncedSearch = debounce((query) => {
        if (query.length < 2) {
            suggestions.innerHTML = '';
            suggestions.style.display = 'none';
            return;
        }
        
        const results = speciesData.filter(species => 
            species.commonName.toLowerCase().includes(query.toLowerCase()) ||
            species.scientificName.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        
        if (results.length > 0) {
            suggestions.innerHTML = results.map(species => `
                <div class="suggestion-item" onclick="window.location.href='catalog.html?search=${encodeURIComponent(species.commonName)}'">
                    <span class="suggestion-name">${species.commonName}</span>
                    <span class="suggestion-scientific">${species.scientificName}</span>
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.innerHTML = '<div class="suggestion-item">Tidak ditemukan</div>';
            suggestions.style.display = 'block';
        }
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hero-search')) {
            suggestions.style.display = 'none';
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    initTheme();
    
    // Initialize mobile navigation
    initMobileNav();
    
    // Load species data
    await loadSpeciesData();
    
    // Initialize search
    initSearch();
    
    // Initialize scroll animations
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target !== '#') {
                smoothScroll(target);
            }
        });
    });
});

// ============================================
// EXPORT FOR OTHER SCRIPTS
// ============================================

// Make functions globally available for components-loader.js
window.initTheme = initTheme;
window.initMobileNav = initMobileNav;

window.BiodiversityAtlas = {
    get speciesData() { return speciesData; },
    loadSpeciesData,
    formatConservationStatus,
    getStatusPriority,
    formatHabitat,
    getTagIcon,
    createSpeciesCard,
    debounce,
    animateCounter
};