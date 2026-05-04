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
// PHẦN 1: GIAO DIỆN DESKTOP PORTFOLIO & DỮ LIỆU POSTER TRANH
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

// Dữ liệu Poster Zoom (Từ nhánh Tương tác tranh)
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
// PHẦN 2: KHỞI TẠO SCENE, CAMERA VÀ RENDERER HẬU KỲ
// =========================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 1.6, 2); 

// Renderer Chính (Tối ưu từ nhánh Tương tác)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.dithering = true;
document.body.appendChild(renderer.domElement);

// Composer Hậu Kỳ (Phát Sáng Viền & Khử răng cưa)
const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    samples: 4, 
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
// PHẦN 3: QUẢN LÝ TẢI TÀI NGUYÊN (LOADING MANAGER)
// =========================================================================
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

// =========================================================================
// PHẦN 4: HỆ THỐNG ÂM THANH (AUDIO & NÚT START)
// =========================================================================
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader(loadingManager);
const bgMusic = new THREE.Audio(listener);
const clickSuccessSound = new THREE.Audio(listener);
const clickMissSound = new THREE.Audio(listener);

audioLoader.load("./sounds/L'indecis - Soulful.mp3", (buffer) => {
    bgMusic.setBuffer(buffer);
    bgMusic.setLoop(true);
    bgMusic.setVolume(0.3);
});

audioLoader.load('/sounds/success.wav', (buffer) => {
    clickSuccessSound.setBuffer(buffer);
    clickSuccessSound.setVolume(0.7);
});

audioLoader.load('/sounds/miss.wav', (buffer) => {
    clickMissSound.setBuffer(buffer);
    clickMissSound.setVolume(0.95);
});

if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out'); 
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
        }
        
        const audioControlUI = document.getElementById('audio-control');
        if (audioControlUI) audioControlUI.style.display = 'flex';

        const volumeSlider = document.getElementById('volume-slider');
        if (!bgMusic.isPlaying && (!volumeSlider || volumeSlider.value > 0)) {
            bgMusic.play();
        }
    });
}

const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');

if (muteBtn && volumeSlider) {
    muteBtn.addEventListener('click', () => {
        if (bgMusic.context.state === 'suspended') bgMusic.context.resume();
        if (bgMusic.isPlaying) {
            bgMusic.pause();
            muteBtn.innerText = '🔇';
        } else {
            bgMusic.play();
            muteBtn.innerText = '🔊';
            if (volumeSlider.value == 0) {
                volumeSlider.value = 0.3;
                bgMusic.setVolume(0.3);
            }
        }
    });

    volumeSlider.addEventListener('input', (event) => {
        const vol = parseFloat(event.target.value);
        bgMusic.setVolume(vol);
        if (vol === 0) {
            muteBtn.innerText = '🔇';
        } else if (!bgMusic.isPlaying && vol > 0) {
            if (bgMusic.context.state === 'suspended') bgMusic.context.resume();
            bgMusic.play();
            muteBtn.innerText = '🔊';
        } else {
            muteBtn.innerText = '🔊';
        }
    });
}

// =========================================================================
// PHẦN 5: ĐIỀU KHIỂN GÓC NHÌN (CONTROLS) VÀ BIẾN VẬT LÝ
// =========================================================================
const controls = new PointerLockControls(camera, document.body);
scene.add(camera);

const blocker = document.getElementById('blocker');
blocker.addEventListener('click', () => { controls.lock(); });
controls.addEventListener('lock', () => { blocker.style.display = 'none'; });

// ĐÃ SỬA: Bắt sự kiện thả chuột, nếu đang xem tranh hoặc mở máy tính thì KHÔNG hiện chữ
controls.addEventListener('unlock', () => { 
    const isZoomOpen = zoomOverlay && zoomOverlay.style.display === 'flex';
    const isComputerOpen = overlay && overlay.style.display === 'block';
    
    if (!isZoomOpen && !isComputerOpen) {
        blocker.style.display = 'flex'; 
    }
});

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

// =========================================================================
// PHẦN 6: ÁNH SÁNG, TẢI MÔ HÌNH VÀ RAYCASTER (TƯƠNG TÁC)
// =========================================================================
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
raycaster.far = Infinity; 
const mouse = new THREE.Vector2(0, 0);

const loader = new GLTFLoader(loadingManager);
const interactableObjects = [];
const collidableObjects = []; 
let deskLightRef = null;

loader.load(
    '/modeldone1.glb',
    (gltf) => {
        const room = gltf.scene;
        room.traverse((child) => {
            // --- 1. THIẾT LẬP ÁNH SÁNG ---
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
            
            // --- 2. VẬT LÝ VA CHẠM ---
            collidableObjects.push(child);
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name.includes('Chup') || child.name.includes('Lampshade') || child.name.includes('DenBan')) {
                child.receiveShadow = false; 
                if (child.material) child.material.side = THREE.DoubleSide; 
            }

            // --- 3. LỌC VẬT THỂ TƯƠNG TÁC (ĐÃ SỬA: LOẠI BỎ TAI NGHE) ---
            let current = child;
            let isInteractable = false;

            while (current) {
                // Kiểm tra tên vật thể hoặc cha của nó
                if (current.name) {
                    // Nếu bắt gặp tên Interact_tainghe thì DỪNG LẠI và KHÔNG cho tương tác
                    if (current.name === 'Interact_tainghe') {
                        isInteractable = false;
                        break;
                    }
                    // Nếu là vật thể Interact_ khác thì cho phép tương tác
                    if (current.name.startsWith('Interact_')) {
                        isInteractable = true;
                        break;
                    }
                }
                current = current.parent;
            }

            // Chỉ thêm vào danh sách tương tác nếu thỏa mãn điều kiện
            if (isInteractable) {
                interactableObjects.push(child);
            }
        });
        scene.add(room);
        console.log('Đã tải xong phòng. Số lượng vật thể tương tác (sau khi lọc):', interactableObjects.length);
    },
    undefined,
    (error) => { console.error('Lỗi tải model:', error); }
);

