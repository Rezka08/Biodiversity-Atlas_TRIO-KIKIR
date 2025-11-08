// ============================================
// CATALOG PAGE STATE
// ============================================

let filteredSpecies = [];
let currentPage = 1;
let currentFilters = {
    search: '',
    status: [],
    habitat: [],
    tags: []
};
let currentSort = 'name-asc';

// ============================================
// INITIALIZE CATALOG
// ============================================

async function initCatalog() {
    try {
        // Load species data
        await BiodiversityAtlas.loadSpeciesData();
        speciesData = BiodiversityAtlas.speciesData;

        // Log for debugging
        console.log('Catalog - Species data loaded:', speciesData.length, 'species');

        if (!speciesData || speciesData.length === 0) {
            console.error('No species data available!');
            const loadingState = document.getElementById('loadingState');
            if (loadingState) {
                loadingState.innerHTML = '<p style="color: red;">❌ Gagal memuat data spesies. Pastikan file data/species.json tersedia.</p>';
            }
            return;
        }

        // Hide loading state
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        // Check URL parameters
        parseURLParameters();

        // Initialize filters
        initFilters();

        // Initialize search
        initCatalogSearch();

        // Initialize sort
        initSort();

        // Initialize view toggle
        initViewToggle();

        // Initial render
        applyFilters();
    } catch (error) {
        console.error('Error initializing catalog:', error);
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
        }
    }
}

// ============================================
// URL PARAMETERS
// ============================================

function parseURLParameters() {
    const params = new URLSearchParams(window.location.search);
    
    // Handle search parameter
    if (params.has('search')) {
        currentFilters.search = params.get('search');
        const searchInput = document.getElementById('catalogSearch');
        if (searchInput) {
            searchInput.value = currentFilters.search;
        }
    }
    
    // Handle species ID (open modal)
    if (params.has('species')) {
        const speciesId = params.get('species');
        setTimeout(() => openSpeciesModal(speciesId), 500);
    }
}

// ============================================
// FILTERS
// ============================================

function initFilters() {
    // Status filters
    document.querySelectorAll('input[name="status"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentFilters.status.push(e.target.value);
            } else {
                currentFilters.status = currentFilters.status.filter(s => s !== e.target.value);
            }
            applyFilters();
        });
    });
    
    // Habitat filters
    document.querySelectorAll('input[name="habitat"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentFilters.habitat.push(e.target.value);
            } else {
                currentFilters.habitat = currentFilters.habitat.filter(h => h !== e.target.value);
            }
            applyFilters();
        });
    });
    
    // Tags filters
    document.querySelectorAll('input[name="tags"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentFilters.tags.push(e.target.value);
            } else {
                currentFilters.tags = currentFilters.tags.filter(t => t !== e.target.value);
            }
            applyFilters();
        });
    });
    
    // Reset filters
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
    }
    
    const resetEmptyState = document.getElementById('resetEmptyState');
    if (resetEmptyState) {
        resetEmptyState.addEventListener('click', resetAllFilters);
    }
    
    // Clear all filters
    const clearAllBtn = document.getElementById('clearAllFilters');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', resetAllFilters);
    }
    
    // Mobile filter toggle
    const mobileFilterToggle = document.getElementById('mobileFilterToggle');
    const sidebar = document.getElementById('catalogSidebar');
    if (mobileFilterToggle && sidebar) {
        mobileFilterToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-active');
        });
    }
}

function resetAllFilters() {
    currentFilters = {
        search: '',
        status: [],
        habitat: [],
        tags: []
    };
    
    // Clear all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Clear search
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) searchInput.value = '';
    
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
    
    applyFilters();
}

// ============================================
// SEARCH
// ============================================

function initCatalogSearch() {
    const searchInput = document.getElementById('catalogSearch');
    if (!searchInput) return;
    
    const debouncedSearch = BiodiversityAtlas.debounce((query) => {
        currentFilters.search = query;
        applyFilters();
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}

// ============================================
// SORT
// ============================================

function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applySort();
        renderSpecies();
    });
}

function applySort() {
    switch (currentSort) {
        case 'name-asc':
            filteredSpecies.sort((a, b) => a.commonName.localeCompare(b.commonName));
            break;
        case 'name-desc':
            filteredSpecies.sort((a, b) => b.commonName.localeCompare(a.commonName));
            break;
        case 'status-critical':
            filteredSpecies.sort((a, b) => 
                BiodiversityAtlas.getStatusPriority(a.conservationStatus) - 
                BiodiversityAtlas.getStatusPriority(b.conservationStatus)
            );
            break;
        case 'status-safe':
            filteredSpecies.sort((a, b) => 
                BiodiversityAtlas.getStatusPriority(b.conservationStatus) - 
                BiodiversityAtlas.getStatusPriority(a.conservationStatus)
            );
            break;
    }
}

// ============================================
// VIEW TOGGLE
// ============================================

