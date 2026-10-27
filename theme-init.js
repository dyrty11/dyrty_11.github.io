(function() {
    var savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('theme') || 'dark';
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', savedTheme);
})();