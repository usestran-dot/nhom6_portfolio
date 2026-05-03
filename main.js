import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';


// =========================================================================
// 1. GIAO DIỆN DESKTOP PORTFOLIO & DỮ LIỆU POSTER
// =========================================================================
const overlay = document.createElement('div');
overlay.id = 'popup-overlay';
overlay.innerHTML = `
    <div id="computer-popup">
        <div id="desktop-view">
            <div id="desktop-icons">
                <div class="folder-icon" onclick="window.open('https://www.google.com', '_blank')"><div>🌐</div><div>Browser</div></div>
                <div class="folder-icon" onclick="showPortfolio('team')"><div>👥</div><div>Team</div></div>
                <div class="folder-icon" onclick="showPortfolio('works')"><div>📂</div><div>Works</div></div>
                <div class="folder-icon" onclick="showPortfolio('tech')"><div>🛠️</div><div>Tech</div></div>
                <div class="folder-icon" onclick="showPortfolio('contact')"><div>✉️</div><div>Contact</div></div>
            </div>
        </div>

        <div id="detail-view" style="display: none;">
            <div class="nav-bar">
                <button onclick="goBack()" class="back-btn">← Back</button>
            </div>
            <div id="content-body"></div>
        </div>
    </div>
`;
document.body.appendChild(overlay);

const portfolioData = {
    team: `
        <div class="code-view scrollable-content">
            <div class="indent-1">
            <h1 class="glitch-text animate-slide-up animate-flicker" style="--color: #89ddff; --glow: rgba(137, 221, 255, 0.5);">THÀNH VIÊN NHÓM 6</h1>            
                <ul class="code-list indent-1">
                    <li class="staggered-item" style="--delay: 0.1s"><span class="id-tag">[ID 01]</span> <span class="name">TRẦN HẢI ĐĂNG</span> <span class="code-comment">(24022957)</span></li>
                    <li class="staggered-item" style="--delay: 0.2s"><span class="id-tag">[ID 02]</span> <span class="name">NGUYỄN VĂN MẠNH</span> <span class="code-comment">(24023031)</span></li>
                    <li class="staggered-item" style="--delay: 0.3s"><span class="id-tag">[ID 03]</span> <span class="name">NGUYỄN PHÚC PHƯƠNG</span> <span class="code-comment">(24023055)</span></li>
                    <li class="staggered-item" style="--delay: 0.4s"><span class="id-tag">[ID 04]</span> <span class="name">TRẦN ĐỨC DUY</span> <span class="code-comment">(24022979)</span></li>
                    <li class="staggered-item" style="--delay: 0.5s"><span class="id-tag">[ID 05]</span> <span class="name">NGUYỄN THỊ XUÂN MAI</span> <span class="code-comment">(24023028)</span></li>
                </ul>
            </div>
        </div>
    `,
    works: `
        <div class="code-view scrollable-content">
            <div class="indent-1"><h1 class="glitch-text animate-slide-up animate-flicker" style="--color: #f07178; --glow: rgba(240, 113, 120, 0.5);">DỰ ÁN ĐÃ TRIỂN KHAI</h1><p class="status-tag animate-flicker" style="color: #f07178;"></p>                <div class="project-card animate-pop-in">
                    <p><strong>MỤC TIÊU:</strong> Web Portfolio 3D - Phòng Làm Việc 3D</p>
                    <p class="desc-text">Xây dựng portfolio 3D tương tác dạng phòng làm việc, cho phép người dùng click vào các đồ vật (màn hình, poster...) để khám phá trực quan về hồ sơ, kỹ năng và dự án cá nhân.
                </div>
                <p class="system-msg animate-fade-in">Kho lưu trữ: usestran-dot/nhom6_portfolio</p>
            </div>
        </div>
    `,
    tech: `
        <div class="code-view scrollable-content">
            <div class="indent-1"><h1 class="glitch-text animate-slide-up animate-flicker" style="--color: #c3e88d; --glow: rgba(195, 232, 141, 0.5);">BẢNG CÔNG NGHỆ</h1>                <div class="tech-table animate-pop-in">
                    <div class="table-row header"><div class="cell">PHÂN LOẠI</div><div class="cell">CÔNG NGHỆ</div></div>
                    <div class="table-row staggered-item" style="--delay: 0.1s"><div class="cell category">ĐỒ HỌA</div><div class="cell">Three.js / Blender / WebGL 2.0/ ...</div></div>
                    <div class="table-row staggered-item" style="--delay: 0.2s"><div class="cell category">CỐT LÕI</div><div class="cell">Vite / JavaScript / GitHub/ ...</div></div>
                    <div class="table-row staggered-item" style="--delay: 0.3s"><div class="cell category">VẬT LÝ</div><div class="cell">Raycasting / PointerLock/ ...</div></div>
                </div>
            </div>
        </div>
    `,
    contact: `
        <div class="code-view scrollable-content">
            <div class="indent-1">
<h1 class="glitch-text animate-slide-up animate-flicker" style="--color: #c792ea; --glow: rgba(199, 146, 234, 0.5);">LIÊN HỆ TẠI</h1>                <div class="contact-hub animate-zoom-in">
                    <p class="email-display">lienhe.nhom6@email.com</p>
                    <div class="social-icons-bar">🐦 📁 ✉️</div>
                </div>
            </div>
        </div>
    `
};

