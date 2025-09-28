(() => {
    const canvas = document.querySelector(".canvas");
    const woolString = document.querySelector(".wool-string");
    const panels = Array.from(document.querySelectorAll(".resource-panel[data-resource]"));
    const hintEl = document.querySelector(".resource-hint");

    if (!panels.length) {
        if (woolString) {
            woolString.hidden = true;
        }
        if (hintEl) {
            hintEl.textContent = "";
            hintEl.removeAttribute("data-visible");
        }
        return;
    }

    const toNumber = (value, fallback) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
    };

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const activateGuide = (resource) => {
        if (!canvas) {
            return;
        }

        if (resource === "sensitive" || resource === "impulsive" || resource === "extrovert") {
            canvas.setAttribute("data-active-guide", resource);
        } else {
            canvas.removeAttribute("data-active-guide");
        }
    };

    const deactivateGuide = () => {
        if (!canvas) {
            return;
        }
        canvas.removeAttribute("data-active-guide");
    };

    const showHint = (panel) => {
        const resource = panel.dataset.resource;
        activateGuide(resource);

        if (!hintEl) {
            return;
        }

        const message = panel.dataset.hoverText ?? "";
        hintEl.textContent = message;

        if (message.trim().length > 0) {
            hintEl.setAttribute("data-visible", "true");
        } else {
            hintEl.removeAttribute("data-visible");
        }
    };

    const hideHint = () => {
        deactivateGuide();

        if (!hintEl) {
            return;
        }
        hintEl.textContent = "";
        hintEl.removeAttribute("data-visible");
    };

    panels.forEach((panel) => {
        const resource = panel.dataset.resource;
        if (!resource) {
            return;
        }

        const counterEl = panel.querySelector(".resource-value");
        const decreaseBtn = panel.querySelector('.counter-btn[data-direction="down"]');
        const increaseBtn = panel.querySelector('.counter-btn[data-direction="up"]');

        if (!counterEl || !decreaseBtn || !increaseBtn) {
            return;
        }

        const min = toNumber(panel.dataset.min, 0);
        const max = toNumber(panel.dataset.max, 5);

        const setValue = (nextValue) => {
            const clamped = clamp(nextValue, min, max);
            window[resource] = clamped;
            counterEl.textContent = String(clamped);
            decreaseBtn.disabled = clamped <= min;
            increaseBtn.disabled = clamped >= max;

            if (resource === "wool" && woolString) {
                woolString.hidden = clamped < 1;
            }
        };

        decreaseBtn.addEventListener("click", () => setValue((window[resource] ?? min) - 1));
        increaseBtn.addEventListener("click", () => setValue((window[resource] ?? min) + 1));

        panel.addEventListener("mouseenter", () => showHint(panel));
        panel.addEventListener("mouseleave", () => hideHint());
        panel.addEventListener("focusin", () => showHint(panel));
        panel.addEventListener("focusout", (event) => {
            if (!panel.contains(event.relatedTarget)) {
                hideHint();
            }
        });

        const startingValue = typeof window[resource] === "number" ? window[resource] : min;
        setValue(startingValue);
    });
})();
