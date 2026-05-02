import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- 1. GIAO DIỆN DESKTOP PORTFOLIO (HỖ TRỢ VIEW CHI TIẾT & NÚT BACK) ---
const overlay = document.createElement('div');
overlay.id = 'popup-overlay';
// Giao diện bao gồm 2 phần: Desktop (chứa icon) và Detail (chứa nội dung)
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
            <div id="content-body">
                </div>
        </div>
    </div>
`;
document.body.appendChild(overlay);

// Dữ liệu nội dung (Tôi đã thêm format giống code để nhìn chuyên nghiệp hơn)
const portfolioData = {
    team: `
        <div class="code-view scrollable-content">
            <div class="indent-1">
                <h1 class="glitch-text animate-slide-up" style="--color: #89ddff; --glow: rgba(137, 221, 255, 0.5);">THÀNH VIÊN CỐT LÕI</h1>
                <p class="status-tag animate-flicker">[NHÓM 6]</p>
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
            <div class="indent-1">
                <h1 class="glitch-text animate-slide-up" style="--color: #f07178; --glow: rgba(240, 113, 120, 0.5);">DỰ ÁN ĐÃ TRIỂN KHAI</h1>
                <p class="status-tag animate-flicker" style="color: #f07178;">[PHIÊN BẢN: 2.0.2.6 - ỔN ĐỊNH]</p>
                <div class="project-card animate-pop-in">
                    <p><strong>MỤC TIÊU:</strong> Web Portfolio - Phòng Làm Việc 3D</p>
                    <p class="desc-text">Mô phỏng không gian thực tế ảo bằng <span class="highlight">Engine Raycasting</span>.</p>
                </div>
                <p class="system-msg animate-fade-in">// Trạng thái: Đang hoạt động | Kho lưu trữ: usestran-dot/nhom6_portfolio</p>
            </div>
        </div>
    `,
    
    tech: `
        <div class="code-view scrollable-content">
            <div class="indent-1">
                <h1 class="glitch-text animate-slide-up" style="--color: #c3e88d; --glow: rgba(195, 232, 141, 0.5);">BẢNG CÔNG NGHỆ</h1>
                <div class="tech-table animate-pop-in">
                    <div class="table-row header"><div class="cell">PHÂN LOẠI</div><div class="cell">THÔNG SỐ CỐT LÕI</div></div>
                    <div class="table-row staggered-item" style="--delay: 0.1s"><div class="cell category">ĐỒ HỌA</div><div class="cell">Three.js / Blender / WebGL 2.0</div></div>
                    <div class="table-row staggered-item" style="--delay: 0.2s"><div class="cell category">CỐT LÕI</div><div class="cell">Vite / JavaScript / GitHub</div></div>
                    <div class="table-row staggered-item" style="--delay: 0.3s"><div class="cell category">VẬT LÝ</div><div class="cell">Raycasting / PointerLock</div></div>
                </div>
            </div>
        </div>
    `,

    contact: `
        <div class="code-view scrollable-content">
            <div class="indent-1">
                <h1 class="glitch-text animate-slide-up" style="--color: #c792ea; --glow: rgba(199, 146, 234, 0.5);">TRUYỀN TÍN HIỆU</h1>
                <div class="contact-hub animate-zoom-in">
                    <p class="email-display">lienhe.nhom6@email.com</p>
                    <div class="social-icons-bar">🐦 📁 ✉️</div>
                </div>
            </div>
        </div>
    `
};

// Hàm hiển thị chi tiết
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

// Hàm quay lại màn hình chính
window.goBack = () => {
    document.getElementById('desktop-view').style.display = 'block';
    document.getElementById('detail-view').style.display = 'none';
};

// Click ra ngoài để thoát chế độ dùng máy tính 
overlay.onclick = (e) => {
    if (e.target.id === 'popup-overlay') {
        overlay.style.display = 'none';
        goBack(); // Reset về màn hình icon cho lần mở sau
        if (typeof controls !== 'undefined') controls.lock(); 
    }
};

// 1. KHỞI TẠO SCENE, CAMERA, RENDERER
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); 

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01, // FIX 1: Đổi từ 0.1 thành 0.01 (Mắt camera nhìn sát vật thể đến 1cm vẫn không bị xuyên)
    1000
);
camera.position.set(0, 1.6, 2); 

// KHỞI TẠO ÂM THANH
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();
const clickSuccessSound = new THREE.Audio(listener);
const clickMissSound = new THREE.Audio(listener);

// Load file từ thư mục public/sounds đã tạo
audioLoader.load('/sounds/success.wav', (buffer) => {
    clickSuccessSound.setBuffer(buffer);
    clickSuccessSound.setVolume(0.7);
});

audioLoader.load('/sounds/miss.wav', (buffer) => {
    clickMissSound.setBuffer(buffer);
    clickMissSound.setVolume(0.95);
});
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
document.body.appendChild(renderer.domElement);

// 2. KHỞI TẠO CSS2DRENDERER (CHO UI LABELS)
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// 3. KHỞI TẠO CONTROLS (GÓC NHÌN THỨ NHẤT AAA)
const controls = new PointerLockControls(camera, document.body);
scene.add(camera);

const blocker = document.getElementById('blocker');
blocker.addEventListener('click', () => { controls.lock(); });
controls.addEventListener('lock', () => { blocker.style.display = 'none'; });
controls.addEventListener('unlock', () => { blocker.style.display = 'flex'; });

// Biến vật lý di chuyển
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
document.addEventListener('mousedown', () => {
    if (!controls.isLocked) return;
    
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(interactableObjects, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        let interactName = "";
        let curr = obj;

        // Tìm object cha có tên bắt đầu bằng "Interact_"
        while (curr) {
            if (curr.name && curr.name.startsWith('Interact_')) {
                interactName = curr.name.toLowerCase();
                break;
            }
            curr = curr.parent;
        }

        // Chỉ giữ lại tương tác với Màn hình
        if (interactName.includes('screen') || interactName.includes('manhinh')) {
            controls.unlock();
            
            // Hiển thị lớp phủ Portfolio
            if (typeof overlay !== 'undefined') {
                overlay.style.display = 'block';
                // Đảm bảo quay về màn hình Desktop chính (chứa các icon)
                if (window.goBack) window.goBack(); 
            }
        }
    }
});


// 4. ÁNH SÁNG MÔI TRƯỜNG CƠ BẢN
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// 5. TẠO HTML ELEMENT CHO UI NHÃN TÊN
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

// 6. RAYCASTER VÀ LOADER
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const loader = new GLTFLoader();
const interactableObjects = [];
const collidableObjects = []; // MỚI: Mảng chứa TẤT CẢ tường, sàn, đồ vật để làm vật cản
let deskLightRef = null;
// 7. TẢI MODEL VÀ XỬ LÝ (ÁNH SÁNG & TƯƠNG TÁC)
loader.load(
    '/modeldone1.glb',
    (gltf) => {
        const room = gltf.scene;

        room.traverse((child) => {
            // ==========================================
            // BƯỚC A: XỬ LÝ CÁC MỎ NEO ÁNH SÁNG
            // ==========================================
            
            // --- 1. ĐÈN TRẦN ---
            if (child.name === 'Light_tran') {
                const ceilingLight = new THREE.PointLight(0xfffaf0, 5, 20);
                ceilingLight.decay = 2; 
                ceilingLight.castShadow = true; 
                ceilingLight.shadow.mapSize.width = 1024;
                ceilingLight.shadow.mapSize.height = 1024;
                ceilingLight.shadow.bias = -0.005;
                ceilingLight.position.set(0, 0, 0); 
                child.add(ceilingLight);
            }
            
            // --- 2. ĐÈN BÀN HỌC (MỚI THÊM) ---
            else if (child.name === 'Light_denban') {
                console.log('Đã tìm thấy Light_denban, đang gắn SpotLight...');
                
                // Màu vàng nắng (0xffd27d)
                const deskLight = new THREE.SpotLight(0xffd27d, 1, 10);
                deskLight.angle = Math.PI / 4; // Góc mở của chụp đèn
                deskLight.penumbra = 0.3;      // Mờ viền sáng
                deskLight.decay = 2;
                
                // Bật đổ bóng
                deskLight.castShadow = true;
                deskLight.shadow.mapSize.width = 512;
                deskLight.shadow.mapSize.height = 512;
                deskLight.shadow.bias = -0.0001;
                deskLight.visible = false; // Mặc định ban đầu là đèn TẮT
                deskLightRef = deskLight;  // Lưu vào biến toàn cục để điều khiển ở sự kiện click

                deskLight.position.set(0, 0, 0);
                child.add(deskLight);

                // Hướng tia sáng cắm xuống mặt bàn
                deskLight.target.position.set(0, -1, 0);
                child.add(deskLight.target);
            }

            // ==========================================
            // BƯỚC B: CHẶN CÁC OBJECT KHÔNG PHẢI MESH
            // ==========================================
            if (!child.isMesh) return;
            collidableObjects.push(child);

            // ==========================================
            // BƯỚC C: XỬ LÝ ĐỔ BÓNG CHO MESH
            // ==========================================
            child.castShadow = true;
            child.receiveShadow = true;

            // --- XỬ LÝ CHỤP ĐÈN KHÔNG CHO SÁNG XUYÊN QUA ---
            // Tạm thời tôi đặt từ khóa là 'Chup' hoặc 'Lampshade'.
            // (Nếu team 3D đặt tên khác, bạn thay chữ 'Chup' bằng tên đó nhé)
            if (child.name.includes('Chup') || child.name.includes('Lampshade') || child.name.includes('DenBan')) {
                child.receiveShadow = false; // Chụp đèn không nhận bóng của chính nó
                if (child.material) {
                    child.material.side = THREE.DoubleSide; // Render cả mặt trong lẫn ngoài để chắn sáng tuyệt đối
                }
            }

            // ==========================================
            // BƯỚC D: LỌC VẬT THỂ TƯƠNG TÁC (Raycaster)
            // ==========================================
            let current = child;
            let isInteractable = false;
            while (current) {
                if (current.name && current.name.startsWith('Interact_')) {
                    isInteractable = true;
                    break;
                }
                current = current.parent;
            }
            if (isInteractable) {
                interactableObjects.push(child);
            }
        });

        scene.add(room);
        console.log('Đã tải modeldone1.glb thành công. Số lượng mesh tương tác:', interactableObjects.length);
    },
    undefined,
    (error) => {
        console.error('Lỗi tải file modeldone1.glb:', error);
    }
);

// 8. BẮT SỰ KIỆN CLICK (RAYCASTER CHO GAME FPS)
window.addEventListener('click', (event) => {
    if (!controls.isLocked) return; // Bắt buộc phải khóa chuột mới được tương tác

    // Bắn tia từ tâm ngắm (giữa màn hình)
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

    if (targetGroup.name === 'Interact_den' && deskLightRef) {
        deskLightRef.visible = !deskLightRef.visible; 
        console.log("Trạng thái đèn bàn:", deskLightRef.visible ? "BẬT" : "TẮT");
    }
});

// 9. VÒNG LẶP RENDER VÀ VẬT LÝ DI CHUYỂN
function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        // Tốc độ đi bộ vừa phải
        if (moveForward || moveBackward) velocity.z -= direction.z * 25.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 25.0 * delta;

        // Lực di chuyển dự kiến
        const fwVelocity = -velocity.z * delta;
        const sideVelocity = -velocity.x * delta;

        // Lấy vector Hướng nhìn (Forward) và Hướng ngang (Right)
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0; 
        camDir.normalize();

        const camRight = new THREE.Vector3();
        
        // ==========================================
        // FIX BUG ĐI XUYÊN TƯỜNG NGANG CHÍNH LÀ Ở ĐÂY:
        // Đảo ngược vị trí thành (camDir, camera.up) để tia Ray chỉ đúng sang PHẢI
        // ==========================================
        camRight.crossVectors(camDir, camera.up).normalize();

        // ==========================================
        // VẬT LÝ 1: KIỂM TRA VA CHẠM ĐỘC LẬP & TRƯỢT TƯỜNG
        // ==========================================
        let allowZ = true;
        let allowX = true;
        const collisionDistance = 0.5; // Bán kính bụng nhân vật

        // Bắn tia hướng Tiến/Lùi
        if (Math.abs(fwVelocity) > 0) {
            const rayDirZ = camDir.clone().multiplyScalar(Math.sign(fwVelocity));
            raycaster.set(camera.position, rayDirZ);
            const hitsZ = raycaster.intersectObjects(collidableObjects, false);
            if (hitsZ.length > 0 && hitsZ[0].distance < collisionDistance) {
                allowZ = false;
            }
        }

        // Bắn tia hướng Trái/Phải
        if (Math.abs(sideVelocity) > 0) {
            const rayDirX = camRight.clone().multiplyScalar(Math.sign(sideVelocity));
            raycaster.set(camera.position, rayDirX);
            const hitsX = raycaster.intersectObjects(collidableObjects, false);
            if (hitsX.length > 0 && hitsX[0].distance < collisionDistance) {
                allowX = false;
            }
        }

        // Áp dụng di chuyển độc lập
        if (allowX) controls.moveRight(sideVelocity);
        else velocity.x = 0; 

        if (allowZ) controls.moveForward(fwVelocity);
        else velocity.z = 0;

        // ==========================================
        // VẬT LÝ 2: TRỌNG LỰC & CHẠM ĐẤT
        // ==========================================
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

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); 
}

animate();

// 10. XỬ LÝ KHI RESIZE TRÌNH DUYỆT
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
