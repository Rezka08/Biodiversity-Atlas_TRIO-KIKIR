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
// SPECIES SELECT
// ============================================

function initSpeciesSelect() {
    const speciesSelect = document.getElementById('speciesSelect');
    if (!speciesSelect) return;

    // Sort species by name
    const sortedSpecies = [...speciesData].sort((a, b) => 
        a.commonName.localeCompare(b.commonName)
    );

    // Populate options
    speciesSelect.innerHTML = `
        <option value="">-- Pilih spesies --</option>
        ${sortedSpecies.map(species => `
            <option value="${species.id}">
                ${species.commonName} (${species.scientificName})
            </option>
        `).join('')}
        <option value="unknown">Tidak Diketahui / Lainnya</option>
    `;
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
        coordsEl.textContent = `Lat: ${selectedLocation.lat}, Lng: ${selectedLocation.lng}`;
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
    // Validate required fields
    if (!uploadedImage) {
        alert('Harap upload foto pengamatan');
        return;
    }

    const speciesId = document.getElementById('speciesSelect').value;
    if (!speciesId) {
        alert('Harap pilih spesies');
        return;
    }

    if (!selectedLocation) {
        alert('Harap pilih lokasi di peta');
        return;
    }

    // Get form data
    const formData = {
        image: uploadedImage,
        speciesId: speciesId,
        uploaderName: document.getElementById('uploaderName').value || 'Anonim',
        location: selectedLocation,
        locationName: document.getElementById('locationName').value || 'Lokasi tidak disebutkan',
        notes: document.getElementById('observationNotes').value || '',
        date: document.getElementById('observationDate').value,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };

    console.log('Form submitted:', formData);

    // Simulate submission (in real app, this would be an API call)
    submitFinding(formData);
}

function submitFinding(data) {
    // Show loading (you could add a loading spinner here)
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Mengirim...</span>';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Store in localStorage for demo purposes
        const findings = JSON.parse(localStorage.getItem('findings') || '[]');
        findings.push(data);
        localStorage.setItem('findings', JSON.stringify(findings));

        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.add('active');

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Reset form after 3 seconds
        setTimeout(() => {
            resetForm();
            successMessage.classList.remove('active');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 3000);
    }, 1500);
}

function resetForm() {
    // Clear image
    clearImage();

    // Reset form fields
    document.getElementById('submitForm').reset();

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