(function() {
    const inputArea = document.getElementById('inputArea');
    const outputArea = document.getElementById('outputArea');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');

    function showStatus(message, type) { status.textContent = message; status.className = 'status ' + type; }
    function clearStatus() { status.textContent = ''; status.className = 'status'; }

    function processJSON(minify) {
        const raw = inputArea.value.trim();
        if (!raw) { showStatus('Введите JSON для обработки.', 'error'); return; }
        try {
            const parsed = JSON.parse(raw);
            const result = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 4);
            outputArea.value = result;
            showStatus(minify ? 'Успешно сжато!' : 'Успешно отформатировано!', 'success');
        } catch (error) {
            outputArea.value = '';
            showStatus('Ошибка: ' + error.message, 'error');
        }
    }

    formatBtn.addEventListener('click', () => processJSON(false));
    minifyBtn.addEventListener('click', () => processJSON(true));

    copyBtn.addEventListener('click', () => {
        if (!outputArea.value) { showStatus('Нечего копировать.', 'error'); return; }
        navigator.clipboard.writeText(outputArea.value)
            .then(() => { showStatus('Скопировано в буфер обмена!', 'success'); setTimeout(clearStatus, 2000); })
            .catch(() => { showStatus('Не удалось скопировать.', 'error'); });
    });

    clearBtn.addEventListener('click', () => { inputArea.value = ''; outputArea.value = ''; clearStatus(); });
})();