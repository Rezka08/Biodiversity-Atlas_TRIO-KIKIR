// ============================================
// HOME PAGE SPECIFIC FUNCTIONALITY
// ============================================

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

    // Render all carousel items in grid (no pagination)
    carousel.innerHTML = featured.map(species => createSpeciesCard(species)).join('');

    console.log(`✅ Featured carousel loaded with ${featured.length} species`);
}

// Carousel pagination functions removed - displaying all cards in grid now

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
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    // Create Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animate-in class when element comes into view
                entry.target.classList.add('animate-in');

                // Optionally unobserve after animation to improve performance
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
        '.stat-card, .step-card, .species-card, .section-header, ' +
        '.conservation-content, .conservation-chart, .scroll-animate, ' +
        '.fade-in, .slide-up, .slide-left, .slide-right, .scale-in'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    console.log(`✅ Scroll animations initialized for ${animatedElements.length} elements`);
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
        initScrollAnimations(); // Initialize scroll animations

        // Re-draw chart on theme change to update colors
        window.addEventListener('themeChanged', () => {
            initConservationChart();
        });
        initScrollIndicator();
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
});