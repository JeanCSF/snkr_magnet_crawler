document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('scrapingForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const headlessType = document.getElementById('headlessSelect').value;
        const maxConcurrency = document.getElementById('maxConcurrency').value;
        const saveType = document.getElementById('saveTypeSelect').value;
        const store = document.getElementById('storeSelect').value;
        const storeName = JSON.parse(store).storeName;
        const url = JSON.parse(store).url;

        const data = {
            url: url,
            concurrency: maxConcurrency,
            storeName: storeName,
            saveType: saveType,
            headlessType: headlessType
        };

        fetch('/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    });

    const logsUl = document.getElementById('logs');
    const logsContainer = document.getElementById('logsContainer');
    const eventSource = new EventSource('/logs');
    eventSource.onmessage = function (event) {
        const log = document.createElement('li');
        log.textContent = event.data;
        logsUl.appendChild(log);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    };

    eventSource.onerror = function (error) {
        console.error('EventSource failed:', error);
        eventSource.close();
    };
});