// Game Configuration
const config = {
    moveSpeed: 10.0,
    lookSpeed: 2.0,
    playerHeight: 2.5,
    colors: {
        background: 0x050505,
        grid: 0x004400,
        floor: 0x0a0a0a,
        objects: {
            about: 0x00ffff, // Cyan
            skills: 0xff00ff, // Magenta
            projects: 0xffff00, // Yellow
            contact: 0x00ff00  // Green
        }
    }
};

let camera, scene, renderer, controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Interactable Objects
const interactables = [];
let raycaster;

// DOM Elements
const startBtn = document.getElementById('start-btn');
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');
const dialogBox = document.getElementById('dialog-box');
const dialogTitle = document.getElementById('dialog-title');
const dialogContent = document.getElementById('dialog-content');
const interactionPrompt = document.querySelector('.interaction-prompt');

// Data for Sections
const portfolioData = {
    about: {
        title: "Subject: Nikesh Nakarmi",
        content: "DevOps Engineer | System Administrator | SRE<br><br>Ambitious results-driven professional with 6+ years in Azure, AWS, and GCP. Passionate about building reliable, scalable automated infrastructure."
    },
    skills: {
        title: "System Capabilities",
        content: "<strong>Cloud:</strong> Azure (85%), AWS, GCP<br><strong>CI/CD:</strong> YAML (90%), Pipelines<br><strong>Ops:</strong> Linux, Windows Server (75%)<br><strong>Soft Skills:</strong> Project Management (70%), Troubleshooting"
    },
    projects: {
        title: "Mission Logs",
        content: "1. <strong>Cloud Migration:</strong> Migrated legacy on-prem to Azure.<br>2. <strong>Auto-Scaling Pipeline:</strong> Reduced deployment time by 60%.<br>3. <strong>Secure Gateway:</strong> Implemented zero-trust network access."
    },
    contact: {
        title: "Uplink Frequency",
        content: "Email: nikeshn.nn@gmail.com<br>Phone: (+977) 9841183378<br><br>Connecting to external satellite..."
    }
};

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.colors.background);
    scene.fog = new THREE.Fog(config.colors.background, 0, 750);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = config.playerHeight;

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    // Renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.PointerLockControls(camera, document.body);

    startBtn.addEventListener('click', () => {
        controls.lock();
    });

    controls.addEventListener('lock', () => {
        loadingScreen.style.display = 'none';
    });

    controls.addEventListener('unlock', () => {
        // Show pause menu if needed, or keeping simple for now
    });

    scene.add(controls.getObject());

    // Input Handling
    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
            case 'KeyE':
                checkInteraction();
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Raycaster for interaction
    raycaster = new THREE.Raycaster();

    buildWorld();

    // Resize Handler
    window.addEventListener('resize', onWindowResize);

    // Simulation of loading
    setTimeout(() => {
        loadingText.innerHTML = "System Ready";
        startBtn.style.display = 'block';
    }, 1500);
}

