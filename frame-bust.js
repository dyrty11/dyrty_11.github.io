(function() {
    if (window.self !== window.top) {
        try {
            // Пытаемся "вырваться" из iframe
            window.top.location.href = window.self.location.href;
        } catch (e) {
            // Если браузер блокирует доступ (cross-origin), просто скрываем страницу
            document.documentElement.style.display = 'none';
        }
    }
})();