window.showPortfolio = (type) => {
    const desktop = document.getElementById('desktop-view');
    const detail = document.getElementById('detail-view');
    const body = document.getElementById('content-body');
    if (portfolioData[type]) {
        body.innerHTML = portfolioData[type];
        desktop.style.display = 'none';
        detail.style.display = 'block';
    }
};

window.goBack = () => {
    document.getElementById('desktop-view').style.display = 'block';
    document.getElementById('detail-view').style.display = 'none';
};

overlay.onclick = (e) => {
    if (e.target.id === 'popup-overlay') {
        overlay.style.display = 'none';
        goBack(); 
        if (typeof controls !== 'undefined') controls.lock(); 
    }
};

// Dữ liệu Poster Zoom
const posterGallery = {
    "Interact_tranh1": "/assets/images/paper_diffuse.jpeg", 
    "Interact_tranh2": "/assets/images/paper.002_diffuse.jpeg",
    "Interact_tranh3": "/assets/images/paper.001_diffuse.jpeg",
    "Interact_tranh4": "/assets/images/fear_the_dark_diffuse.png",
    "Interact_tranh5": "/assets/images/obey_the_god_diffuse.png",
    "Interact_tranh6": "/assets/images/mad_max_fury_road_web_by_3ftdeep-d8qr5za_diffuse.png",
    "Interact_tranh7": "/assets/images/mad_max_fury_road_web_by_3ftdeep-d8qr5za.001_diffuse.png",
    "Interact_tranh8": "/assets/images/paper.005_diffuse.jpeg",
    "Interact_tranh9": "/assets/images/paper.004_diffuse.jpeg",
    "Interact_tranh10": "/assets/images/paper.003_diffuse.jpeg",
    "Interact_tranh11": "/assets/images/fear_the_dark.001_diffuse.jpeg",
};
const zoomOverlay = document.getElementById('zoom-overlay');
const zoomedImage = document.getElementById('zoomed-image');

// =========================================================================
// 2. KHỞI TẠO SCENE, MÔI TRƯỜNG, MANAGER VÀ RENDERER HẬU KỲ (COMPOSER)
// =========================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 1.6, 2); 

// Loading Manager
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const loadingProgressDiv = document.getElementById('loading-progress');
const startContainer = document.getElementById('start-container');
const startBtn = document.getElementById('start-btn');

loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.innerText = `Loading... ${Math.floor(progress)}%`;
};

loadingManager.onLoad = function() {
    if (loadingProgressDiv) loadingProgressDiv.style.display = 'none';
    if (startContainer) startContainer.style.display = 'block';
};