function initViewToggle() {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const speciesGrid = document.getElementById('speciesGrid');
    
    if (!gridView || !listView || !speciesGrid) return;
    
    gridView.addEventListener('click', () => {
        gridView.classList.add('active');
        listView.classList.remove('active');
        speciesGrid.classList.remove('list-view');
    });
    
    listView.addEventListener('click', () => {
        listView.classList.add('active');
        gridView.classList.remove('active');
        speciesGrid.classList.add('list-view');
    });
}

// ============================================
// APPLY FILTERS & RENDER
// ============================================

function applyFilters() {
    // Start with all species
    filteredSpecies = [...speciesData];
    
    // Apply search filter
    if (currentFilters.search) {
        const query = currentFilters.search.toLowerCase();
        filteredSpecies = filteredSpecies.filter(species =>
            species.commonName.toLowerCase().includes(query) ||
            species.scientificName.toLowerCase().includes(query) ||
            species.shortDescription.toLowerCase().includes(query)
        );
    }
    
    // Apply status filter
    if (currentFilters.status.length > 0) {
        filteredSpecies = filteredSpecies.filter(species =>
            currentFilters.status.includes(species.conservationStatus)
        );
    }
    
    // Apply habitat filter
    if (currentFilters.habitat.length > 0) {
        filteredSpecies = filteredSpecies.filter(species =>
            species.habitat.some(h => currentFilters.habitat.includes(h))
        );
    }
    
    // Apply tags filter
    if (currentFilters.tags.length > 0) {
        filteredSpecies = filteredSpecies.filter(species =>
            species.tags.some(t => currentFilters.tags.includes(t))
        );
    }
    
    // Apply sort
    applySort();
    
    // Update UI
    updateFilterCounts();
    updateActiveFilters();
    
    // Reset to page 1
    currentPage = 1;
    
    // Render
    renderSpecies();
    renderPagination();
}

function updateFilterCounts() {
    // Update status count
    const statusCount = document.getElementById('statusCount');
    if (statusCount) {
        statusCount.textContent = currentFilters.status.length || '';
        statusCount.style.display = currentFilters.status.length ? 'block' : 'none';
    }
    
    // Update habitat count
    const habitatCount = document.getElementById('habitatCount');
    if (habitatCount) {
        habitatCount.textContent = currentFilters.habitat.length || '';
        habitatCount.style.display = currentFilters.habitat.length ? 'block' : 'none';
    }
    
    // Update tags count
    const tagsCount = document.getElementById('tagsCount');
    if (tagsCount) {
        tagsCount.textContent = currentFilters.tags.length || '';
        tagsCount.style.display = currentFilters.tags.length ? 'block' : 'none';
    }
}

function updateActiveFilters() {
    const filterChips = document.getElementById('filterChips');
    const activeFilters = document.getElementById('activeFilters');
    
    if (!filterChips || !activeFilters) return;
    
    const chips = [];
    
    // Add status chips
    currentFilters.status.forEach(status => {
        chips.push(`
            <div class="filter-chip" data-type="status" data-value="${status}">
                <span>${status}</span>
                <button onclick="removeFilter('status', '${status}')">×</button>
            </div>
        `);
    });
    
    // Add habitat chips
    currentFilters.habitat.forEach(habitat => {
        chips.push(`
            <div class="filter-chip" data-type="habitat" data-value="${habitat}">
                <span>${BiodiversityAtlas.formatHabitat(habitat)}</span>
                <button onclick="removeFilter('habitat', '${habitat}')">×</button>
            </div>
        `);
    });
    
    // Add tags chips
    currentFilters.tags.forEach(tag => {
        chips.push(`
            <div class="filter-chip" data-type="tags" data-value="${tag}">
                <span>${BiodiversityAtlas.getTagIcon(tag)} ${tag}</span>
                <button onclick="removeFilter('tags', '${tag}')">×</button>
            </div>
        `);
    });
    
    // Add search chip
    if (currentFilters.search) {
        chips.push(`
            <div class="filter-chip" data-type="search">
                <span>🔍 "${currentFilters.search}"</span>
                <button onclick="removeFilter('search', '')">×</button>
            </div>
        `);
    }
    
    if (chips.length > 0) {
        filterChips.innerHTML = chips.join('');
        activeFilters.style.display = 'block';
    } else {
        activeFilters.style.display = 'none';
    }
}

function removeFilter(type, value) {
    if (type === 'search') {
        currentFilters.search = '';
        const searchInput = document.getElementById('catalogSearch');
        if (searchInput) searchInput.value = '';
    } else {
        currentFilters[type] = currentFilters[type].filter(item => item !== value);
        
        // Uncheck the checkbox
        const checkbox = document.querySelector(`input[name="${type}"][value="${value}"]`);
        if (checkbox) checkbox.checked = false;
    }
    
    applyFilters();
}

// Make removeFilter available globally
window.removeFilter = removeFilter;

// ============================================
// RENDER SPECIES
// ============================================

