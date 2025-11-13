// ============================================
// SUBMIT FINDING PAGE
// ============================================

let mapPicker;
let selectedLocation = null;
let uploadedImage = null;

// ============================================
// INITIALIZE
// ============================================

async function initSubmitPage() {
    try {
        // Load species data
        await BiodiversityAtlas.loadSpeciesData();
        speciesData = BiodiversityAtlas.speciesData;

        console.log('Submit - Species data loaded:', speciesData.length, 'species');

        // Initialize form components
        initImageUpload();
        initSpeciesSelect();
        initMapPicker();
        initFormHandlers();
        
        // Set default date to today
        document.getElementById('observationDate').valueAsDate = new Date();

    } catch (error) {
        console.error('Error initializing submit page:', error);
    }
}

// ============================================
// IMAGE UPLOAD
// ============================================

function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeBtn = document.getElementById('removeImageBtn');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // File input change
    imageInput.addEventListener('change', (e) => {
        handleImageUpload(e.target.files[0]);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    });

    // Remove image
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearImage();
    });
}

function handleImageUpload(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Harap upload file gambar (JPG, PNG)');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = {
            file: file,
            dataUrl: e.target.result,
            name: file.name,
            size: file.size
        };

        // Show preview
        const previewImage = document.getElementById('previewImage');
        const imagePreview = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('imageUploadArea');

        previewImage.src = e.target.result;
        imagePreview.classList.add('active');
        uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    uploadedImage = null;
    
    const previewImage = document.getElementById('previewImage');
    const imagePreview = document.getElementById('imagePreview');
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');

    previewImage.src = '';
    imagePreview.classList.remove('active');
    uploadArea.style.display = 'block';
    imageInput.value = '';
}

// ============================================
// SPECIES AUTOCOMPLETE
// ============================================

let selectedSpeciesIndex = -1;
let filteredSpecies = [];

function initSpeciesSelect() {
    const speciesInput = document.getElementById('speciesInput');
    const speciesDropdown = document.getElementById('speciesDropdown');
    const speciesIdInput = document.getElementById('speciesId');

    if (!speciesInput) return;

    // Sort species by name
    const sortedSpecies = [...speciesData].sort((a, b) =>
        a.commonName.localeCompare(b.commonName)
    );

    // Input event - search as user types
    speciesInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm.length === 0) {
            speciesDropdown.classList.remove('active');
            speciesIdInput.value = '';
            return;
        }

        // Filter species
        filteredSpecies = sortedSpecies.filter(species =>
            species.commonName.toLowerCase().includes(searchTerm) ||
            species.scientificName.toLowerCase().includes(searchTerm)
        );

        // Add "Unknown" option if search matches
        if ('tidak diketahui'.includes(searchTerm) || 'unknown'.includes(searchTerm)) {
            filteredSpecies.push({
                id: 'unknown',
                commonName: 'Tidak Diketahui / Lainnya',
                scientificName: 'Unknown species'
            });
        }

        displayAutocompleteResults(filteredSpecies);
        selectedSpeciesIndex = -1;
    });

    // Keyboard navigation
    speciesInput.addEventListener('keydown', (e) => {
        if (!speciesDropdown.classList.contains('active')) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSpeciesIndex = Math.min(selectedSpeciesIndex + 1, filteredSpecies.length - 1);
            updateSelectedItem();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSpeciesIndex = Math.max(selectedSpeciesIndex - 1, 0);
            updateSelectedItem();
        } else if (e.key === 'Enter' && selectedSpeciesIndex >= 0) {
            e.preventDefault();
            selectSpecies(filteredSpecies[selectedSpeciesIndex]);
        } else if (e.key === 'Escape') {
            speciesDropdown.classList.remove('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!speciesInput.contains(e.target) && !speciesDropdown.contains(e.target)) {
            speciesDropdown.classList.remove('active');
        }
    });

    // Focus event - show dropdown if has value
    speciesInput.addEventListener('focus', (e) => {
        if (e.target.value.trim().length > 0) {
            speciesInput.dispatchEvent(new Event('input'));
        }
    });
}

function displayAutocompleteResults(results) {
    const speciesDropdown = document.getElementById('speciesDropdown');

    if (results.length === 0) {
        speciesDropdown.innerHTML = `
            <div class="autocomplete-no-results">
                Spesies tidak ditemukan. Coba kata kunci lain.
            </div>
        `;
        speciesDropdown.classList.add('active');
        return;
    }

    // Limit to 10 results for performance
    const displayResults = results.slice(0, 10);

    speciesDropdown.innerHTML = displayResults.map((species, index) => `
        <div class="autocomplete-item" data-index="${index}" data-species-id="${species.id}">
            <div class="autocomplete-item-name">${species.commonName}</div>
            <div class="autocomplete-item-scientific">${species.scientificName}</div>
        </div>
    `).join('');

    // Add click handlers
    speciesDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const speciesId = item.getAttribute('data-species-id');
            const species = results.find(s => s.id === speciesId);
            selectSpecies(species);
        });
    });

    speciesDropdown.classList.add('active');
}

