// ============================================
// DASHBOARD PAGE - DATA VISUALIZATION
// ============================================

let charts = {};
let dashboardData = {
    speciesViews: {},
    findings: []
};

// ============================================
// INITIALIZE DASHBOARD
// ============================================

async function initDashboard() {
    try {
        // Load species data
        await BiodiversityAtlas.loadSpeciesData();
        speciesData = BiodiversityAtlas.speciesData;

        console.log('Dashboard - Species data loaded:', speciesData.length, 'species');

        if (!speciesData || speciesData.length === 0) {
            console.error('No species data available!');
            return;
        }

        // Load dashboard data from localStorage
        loadDashboardData();

        // Update stats cards
        updateStatsCards();

        // Initialize charts
        initConservationChart();
        initHabitatChart();
        initCategoryChart();
        initFindingsChart();

        // Render tables
        renderTopSpeciesTable();
        renderActivityTimeline();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// ============================================
// LOAD DATA
// ============================================

function loadDashboardData() {
    // Load species views
    dashboardData.speciesViews = JSON.parse(localStorage.getItem('speciesViews') || '{}');
    
    // Initialize views for new species
    speciesData.forEach(species => {
        if (!dashboardData.speciesViews[species.id]) {
            dashboardData.speciesViews[species.id] = Math.floor(Math.random() * 500) + 100;
        }
    });
    
    // Load findings
    dashboardData.findings = JSON.parse(localStorage.getItem('findings') || '[]');
    
    // Save back
    localStorage.setItem('speciesViews', JSON.stringify(dashboardData.speciesViews));
}

// ============================================
// STATS CARDS
// ============================================

function updateStatsCards() {
    // Total species
    const totalSpecies = speciesData.length;
    BiodiversityAtlas.animateCounter(document.getElementById('totalSpecies'), totalSpecies);
    
    // Endangered species
    const endangeredCount = speciesData.filter(s => 
        ['Critically Endangered', 'Endangered'].includes(s.conservationStatus)
    ).length;
    BiodiversityAtlas.animateCounter(document.getElementById('endangeredSpecies'), endangeredCount);
    
    // Total locations
    const uniqueLocations = new Set(
        speciesData.flatMap(s => s.locations.map(l => l.name))
    );
    BiodiversityAtlas.animateCounter(document.getElementById('totalLocations'), uniqueLocations.size);
    
    // Total findings
    BiodiversityAtlas.animateCounter(document.getElementById('totalFindings'), dashboardData.findings.length);
}

// ============================================
// CONSERVATION STATUS CHART
// ============================================

function initConservationChart() {
    const ctx = document.getElementById('conservationChart');
    
    // Count species by status
    const statusCounts = {};
    speciesData.forEach(species => {
        statusCounts[species.conservationStatus] = (statusCounts[species.conservationStatus] || 0) + 1;
    });
    
    // Chart colors
    const colors = {
        'Critically Endangered': '#dc2626',
        'Endangered': '#ea580c',
        'Vulnerable': '#f59e0b',
        'Near Threatened': '#84cc16',
        'Least Concern': '#10b981'
    };
    
    charts.conservation = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: Object.keys(statusCounts).map(status => colors[status]),
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-surface').trim()
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-text-primary').trim()
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// HABITAT DISTRIBUTION CHART
// ============================================

function initHabitatChart() {
    const ctx = document.getElementById('habitatChart');
    
    // Count species by habitat
    const habitatCounts = {};
    speciesData.forEach(species => {
        species.habitat.forEach(habitat => {
            habitatCounts[habitat] = (habitatCounts[habitat] || 0) + 1;
        });
    });
    
    // Sort by count
    const sortedHabitats = Object.entries(habitatCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    charts.habitat = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedHabitats.map(([habitat]) => 
                BiodiversityAtlas.formatHabitat(habitat).replace(/^.+\s/, '')
            ),
            datasets: [{
                label: 'Jumlah Spesies',
                data: sortedHabitats.map(([, count]) => count),
                backgroundColor: 'rgba(45, 122, 62, 0.8)',
                borderColor: 'rgba(45, 122, 62, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Inter',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-border').trim()
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-text-secondary').trim()
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================
// CATEGORY CHART
// ============================================

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    
    // Count species by category/tags
    const categoryCounts = {};
    const categoryLabels = {
        'mammal': 'Mamalia',
        'bird': 'Burung',
        'reptile': 'Reptil',
        'amphibian': 'Amfibi',
        'fish': 'Ikan',
        'insect': 'Serangga',
        'plant': 'Tumbuhan'
    };
    
    speciesData.forEach(species => {
        species.tags.forEach(tag => {
            if (categoryLabels[tag]) {
                categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
            }
        });
    });
    
    const colors = [
        '#2d7a3e', '#3d9b52', '#f59e0b', '#06b6d4', 
        '#8b5cf6', '#ec4899', '#ef4444'
    ];
    
    charts.category = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryCounts).map(key => categoryLabels[key]),
            datasets: [{
                data: Object.values(categoryCounts),
                backgroundColor: colors.slice(0, Object.keys(categoryCounts).length),
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-surface').trim()
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-text-primary').trim()
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// FINDINGS CHART
// ============================================

function initFindingsChart() {
    const ctx = document.getElementById('findingsChart');
    
    // Generate mock data for last 6 months
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const mockData = [12, 19, 15, 25, 22, 30];
    
    charts.findings = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Temuan Dilaporkan',
                data: mockData,
                borderColor: '#2d7a3e',
                backgroundColor: 'rgba(45, 122, 62, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#2d7a3e',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Inter',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5,
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-border').trim()
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-text-secondary').trim()
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================
// TOP SPECIES TABLE
// ============================================

function renderTopSpeciesTable() {
    const tableBody = document.getElementById('topSpeciesTable');
    
    // Sort species by views
    const sortedSpecies = speciesData
        .map(species => ({
            ...species,
            views: dashboardData.speciesViews[species.id] || 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    
    tableBody.innerHTML = sortedSpecies.map((species, index) => {
        const statusInfo = BiodiversityAtlas.formatConservationStatus(species.conservationStatus);
        return `
            <tr onclick="window.location.href='catalog.html?species=${species.id}'" style="cursor: pointer;">
                <td class="species-rank">${index + 1}</td>
                <td>
                    <div class="species-info">
                        <div class="species-common-name">${species.commonName}</div>
                        <div class="species-scientific-name">${species.scientificName}</div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusInfo.class}">${statusInfo.abbr}</span>
                </td>
                <td class="species-views">${species.views.toLocaleString()}</td>
            </tr>
        `;
    }).join('');
}

// ============================================
// ACTIVITY TIMELINE
// ============================================

function renderActivityTimeline() {
    const timeline = document.getElementById('activityTimeline');
    
    // Generate mock activities
    const activities = [
        {
            type: 'Temuan Baru',
            description: 'Pengguna melaporkan Harimau Sumatera di Taman Nasional Kerinci',
            time: '2 jam yang lalu',
            icon: '📸'
        },
        {
            type: 'Kuis Selesai',
            description: '15 pengguna menyelesaikan kuis keanekaragaman hayati',
            time: '5 jam yang lalu',
            icon: '🎓'
        },
        {
            type: 'Spesies Ditambahkan',
            description: 'Data Kupu-kupu Sayap Burung diperbarui dengan lokasi baru',
            time: '1 hari yang lalu',
            icon: '🦋'
        },
        {
            type: 'Milestone',
            description: 'Platform mencapai 1000 temuan yang diverifikasi!',
            time: '2 hari yang lalu',
            icon: '🎉'
        },
        {
            type: 'Temuan Baru',
            description: 'Jalak Bali terlihat di Taman Nasional Bali Barat',
            time: '3 hari yang lalu',
            icon: '📸'
        }
    ];
    
    // Add real findings if any
    if (dashboardData.findings.length > 0) {
        const recentFindings = dashboardData.findings
            .slice(-3)
            .reverse()
            .map(finding => {
                const species = speciesData.find(s => s.id === finding.speciesId);
                return {
                    type: 'Temuan Baru',
                    description: `${finding.uploaderName} melaporkan ${species ? species.commonName : 'spesies'} di ${finding.locationName}`,
                    time: timeAgo(new Date(finding.submittedAt)),
                    icon: '📸'
                };
            });
        
        activities.unshift(...recentFindings);
    }
    
    timeline.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-content">
                <div class="activity-type">${activity.icon} ${activity.type}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun yang lalu";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan yang lalu";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari yang lalu";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam yang lalu";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit yang lalu";
    
    return "Baru saja";
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', initDashboard);