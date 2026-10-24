let savedTheme = 'dark';
try {
    savedTheme = localStorage.getItem('theme') || 'dark';
} catch (e) {
    // localStorage может быть недоступен (приватный режим, отключённые cookies и т.п.)
}
document.documentElement.setAttribute('data-theme', savedTheme);
