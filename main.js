import './style.css';
import { SkinViewer, IdleAnimation, WalkingAnimation, RunningAnimation, FlyingAnimation } from 'skinview3d';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { createIcons, Box, Search, ArrowRight, Download, DownloadCloud, RotateCcw, UploadCloud } from 'lucide';

// Local Assets
import steveSkin from './steve.png';

createIcons({
    icons: { Box, Search, ArrowRight, Download, DownloadCloud, RotateCcw, UploadCloud }
});

const canvas = document.getElementById("skin_container");
const container = document.getElementById("viewer_wrapper");
let currentSkinUrl = steveSkin;

// 1. Initialize Viewer
const viewer = new SkinViewer({
    canvas: canvas,
    width: container.clientWidth,
    height: container.clientHeight,
    skin: currentSkinUrl
});

// Setup Initial State
viewer.animation = new IdleAnimation();
viewer.autoRotate = true;
viewer.autoRotateSpeed = 2.0; // Fixed rotation speed

// 2. Resize Logic
const resizeObserver = new ResizeObserver(() => {
    viewer.width = container.clientWidth;
    viewer.height = container.clientHeight;
});
resizeObserver.observe(container);

// --- UI Logic ---

// Auto Rotate Toggle (FIXED)
document.getElementById('auto_rotate_check').onchange = (e) => {
    viewer.autoRotate = e.target.checked;
};

// Fetch Online
document.getElementById('fetch_btn').onclick = () => {
    const user = document.getElementById('username_input').value.trim();
    if (user) {
        currentSkinUrl = `https://mineskin.eu/skin/${user}`;
        viewer.loadSkin(currentSkinUrl);
    }
};

// Upload Local
document.getElementById('file_input').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentSkinUrl = event.target.result;
            viewer.loadSkin(currentSkinUrl);
        };
        reader.readAsDataURL(file);
    }
};

// Animation Switch (FIXED)
document.getElementById('anim_select').onchange = (e) => {
    const val = e.target.value;
    viewer.animation = null; // Kill current animation
    
    if (val === 'walk') viewer.animation = new WalkingAnimation();
    else if (val === 'run') viewer.animation = new RunningAnimation();
    else if (val === 'fly') viewer.animation = new FlyingAnimation();
    else viewer.animation = new IdleAnimation();
};

// Save PNG (Direct Method)
document.getElementById('save_skin_btn').onclick = async () => {
    try {
        const response = await fetch(currentSkinUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "skin.png";
        link.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        // Fallback for CORS issues
        const skinImg = viewer.playerObject.skin.texture.image;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = skinImg.width;
        tempCanvas.height = skinImg.height;
        tempCanvas.getContext('2d').drawImage(skinImg, 0, 0);
        const link = document.createElement('a');
        link.href = tempCanvas.toDataURL("image/png");
        link.download = "skin_fallback.png";
        link.click();
    }
};

// Export GLB
document.getElementById('export_glb_btn').onclick = () => {
    const exporter = new GLTFExporter();
    exporter.parse(viewer.playerObject, (gltf) => {
        const blob = new Blob([gltf], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.glb';
        a.click();
    }, { binary: true });
};

// Reset
document.getElementById('reset_btn').onclick = () => {
    currentSkinUrl = steveSkin;
    viewer.loadSkin(currentSkinUrl);
    document.getElementById('username_input').value = '';
};