function updateSelectedItem() {
    const items = document.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
        if (index === selectedSpeciesIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function selectSpecies(species) {
    const speciesInput = document.getElementById('speciesInput');
    const speciesIdInput = document.getElementById('speciesId');
    const speciesDropdown = document.getElementById('speciesDropdown');

    speciesInput.value = species.commonName;
    speciesIdInput.value = species.id;
    speciesDropdown.classList.remove('active');
}

// ============================================
// MAP PICKER
// ============================================

function initMapPicker() {
    // Initialize map
    mapPicker = L.map('mapPicker', {
        center: [-2.5, 118.0],
        zoom: 5,
        zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(mapPicker);

    // Add click handler
    let marker = null;
    mapPicker.on('click', (e) => {
        const { lat, lng } = e.latlng;

        // Remove previous marker
        if (marker) {
            mapPicker.removeLayer(marker);
        }

        // Add new marker
        marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `
                    <div style="
                        background: #2d7a3e;
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
                            font-size: 16px;
                        ">📍</span>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(mapPicker);

        // Update location
        selectedLocation = {
            lat: lat.toFixed(6),
            lng: lng.toFixed(6)
        };

        updateLocationDisplay();
    });

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                mapPicker.setView([latitude, longitude], 10);
            },
            (error) => {
                console.log('Geolocation error:', error);
            }
        );
    }
}

function updateLocationDisplay() {
    const coordsEl = document.getElementById('locationCoords');
    const statusEl = document.getElementById('locationStatus');

    if (selectedLocation) {
        coordsEl.textContent = `${selectedLocation.lat}, ${selectedLocation.lng}`;
        statusEl.innerHTML = `
            <span>✅</span>
            <span>Lokasi dipilih</span>
        `;
        statusEl.classList.add('selected');
    } else {
        coordsEl.textContent = 'Klik pada peta untuk menandai lokasi';
        statusEl.innerHTML = `
            <span>⚠️</span>
            <span>Belum dipilih</span>
        `;
        statusEl.classList.remove('selected');
    }
}

// ============================================
// FORM HANDLERS
// ============================================

function initFormHandlers() {
    const form = document.getElementById('submitForm');
    const resetBtn = document.getElementById('resetBtn');

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit();
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mereset form?')) {
            resetForm();
        }
    });
}

function handleFormSubmit() {
    // Check if user is logged in
    if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
        alert('⚠️ Anda harus login terlebih dahulu untuk submit temuan!');
        window.location.href = 'login.html';
        return;
    }

    // Validate required fields
    if (!uploadedImage) {
        alert('⚠️ Harap upload foto pengamatan');
        return;
    }

    const speciesId = document.getElementById('speciesId').value;
    const speciesInput = document.getElementById('speciesInput').value;
    if (!speciesId || !speciesInput) {
        alert('⚠️ Harap pilih spesies dari daftar');
        return;
    }

    if (!selectedLocation) {
        alert('⚠️ Harap pilih lokasi di peta');
        return;
    }

    // Get species name from input
    const speciesName = speciesInput;

    // Validate Quick Facts fields
    const speciesSize = document.getElementById('speciesSize').value;
    const speciesDiet = document.getElementById('speciesDiet').value;
    const speciesLifespan = document.getElementById('speciesLifespan').value;
    const speciesReproduction = document.getElementById('speciesReproduction').value;

    if (!speciesSize || !speciesDiet || !speciesLifespan || !speciesReproduction) {
        alert('⚠️ Harap lengkapi semua field Fakta Singkat Spesies');
        return;
    }

    // Get form data
    const formData = {
        speciesId: speciesId,
        speciesName: speciesName,
        image: uploadedImage.dataUrl, // Store base64 image
        location: selectedLocation,
        locationName: document.getElementById('locationName').value || 'Lokasi tidak disebutkan',
        observationNotes: document.getElementById('observationNotes').value || '',
        observationDate: document.getElementById('observationDate').value,
        quickFacts: {
            size: speciesSize,
            diet: speciesDiet,
            lifespan: speciesLifespan,
            reproduction: speciesReproduction
        }
    };

    console.log('Form submitted:', formData);

    // Submit using auth system
    submitFinding(formData);
}

function submitFinding(data) {
    // Show loading
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Mengirim...</span>';
    submitBtn.disabled = true;

    // Save using auth system
    setTimeout(() => {
        const result = saveSubmission(data);

        if (result.success) {
            // Show success message
            const successMessage = document.getElementById('successMessage');
            const successText = successMessage.querySelector('.success-text');
            successText.textContent = result.message + ' Admin akan mereview submission Anda dalam 1-3 hari kerja.';
            successMessage.classList.add('active');

            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Reset form after 4 seconds
            setTimeout(() => {
                resetForm();
                successMessage.classList.remove('active');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 4000);
        } else {
            // Show error
            alert('❌ Error: ' + result.message);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
}

function resetForm() {
    // Clear image
    clearImage();

    // Reset form fields
    document.getElementById('submitForm').reset();

    // Clear autocomplete
    document.getElementById('speciesId').value = '';
    document.getElementById('speciesDropdown').classList.remove('active');

    // Reset location
    selectedLocation = null;
    updateLocationDisplay();

    // Re-center map
    mapPicker.setView([-2.5, 118.0], 5);

    // Set default date
    document.getElementById('observationDate').valueAsDate = new Date();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', initSubmitPage);