if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out'); 
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
        }
    });
}

// Âm thanh
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader(loadingManager);
const clickSuccessSound = new THREE.Audio(listener);
const clickMissSound = new THREE.Audio(listener);

audioLoader.load('/sounds/success.wav', (buffer) => {
    clickSuccessSound.setBuffer(buffer);
    clickSuccessSound.setVolume(0.7);
});

audioLoader.load('/sounds/miss.wav', (buffer) => {
    clickMissSound.setBuffer(buffer);
    clickMissSound.setVolume(0.95);
});

// Renderer Chính
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// TỐI ƯU LAG: Giới hạn Pixel Ratio tối đa là 2 để cứu GPU trên màn hình độ phân giải cao
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

// FIX LỖI VÂN GỖ: Bật Dithering để làm mịn các dải màu ánh sáng gradient trên tường
renderer.dithering = true;

document.body.appendChild(renderer.domElement);

// Composer Hậu Kỳ (Phát Sáng Viền & Khử răng cưa)
const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    samples: 4, // Đã đủ để khử răng cưa mượt mà, không cần dùng thêm SMAA
    type: THREE.HalfFloatType
});
const composer = new EffectComposer(renderer, renderTarget);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 3.0;
outlinePass.edgeGlow = 0.2;
outlinePass.edgeThickness = 1.0;
outlinePass.visibleEdgeColor.set('#ffffff');
outlinePass.hiddenEdgeColor.set('#cccccc');  
composer.addPass(outlinePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Renderer Label HTML 2D
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// =========================================================================
// 3. ĐIỀU KHIỂN FPS, RAYCASTER VÀ TẢI MÔ HÌNH 3D
// =========================================================================
const controls = new PointerLockControls(camera, document.body);
scene.add(camera);

const blocker = document.getElementById('blocker');
blocker.addEventListener('click', () => { controls.lock(); });
controls.addEventListener('lock', () => { blocker.style.display = 'none'; });
controls.addEventListener('unlock', () => { blocker.style.display = 'flex'; });

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

const onKeyDown = (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyD': moveRight = true; break;
    }
};
const onKeyUp = (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyD': moveRight = false; break;
    }
};
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const infoDiv = document.createElement('div');
infoDiv.className = 'interact-label';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
infoDiv.style.color = '#00ffcc';
infoDiv.style.padding = '8px 12px';
infoDiv.style.borderRadius = '5px';
infoDiv.style.fontFamily = 'monospace';
infoDiv.style.border = '1px solid #00ffcc';
infoDiv.style.display = 'none';
infoDiv.style.marginTop = '-1em';

const infoLabel = new CSS2DObject(infoDiv);
scene.add(infoLabel);

const raycaster = new THREE.Raycaster();
// ĐÃ SỬA: Đổi từ 2.5 thành Infinity để cho phép tương tác từ xa
raycaster.far = Infinity; 
const mouse = new THREE.Vector2();

const loader = new GLTFLoader(loadingManager);
const interactableObjects = [];
const collidableObjects = []; 
let deskLightRef = null;

