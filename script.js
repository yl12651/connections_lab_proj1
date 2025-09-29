(() => {
    // all interactive elements
    const bodyEl = document.body;
    const canvas = document.querySelector(".canvas");
    const plate = document.querySelector(".plate");
    const woolStringsContainer = document.querySelector(".wool-strings");
    const woolStringTemplate = woolStringsContainer?.querySelector('.wool-string[data-template="true"]');
    const panels = Array.from(document.querySelectorAll(".resource-panel[data-resource]"));
    const hintEl = document.querySelector(".resource-hint");
    const resultOverlay = document.querySelector(".result-overlay");
    const resultImage = resultOverlay?.querySelector(".result-image");

    if (!panels.length) {
        if (woolStringsContainer) {
            woolStringsContainer.hidden = true;
        }
        if (hintEl) {
            hintEl.textContent = "";
            hintEl.removeAttribute("data-visible");
        }
        return;
    }

    const resultMeta = {
        Emo: { src: "assets/result1.png", alt: "Subject-E - Emotional Type Test Subject" },
        Rea: { src: "assets/result2.png", alt: "Subject-R - Reactive Type Test Subject" },
        Soc: { src: "assets/result3.png", alt: "Subject-S - Social Type Test Subject" },
        Log: { src: "assets/result4.png", alt: "Subject-L - Logical Type Test Subject" },
        Inw: { src: "assets/result5.png", alt: "Subject-I - Inward Type Test Subject" },
        Cor: { src: "assets/result6.png", alt: "Subject-C - Core Sample" }
    };

    const toNumber = (value, fallback) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
    };

    // used to maintain values within 0 to 5
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const getResourceValue = (resource) => (typeof window[resource] === "number" ? window[resource] : 0);

    // clone wool strings based on wool count, position them slightly above every time with some random rotation
    const updateWoolStrings = (count) => {
        if (!woolStringsContainer || !woolStringTemplate) {
            return;
        }

        const targetLayers = clamp(count, 0, 5);
        let existing = Array.from(woolStringsContainer.querySelectorAll('.wool-string[data-layer="instance"]'))
            .sort((a, b) => Number(a.dataset.index || 0) - Number(b.dataset.index || 0));

        if (existing.length > targetLayers) {
            existing.slice(targetLayers).forEach((node) => node.remove());
            existing = existing.slice(0, targetLayers);
        }

        while (existing.length < targetLayers) {
            const clone = woolStringTemplate.cloneNode(true);
            clone.dataset.layer = "instance";
            clone.removeAttribute("data-template");
            clone.removeAttribute("hidden");
            clone.alt = "";
            woolStringsContainer.appendChild(clone);
            existing.push(clone);
        }

        existing.forEach((img, index) => {
            img.dataset.index = String(index);
            // random rotation
            if (!img.dataset.rotation) {
                const min = -12;
                const max = 12;
                img.dataset.rotation = (Math.random() * (max - min) + min).toFixed(1);
            }
            const rotation = img.dataset.rotation;
            const verticalOffset = 18 - index * 5;
            img.style.transform = `translate(-50%, ${verticalOffset}%) rotate(${rotation}deg)`;
            img.style.zIndex = String(10 + index);
        });

        woolStringsContainer.hidden = targetLayers === 0;
    };

    // hover hints based on panel
    const showHint = (element) => {
        if (!hintEl) {
            return;
        }

        const message = element.dataset.hoverText ?? "";
        hintEl.textContent = message;

        if (message.trim().length > 0) {
            hintEl.setAttribute("data-visible", "true");
        } else {
            hintEl.removeAttribute("data-visible");
        }
    };

    const hideHint = () => {
        if (!hintEl) {
            return;
        }
        hintEl.textContent = "";
        hintEl.removeAttribute("data-visible");
    };

    // panel setup: counter buttons and value syncing
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

            if (resource === "wool") {
                updateWoolStrings(clamped);
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

    if (plate) {
        plate.addEventListener("mouseenter", () => showHint(plate));
        plate.addEventListener("mouseleave", () => hideHint());
        plate.addEventListener("focusin", () => showHint(plate));
        plate.addEventListener("focusout", (event) => {
            if (!plate.contains(event.relatedTarget)) {
                hideHint();
            }
        });
    }

    // prevents re-triggering
    let crafted = false;

    const pickFallbackRole = (values) => {
        const options = [
            { role: "Emo", score: values.sensitive },
            { role: "Rea", score: values.impulsive },
            { role: "Soc", score: values.extrovert },
            { role: "Log", score: 5 - (values.sensitive + values.impulsive) / 2 },
            { role: "Inw", score: 5 - values.extrovert },
            { role: "Cor", score: values.wool }
        ];

        options.sort((a, b) => b.score - a.score);
        return options[0].role;
    };

    // determine role based on values
    const resolveRole = (values) => {
        const Y = values.wool;
        const A = values.sensitive;
        const B = values.impulsive;
        const C = values.extrovert;
        const averageABC = (A + B + C) / 3;

        if (A >= 4 && Y >= 2) {
            return "Emo";
        }
        if (B >= 4 && Y >= 2) {
            return "Rea";
        }
        if (C >= 4 && Y >= 2) {
            return "Soc";
        }
        if (A <= 2 && B <= 2 && Y >= 3) {
            return "Log";
        }
        if (C <= 2 && Y <= 2) {
            return "Inw";
        }
        if (Y >= 4 && averageABC >= 2 && averageABC <= 3) {
            return "Cor";
        }
        return pickFallbackRole(values);
    };

    const craft = () => {
        if (crafted) {
            return;
        }

        const woolCount = getResourceValue("wool");
        if (woolCount < 1) {
            return;
        }

        const values = {
            wool: woolCount,
            sensitive: getResourceValue("sensitive"),
            impulsive: getResourceValue("impulsive"),
            extrovert: getResourceValue("extrovert")
        };

        const role = resolveRole(values);
        const meta = resultMeta[role];

        if (!meta || !resultOverlay || !resultImage) {
            return;
        }

        resultImage.src = meta.src;
        resultImage.alt = meta.alt;
        resultOverlay.setAttribute("aria-hidden", "false");
        bodyEl.classList.add("crafting");
        crafted = true;
    };

    window.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }
        craft();
    });
})();
