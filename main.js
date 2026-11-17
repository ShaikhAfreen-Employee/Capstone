/**
 * BriefIQ Client-side Controller
 * Handles drag-and-drop, loading states, copy-to-clipboard, table filtering.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Drag and Drop File Upload
    // -------------------------------------------------------------
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('documentInput');
    const fileSelectedBadge = document.getElementById('fileSelectedBadge');
    const selectedFileName = document.getElementById('selectedFileName');
    const uploadForm = document.getElementById('uploadForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingSubtext = document.getElementById('loadingSubtext');

    if (dropzone && fileInput) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileBadge(files[0]);
            }
        });

        // ✅ Fix: clicking the dropzone opens the file browser
        dropzone.addEventListener('click', (e) => {
            if (e.target === fileInput) return; // prevent double trigger
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                updateFileBadge(fileInput.files[0]);
            }
        });
    }

    function updateFileBadge(file) {
        if (!fileSelectedBadge || !selectedFileName) return;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        selectedFileName.textContent = `${file.name} (${sizeMb > 1 ? sizeMb + ' MB' : (file.size / 1024).toFixed(1) + ' KB'})`;
        fileSelectedBadge.style.display = 'inline-flex';
    }

    // -------------------------------------------------------------
    // Form Submission & Animated Loading Overlay
    // -------------------------------------------------------------
    const loadingFileBadge = document.getElementById('loadingFileBadge');
    const loadingFileName = document.getElementById('loadingFileName');
    const loadingProgressFill = document.getElementById('loadingProgressFill');
    const loadingPercent = document.getElementById('loadingPercent');

    function startProcessingModal(filename) {
        if (!loadingOverlay) return;

        // Show file name if available
        if (filename && loadingFileName && loadingFileBadge) {
            loadingFileName.textContent = filename;
            loadingFileBadge.style.display = 'inline-flex';
        }

        loadingOverlay.style.display = 'flex';

        const stages = [
            { text: "Reading & extracting document structure...", pct: 25, step: 1 },
            { text: "Tokenizing with HuggingFace T5 tokenizer...", pct: 45, step: 2 },
            { text: "Running Deep Learning T5 Neural Transformer...", pct: 68, step: 3 },
            { text: "Synthesizing key insights & computing metrics...", pct: 86, step: 4 },
            { text: "Finalizing interactive report & visuals...", pct: 95, step: 5 }
        ];

        let stageIdx = 0;
        const interval = setInterval(() => {
            stageIdx++;
            if (stageIdx >= stages.length) {
                clearInterval(interval);
                return;
            }
            const s = stages[stageIdx];
            if (loadingSubtext) loadingSubtext.textContent = s.text;
            if (loadingProgressFill) loadingProgressFill.style.width = `${s.pct}%`;
            if (loadingPercent) loadingPercent.textContent = `${s.pct}%`;

            // Update step indicators
            for (let i = 1; i <= 5; i++) {
                const el = document.getElementById(`step${i}`);
                if (!el) continue;
                if (i < s.step) {
                    el.className = 'loading-step done';
                } else if (i === s.step) {
                    el.className = 'loading-step active';
                } else {
                    el.className = 'loading-step';
                }
            }
        }, 1800);
    }

    if (uploadForm && loadingOverlay) {
        uploadForm.addEventListener('submit', (e) => {
            // Only show overlay if a file is actually selected
            if (!fileInput || fileInput.files.length === 0) {
                return; // let browser's native validation handle it
            }

            const file = fileInput.files[0];
            startProcessingModal(file ? file.name : "Document");
        });
    }

    // Also trigger loading feedback when clicking sample test buttons
    document.querySelectorAll('.samples-buttons a').forEach(link => {
        link.addEventListener('click', (e) => {
            const sampleName = link.textContent.trim();
            startProcessingModal(sampleName);
        });
    });

    // -------------------------------------------------------------
    // Flash Message Dismissal
    // -------------------------------------------------------------
    document.querySelectorAll('.flash-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const alert = e.target.closest('.flash-alert');
            if (alert) {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 250);
            }
        });
    });

    // -------------------------------------------------------------
    // Copy To Clipboard
    // -------------------------------------------------------------
    const copyBtn = document.getElementById('copySummaryBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const summaryEl = document.getElementById('summaryContentText');
            if (!summaryEl) return;
            const textToCopy = summaryEl.innerText || summaryEl.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg> Copied!
                `;
                copyBtn.classList.remove('btn-secondary');
                copyBtn.classList.add('btn-primary');
                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                    copyBtn.classList.remove('btn-primary');
                    copyBtn.classList.add('btn-secondary');
                }, 2000);
            }).catch(err => {
                console.error("Copy failed: ", err);
            });
        });
    }

    // -------------------------------------------------------------
    // Client-side Table Search Filter
    // -------------------------------------------------------------
    const tableSearch = document.getElementById('tableSearchInput');
    const dataTable = document.getElementById('modernDataTable');
    if (tableSearch && dataTable) {
        tableSearch.addEventListener('keyup', () => {
            const filter = tableSearch.value.toLowerCase();
            const rows = dataTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
    }

    // -------------------------------------------------------------
    // 10 Background Color Themes Controller
    // -------------------------------------------------------------
    const themePickerToggle = document.getElementById('themePickerToggle');
    const themeDropdown = document.getElementById('themeDropdown');
    const activeThemeDot = document.getElementById('activeThemeDot');
    const btnAutoCycle = document.getElementById('btnAutoCycle');
    const activeThemeLabel = document.getElementById('activeThemeLabel');
    const themeItems = document.querySelectorAll('.theme-item');
    const floatingSwatches = document.querySelectorAll('.floating-swatch');

    const themeColors = {
        'white': '#ffffff',
        'light-blue': '#bfdbfe',
        'light-green': '#bbf7d0',
        'light-gray': '#e5e7eb',
        'light-purple': '#e9d5ff',
        'black': '#090d16',
        'dark-blue': '#071329',
        'dark-green': '#041f18',
        'dark-red': '#1c070c',
        'dark-gray': '#12161f',
        'aura': 'linear-gradient(135deg, #a855f7, #06b6d4, #ec4899)'
    };

    const themeNames = {
        'white': 'White',
        'light-blue': 'Light Blue',
        'light-green': 'Light Green',
        'light-gray': 'Light Gray',
        'light-purple': 'Light Purple',
        'black': 'Black',
        'dark-blue': 'Dark Blue',
        'dark-green': 'Dark Green',
        'dark-red': 'Dark Red',
        'dark-gray': 'Dark Gray',
        'aura': '✨ Aura'
    };

    // Backward compatibility mapping for old theme names
    const legacyThemeMap = {
        'obsidian': 'black',
        'midnight': 'dark-blue',
        'emerald': 'dark-green',
        'amethyst': 'dark-blue',
        'magenta': 'dark-red',
        'crimson': 'dark-red',
        'ocean': 'dark-blue',
        'charcoal': 'dark-gray',
        'amber': 'black',
        'aurora': 'aura'
    };

    function applyTheme(themeId) {
        if (legacyThemeMap[themeId]) {
            themeId = legacyThemeMap[themeId];
        }

        document.body.setAttribute('data-theme', themeId);
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('briefiq_theme', themeId);

        // Update active dot and label in toggle button
        if (activeThemeDot) {
            activeThemeDot.style.background = themeColors[themeId] || '#6366f1';
            if (themeId === 'white') {
                activeThemeDot.style.border = '1px solid #94a3b8';
                activeThemeDot.style.boxShadow = 'none';
            } else if (themeId === 'aura') {
                activeThemeDot.style.border = 'none';
                activeThemeDot.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.85)';
            } else {
                activeThemeDot.style.border = 'none';
                activeThemeDot.style.boxShadow = 'none';
            }
        }
        if (activeThemeLabel) {
            activeThemeLabel.textContent = themeNames[themeId] || '10 Colors';
        }

        // Update dropdown items
        themeItems.forEach(item => {
            if (item.getAttribute('data-theme-id') === themeId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update floating dock swatches
        floatingSwatches.forEach(swatch => {
            if (swatch.getAttribute('data-theme-id') === themeId) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
    }

    // Toggle dropdown open/close
    if (themePickerToggle && themeDropdown) {
        themePickerToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!themeDropdown.contains(e.target) && e.target !== themePickerToggle) {
                themeDropdown.classList.remove('show');
            }
        });
    }

    // Swatch clicks in dropdown
    themeItems.forEach(item => {
        item.addEventListener('click', () => {
            const themeId = item.getAttribute('data-theme-id');
            applyTheme(themeId);
            if (themeDropdown) themeDropdown.classList.remove('show');
        });
    });

    // Swatch clicks in floating quick dock
    floatingSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const themeId = swatch.getAttribute('data-theme-id');
            applyTheme(themeId);
        });
    });

    // Initialize saved theme on load (defaults to 'black')
    const currentSavedTheme = localStorage.getItem('briefiq_theme') || 'black';
    applyTheme(currentSavedTheme);
});