loader.load(
    '/modeldone1.glb',
    (gltf) => {
        const room = gltf.scene;
        room.traverse((child) => {
            if (child.name === 'Light_tran') {
                const ceilingLight = new THREE.PointLight(0xfffaf0, 5, 20);
                ceilingLight.decay = 2; 
                ceilingLight.castShadow = true; 
                ceilingLight.shadow.mapSize.width = 1024;
                ceilingLight.shadow.mapSize.height = 1024;
                ceilingLight.shadow.bias = -0.001;
                ceilingLight.position.set(0, 0, 0); 
                child.add(ceilingLight);
            }
            else if (child.name === 'Light_denban') {
                const deskLight = new THREE.SpotLight(0xffd27d, 1, 10);
                deskLight.angle = Math.PI / 4; 
                deskLight.penumbra = 0.3;      
                deskLight.decay = 2;
                deskLight.castShadow = true;
                deskLight.shadow.mapSize.width = 512;
                deskLight.shadow.mapSize.height = 512;
                deskLight.shadow.bias = -0.0001;
                deskLight.visible = false; 
                deskLightRef = deskLight;  
                deskLight.position.set(0, 0, 0);
                child.add(deskLight);
                deskLight.target.position.set(0, -1, 0);
                child.add(deskLight.target);
            }

            if (!child.isMesh) return;
            collidableObjects.push(child);
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name.includes('Chup') || child.name.includes('Lampshade') || child.name.includes('DenBan')) {
                child.receiveShadow = false; 
                if (child.material) child.material.side = THREE.DoubleSide; 
            }

            let current = child;
            let isInteractable = false;
            while (current) {
                if (current.name && current.name.startsWith('Interact_')) {
                    isInteractable = true;
                    break;
                }
                current = current.parent;
            }
            if (isInteractable) interactableObjects.push(child);
        });
        scene.add(room);
        console.log('Đã tải modeldone1.glb thành công. Số lượng tương tác:', interactableObjects.length);
    },
    undefined,
    (error) => { console.error('Lỗi tải model:', error); }
);

// =========================================================================
// 4. SỰ KIỆN TƯƠNG TÁC CHUỘT (CLICK, HOVER) & VÒNG LẶP VẬT LÝ GAME
// =========================================================================

// Sự kiện mở máy tính (Có âm thanh)
document.addEventListener('mousedown', () => {
    if (!controls.isLocked) return;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(interactableObjects, true);

    if (intersects.length > 0) {
        let interactName = "";
        let curr = intersects[0].object;
        while (curr) {
            if (curr.name && curr.name.startsWith('Interact_')) {
                interactName = curr.name.toLowerCase();
                break;
            }
            curr = curr.parent;
        }

        if (interactName.includes('screen') || interactName.includes('manhinh')) {
            if (clickSuccessSound.isPlaying) clickSuccessSound.stop();
            clickSuccessSound.play();
            controls.unlock();
            if (typeof overlay !== 'undefined') {
                overlay.style.display = 'block';
                if (window.goBack) window.goBack(); 
            }
        }
    }
});

// Sự kiện click Poster, Đèn & Tắt ảnh bằng chuột trái
window.addEventListener('click', (event) => {
    if (!controls.isLocked) return; 

    // Đóng ảnh zoom nếu đang mở
    if (zoomOverlay && zoomOverlay.style.display === 'flex') {
        zoomOverlay.style.display = 'none'; 
        controls.enabled = true; 
        return; 
    }

    mouse.x = 0;
    mouse.y = 0;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length === 0) {
        infoDiv.style.display = 'none';
        if (clickMissSound.isPlaying) clickMissSound.stop();
        clickMissSound.play();
        return;
    }

    const clickedMesh = intersects[0].object;
    let targetGroup = null;
    
    if (clickSuccessSound.isPlaying) clickSuccessSound.stop();
    clickSuccessSound.play();

    if (clickedMesh.name.startsWith('Interact_')) {
        targetGroup = clickedMesh;
    } else {
        clickedMesh.traverseAncestors((ancestor) => {
            if (ancestor.name && ancestor.name.startsWith('Interact_')) targetGroup = ancestor;
        });
    }

    if (!targetGroup) {
        infoDiv.style.display = 'none';
        return;
    }

    const targetPosition = new THREE.Vector3();
    targetGroup.getWorldPosition(targetPosition);
    infoLabel.position.copy(targetPosition);
    infoLabel.position.y += 1.5;

    const displayName = targetGroup.name.replace('Interact_', '');
    infoDiv.innerHTML = `<strong>${displayName}</strong><br><span style="font-size: 12px; color: white;">Click de xem chi tiet</span>`;
    infoDiv.style.display = 'block';

    // Zoom Poster
    if (targetGroup.name.startsWith('Interact_tranh')) {
        const imagePath = posterGallery[targetGroup.name];
        if (imagePath) {
            zoomedImage.src = imagePath;
            zoomedImage.style.transform = "scaleY(-1)"; 
            zoomOverlay.style.display = 'flex';
            controls.enabled = false; 
        }
    }
    
    // Đèn bàn
    if (targetGroup.name === 'Interact_den') {
        if (deskLightRef) {
            deskLightRef.visible = !deskLightRef.visible; 
        }
    }
});

