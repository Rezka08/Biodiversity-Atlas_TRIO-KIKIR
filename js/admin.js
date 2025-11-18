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
                                        class="ml-auto px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition flex items-center gap-1.5"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1rem; height: 1rem;">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Lihat Detail
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
                pending: '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 0.875rem; height: 0.875rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Pending</span>',
                approved: '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 0.875rem; height: 0.875rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Approved</span>',
                rejected: '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 0.875rem; height: 0.875rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Rejected</span>'
            };
            return badges[status] || '';
        }

        function getActionButtons(submission) {
            if (submission.status === 'pending') {
                return `
                    <div class="ml-6 flex flex-col space-y-2">
                        <button
                            onclick="openEditModal('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.125rem; height: 1.125rem;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            <span>Edit</span>
                        </button>
                        <button
                            onclick="approveSubmission('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center space-x-2 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.125rem; height: 1.125rem;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Approve</span>
                        </button>
                        <button
                            onclick="openRejectionModal('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center space-x-2 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.125rem; height: 1.125rem;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Reject</span>
                        </button>
                    </div>
                `;
            } else {
                return `
                    <div class="ml-6 flex flex-col space-y-2">
                        <button
                            onclick="openEditModal('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.125rem; height: 1.125rem;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onclick="deleteSubmissionConfirm('${submission.id}')"
                            class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition shadow-sm flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.125rem; height: 1.125rem;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Hapus
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
                        <div class="flex items-center justify-center gap-2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                            </svg>
                            <span>Tidak ada foto</span>
                        </div>
                    </div>
                    `}

                    <!-- Details Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- User Info -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                Informasi Pengamat
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                Informasi Waktu
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                Informasi Lokasi
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>
                                Informasi Spesies
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Catatan Pengamatan
                        </h4>
                        <p class="text-gray-700 text-sm leading-relaxed">${submission.observationNotes}</p>
                    </div>
                    ` : ''}

                    <!-- Rejection Reason -->
                    ${submission.status === 'rejected' && submission.rejectionReason ? `
                    <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 class="font-semibold text-red-900 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Alasan Penolakan
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span>Approve</span>
                    </button>
                    <button
                        onclick="openRejectionModalFromDetail('${submission.id}')"
                        class="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-medium shadow-sm flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
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
                        class="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-medium shadow-sm flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        <span>Hapus Submission</span>
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

        // Edit submission functions
        function openEditModal(id) {
            const submissions = getAllSubmissions();
            const submission = submissions.find(s => s.id === id);

            if (!submission) {
                alert('Submission tidak ditemukan!');
                return;
            }

            // Populate form fields
            document.getElementById('editSubmissionId').value = submission.id;
            document.getElementById('editSpeciesName').value = submission.speciesName || '';
            document.getElementById('editScientificName').value = submission.scientificName || '';
            document.getElementById('editSize').value = submission.quickFacts?.size || '';
            document.getElementById('editDiet').value = submission.quickFacts?.diet || '';
            document.getElementById('editLifespan').value = submission.quickFacts?.lifespan || '';
            document.getElementById('editReproduction').value = submission.quickFacts?.reproduction || '';
            document.getElementById('editLocationName').value = submission.locationName || '';
            document.getElementById('editObservationNotes').value = submission.observationNotes || '';
            document.getElementById('editObservationDate').value = submission.observationDate || '';

            // Show modal
            document.getElementById('editModal').classList.remove('hidden');
            document.getElementById('editModal').classList.add('flex');
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.add('hidden');
            document.getElementById('editModal').classList.remove('flex');
        }

        function saveEditSubmission() {
            const id = document.getElementById('editSubmissionId').value;

            // Get updated values
            const updatedData = {
                speciesName: document.getElementById('editSpeciesName').value.trim(),
                scientificName: document.getElementById('editScientificName').value.trim(),
                locationName: document.getElementById('editLocationName').value.trim(),
                observationNotes: document.getElementById('editObservationNotes').value.trim(),
                observationDate: document.getElementById('editObservationDate').value,
                quickFacts: {
                    size: document.getElementById('editSize').value.trim(),
                    diet: document.getElementById('editDiet').value.trim(),
                    lifespan: document.getElementById('editLifespan').value.trim(),
                    reproduction: document.getElementById('editReproduction').value.trim()
                }
            };

            // Validate required fields
            if (!updatedData.speciesName) {
                alert('⚠️ Nama spesies harus diisi!');
                return;
            }

            // Update submission in localStorage
            try {
                const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
                const index = submissions.findIndex(s => s.id === id);

                if (index === -1) {
                    alert('❌ Submission tidak ditemukan!');
                    return;
                }

                // Update submission data
                submissions[index] = {
                    ...submissions[index],
                    ...updatedData
                };

                // Save to localStorage
                localStorage.setItem('submissions', JSON.stringify(submissions));

                alert('✅ Submission berhasil diupdate!');
                closeEditModal();
                loadSubmissions();
            } catch (error) {
                console.error('Error updating submission:', error);
                alert('❌ Terjadi kesalahan saat mengupdate submission!');
            }
        }

        // Close edit modal when clicking outside
        document.getElementById('editModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });

        // Make functions globally available
        window.openEditModal = openEditModal;
        window.closeEditModal = closeEditModal;
        window.saveEditSubmission = saveEditSubmission;

        // Load submissions on page load
        loadSubmissions();