// ============================================
// HOME PAGE SPECIFIC FUNCTIONALITY
// ============================================

let currentSlide = 0;
let carouselInterval;

// ============================================
// FEATURED SPECIES CAROUSEL
// ============================================

async function initFeaturedCarousel() {
    const carousel = document.getElementById('featuredCarousel');
    if (!carousel) return;
    
    // Get featured species (first 6 with high priority conservation status)
    const featured = speciesData
        .filter(s => ['Critically Endangered', 'Endangered'].includes(s.conservationStatus))
        .slice(0, 6);
    
    if (featured.length === 0) {
        carousel.innerHTML = '<p>Tidak ada spesies unggulan tersedia.</p>';
        return;
    }
    
    // Render carousel items
    carousel.innerHTML = featured.map(species => createSpeciesCard(species)).join('');
    
    // Initialize carousel dots
    initCarouselDots(featured.length);

    // Initialize carousel controls
    initCarouselControls();

    // Auto-play carousel - DISABLED to prevent auto-scroll
    // startCarouselAutoPlay();
}

function initCarouselDots(count) {
    const dotsContainer = document.getElementById('carouselDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = Array.from({ length: Math.ceil(count / 3) }, (_, i) => 
        `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></div>`
    ).join('');
    
    // Add click handlers
    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const slide = parseInt(dot.getAttribute('data-slide'));
            goToSlide(slide);
        });
    });
}

function initCarouselControls() {
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }
}

function goToSlide(slideIndex) {
    const carousel = document.getElementById('featuredCarousel');
    const dots = document.querySelectorAll('.carousel-dot');
    const maxSlide = dots.length - 1;
    
    // Boundary checks
    if (slideIndex < 0) slideIndex = 0;
    if (slideIndex > maxSlide) slideIndex = maxSlide;
    
    currentSlide = slideIndex;
    
    // Update carousel position (smooth scroll - horizontal only)
    const cards = carousel.querySelectorAll('.species-card');
    if (cards[slideIndex * 3]) {
        // Scroll horizontally without affecting vertical scroll position
        const targetCard = cards[slideIndex * 3];
        const carousel = targetCard.closest('#featuredCarousel');
        if (carousel) {
            carousel.scrollTo({
                left: targetCard.offsetLeft,
                behavior: 'smooth'
            });
        }
    }
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // Update button states
    updateCarouselButtons();

    // Reset auto-play - DISABLED to prevent auto-scroll
    // stopCarouselAutoPlay();
    // startCarouselAutoPlay();
}

function updateCarouselButtons() {
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const maxSlide = document.querySelectorAll('.carousel-dot').length - 1;
    
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === maxSlide;
}

function startCarouselAutoPlay() {
    stopCarouselAutoPlay();
    carouselInterval = setInterval(() => {
        const maxSlide = document.querySelectorAll('.carousel-dot').length - 1;
        const nextSlide = currentSlide < maxSlide ? currentSlide + 1 : 0;
        goToSlide(nextSlide);
    }, 5000);
}

function stopCarouselAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
}

// ============================================
// CONSERVATION STATUS CHART
// ============================================

function initConservationChart() {
    const canvas = document.getElementById('conservationChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Count species by status
    const statusCounts = {
        'Critically Endangered': 0,
        'Endangered': 0,
        'Vulnerable': 0,
        'Near Threatened': 0,
        'Least Concern': 0
    };

    speciesData.forEach(species => {
        if (statusCounts.hasOwnProperty(species.conservationStatus)) {
            statusCounts[species.conservationStatus]++;
        }
    });

    // Filter out statuses with 0 count
    const activeStatuses = Object.entries(statusCounts).filter(([_, count]) => count > 0);

    // If no data, show message
    if (activeStatuses.length === 0) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim();
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Tidak ada data', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Draw simple bar chart
    const colors = {
        'Critically Endangered': '#dc2626',
        'Endangered': '#ea580c',
        'Vulnerable': '#f59e0b',
        'Near Threatened': '#84cc16',
        'Least Concern': '#10b981'
    };

    const maxCount = Math.max(...activeStatuses.map(([_, count]) => count));
    const barHeight = 40;
    const barSpacing = 20;
    const startY = 50;
    const maxBarWidth = canvas.width - 200;

    activeStatuses.forEach(([status, count], index) => {
        const y = startY + (barHeight + barSpacing) * index;
        const barWidth = maxCount > 0 ? (count / maxCount) * maxBarWidth : 0;

        // Draw bar
        ctx.fillStyle = colors[status];
        ctx.fillRect(120, y, Math.max(barWidth, 20), barHeight); // Minimum 20px width

        // Draw label
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim();
        ctx.font = '14px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(status, 110, y + 25);

        // Draw count
        ctx.textAlign = 'left';
        ctx.fillText(count, 130 + Math.max(barWidth, 20), y + 25);
    });

    console.log('✅ Conservation chart rendered with statuses:', activeStatuses.map(([s]) => s).join(', '));
}

// ============================================
// STATISTICS COUNTER ANIMATION
// ============================================

function initStatsCounters() {
    const stats = {
        speciesCount: speciesData.length,
        endangeredCount: speciesData.filter(s => 
            ['Critically Endangered', 'Endangered'].includes(s.conservationStatus)
        ).length,
        locationsCount: new Set(speciesData.flatMap(s => 
            s.locations.map(l => l.name)
        )).size,
        contributorsCount: 156 // Mock data
    };
    
    // Update stat card attributes
    document.querySelectorAll('.stat-card').forEach(card => {
        const id = card.querySelector('[id$="Count"]')?.id;
        if (id && stats[id]) {
            card.setAttribute('data-count', stats[id]);
        }
    });
}

// ============================================
// HERO SEARCH WITH REDIRECT
// ============================================

function initHeroSearch() {
    const searchInput = document.getElementById('heroSearch');
    const searchBtn = document.querySelector('.hero-search .search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
        }
    };
    
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// ============================================
// SMOOTH SCROLL INDICATOR
// ============================================

function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    scrollIndicator.addEventListener('click', () => {
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            statsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Hide scroll indicator after scrolling
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    });
}

// ============================================
// SPECIES MODAL (Basic)
// ============================================

function openSpeciesModal(speciesId) {
    // Redirect to catalog with pre-selected species
    window.location.href = `catalog.html?species=${speciesId}`;
}

// ============================================
// INITIALIZE HOME PAGE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait for species data to load
        if (typeof BiodiversityAtlas !== 'undefined') {
            // Always ensure data is loaded
            await BiodiversityAtlas.loadSpeciesData();
            speciesData = BiodiversityAtlas.speciesData;

            // Log for debugging
            console.log('Species data loaded:', speciesData.length, 'species');
        } else {
            console.error('BiodiversityAtlas not found!');
            return;
        }

        // Check if data is loaded
        if (!speciesData || speciesData.length === 0) {
            console.error('No species data available!');
            return;
        }

        // Initialize home page features
        initStatsCounters();
        initFeaturedCarousel();
        initConservationChart();
        initHeroSearch();

        // Re-draw chart on theme change to update colors
        window.addEventListener('themeChanged', () => {
            initConservationChart();
        });
        initScrollIndicator();

        // Pause carousel on hover
        const carousel = document.getElementById('featuredCarousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopCarouselAutoPlay);
            carousel.addEventListener('mouseleave', startCarouselAutoPlay);
        }
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopCarouselAutoPlay();
});