// =========================================================================
// PHẦN 7: SỰ KIỆN TƯƠNG TÁC CHUỘT (CLICK, HOVER) & VÒNG LẶP VẬT LÝ GAME
// =========================================================================
// Khai báo vector tâm màn hình cố định
const screenCenter = new THREE.Vector2(0, 0);

// 1. Sự kiện Click chuột (Sử dụng tâm màn hình)
document.addEventListener('mousedown', (event) => {
    // Thoát chế độ xem tranh (Zoom)
    const isZoomOpen = zoomOverlay && zoomOverlay.style.display === 'flex';
    if (isZoomOpen) {
        if (event.button === 0) {
            event.stopPropagation();
            zoomOverlay.style.display = 'none';
            controls.enabled = true;
            controls.lock(); 
        }
        return; 
    }

    if (!controls.isLocked) return;

    // Bắn tia từ TÂM màn hình
    raycaster.setFromCamera(screenCenter, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length === 0) {
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

    if (!targetGroup) return;

    const interactName = targetGroup.name.toLowerCase();

    // Tương tác Màn hình máy tính
    if (interactName.includes('screen') || interactName.includes('manhinh')) {
        if (typeof overlay !== 'undefined') {
            overlay.style.display = 'block';
            if (window.goBack) window.goBack(); 
        }
        controls.unlock(); 
    } 
    // Tương tác Xem Poster/Tranh
    else if (interactName.startsWith('interact_tranh')) {
        const imagePath = posterGallery[targetGroup.name];
        if (imagePath) {
            zoomedImage.src = imagePath;
            zoomedImage.style.transform = "scaleY(-1)"; 
            zoomOverlay.style.display = 'flex';
            controls.enabled = false; 
            controls.unlock(); 
        }
    }
    // Tương tác Đèn bàn
    else if (interactName.includes('den') && deskLightRef) {
        deskLightRef.visible = !deskLightRef.visible; 
    }
});

// 2. Sự kiện chuột phải đóng tranh
if (zoomOverlay) {
    zoomOverlay.addEventListener('contextmenu', (event) => {
        event.preventDefault(); 
        if (zoomOverlay.style.display === 'flex') {
            zoomOverlay.style.display = 'none'; 
            controls.enabled = true; 
            controls.lock();
        }
    });
}

// 3. Vòng lặp vật lý và render (Đã tích hợp Hover theo tâm)
function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);

    if (controls.isLocked) {
        // --- LOGIC DI CHUYỂN & VA CHẠM ---
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
        camDir.y = 0; camDir.normalize();
        const camRight = new THREE.Vector3();
        camRight.crossVectors(camDir, camera.up).normalize();

        let allowZ = true, allowX = true;
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

        // --- LOGIC TRỌNG LỰC / SÀN NHÀ ---
        raycaster.set(camera.position, new THREE.Vector3(0, -1, 0));
        const floorIntersects = raycaster.intersectObjects(collidableObjects, false);
        if (floorIntersects.length > 0) {
            const floorHeight = floorIntersects[0].point.y;
            if (floorHeight < camera.position.y + 1.0) camera.position.y = floorHeight + 1.6;
        } else {
            camera.position.y = 1.6; 
        }

        // --- MỚI: LOGIC HOVER THEO TÂM MÀN HÌNH ---
        // Kiểm tra vật thể ở tâm mỗi khung hình để bật Outline sáng viền
        raycaster.setFromCamera(screenCenter, camera);
        const hoverIntersects = raycaster.intersectObjects(interactableObjects, false);

        if (hoverIntersects.length > 0) {
            const hoveredMesh = hoverIntersects[0].object;
            let targetGroup = null;

            // Tìm group cha Interact_
            if (hoveredMesh.name.startsWith('Interact_')) {
                targetGroup = hoveredMesh;
            } else {
                hoveredMesh.traverseAncestors((ancestor) => {
                    if (ancestor.name && ancestor.name.startsWith('Interact_')) targetGroup = ancestor;
                });
            }

            if (targetGroup) {
                // Hiển thị nhãn tên (Label)
                const targetPos = new THREE.Vector3();
                targetGroup.getWorldPosition(targetPos);
                infoLabel.position.copy(targetPos);
                infoLabel.position.y += 1.2;
                infoDiv.innerHTML = `<strong>${targetGroup.name.replace('Interact_', '')}</strong>`;
                infoDiv.style.display = 'block';

                // Bật sáng viền
                if (targetGroup.name.startsWith('Interact_tranh')) {
                    outlinePass.selectedObjects = [hoveredMesh];
                } else {
                    outlinePass.selectedObjects = [targetGroup];
                }
            }
        } else {
            // Tắt viền và nhãn khi không nhìn vào vật thể
            outlinePass.selectedObjects = [];
            infoDiv.style.display = 'none';
        }
    }

    composer.render();
    labelRenderer.render(scene, camera); 
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});