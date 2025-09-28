(() => {
    const MIN_WOOL = 0;
    const MAX_WOOL = 5;

    const counterEl = document.getElementById("wool-count");
    const decreaseBtn = document.querySelector(".counter-btn[data-direction=\"down\"]");
    const increaseBtn = document.querySelector(".counter-btn[data-direction=\"up\"]");
    const woolString = document.querySelector(".wool-string");

    if (!counterEl || !decreaseBtn || !increaseBtn) {
        window.wool = MIN_WOOL;
        if (woolString) {
            woolString.hidden = true;
        }
        return;
    }

    const clamp = (value) => Math.min(MAX_WOOL, Math.max(MIN_WOOL, value));

    const setWool = (value) => {
        window.wool = clamp(value);
        counterEl.textContent = String(window.wool);
        decreaseBtn.disabled = window.wool <= MIN_WOOL;
        increaseBtn.disabled = window.wool >= MAX_WOOL;
        if (woolString) {
            woolString.hidden = window.wool < 1;
        }
    };

    decreaseBtn.addEventListener("click", () => setWool(window.wool - 1));
    increaseBtn.addEventListener("click", () => setWool(window.wool + 1));

    setWool(typeof window.wool === "number" ? window.wool : MIN_WOOL);
})();

