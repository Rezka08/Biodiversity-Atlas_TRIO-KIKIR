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
    const logoutBtn = document.getElementById('logoutBtn');

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

        // Populate user info
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('dropdownName').textContent = user.name;
        document.getElementById('dropdownEmail').textContent = user.email;
        document.getElementById('dropdownRole').textContent = user.role;

        // Show admin dashboard link if user is admin
        if (user.role === 'admin') {
            const adminLink = document.getElementById('adminDashboardLink');
            if (adminLink) {
                adminLink.classList.add('show');
            }
        }

        // Handle profile dropdown toggle (remove old listeners first)
        if (profileToggle && profileDropdown) {
            // Clone to remove old event listeners
            const newProfileToggle = profileToggle.cloneNode(true);
            profileToggle.parentNode.replaceChild(newProfileToggle, profileToggle);

            newProfileToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                newProfileToggle.classList.toggle('active');
                profileDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    newProfileToggle.classList.remove('active');
                    profileDropdown.classList.remove('active');
                }
            });
        }

        // Handle logout
        if (logoutBtn) {
            // Clone to remove old event listeners
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

            newLogoutBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    logout();
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
