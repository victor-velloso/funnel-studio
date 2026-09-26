
(function () {

    const STORAGE_KEY = "utm_data";
    const EXPIRY_DAYS = 90;

    // 1. CAPTURA NA ENTRADA
    function saveUTMs() {
        const params = new URLSearchParams(window.location.search);
        if (!params.toString()) return;

        const data = {};

        params.forEach((value, key) => {
            data[key] = value;
        });

        data.timestamp = Date.now();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // 2. RECUPERA
    function getUTMs() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        try {
            const data = JSON.parse(raw);

            const ageDays = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
            if (ageDays > EXPIRY_DAYS) return null;

            return data;

        } catch (e) {
            return null;
        }
    }

    // 3. REDIRECIONA COM UTMs GARANTIDAS
    function attachClickHandler() {

        document.addEventListener("click", function (e) {

            const link = e.target.closest("a[href*='eduzz.com']");
            if (!link) return;

            const utms = getUTMs();
            if (!utms) return;

            e.preventDefault();

            const url = new URL(link.href);

            Object.keys(utms).forEach(key => {
                if (key !== "timestamp") {
                    url.searchParams.set(key, utms[key]);
                }
            });

            window.location.href = url.toString();
        });

    }

    saveUTMs();
    attachClickHandler();

})();
