document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Переключение темы (Затмение) ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    if (themeToggle) {
        themeToggle.addEventListener('click', (event) => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            if (!document.startViewTransition) { 
                htmlElement.setAttribute('data-theme', newTheme); 
                localStorage.setItem('theme', newTheme); 
                return; 
            }
            const x = event.clientX; 
            const y = event.clientY; 
            const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
            const transition = document.startViewTransition(() => { htmlElement.setAttribute('data-theme', newTheme); });
            transition.ready.then(() => { 
                document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] }, { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }); 
            });
            transition.finished.then(() => { localStorage.setItem('theme', newTheme); });
        });
    }

    // --- 2. Плавный переход между страницами ---
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Пропускаем внешние ссылки, якоря и ссылки проектов
            if (href.startsWith('#') || this.target === '_blank' || href === 'voidforge.html') return;
            e.preventDefault(); 
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, 300);
        });
    });

    // --- 3. Загрузка и рендеринг проектов ---
    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
        const icons = {
            'layout': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
            'file': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>',
            'shopping-bag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
            'archive': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
        };
        
        let allProjects = [];

        const fallbackProjects = [
            { "title": "Корпоративный сайт", "category": "website", "description": "Современный адаптивный сайт.", "tags": ["HTML/CSS"], "type": "link", "link": "https://example.com", "buttonText": "Перейти на сайт", "icon": "layout", "color": "#2563eb" },
            { "title": "Шаблон Figma", "category": "file", "description": "UI-кит.", "tags": ["UI/UX"], "type": "download", "link": "files/template.fig", "buttonText": "Скачать файл", "icon": "file", "color": "#10b981" },
            { "title": "Магазин одежды", "category": "website", "description": "E-commerce платформа.", "tags": ["React"], "type": "link", "link": "https://example.com", "buttonText": "Перейти на сайт", "icon": "shopping-bag", "color": "#8b5cf6" }
        ];

        // ИСПРАВЛЕННАЯ ФУНКЦИЯ (теперь разрешает любые локальные страницы)
        function sanitizeURL(url) {
            if (typeof url === 'string') {
                const lowerUrl = url.toLowerCase().trim();
                if (!lowerUrl.startsWith('javascript:') && !lowerUrl.startsWith('data:')) {
                    return url;
                }
            }
            return '#';
        }

        function getColorClass(colorHex) {
            const map = { '#2563eb': 'color-blue', '#8b5cf6': 'color-purple', '#10b981': 'color-green', '#f59e0b': 'color-orange' };
            return map[colorHex] || 'color-blue';
        }

        fetch('projects.json')
            .then(response => { if (!response.ok) throw new Error('Network response was not ok'); return response.json(); })
            .then(data => { allProjects = data; renderProjects(allProjects); })
            .catch(error => { 
                console.warn('JSON не загружен. Используем резерв.'); 
                allProjects = fallbackProjects; 
                renderProjects(allProjects); 
            });

        function renderProjects(projects) {
            projectsGrid.innerHTML = '';
            
            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.setAttribute('data-category', project.category);
                
                const iconDiv = document.createElement('div');
                iconDiv.className = 'project-icon';
                iconDiv.classList.add(getColorClass(project.color)); 
                iconDiv.innerHTML = icons[project.icon] || icons['file'];
                
                const titleEl = document.createElement('h3');
                titleEl.textContent = project.title;
                
                const descEl = document.createElement('p');
                descEl.textContent = project.description;
                
                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'project-tags';
                if (Array.isArray(project.tags)) {
                    project.tags.forEach(tag => {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = 'tag';
                        tagSpan.textContent = tag;
                        tagsDiv.appendChild(tagSpan);
                    });
                }

                const isDownload = project.type === 'download';
                const linkEl = document.createElement('a');
                linkEl.className = `action-btn ${isDownload ? 'btn-outline' : 'btn-primary'}`;
                linkEl.href = sanitizeURL(project.link);
                
                if (isDownload) {
                    linkEl.setAttribute('download', '');
                } else {
                    linkEl.setAttribute('target', '_blank');
                    linkEl.setAttribute('rel', 'noopener noreferrer');
                }

                linkEl.appendChild(document.createTextNode(project.buttonText + ' '));
                
                const btnIcon = isDownload 
                    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
                    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
                linkEl.insertAdjacentHTML('beforeend', btnIcon);

                card.appendChild(iconDiv);
                card.appendChild(titleEl);
                card.appendChild(descEl);
                card.appendChild(tagsDiv);
                card.appendChild(linkEl);
                
                projectsGrid.appendChild(card);
            });
        }

        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.getAttribute('data-filter');
                const filtered = filterValue === 'all' ? allProjects : allProjects.filter(p => p.category === filterValue);
                renderProjects(filtered);
            });
        });
    }

    // --- 4. Обработка формы контактов ---
    const contactForm = document.getElementById('contactForm');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                const allowedTypes = ['application/pdf', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
                const maxSize = 5 * 1024 * 1024;

                if (!allowedTypes.includes(file.type)) {
                    alert('Ошибка: Недопустимый тип файла.');
                    this.value = ''; fileName.textContent = 'Файл не выбран'; return;
                }
                if (file.size > maxSize) {
                    alert('Ошибка: Файл больше 5MB.');
                    this.value = ''; fileName.textContent = 'Файл не выбран'; return;
                }
                fileName.textContent = file.name;
            } else {
                fileName.textContent = 'Файл не выбран';
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
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

                if (response.ok) {
                    alert('Сообщение успешно отправлено! Я свяжусь с вами.');
                    this.reset();
                    if (fileName) fileName.textContent = 'Файл не выбран';
                } else {
                    alert('Ошибка при отправке. Пожалуйста, попробуйте позже.');
                }
            } catch (error) {
                alert('Ошибка сети. Проверьте подключение к интернету.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
