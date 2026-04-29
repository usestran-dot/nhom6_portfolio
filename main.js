import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// 1. KHỞI TẠO SCENE, CAMERA, RENDERER
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); // Thiết lập nền sáng chuẩn AAA

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
// Đặt camera ở độ cao mắt người (1.6m) và đứng ở vị trí thuận tiện nhìn căn phòng
camera.position.set(0, 1.6, 2); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Tối ưu độ nét cho các màn hình cao cấp
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Giúp bóng đổ mịn hơn
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
        return;
    }

    const clickedMesh = intersects[0].object;
    let targetGroup = null;

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

    if (controls.isLocked) {
        const delta = clock.getDelta();

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 50.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 50.0 * delta;

        // ==========================================
        // VẬT LÝ 1: VA CHẠM TƯỜNG VÀ ĐỒ VẬT (COLLISION)
        // ==========================================
        const moveVector = new THREE.Vector3(-velocity.x * delta, 0, -velocity.z * delta);
        const moveDistance = moveVector.length();

        if (moveDistance > 0) {
            // Bắn tia từ bụng nhân vật ra hướng đang đi
            const moveDir = moveVector.clone().normalize();
            raycaster.set(camera.position, moveDir);
            
            // Tìm vật cản
            const intersects = raycaster.intersectObjects(collidableObjects, false);

            // Bán kính bụng nhân vật = 0.5 mét. Nếu tường/đồ vật gần hơn khoảng này -> NGỪNG LẠI!
            if (intersects.length > 0 && intersects[0].distance < 0.5) {
                velocity.x = 0;
                velocity.z = 0;
            } else {
                // Nếu đường trống thì cho phép bước đi
                controls.moveRight(-velocity.x * delta);
                controls.moveForward(-velocity.z * delta);
            }
        }

        // ==========================================
        // VẬT LÝ 2: TRỌNG LỰC & CHẠM ĐẤT
        // ==========================================
        // Bắn tia từ camera thẳng xuống mặt đất (-1)
        raycaster.set(camera.position, new THREE.Vector3(0, -1, 0));
        const floorIntersects = raycaster.intersectObjects(collidableObjects, false);

        if (floorIntersects.length > 0) {
            // Đặt chân lên mặt sàn đó, và đẩy camera lên bằng đúng chiều cao mắt người (1.6m)
            const floorHeight = floorIntersects[0].point.y;
            camera.position.y = floorHeight + 1.6;
        } else {
            // Đề phòng bay ra ngoài không gian không có sàn
            camera.position.y = 1.6; 
        }
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); 
}

// 10. XỬ LÝ KHI RESIZE TRÌNH DUYỆT
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});