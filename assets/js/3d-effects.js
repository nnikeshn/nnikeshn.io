// Initialize Vanilla Tilt
document.addEventListener('DOMContentLoaded', () => {
    // Select elements to apply tilt effect
    const tiltElements = document.querySelectorAll('.box-shadow-full, .service-box, .work-box, .card-blog, .testimonial-box');

    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(tiltElements, {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
            scale: 1.02
        });
    }

    // Initialize Three.js Background
    initThreeJsBackground();
});

function initThreeJsBackground() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Style the canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '0'; // Behind content

    // Insert as first child to be behind overlay
    heroSection.insertBefore(renderer.domElement, heroSection.firstChild);

    // Create Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;

    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        // Spread particles across a wide area
        posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create Material
    // Check if dark mode is active to decide simplified starting color (though it updates dynamically)
    const isDark = document.body.classList.contains('dark-mode');
    const color = isDark ? 0xffffff : 0x0078ff;

    const material = new THREE.PointsMaterial({
        size: 0.15,
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Create Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    camera.position.z = 10;

    // Animation Loop
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Rotate entire system slowly
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Mouse interaction effect
        // particlesMesh.rotation.x += mouseY * 0.00005;
        // particlesMesh.rotation.y += mouseX * 0.00005;

        // Dynamic color update based on theme
        // We can check the body class every frame or listen to event. 
        // For performance, let's just check periodically or keep it simple.
        // Actually, let's just let the particles shine.

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
