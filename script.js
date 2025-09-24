let personality1Value = 50, personality2Value = 50, personality3Value = 50, personality4Value = 50, personality5Value = 50;

window.onload = () => {
    const slider = document.getElementById('slider');
    const button = document.getElementById('personality1');
    const color = button.style.backgroundColor;

    slider.style.setProperty('--slider-thumb-color', color);
    slider.style.setProperty('--slider-fill-color', color);

    slider.value = personality1Value;
    slider.style.setProperty('--p', slider.value);

    slider.oninput = () => {
        personality1Value = slider.value;
        slider.style.setProperty('--p', slider.value);
    };
};

function changeSliderColor(buttonId) {
    const slider = document.getElementById('slider');
    const button = document.getElementById(buttonId);
    const color = button.style.backgroundColor;

    slider.style.setProperty('--slider-thumb-color', color);
    slider.style.setProperty('--slider-fill-color', color);

    switch (buttonId) {
        case 'personality1':
            slider.value = personality1Value;
            slider.style.setProperty('--p', slider.value);
            slider.oninput = () => {
                personality1Value = slider.value;
                slider.style.setProperty('--p', slider.value);
            };
            break;
        case 'personality2':
            slider.value = personality2Value;
            slider.style.setProperty('--p', slider.value);
            slider.oninput = () => {
                personality2Value = slider.value;
                slider.style.setProperty('--p', slider.value);
            };
            break;
        case 'personality3':
            slider.value = personality3Value;
            slider.style.setProperty('--p', slider.value);
            slider.oninput = () => {
                personality3Value = slider.value;
                slider.style.setProperty('--p', slider.value);
            };
            break;
        case 'personality4':
            slider.value = personality4Value;
            slider.style.setProperty('--p', slider.value);
            slider.oninput = () => {
                personality4Value = slider.value;
                slider.style.setProperty('--p', slider.value);
            };
            break;
        case 'personality5':
            slider.value = personality5Value;
            slider.style.setProperty('--p', slider.value);
            slider.oninput = () => {
                personality5Value = slider.value;
                slider.style.setProperty('--p', slider.value);
            };
            break;
    }
}
