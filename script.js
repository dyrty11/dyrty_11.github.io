document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Переключение темы ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    if (themeToggle) {
        themeToggle.addEventListener('click', (event) => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            const persistTheme = () => {
                try { localStorage.setItem('theme', newTheme); } catch (e) {}
            };
            if (!document.startViewTransition) {
                htmlElement.setAttribute('data-theme', newTheme);
                persistTheme();
                return;
            }
            const x = event.clientX;
            const y = event.clientY;
            const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
            const transition = document.startViewTransition(() => {
                htmlElement.setAttribute('data-theme', newTheme);
            });
            transition.ready.then(() => {
                document.documentElement.animate(
                    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
                    { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
                );
            });
            transition.finished.then(persistTheme);
        });
    }

    // --- 2. Плавный переход между страницами ---
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href.startsWith('#') || this.target === '_blank' || href === 'voidforge.html' || href === 'json-formatter.html') return;
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, 200);
        });
    });

    // --- 3. Логика проектов ---
    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
        const icons = {
            'layout': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
            'file': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>',
            'shopping-bag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
            'archive': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
        };
        const tagIcons = {
            'react': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"></ellipse></svg>',
            'javascript': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            'js': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            'html': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            'css': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>',
            'python': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            'windows': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
            'exe': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
            'security': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
            'default': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>'
        };
        function getTagIcon(tagName) {
            const key = String(tagName).toLowerCase();
            return tagIcons[key] || tagIcons['default'];
        }
        let allProjects = [];
        let currentFilters = { category: 'all', tag: 'all', search: '' };
        const fallbackProjects = [
            { "title": "VoidForge", "category": "website", "description": "Генератор аудио-сайтов.", "tags": ["HTML", "JavaScript"], "type": "link", "link": "voidforge.html", "buttonText": "Открыть", "icon": "layout", "color": "#ccff00" }
        ];
        function sanitizeURL(url) {
            try {
                const u = new URL(url, window.location.href);
                if (['http:', 'https:', 'mailto:'].includes(u.protocol)) {
                    return u.href;
                }
            } catch (e) {}
            return '#';
        }
        fetch('projects.json')
            .then(response => { if (!response.ok) throw new Error('Network error'); return response.json(); })
            .then(data => { allProjects = Array.isArray(data) ? data : []; buildTagFilters(); applyFilters(); })
            .catch(() => { allProjects = fallbackProjects; buildTagFilters(); applyFilters(); });
        function buildTagFilters() {
            const tagFiltersContainer = document.getElementById('tagFilters');
            if (!tagFiltersContainer) return;
            tagFiltersContainer.innerHTML = '';
            const allTags = new Set();
            allProjects.forEach(p => {
                if (Array.isArray(p.tags)) p.tags.forEach(t => allTags.add(String(t)));
            });
            const makeFilterBtn = (label, tagValue, isActive) => {
                const btn = document.createElement('button');
                btn.className = 'tag-filter-btn' + (isActive ? ' active' : '');
                btn.setAttribute('data-tag', tagValue);
                if (tagValue !== 'all') btn.innerHTML = getTagIcon(tagValue);
                btn.appendChild(document.createTextNode((tagValue === 'all' ? '' : ' ') + label));
                return btn;
            };
            tagFiltersContainer.appendChild(makeFilterBtn('Все теги', 'all', true));
            allTags.forEach(tag => tagFiltersContainer.appendChild(makeFilterBtn(tag, tag, false)));
            tagFiltersContainer.querySelectorAll('.tag-filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    tagFiltersContainer.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    currentFilters.tag = e.currentTarget.getAttribute('data-tag');
                    applyFilters();
                });
            });
        }
        function applyFilters() {
            const filtered = allProjects.filter(project => {
                const title = String(project.title || '');
                const desc = String(project.description || '');
                const tags = Array.isArray(project.tags) ? project.tags.map(String) : [];
                const matchCategory = currentFilters.category === 'all' || project.category === currentFilters.category;
                const matchTag = currentFilters.tag === 'all' || tags.includes(currentFilters.tag);
                const searchLower = currentFilters.search.toLowerCase();
                const matchSearch = title.toLowerCase().includes(searchLower) || desc.toLowerCase().includes(searchLower);
                return matchCategory && matchTag && matchSearch;
            });
            renderProjects(filtered);
        }
        function renderProjects(projects) {
            projectsGrid.innerHTML = '';
            if (projects.length === 0) {
                const empty = document.createElement('p');
                empty.style.cssText = 'grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px;';
                empty.textContent = 'Ничего не найдено.';
                projectsGrid.appendChild(empty);
                return;
            }
            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';
                const iconDiv = document.createElement('div');
                iconDiv.className = 'project-icon';
                iconDiv.innerHTML = icons[project.icon] || icons['file'];
                const titleEl = document.createElement('h3');
                titleEl.textContent = String(project.title || '');
                const descEl = document.createElement('p');
                descEl.textContent = String(project.description || '');
                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'project-tags';
                if (Array.isArray(project.tags)) {
                    project.tags.forEach(tagRaw => {
                        const tag = String(tagRaw);
                        const tagSpan = document.createElement('span');
                        tagSpan.className = 'tag';
                        tagSpan.innerHTML = getTagIcon(tag);
                        tagSpan.appendChild(document.createTextNode(' ' + tag));
                        tagsDiv.appendChild(tagSpan);
                    });
                }
                const isDownload = project.type === 'download';
                const linkEl = document.createElement('a');
                linkEl.className = 'action-btn';
                linkEl.href = sanitizeURL(project.link);
                if (isDownload) {
                    linkEl.setAttribute('download', '');
                    linkEl.setAttribute('rel', 'noopener noreferrer');
                } else {
                    linkEl.setAttribute('target', '_blank');
                    linkEl.setAttribute('rel', 'noopener noreferrer');
                }
                linkEl.appendChild(document.createTextNode(String(project.buttonText || 'Открыть')));
                const btnIcon = isDownload
                    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
                linkEl.insertAdjacentHTML('beforeend', btnIcon);
                card.appendChild(iconDiv);
                card.appendChild(titleEl);
                card.appendChild(descEl);
                card.appendChild(tagsDiv);
                card.appendChild(linkEl);
                projectsGrid.appendChild(card);
            });
        }
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilters.category = button.getAttribute('data-filter');
                applyFilters();
            });
        });
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentFilters.search = e.target.value;
                applyFilters();
            });
        }
    }

    // --- 4. Обработка формы контактов (Formcarry AJAX) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            const formData = new FormData(this);

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                const data = await response.json();

                if (data.status === 'success') {
                    alert('Сообщение успешно отправлено! Я свяжусь с вами.');
                    this.reset();
                } else if (data.code === 422) {
                    alert('Ошибка валидации. Проверьте поля.');
                } else {
                    alert('Ошибка: ' + (data.message || 'Неизвестная ошибка Formcarry'));
                }
            } catch (error) {
                alert('Ошибка сети. Проверьте подключение к интернету.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // --- 5. Мобильное меню (исправленная логика) ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const menuBackdrop = document.createElement('div');
    menuBackdrop.className = 'menu-backdrop';
    document.body.appendChild(menuBackdrop);

    if (mobileMenuBtn && mobileNav) {
        const toggleMenu = () => {
            const isActive = mobileNav.classList.toggle('active');
            menuBackdrop.classList.toggle('active', isActive);
            document.body.classList.toggle('menu-open', isActive);
        };
        mobileMenuBtn.addEventListener('click', toggleMenu);
        menuBackdrop.addEventListener('click', toggleMenu);
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                menuBackdrop.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // --- 6. Магнитный эффект для кнопок ---
    if (window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll('.btn, .project-card').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }
});