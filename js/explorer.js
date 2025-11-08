// ============================================
// EXPLORER PAGE - MAP FUNCTIONALITY
// ============================================

let map;
let markers = [];
let markerClusterGroup;
let currentFilters = {
    status: ['Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern']
};
let activeSpecies = null;

// ============================================
// INITIALIZE MAP
// ============================================

async function initMap() {
    try {
        // Load species data
        await BiodiversityAtlas.loadSpeciesData();
        speciesData = BiodiversityAtlas.speciesData;

        console.log('Explorer - Species data loaded:', speciesData.length, 'species');

        if (!speciesData || speciesData.length === 0) {
            console.error('No species data available!');
            return;
        }

        // Initialize Leaflet map centered on Indonesia
        map = L.map('map', {
            center: [-2.5, 118.0],
            zoom: 5,
            zoomControl: true,
            minZoom: 4,
            maxZoom: 18
        });

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Initialize marker cluster group
        markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: function(cluster) {
                const count = cluster.getChildCount();
                let c = ' marker-cluster-';
                if (count < 10) {
                    c += 'small';
                } else if (count < 50) {
                    c += 'medium';
                } else {
                    c += 'large';
                }
                return L.divIcon({
                    html: '<div><span>' + count + '</span></div>',
                    className: 'marker-cluster' + c,
                    iconSize: L.point(40, 40)
                });
            }
        });

        map.addLayer(markerClusterGroup);

        // Add markers
        addMarkersToMap();

        // Initialize filters
        initFilters();

        // Initialize species list
        renderSpeciesList();

        // Initialize map controls
        initMapControls();

        // Check URL parameters
        checkURLParameters();

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// ============================================
// ADD MARKERS
// ============================================

function addMarkersToMap() {
    // Clear existing markers
    markerClusterGroup.clearLayers();
    markers = [];

    // Filter species based on current filters
    const filteredSpecies = speciesData.filter(species =>
        currentFilters.status.includes(species.conservationStatus)
    );

    // Create markers for each species location
    filteredSpecies.forEach(species => {
        species.locations.forEach(location => {
            const marker = createMarker(species, location);
            markers.push(marker);
            markerClusterGroup.addLayer(marker);
        });
    });

    console.log('Added', markers.length, 'markers to map');
}

function createMarker(species, location) {
    const statusInfo = BiodiversityAtlas.formatConservationStatus(species.conservationStatus);
    
    // Custom icon based on conservation status
    const iconColor = getStatusColor(species.conservationStatus);
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${iconColor};
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg);
                    color: white;
                    font-weight: bold;
                    font-size: 10px;
                ">${statusInfo.abbr}</span>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const marker = L.marker([location.lat, location.lng], { icon: icon });

    // Create popup content
    const popupContent = `
        <div class="popup-content">
            <div class="popup-species-name">${species.commonName}</div>
            <div class="popup-scientific">${species.scientificName}</div>
            <div class="popup-location">📍 ${location.name}</div>
            <div class="status-badge ${statusInfo.class}">${statusInfo.abbr} ${species.conservationStatus}</div>
            <div class="popup-actions">
                <a href="catalog.html?species=${species.id}" class="popup-btn popup-btn-primary">
                    Lihat Detail
                </a>
                <button onclick="focusSpecies('${species.id}')" class="popup-btn popup-btn-secondary">
                    Fokus
                </button>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);
    marker.speciesId = species.id;
    marker.locationName = location.name;

    return marker;
}

function getStatusColor(status) {
    const colors = {
        'Critically Endangered': '#dc2626',
        'Endangered': '#ea580c',
        'Vulnerable': '#f59e0b',
        'Near Threatened': '#84cc16',
        'Least Concern': '#10b981'
    };
    return colors[status] || '#6b7280';
}

// ============================================
// FILTERS
// ============================================

function initFilters() {
    document.querySelectorAll('input[name="status"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!currentFilters.status.includes(e.target.value)) {
                    currentFilters.status.push(e.target.value);
                }
            } else {
                currentFilters.status = currentFilters.status.filter(s => s !== e.target.value);
            }
            applyFilters();
        });
    });
}

function applyFilters() {
    addMarkersToMap();
    renderSpeciesList();
}

// ============================================
// SPECIES LIST
// ============================================

function renderSpeciesList() {
    const speciesList = document.getElementById('speciesList');
    if (!speciesList) return;

    // Get unique species that match filters
    const filteredSpecies = speciesData.filter(species =>
        currentFilters.status.includes(species.conservationStatus)
    );

    // Sort by conservation status priority
    filteredSpecies.sort((a, b) => 
        BiodiversityAtlas.getStatusPriority(a.conservationStatus) - 
        BiodiversityAtlas.getStatusPriority(b.conservationStatus)
    );

    speciesList.innerHTML = filteredSpecies.map(species => {
        const locationCount = species.locations.length;
        const statusInfo = BiodiversityAtlas.formatConservationStatus(species.conservationStatus);
        
        return `
            <div class="species-list-item ${activeSpecies === species.id ? 'active' : ''}" 
                 onclick="focusSpecies('${species.id}')">
                <div class="species-item-header">
                    <span class="species-item-name">${species.commonName}</span>
                    <span class="species-item-count">${locationCount} lokasi</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="status-badge ${statusInfo.class}" style="font-size: 0.7rem;">
                        ${statusInfo.abbr}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--color-text-tertiary); font-style: italic;">
                        ${species.scientificName}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// FOCUS SPECIES
// ============================================

function focusSpecies(speciesId) {
    const species = speciesData.find(s => s.id === speciesId);
    if (!species) return;

    activeSpecies = speciesId;
    renderSpeciesList();

    // Get all markers for this species
    const speciesMarkers = markers.filter(m => m.speciesId === speciesId);
    
    if (speciesMarkers.length === 0) return;

    // If only one location, center on it
    if (speciesMarkers.length === 1) {
        map.setView(speciesMarkers[0].getLatLng(), 10);
        speciesMarkers[0].openPopup();
    } else {
        // Fit bounds to show all locations
        const bounds = L.latLngBounds(speciesMarkers.map(m => m.getLatLng()));
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Highlight markers
    speciesMarkers.forEach(marker => {
        marker.openPopup();
    });

    // Close mobile sidebar on focus
    const sidebar = document.getElementById('mapSidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
}

// Make focusSpecies available globally
window.focusSpecies = focusSpecies;

// ============================================
// MAP CONTROLS
// ============================================

function initMapControls() {
    // Reset view
    const resetBtn = document.getElementById('resetView');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            map.setView([-2.5, 118.0], 5);
            activeSpecies = null;
            renderSpeciesList();
        });
    }

    // Toggle clusters
    const toggleClustersBtn = document.getElementById('toggleClusters');
    let clustersEnabled = true;
    if (toggleClustersBtn) {
        toggleClustersBtn.addEventListener('click', () => {
            if (clustersEnabled) {
                map.removeLayer(markerClusterGroup);
                markers.forEach(marker => marker.addTo(map));
                toggleClustersBtn.style.opacity = '0.5';
            } else {
                markers.forEach(marker => map.removeLayer(marker));
                map.addLayer(markerClusterGroup);
                toggleClustersBtn.style.opacity = '1';
            }
            clustersEnabled = !clustersEnabled;
        });
    }

    // Mobile sidebar toggle
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('mapSidebar');
    if (mobileSidebarToggle && sidebar) {
        mobileSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

// ============================================
// URL PARAMETERS
// ============================================

function checkURLParameters() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('species')) {
        const speciesId = params.get('species');
        setTimeout(() => focusSpecies(speciesId), 500);
    }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', initMap);