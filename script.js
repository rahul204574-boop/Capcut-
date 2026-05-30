// DOM Elements
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const placeholder = document.getElementById('placeholder');

// Control Elements
const controls = {
    brightness: document.getElementById('brightness'),
    contrast: document.getElementById('contrast'),
    saturation: document.getElementById('saturation'),
    hue: document.getElementById('hue'),
    blur: document.getElementById('blur'),
    grayscale: document.getElementById('grayscale'),
    sepia: document.getElementById('sepia'),
    invert: document.getElementById('invert'),
};

// State
let originalImage = null;
let currentImage = null;

// Presets
const presets = {
    vintage: {
        brightness: 110,
        contrast: 90,
        saturation: 80,
        sepia: 30,
    },
    cool: {
        brightness: 100,
        contrast: 110,
        saturation: 120,
        hue: 180,
    },
    warm: {
        brightness: 110,
        contrast: 100,
        saturation: 130,
        hue: 10,
    },
    bw: {
        brightness: 100,
        contrast: 110,
        saturation: 0,
        grayscale: 100,
    },
};

// Initialize
function init() {
    imageInput.addEventListener('change', handleImageUpload);
    resetBtn.addEventListener('click', resetControls);
    downloadBtn.addEventListener('click', downloadImage);
    copyBtn.addEventListener('click', copyImage);

    // Add event listeners to all controls
    Object.values(controls).forEach((control) => {
        control.addEventListener('input', () => {
            updateValueDisplay(control);
            applyFilters();
        });
    });

    // Add preset button listeners
    document.querySelectorAll('.preset-btn').forEach((btn) => {
        btn.addEventListener('click', applyPreset);
    });
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            currentImage = img;
            setupCanvas();
            applyFilters();
            placeholder.classList.remove('active');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Setup canvas
function setupCanvas() {
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
}

// Apply filters
function applyFilters() {
    if (!originalImage) return;

    const filters = {
        brightness: controls.brightness.value,
        contrast: controls.contrast.value,
        saturation: controls.saturation.value,
        hue: controls.hue.value,
        blur: controls.blur.value,
        grayscale: controls.grayscale.value,
        sepia: controls.sepia.value,
        invert: controls.invert.value,
    };

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Build filter string
    let filterString = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        hue-rotate(${filters.hue}deg)
        blur(${filters.blur}px)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        invert(${filters.invert}%)
    `;

    // Apply filters
    ctx.filter = filterString;
    ctx.drawImage(originalImage, 0, 0);
}

// Update value display
function updateValueDisplay(control) {
    const display = control.parentElement.querySelector('.value-display');
    if (!display) return;

    let value = control.value;
    let unit = '%';

    if (control.id === 'hue') unit = '°';
    else if (control.id === 'blur') unit = 'px';

    display.textContent = value + unit;
}

// Reset controls
function resetControls() {
    Object.entries(controls).forEach(([key, control]) => {
        control.value = control.getAttribute('value') || (key === 'brightness' || key === 'contrast' || key === 'saturation' ? 100 : 0);
        updateValueDisplay(control);
    });

    document.querySelectorAll('.preset-btn').forEach((btn) => {
        btn.classList.remove('active');
    });

    applyFilters();
}

// Apply preset
function applyPreset(e) {
    const presetName = e.target.getAttribute('data-preset');
    const preset = presets[presetName];

    if (!preset) return;

    Object.entries(preset).forEach(([key, value]) => {
        if (controls[key]) {
            controls[key].value = value;
            updateValueDisplay(controls[key]);
        }
    });

    document.querySelectorAll('.preset-btn').forEach((btn) => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    applyFilters();
}

// Download image
function downloadImage() {
    if (!originalImage) {
        showMessage('Please upload an image first');
        return;
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `photo-edited-${Date.now()}.png`;
    link.click();

    showMessage('Image downloaded successfully!');
}

// Copy image to clipboard
function copyImage() {
    if (!originalImage) {
        showMessage('Please upload an image first');
        return;
    }

    canvas.toBlob((blob) => {
        navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
        ]).then(() => {
            showMessage('Image copied to clipboard!');
        }).catch(() => {
            showMessage('Failed to copy image');
        });
    });
}

// Show message
function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = text;
    document.body.appendChild(message);

    setTimeout(() => {
        message.classList.add('hide');
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 2000);
}

// Start the app
init();