function buildWorld() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    const floorMaterial = new THREE.MeshBasicMaterial({
        color: config.colors.floor,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Add Grid Helper
    const gridHelper = new THREE.GridHelper(2000, 100, config.colors.grid, config.colors.grid);
    scene.add(gridHelper);

    // Initial Platform Area
    createPlatform(0, 0, 0, 50, 50);

    // Zones
    // About Zone (North)
    createPlatform(0, 0, -50, 20, 20);
    createMonolith(0, 2, -50, config.colors.objects.about, "About Me", "about");

    // Skills Zone (East)
    createPlatform(50, 0, 0, 20, 20);
    createDataServer(50, 2, 0, config.colors.objects.skills, "Skills", "skills");

    // Projects Zone (West)
    createPlatform(-50, 0, 0, 20, 20);
    createHologram(-50, 2, 0, config.colors.objects.projects, "Projects", "projects");

    // Contact Zone (South)
    createPlatform(0, 0, 50, 20, 20);
    createUplink(0, 2, 50, config.colors.objects.contact, "Contact", "contact");

    // Floating Text Helper
    // Note: Implementing 3D text in pure ThreeJS requires font loader. 
    // For simplicity, we stick to HTML UI overlays for text.
}

function createPlatform(x, y, z, width, depth) {
    const geo = new THREE.BoxGeometry(width, 0.5, depth);
    const mat = new THREE.MeshPhongMaterial({ color: 0x111111, specular: 0x111111 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y - 0.25, z);
    scene.add(mesh);
}

function createMonolith(x, y, z, color, label, type) {
    const geo = new THREE.BoxGeometry(4, 6, 4);
    const mat = new THREE.MeshPhongMaterial({ color: color, shininess: 100, emissive: color, emissiveIntensity: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 3, z);
    mesh.userData = { type: type, label: label };
    scene.add(mesh);
    interactables.push(mesh);
}

function createDataServer(x, y, z, color, label, type) {
    const geo = new THREE.BoxGeometry(3, 8, 3);
    const mat = new THREE.MeshPhongMaterial({ color: 0x333333 }); // Rack casing
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 4, z);
    mesh.userData = { type: type, label: label };

    // Server lights
    for (let i = 0; i < 5; i++) {
        const lightGeo = new THREE.PlaneGeometry(2.5, 0.2);
        const lightMat = new THREE.MeshBasicMaterial({ color: color });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.set(0, -2 + i * 1.2, 1.51); // Front face
        mesh.add(light);
    }

    scene.add(mesh);
    interactables.push(mesh);
}

function createHologram(x, y, z, color, label, type) {
    const geo = new THREE.IcosahedronGeometry(3, 0);
    const mat = new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 4, z);
    mesh.userData = { type: type, label: label, rot: true }; // Flag to rotate
    scene.add(mesh);
    interactables.push(mesh);
}

function createUplink(x, y, z, color, label, type) {
    const geo = new THREE.CylinderGeometry(0.5, 3, 2, 8); // Dish base
    const mat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 1, z);
    mesh.userData = { type: type, label: label };

    const dishGeo = new THREE.SphereGeometry(3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dishMat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 1.5, 0);
    dish.rotation.x = -Math.PI / 2;
    mesh.add(dish);

    scene.add(mesh);
    interactables.push(mesh);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();

    // Check controls state
    if (controls.isLocked === true) {

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        // velocity.y -= 9.8 * 100.0 * delta; // Jump logic (disabled for simplicity)

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // Ensure consistent movement in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Simple boundary check or floor clamp
        if (controls.getObject().position.y < config.playerHeight) {
            velocity.y = 0;
            controls.getObject().position.y = config.playerHeight;
            canJump = true;
        }

    }

    prevTime = time;

    // Rotate holographic objects
    scene.traverse((object) => {
        if (object.isMesh && object.userData.rot) {
            object.rotation.y += 0.01;
            object.rotation.x += 0.005;
        }
    });

    // Interaction Raycast
    checkHover();

    renderer.render(scene, camera);
}

let activeInteractable = null;

function checkHover() {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); // Center screen ray
    const intersects = raycaster.intersectObjects(interactables, false); // No recursive check for simplicity unless needed

    if (intersects.length > 0 && intersects[0].distance < 15) {
        const object = intersects[0].object;
        activeInteractable = object;
        interactionPrompt.style.display = 'block';
        interactionPrompt.innerHTML = "Press E: " + object.userData.label;
    } else {
        activeInteractable = null;
        interactionPrompt.style.display = 'none';

        // Also check children if parent wasn't hit directly (basic logic mostly covers it)
    }
}

function checkInteraction() {
    if (activeInteractable) {
        const type = activeInteractable.userData.type;
        const data = portfolioData[type];

        if (data) {
            showDialog(data.title, data.content);
            controls.unlock(); // Unlock cursor to allow clicking close button
        }
    }
}

function showDialog(title, content) {
    dialogTitle.innerHTML = title;
    dialogContent.innerHTML = content;
    dialogBox.style.display = 'block';
}

function closeDialog() {
    dialogBox.style.display = 'none';
    controls.lock(); // Not auto-locking to avoid confusion, user should click back in or use button
}