function renderSpecies() {
    const grid = document.getElementById('speciesGrid');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!grid) return;
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = filteredSpecies.length;
    }
    
    // Show empty state if no results
    if (filteredSpecies.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    // Hide empty state
    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const pageSpecies = filteredSpecies.slice(startIndex, endIndex);
    
    // Render species cards
    grid.innerHTML = pageSpecies.map(species => 
        BiodiversityAtlas.createSpeciesCard(species)
    ).join('');
    
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// PAGINATION
// ============================================

function renderPagination() {
    const pagination = document.getElementById('pagination');
    const paginationPages = document.getElementById('paginationPages');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (!pagination || !paginationPages) return;
    
    const totalPages = Math.ceil(filteredSpecies.length / CONFIG.itemsPerPage);
    
    // Hide pagination if only one page
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // Update buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderSpecies();
                renderPagination();
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderSpecies();
                renderPagination();
            }
        };
    }
    
    // Render page numbers
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        pages.push(`
            <button class="pagination-page" onclick="goToPage(1)">1</button>
            ${startPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
        `);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(`
            <button class="pagination-page ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `);
    }
    
    if (endPage < totalPages) {
        pages.push(`
            ${endPage < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
            <button class="pagination-page" onclick="goToPage(${totalPages})">${totalPages}</button>
        `);
    }
    
    paginationPages.innerHTML = pages.join('');
}

function goToPage(page) {
    currentPage = page;
    renderSpecies();
    renderPagination();
}

// Make goToPage available globally
window.goToPage = goToPage;

// ============================================
// SPECIES DETAIL MODAL
// ============================================

function openSpeciesModal(speciesId) {
    const species = speciesData.find(s => s.id === speciesId);
    if (!species) return;
    
    const modal = document.getElementById('speciesModal');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) return;
    
    const statusInfo = BiodiversityAtlas.formatConservationStatus(species.conservationStatus);
    
    // Build modal content
    modalBody.innerHTML = `
        <div class="modal-species">
            <div class="modal-header-section">
                <div class="modal-title-group">
                    <h2 class="modal-species-name">${species.commonName}</h2>
                    <p class="modal-species-scientific">${species.scientificName}</p>
                </div>
                <span class="status-badge ${statusInfo.class} status-large">${statusInfo.abbr} ${species.conservationStatus}</span>
            </div>
            
            <div class="modal-image-gallery">
                <img src="assets/images/species/${species.id}.jpg" 
                     alt="${species.commonName}"
                     onerror="this.src='assets/images/placeholder.jpg'">
            </div>
            
            <div class="modal-tabs">
                <button class="modal-tab active" data-tab="overview">Overview</button>
                <button class="modal-tab" data-tab="habitat">Habitat</button>
                <button class="modal-tab" data-tab="conservation">Konservasi</button>
            </div>
            
            <div class="modal-tab-content active" data-content="overview">
                <h3>Deskripsi</h3>
                <p>${species.longDescription}</p>
                
                <h3>Fakta Singkat</h3>
                <div class="quick-facts">
                    <div class="fact-item">
                        <strong>Ukuran:</strong>
                        <span>${species.quickFacts.size}</span>
                    </div>
                    <div class="fact-item">
                        <strong>Diet:</strong>
                        <span>${species.quickFacts.diet}</span>
                    </div>
                    <div class="fact-item">
                        <strong>Masa Hidup:</strong>
                        <span>${species.quickFacts.lifespan}</span>
                    </div>
                    <div class="fact-item">
                        <strong>Reproduksi:</strong>
                        <span>${species.quickFacts.reproduction}</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-tab-content" data-content="habitat">
                <h3>Tipe Habitat</h3>
                <div class="habitat-tags">
                    ${species.habitat.map(h => `
                        <span class="habitat-tag">${BiodiversityAtlas.formatHabitat(h)}</span>
                    `).join('')}
                </div>
                
                <h3>Lokasi Observasi</h3>
                <div class="location-list">
                    ${species.locations.map(loc => `
                        <div class="location-item">
                            <span class="location-icon">📍</span>
                            <span class="location-name">${loc.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="modal-tab-content" data-content="conservation">
                <h3>Status Konservasi</h3>
                <div class="conservation-status-detail">
                    <span class="status-badge ${statusInfo.class}">${statusInfo.abbr}</span>
                    <span>${species.conservationStatus}</span>
                </div>
                
                <h3>Upaya Konservasi</h3>
                <p>${species.conservationActions}</p>
                
                <div class="modal-cta">
                    <a href="explorer.html?species=${species.id}" class="btn btn-primary">
                        <span>Lihat di Peta</span>
                        <span class="btn-icon">🗺️</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize tabs
    initModalTabs();
    
    // Close handlers
    const closeBtn = document.getElementById('modalClose');
    const overlay = document.getElementById('modalOverlay');
    
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;
    
    // Close on escape
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function initModalTabs() {
    const tabs = document.querySelectorAll('.modal-tab');
    const contents = document.querySelectorAll('.modal-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update contents
            contents.forEach(c => {
                if (c.getAttribute('data-content') === targetTab) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
        });
    });
}

// Make openSpeciesModal available globally
window.openSpeciesModal = openSpeciesModal;

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', initCatalog);