// Sự kiện click chuột PHẢI để ĐÓNG ảnh
if (zoomOverlay) {
    zoomOverlay.addEventListener('contextmenu', (event) => {
        event.preventDefault(); 
        zoomOverlay.style.display = 'none'; 
        controls.enabled = true; 
    });
}

// Bắt sự kiện Hover chuột phát sáng viền bằng OutlinePass
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        let targetGroup = null;

        if (hoveredMesh.name.startsWith('Interact_')) {
            targetGroup = hoveredMesh;
        } else {
            hoveredMesh.traverseAncestors((ancestor) => {
                if (ancestor.name && ancestor.name.startsWith('Interact_')) {
                    targetGroup = ancestor;
                }
            });
        }

        if (targetGroup) {
            document.body.style.cursor = 'pointer';  
            if (targetGroup.name.startsWith('Interact_tranh')) {
                outlinePass.selectedObjects = [hoveredMesh]; // Sáng nguyên bức tranh
            } else {
                outlinePass.selectedObjects = [targetGroup]; // Sáng cả cụm đồ vật
            }
        } else {
            outlinePass.selectedObjects = [];
            document.body.style.cursor = 'default';
        }
    } else {
        outlinePass.selectedObjects = [];
        document.body.style.cursor = 'default';
    }
});

// Vòng lặp vật lý và render
function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 25.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 25.0 * delta;

        const fwVelocity = -velocity.z * delta;
        const sideVelocity = -velocity.x * delta;

        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0; 
        camDir.normalize();

        const camRight = new THREE.Vector3();
        camRight.crossVectors(camDir, camera.up).normalize();

        let allowZ = true;
        let allowX = true;
        const collisionDistance = 0.5; 

        if (Math.abs(fwVelocity) > 0) {
            const rayDirZ = camDir.clone().multiplyScalar(Math.sign(fwVelocity));
            raycaster.set(camera.position, rayDirZ);
            const hitsZ = raycaster.intersectObjects(collidableObjects, false);
            if (hitsZ.length > 0 && hitsZ[0].distance < collisionDistance) allowZ = false;
        }

        if (Math.abs(sideVelocity) > 0) {
            const rayDirX = camRight.clone().multiplyScalar(Math.sign(sideVelocity));
            raycaster.set(camera.position, rayDirX);
            const hitsX = raycaster.intersectObjects(collidableObjects, false);
            if (hitsX.length > 0 && hitsX[0].distance < collisionDistance) allowX = false;
        }

        if (allowX) controls.moveRight(sideVelocity);
        else velocity.x = 0; 

        if (allowZ) controls.moveForward(fwVelocity);
        else velocity.z = 0;

        raycaster.set(camera.position, new THREE.Vector3(0, -1, 0));
        const floorIntersects = raycaster.intersectObjects(collidableObjects, false);

        if (floorIntersects.length > 0) {
            const floorHeight = floorIntersects[0].point.y;
            if (floorHeight < camera.position.y + 1.0) {
                camera.position.y = floorHeight + 1.6;
            }
        } else {
            camera.position.y = 1.6; 
        }
    }

    // LƯU Ý: Phải dùng composer.render() thay vì renderer.render() để hậu kỳ chạy được
    composer.render();
    labelRenderer.render(scene, camera); 
}

animate();

// Cập nhật Resize cho cả Renderer và Composer (Fix lỗi viền nhòe khi kéo cửa sổ)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});