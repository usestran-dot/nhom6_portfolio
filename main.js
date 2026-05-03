import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
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
// --- BỔ SUNG: KHỞI TẠO COMPOSER & OUTLINE PASS ---
const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        samples: 4,
        type: THREE.HalfFloatType
    }
);
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


// --- NÂNG CẤP: DÙNG SMAA THAY VÌ FXAA ĐỂ NÉT NHƯ BLENDER ---
const pixelRatio = renderer.getPixelRatio();
const smaaPass = new SMAAPass( window.innerWidth * pixelRatio, window.innerHeight * pixelRatio );
composer.addPass( smaaPass );
// ----------------------------------------------------

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
raycaster.far = 2.5;
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
                 ceilingLight.shadow.bias = -0.001;
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
// --- BẢN ĐỒ ẢNH POSTER ---
const posterGallery = {
    "Object_24": "/assets/images/fear_the_dark_diffuse.png", 
    "Object_25": "/assets/images/fear_the_dark.001_diffuse.jpeg",
    "Object_26": "/assets/images/fear_the_dark.002_diffuse.jpeg",
    "Object_31": "/assets/images/mad_max_fury_road_web_by_3ftdeep-d8qr5za_diffuse.png",
    "Object_32": "/assets/images/mad_max_fury_road_web_by_3ftdeep-d8qr5za.001_diffuse.png",
    "Object_36": "/assets/images/obey_the_god_diffuse.png",
    "Object_37": "/assets/images/paper_diffuse.jpeg",
    "Object_38": "/assets/images/paper.001_diffuse.jpeg",
    "Object_39": "/assets/images/paper.002_diffuse.jpeg",
    "Object_40": "/assets/images/paper.003_diffuse.jpeg",
    "Object_41": "/assets/images/paper.004_diffuse.jpeg",
    "Object_42": "/assets/images/paper.005_diffuse.jpeg",
};

const zoomOverlay = document.getElementById('zoom-overlay');
const zoomedImage = document.getElementById('zoomed-image');
// 8. BẮT SỰ KIỆN CLICK (RAYCASTER)
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
    // --- PHẦN XỬ LÝ ZOOM POSTER CON ---
    if (targetGroup.name === 'Interact_tranh1') {
        const childName = clickedMesh.name; // Lấy tên "Object_24", "Object_25"...
        
        if (posterGallery[childName]) {
            zoomedImage.src = posterGallery[childName];
            zoomedImage.style.transform = "scaleY(-1)";
            zoomOverlay.style.display = 'flex';
            controls.enabled = false; // Khóa camera để xem ảnh
            console.log("Đang zoom poster:", childName);
        }
    }
    else if (targetGroup.name === 'Interact_den') {
        if (deskLightRef) {
            // Đảo ngược trạng thái hiện tại (Tắt thành Bật, Bật thành Tắt)
            deskLightRef.visible = !deskLightRef.visible; 
            console.log("Trạng thái đèn bàn:", deskLightRef.visible ? "BẬT" : "TẮT");
        }
    }
});
// Sự kiện click để ĐÓNG ảnh khi người dùng click vào màn hình đen
if (zoomOverlay) {
    zoomOverlay.onclick = () => {
        event.stopPropagation();
        zoomOverlay.style.display = 'none';
        controls.enabled = true; // Mở lại camera để tiếp tục khám phá
    };
}

// --- BỔ SUNG: BẮT SỰ KIỆN MOUSEMOVE (HOVER ĐỂ PHÁT SÁNG) ---
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);


    if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        let targetGroup = null;


        // Tìm Group/Mesh cha có chữ Interact_ giống logic lúc Click
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
            outlinePass.selectedObjects = [targetGroup]; // Phát sáng group đó
            document.body.style.cursor = 'pointer';  
            // 2. LOGIC FIX: Kiểm tra nếu là cụm tranh thì chỉ sáng Mesh con
            if (targetGroup.name === 'Interact_tranh1') {
                // Chỉ gán duy nhất Mesh mà tia Raycaster chạm trúng
                outlinePass.selectedObjects = [hoveredMesh];
            } else {
                // Đối với các vật thể khác (như cái đèn), có thể sáng cả cụm
                outlinePass.selectedObjects = [targetGroup];
            }    // Đổi icon chuột thành bàn tay
        } else {
            outlinePass.selectedObjects = [];
            document.body.style.cursor = 'default';
        }
    } else {
        outlinePass.selectedObjects = [];
        document.body.style.cursor = 'default';
    }
});
// 9. VÒNG LẶP RENDER
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
    labelRenderer.render(scene, camera); // Render UI 2D

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
    composer.setSize(window.innerWidth, window.innerHeight);


    // Cập nhật lại độ phân giải cho SMAA
    const pixelRatio = renderer.getPixelRatio();
    smaaPass.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);

});
