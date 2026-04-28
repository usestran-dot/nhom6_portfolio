import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
// 1. KHỞI TẠO SCENE, CAMERA, RENDERER
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // BỔ SUNG: Lấy đúng mật độ điểm ảnh để nét hơn
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Giúp bóng đổ mịn hơn
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

// 3. KHỞI TẠO CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

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
let deskLightRef = null; // Biến dùng để ghi nhớ và điều khiển bật/tắt đèn bàn
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

// 8. BẮT SỰ KIỆN CLICK (RAYCASTER)
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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
            if (ancestor.name && ancestor.name.startsWith('Interact_')) {
                targetGroup = ancestor;
            }
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
    if (targetGroup.name === 'Interact_den') {
        if (deskLightRef) {
            // Đảo ngược trạng thái hiện tại (Tắt thành Bật, Bật thành Tắt)
            deskLightRef.visible = !deskLightRef.visible; 
            console.log("Trạng thái đèn bàn:", deskLightRef.visible ? "BẬT" : "TẮT");
        }
    }
});
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
            document.body.style.cursor = 'pointer';      // Đổi icon chuột thành bàn tay
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