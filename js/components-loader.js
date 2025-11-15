// ============================================
// COMPONENT LOADER
// Load reusable HTML components (navbar, footer)
// ============================================

/**
 * Load HTML component from file
 * @param {string} componentPath - Path to component file
 * @param {string} targetSelector - CSS selector where component should be inserted
 */
async function loadComponent(componentPath, targetSelector) {
    try {
        const response = await fetch(componentPath);

        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}: ${response.status}`);
        }

        const html = await response.text();
        const targetElement = document.querySelector(targetSelector);

        if (targetElement) {
            targetElement.innerHTML = html;
        } else {
            console.error(`Target element "${targetSelector}" not found`);
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

/**
 * Load all common components (navbar and footer)
 */
async function loadAllComponents() {
    await Promise.all([
        loadComponent('components/navbar.html', '#navbar-placeholder'),
        loadComponent('components/footer.html', '#footer-placeholder')
    ]);

    // Set active nav link based on current page
    setActiveNavLink();

    // Re-initialize features that depend on navbar/footer after components loaded
    initComponentDependentFeatures();
}

/**
 * Initialize features that depend on navbar/footer being loaded
 * This is called AFTER components are loaded
 */
function initComponentDependentFeatures() {
    // Wait for browser to finish parsing and rendering the inserted HTML
    // Use requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Re-initialize theme (dark mode toggle is in navbar)
            if (typeof initTheme === 'function') {
                initTheme();
            }

            // Re-initialize mobile navigation
            if (typeof initMobileNav === 'function') {
                initMobileNav();
            }

            // Initialize navbar authentication UI
            initNavbarAuth();

            console.log('✅ Component-dependent features initialized');
        });
    });
}

/**
 * Initialize navbar authentication UI
 * Show/hide login button or user profile based on login status
 */
function initNavbarAuth() {
    // Check if auth.js is loaded
    if (typeof isLoggedIn !== 'function') {
        // Auth.js not loaded yet, load it dynamically
        const script = document.createElement('script');
        script.src = 'js/auth.js';
        script.onload = () => {
            setupNavbarAuth();
        };
        document.body.appendChild(script);
    } else {
        setupNavbarAuth();
    }
}

function setupNavbarAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');

    if (!loginBtn || !userProfile) {
        console.warn('Navbar auth elements not found');
        return;
    }

    // Check if user is logged in
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        const user = getCurrentUser();

        // Hide login button, show user profile
        loginBtn.style.display = 'none';
        userProfile.style.display = 'block';

        // Function to populate user info with retry mechanism
        function populateUserInfo(attempts = 0) {
            const maxAttempts = 5;

            // Try to find elements
            const profileName = document.querySelector('#profileName');
            const dropdownName = document.querySelector('#dropdownName');
            const dropdownEmail = document.querySelector('#dropdownEmail');
            const dropdownRole = document.querySelector('#dropdownRole');
            const adminLink = document.querySelector('#adminDashboardLink');
            const logoutBtn = document.querySelector('#logoutBtn');

            console.log(`🔍 Attempt ${attempts + 1}: Searching for dropdown elements...`);
            console.log('Elements found:', {
                profileName: !!profileName,
                dropdownName: !!dropdownName,
                dropdownEmail: !!dropdownEmail,
                dropdownRole: !!dropdownRole,
                adminLink: !!adminLink,
                logoutBtn: !!logoutBtn
            });

            // If elements not found and haven't exceeded max attempts, retry
            if (!dropdownName && attempts < maxAttempts) {
                console.warn(`⚠️ Elements not found, retrying in 100ms...`);
                setTimeout(() => populateUserInfo(attempts + 1), 100);
                return;
            }

            // Populate elements
            if (profileName) {
                profileName.textContent = user.name;
                console.log('✅ Set profileName:', user.name);
            }
            if (dropdownName) {
                dropdownName.textContent = user.name;
                console.log('✅ Set dropdownName:', user.name);
            }
            if (dropdownEmail) {
                dropdownEmail.textContent = user.email;
                console.log('✅ Set dropdownEmail:', user.email);
            }
            if (dropdownRole) {
                dropdownRole.textContent = user.role;
                console.log('✅ Set dropdownRole:', user.role);
            }

            // Show/hide elements based on user role
            if (user.role === 'admin') {
                // Show admin dashboard link
                if (adminLink) {
                    adminLink.classList.add('show');
                    adminLink.style.display = 'flex';
                    console.log('✅ Admin dashboard link shown');
                }

                // Hide user-only links (Submit Temuan & Quiz) from navbar and dropdown
                const userOnlyLinks = document.querySelectorAll('.user-only');
                userOnlyLinks.forEach(link => {
                    link.classList.add('hide');
                    link.style.display = 'none';
                });
                console.log('✅ User-only links hidden for admin');
            } else {
                // For regular users, show user-only links
                const userOnlyLinks = document.querySelectorAll('.user-only');
                userOnlyLinks.forEach(link => {
                    link.classList.remove('hide');
                    link.style.display = '';
                });
                console.log('✅ User-only links shown for regular user');
            }

            // Handle logout button
            if (logoutBtn) {
                logoutBtn.onclick = function() {
                    if (confirm('Apakah Anda yakin ingin logout?')) {
                        logout();
                    }
                };
                console.log('✅ Logout button handler attached');
            }
        }

        // Start populating after a short delay
        setTimeout(() => populateUserInfo(), 100);

        // Handle profile dropdown toggle
        if (profileToggle && profileDropdown) {
            // Remove existing active classes
            profileToggle.classList.remove('active');
            profileDropdown.classList.remove('active');

            // Add click handler (using named function to avoid duplicates)
            profileToggle.onclick = function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
                profileDropdown.classList.toggle('active');
            };

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    profileToggle.classList.remove('active');
                    profileDropdown.classList.remove('active');
                }
            });
        }

        console.log('✅ Navbar auth initialized for user:', user.name);
    } else {
        // User not logged in, show login button
        loginBtn.style.display = 'inline-flex';
        userProfile.style.display = 'none';
        console.log('ℹ️ No user logged in');
    }
}

// Listen for storage changes (sync across tabs)
window.addEventListener('storage', (e) => {
    if (e.key === 'currentUser') {
        console.log('🔄 Login status changed in another tab, refreshing...');
        // Reload the page to reflect new login state
        location.reload();
    }
});

/**
 * Set active class on current page's nav link
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Load components when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
    loadAllComponents();
}
