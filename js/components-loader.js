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

    console.log('✅ Component-dependent features initialized');
}

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
