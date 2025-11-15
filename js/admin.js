        if (!requireAdmin()) {
            // Will redirect if not admin
        }

        // Display admin name
        const admin = getCurrentUser();
        if (admin) {
            document.getElementById('adminName').textContent = admin.name;
        }

        let currentFilter = 'all';
        let currentSubmissionId = null;

        // Load and display submissions
        function loadSubmissions() {
            const submissions = getAllSubmissions();
            const stats = getSubmissionStats();

            // Update stats
            document.getElementById('totalSubmissions').textContent = stats.total;
            document.getElementById('pendingSubmissions').textContent = stats.pending;
            document.getElementById('approvedSubmissions').textContent = stats.approved;
            document.getElementById('rejectedSubmissions').textContent = stats.rejected;

            // Update counts
            document.getElementById('countAll').textContent = stats.total;
            document.getElementById('countPending').textContent = stats.pending;
            document.getElementById('countApproved').textContent = stats.approved;
            document.getElementById('countRejected').textContent = stats.rejected;

            // Filter submissions based on current filter
            let filteredSubmissions = submissions;
            if (currentFilter !== 'all') {
                filteredSubmissions = submissions.filter(s => s.status === currentFilter);
            }

            // Sort by date (newest first)
            filteredSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            // Display submissions
            displaySubmissions(filteredSubmissions);
        }

        function displaySubmissions(submissions) {
            const container = document.getElementById('submissionsList');
            const emptyState = document.getElementById('emptyState');

            if (submissions.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');

            container.innerHTML = submissions.map(submission => {
                const statusBadge = getStatusBadge(submission.status);
                const actionButtons = getActionButtons(submission);

                return `
                    <div class="px-6 py-6 hover:bg-gray-50 transition">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-3 mb-3">
                                    <h3 class="text-lg font-semibold text-gray-900">
                                        ${submission.speciesName || 'Spesies Tidak Diketahui'}
                                    </h3>
                                    ${statusBadge}
                                    <button
                                        onclick="showDetailModal('${submission.id}')"
                                        class="ml-auto px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                                    >
                                        👁️ Lihat Detail
                                    </button>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p class="text-gray-600 mb-1">Disubmit oleh:</p>
                                        <p class="font-medium text-gray-900">${submission.userName}</p>
                                        <p class="text-gray-500">${submission.userEmail}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600 mb-1">Tanggal Submit:</p>
                                        <p class="font-medium text-gray-900">${formatDate(submission.submittedAt)}</p>
                                    </div>
                                    ${submission.locationName ? `
                                    <div>
                                        <p class="text-gray-600 mb-1">Lokasi:</p>
                                        <p class="font-medium text-gray-900">${submission.locationName}</p>
                                    </div>
                                    ` : ''}
                                    ${submission.observationDate ? `
                                    <div>
                                        <p class="text-gray-600 mb-1">Tanggal Observasi:</p>
                                        <p class="font-medium text-gray-900">${formatDate(submission.observationDate)}</p>
                                    </div>
                                    ` : ''}
                                    ${submission.observationNotes ? `
                                    <div class="col-span-2">
                                        <p class="text-gray-600 mb-1">Catatan:</p>
                                        <p class="text-gray-900">${submission.observationNotes}</p>
                                    </div>
                                    ` : ''}
                                </div>

                                ${submission.status === 'rejected' && submission.rejectionReason ? `
                                <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p class="text-sm font-semibold text-red-800 mb-1">Alasan Penolakan:</p>
                                    <p class="text-sm text-red-700">${submission.rejectionReason}</p>
                                </div>
                                ` : ''}

                                ${submission.reviewedAt ? `
                                <div class="mt-3 text-xs text-gray-500">
                                    Direview oleh <span class="font-medium">${submission.reviewedBy}</span> pada ${formatDate(submission.reviewedAt)}
                                </div>
                                ` : ''}
                            </div>

                            ${actionButtons}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function getStatusBadge(status) {
            const badges = {
                pending: '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full"><span class="mr-1">⏳</span> Pending</span>',
                approved: '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full"><span class="mr-1">✅</span> Approved</span>',
                rejected: '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full"><span class="mr-1">❌</span> Rejected</span>'
            };
            return badges[status] || '';
        }

        function getActionButtons(submission) {
            if (submission.status === 'pending') {
                return `
                    <div class="ml-6 flex flex-col space-y-2">
                        <button
                            onclick="approveSubmission('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center space-x-2 shadow-sm"
                        >
                            <span>✅</span>
                            <span>Approve</span>
                        </button>
                        <button
                            onclick="openRejectionModal('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center space-x-2 shadow-sm"
                        >
                            <span>❌</span>
                            <span>Reject</span>
                        </button>
                    </div>
                `;
            } else {
                return `
                    <div class="ml-6">
                        <button
                            onclick="deleteSubmissionConfirm('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition shadow-sm"
                        >
                            🗑️ Hapus
                        </button>
                    </div>
                `;
            }
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function filterSubmissions(filter) {
            currentFilter = filter;

            // Update active tab
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('border-primary-500', 'text-primary-600');
                tab.classList.add('border-transparent', 'text-gray-500');
            });

            event.target.classList.remove('border-transparent', 'text-gray-500');
            event.target.classList.add('border-primary-500', 'text-primary-600');

            loadSubmissions();
        }

        function approveSubmission(id) {
            if (confirm('Approve submission ini?')) {
                const result = updateSubmissionStatus(id, 'approved');
                if (result.success) {
                    alert('✅ ' + result.message);
                    loadSubmissions();
                } else {
                    alert('❌ Error: ' + result.message);
                }
            }
        }

        function openRejectionModal(id) {
            currentSubmissionId = id;
            document.getElementById('rejectionModal').classList.remove('hidden');
            document.getElementById('rejectionModal').classList.add('flex');
            document.getElementById('rejectionReason').value = '';
            document.getElementById('rejectionReason').focus();
        }

        function closeRejectionModal() {
            document.getElementById('rejectionModal').classList.add('hidden');
            document.getElementById('rejectionModal').classList.remove('flex');
            currentSubmissionId = null;
        }

        function confirmRejection() {
            const reason = document.getElementById('rejectionReason').value.trim();

            if (!reason) {
                alert('⚠️ Mohon masukkan alasan penolakan!');
                return;
            }

            const result = updateSubmissionStatus(currentSubmissionId, 'rejected', reason);
            if (result.success) {
                alert('✅ ' + result.message);
                loadSubmissions();
                closeRejectionModal();
            } else {
                alert('❌ Error: ' + result.message);
            }
        }

        function deleteSubmissionConfirm(id) {
            if (confirm('⚠️ Hapus submission ini? Tindakan ini tidak dapat dibatalkan!')) {
                const result = window.deleteSubmission(id);
                if (result.success) {
                    alert('✅ ' + result.message);
                    loadSubmissions();
                } else {
                    alert('❌ Error: ' + result.message);
                }
            }
        }

        // Show detail modal
        function showDetailModal(id) {
            const submissions = getAllSubmissions();
            const submission = submissions.find(s => s.id === id);

            if (!submission) {
                alert('Submission tidak ditemukan!');
                return;
            }

            const detailContent = document.getElementById('detailContent');
            const detailActions = document.getElementById('detailActions');
            const statusBadge = getStatusBadge(submission.status);

            // Build detail content
            detailContent.innerHTML = `
                <div class="space-y-6">
                    <!-- Status Badge -->
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-900">${submission.speciesName || 'Spesies Tidak Diketahui'}</h2>
                        ${statusBadge}
                    </div>

                    <!-- Image -->
                    ${submission.image ? `
                    <div class="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src="${submission.image}" alt="${submission.speciesName}" class="w-full h-auto max-h-96 object-contain bg-gray-50">
                    </div>
                    ` : `
                    <div class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                        <p class="text-gray-500">📷 Tidak ada foto</p>
                    </div>
                    `}

                    <!-- Details Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- User Info -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                                <span class="mr-2">👤</span> Informasi Pengamat
                            </h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <p class="text-gray-600">Nama:</p>
                                    <p class="font-medium text-gray-900">${submission.userName}</p>
                                </div>
                                <div>
                                    <p class="text-gray-600">Email:</p>
                                    <p class="font-medium text-gray-900">${submission.userEmail}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Date Info -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                                <span class="mr-2">📅</span> Informasi Waktu
                            </h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <p class="text-gray-600">Tanggal Observasi:</p>
                                    <p class="font-medium text-gray-900">${submission.observationDate ? formatDate(submission.observationDate) : 'Tidak disebutkan'}</p>
                                </div>
                                <div>
                                    <p class="text-gray-600">Tanggal Submit:</p>
                                    <p class="font-medium text-gray-900">${formatDate(submission.submittedAt)}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Location Info -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                                <span class="mr-2">📍</span> Informasi Lokasi
                            </h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <p class="text-gray-600">Nama Lokasi:</p>
                                    <p class="font-medium text-gray-900">${submission.locationName || 'Tidak disebutkan'}</p>
                                </div>
                                ${submission.location ? `
                                <div>
                                    <p class="text-gray-600">Koordinat:</p>
                                    <p class="font-mono text-xs text-gray-900">${submission.location.lat}, ${submission.location.lng}</p>
                                </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Species Info -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                                <span class="mr-2">🦎</span> Informasi Spesies
                            </h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <p class="text-gray-600">Nama Spesies:</p>
                                    <p class="font-medium text-gray-900">${submission.speciesName || 'Tidak Diketahui'}</p>
                                </div>
                                <div>
                                    <p class="text-gray-600">ID Spesies:</p>
                                    <p class="font-mono text-xs text-gray-900">${submission.speciesId || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Observation Notes -->
                    ${submission.observationNotes ? `
                    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
                            <span class="mr-2">📝</span> Catatan Pengamatan
                        </h4>
                        <p class="text-gray-700 text-sm leading-relaxed">${submission.observationNotes}</p>
                    </div>
                    ` : ''}

                    <!-- Rejection Reason -->
                    ${submission.status === 'rejected' && submission.rejectionReason ? `
                    <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 class="font-semibold text-red-900 mb-2 flex items-center">
                            <span class="mr-2">❌</span> Alasan Penolakan
                        </h4>
                        <p class="text-red-700 text-sm leading-relaxed">${submission.rejectionReason}</p>
                    </div>
                    ` : ''}

                    <!-- Review Info -->
                    ${submission.reviewedAt ? `
                    <div class="bg-gray-100 rounded-lg p-4">
                        <p class="text-sm text-gray-600">
                            Direview oleh <span class="font-semibold text-gray-900">${submission.reviewedBy}</span> pada ${formatDate(submission.reviewedAt)}
                        </p>
                    </div>
                    ` : ''}
                </div>
            `;

            // Build action buttons
            if (submission.status === 'pending') {
                detailActions.innerHTML = `
                    <button onclick="closeDetailModal()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium">
                        Tutup
                    </button>
                    <button
                        onclick="approveSubmissionFromDetail('${submission.id}')"
                        class="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-medium shadow-sm flex items-center space-x-2"
                    >
                        <span>✅</span>
                        <span>Approve</span>
                    </button>
                    <button
                        onclick="openRejectionModalFromDetail('${submission.id}')"
                        class="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-medium shadow-sm flex items-center space-x-2"
                    >
                        <span>❌</span>
                        <span>Reject</span>
                    </button>
                `;
            } else {
                detailActions.innerHTML = `
                    <button onclick="closeDetailModal()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium">
                        Tutup
                    </button>
                    <button
                        onclick="deleteSubmissionFromDetail('${submission.id}')"
                        class="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
                    >
                        🗑️ Hapus Submission
                    </button>
                `;
            }

            // Show modal
            document.getElementById('detailModal').classList.remove('hidden');
            document.getElementById('detailModal').classList.add('flex');
        }

        function closeDetailModal() {
            document.getElementById('detailModal').classList.add('hidden');
            document.getElementById('detailModal').classList.remove('flex');
        }

        function approveSubmissionFromDetail(id) {
            if (confirm('Approve submission ini?')) {
                const result = updateSubmissionStatus(id, 'approved');
                if (result.success) {
                    alert('✅ ' + result.message);
                    closeDetailModal();
                    loadSubmissions();
                } else {
                    alert('❌ Error: ' + result.message);
                }
            }
        }

        function openRejectionModalFromDetail(id) {
            closeDetailModal();
            openRejectionModal(id);
        }

        function deleteSubmissionFromDetail(id) {
            if (confirm('⚠️ Hapus submission ini? Tindakan ini tidak dapat dibatalkan!')) {
                const result = window.deleteSubmission(id);
                if (result.success) {
                    alert('✅ ' + result.message);
                    closeDetailModal();
                    loadSubmissions();
                } else {
                    alert('❌ Error: ' + result.message);
                }
            }
        }

        // Close detail modal when clicking outside
        document.getElementById('detailModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeDetailModal();
            }
        });

        // Close modal when clicking outside
        document.getElementById('rejectionModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeRejectionModal();
            }
        });

        // Load submissions on page load
        loadSubmissions();