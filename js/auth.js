/**
 * Authentication System
 * Handles login, register, logout, and session management
 */

// Initialize default admin account if not exists
function initializeDefaultAccounts() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if admin account already exists
    const adminExists = users.find(u => u.email === 'admin@biodiversity.com');

    // Create default admin if it doesn't exist
    if (!adminExists) {
        const defaultAdmin = {
            id: generateId(),
            name: 'Admin',
            email: 'admin@biodiversity.com',
            password: 'admin123', // In production, this should be hashed
            role: 'admin',
            createdAt: new Date().toISOString()
        };

        users.push(defaultAdmin);
        localStorage.setItem('users', JSON.stringify(users));

        console.log('✅ Default admin account created');
        console.log('Email: admin@biodiversity.com');
        console.log('Password: admin123');
    }
}

// Generate unique ID
function generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Register new user
function register(name, email, password) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if email already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return {
                success: false,
                message: 'Email sudah terdaftar!'
            };
        }

        // Validate password length
        if (password.length < 6) {
            return {
                success: false,
                message: 'Password minimal 6 karakter!'
            };
        }

        // Create new user (always as 'user' role, admin account is pre-created only)
        const newUser = {
            id: generateId(),
            name,
            email,
            password, // In production, this should be hashed
            role: 'user', // Force all registrations to be 'user' role
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return {
            success: true,
            message: 'Registrasi berhasil! Silakan login.',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat registrasi.'
        };
    }
}

// Login user
function login(email, password) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Find user by email
        const user = users.find(u => u.email === email);

        if (!user) {
            return {
                success: false,
                message: 'Email tidak ditemukan!'
            };
        }

        // Check password
        if (user.password !== password) {
            return {
                success: false,
                message: 'Password salah!'
            };
        }

        // Create session
        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            loginAt: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(session));

        return {
            success: true,
            message: 'Login berhasil!',
            user: session
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat login.'
        };
    }
}

// Logout user
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Check if user is logged in
function isLoggedIn() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser !== null;
}

// Get current logged in user
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Require login (redirect to login if not logged in)
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Require admin (redirect to home if not admin)
function requireAdmin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }

    if (!isAdmin()) {
        alert('Akses ditolak! Halaman ini hanya untuk admin.');
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

// Get all users (admin only)
function getAllUsers() {
    if (!isAdmin()) {
        console.error('Unauthorized: Only admin can access user list');
        return [];
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    }));
}

// Save submission
function saveSubmission(submissionData) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu!'
            };
        }

        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');

        const newSubmission = {
            id: 'submission_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            status: 'pending', // pending, approved, rejected
            ...submissionData,
            submittedAt: new Date().toISOString()
        };

        submissions.push(newSubmission);
        localStorage.setItem('submissions', JSON.stringify(submissions));

        return {
            success: true,
            message: 'Temuan berhasil disubmit! Menunggu persetujuan admin.',
            submission: newSubmission
        };
    } catch (error) {
        console.error('Submission error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat menyimpan submission.'
        };
    }
}

// Get all submissions (admin only)
function getAllSubmissions() {
    if (!isAdmin()) {
        console.error('Unauthorized: Only admin can access all submissions');
        return [];
    }

    return JSON.parse(localStorage.getItem('submissions') || '[]');
}

// Get user's submissions
function getUserSubmissions() {
    const user = getCurrentUser();
    if (!user) return [];

    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    return submissions.filter(s => s.userId === user.id);
}

// Update submission status (admin only)
function updateSubmissionStatus(submissionId, status, rejectionReason = '') {
    if (!isAdmin()) {
        return {
            success: false,
            message: 'Unauthorized: Only admin can update submission status'
        };
    }

    try {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const index = submissions.findIndex(s => s.id === submissionId);

        if (index === -1) {
            return {
                success: false,
                message: 'Submission tidak ditemukan!'
            };
        }

        submissions[index].status = status;
        submissions[index].reviewedAt = new Date().toISOString();
        submissions[index].reviewedBy = getCurrentUser().name;

        if (status === 'rejected' && rejectionReason) {
            submissions[index].rejectionReason = rejectionReason;
        }

        localStorage.setItem('submissions', JSON.stringify(submissions));

        return {
            success: true,
            message: `Submission berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}!`,
            submission: submissions[index]
        };
    } catch (error) {
        console.error('Update submission error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat update submission.'
        };
    }
}

// Delete submission (admin only)
function deleteSubmission(submissionId) {
    if (!isAdmin()) {
        return {
            success: false,
            message: 'Unauthorized: Only admin can delete submissions'
        };
    }

    try {
        let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        submissions = submissions.filter(s => s.id !== submissionId);
        localStorage.setItem('submissions', JSON.stringify(submissions));

        return {
            success: true,
            message: 'Submission berhasil dihapus!'
        };
    } catch (error) {
        console.error('Delete submission error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat menghapus submission.'
        };
    }
}

// Get submission statistics
function getSubmissionStats() {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');

    return {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length
    };
}

// Initialize default accounts on load
initializeDefaultAccounts();

// Export functions to window object
window.register = register;
window.login = login;
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;
window.requireLogin = requireLogin;
window.requireAdmin = requireAdmin;
window.getAllUsers = getAllUsers;
window.saveSubmission = saveSubmission;
window.getAllSubmissions = getAllSubmissions;
window.getUserSubmissions = getUserSubmissions;
window.updateSubmissionStatus = updateSubmissionStatus;
window.deleteSubmission = deleteSubmission;
window.getSubmissionStats = getSubmissionStats;
