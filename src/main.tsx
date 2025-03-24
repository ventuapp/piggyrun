import * as THREE from 'three';

import { createPig } from './pig';
import { createCarrot, createTurnip, createCabbage } from './food';

const SPAWN_POINT_X = -30;
const SPAWN_POINT_Y = -200;
const SPAWN_POINT_Z = 20;


class PiggyRun {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.score = 0;
        this.pigPosition = { x: 0, y: 0, z: 0 };
        this.speed = 0.1;
        this.isGameOver = false;
        this.paused = false;
        this.startPortalBox = null;
        this.exitPortalBox = null;
        this.selfUsername = new URLSearchParams(window.location.search).get('username') || 'MrSmellyPants';
        this.currentSpeed = new URLSearchParams(window.location.search).get('speed') || '0.1';

        ///////
        this.init();
        this.createEnvironment();
        this.createPig();
        this.createFood();
        this.setupEventListeners();
        this.animate();
        ///////

        this.createPortals(this.scene);

        let elem = document.getElementById('controls');
        if (elem) {
            setTimeout(() => {
                elem.style.display = 'none';
            }, 3000);
        }

    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('root').appendChild(this.renderer.domElement);

        // Set up camera
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 5);
        this.scene.add(directionalLight);
    }

    createEnvironment() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(100, 10000);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7cba3d,
            roughness: 0.8,
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -0.5;
        this.scene.add(this.ground);

        // Add barns periodically
        // for (let z = -100; z > -900; z -= 100) {
        //     this.createBarn(15 * (Math.random() - 0.5), z);
        // }
    }

    createPig() {
        // Simple pig representation (will be replaced with a proper model)
        const pigGeometry = new THREE.BoxGeometry(1, 1, 2);
        const pigMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
        let pig = createPig();
        this.pig = pig.group;
        this.pig.position.set(0, 0, 0);
        this.scene.add(this.pig);

        this.legs = pig.legs;

        //console.log("pig", pig);

    }

    createFood() {
        this.foodItems = [];
        this.foodScores = [];
        // Place food items along the path
        for (let z = -20; z > -900; z -= 20) {
            let xpos = Math.random() * 20 - 10;

            const foodGeometry = new THREE.SphereGeometry(0.5);
            const foodMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            let food = new THREE.Mesh(foodGeometry, foodMaterial);

            let foodType = Math.round(Math.random() * 100) % 3;
            if (foodType === 0) {
                food = createCarrot();
            } else if (foodType === 1) {
                food = createTurnip();
            } else {
                food = createCabbage();
            }

            food.position.set(xpos, 0, z);
            this.scene.add(food);
            this.foodItems.push(food);
            this.foodScores.push({
                food: food,
                score: Math.round(10 + Math.abs(xpos)),
                isWitch: Math.random() > 0.8,
                isBad: Math.round(Math.random() * 100) % 6 === 0
            });
        }
        //console.log("foodScores", this.foodScores);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            console.log("keydown", e.key);
            switch (e.key) {
                case 'ArrowLeft':
                    if (this.pig.position.x > -15) {
                        this.pig.position.x -= 0.5;
                        this.camera.position.x -= 0.5;
                        this.camera.lookAt(this.pig.position);
                    }
                    break;
                case 'ArrowRight':
                    if (this.pig.position.x < 15) {
                        this.pig.position.x += 0.5;
                        this.camera.position.x += 0.5;
                        this.camera.lookAt(this.pig.position);
                    }
                    break;
                case 'ArrowUp':
                    this.pig.position.y += 0.5;
                    break;
                case 'ArrowDown':
                    //console.log("arrow down", this.pig.position.y);
                    if (this.pig.position.y > 0) {
                        this.pig.position.y -= 0.5;
                    }
                    break;
                case 'p':
                    this.paused = !this.paused;
                    break;
                case 'q':
                    this.gameover();
                    break;
                case ' ':
                    this.pig.position.y += 0.5;
                    break;
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    showGameMessage(message) {
        let gameMessageElement = document.getElementById('game-message');
        if (gameMessageElement) {
            gameMessageElement.textContent = message;
            gameMessageElement.style.display = 'block';
        }
        setTimeout(() => {
            gameMessageElement.style.display = 'none';
        }, 3000);
    }

    checkCollisions() {
        this.foodItems.forEach((food, index) => {
            if (food.visible &&
                Math.abs(this.pig.position.x - food.position.x) < 1 &&
                Math.abs(this.pig.position.z - food.position.z) < 1) {
                food.visible = false;
                this.score += this.foodScores[index].score;
                console.log("score", this.score);

                if (this.foodScores[index].isBad) {
                    this.showGameMessage("That was bad food! You vomited and lost 60% of your score!");
                    this.score = Math.round(this.score * 0.4 );
                } else if (this.foodScores[index].isWitch) {
                    this.showGameMessage("A witch caught you! You lost 50% of your score!");
                    this.score -= Math.round(this.score / 2);
                }

                let scoreElement = document.getElementById('score-value');
                if (scoreElement) {
                    scoreElement.textContent = this.score;
                }
            }
        });
    }

    animateLegs(time) {
        const legAnimation = time * 0.02;
        this.legs.fl.rotation.x = Math.sin(legAnimation) * 0.3;
        this.legs.fr.rotation.x = -Math.sin(legAnimation) * 0.3;
        this.legs.bl.rotation.x = -Math.sin(legAnimation) * 0.3;
        this.legs.br.rotation.x = Math.sin(legAnimation) * 0.3;
    }

    gameover() {
        this.isGameOver = true;
        let finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            finalScoreElement.textContent = this.score;
        }
        let scoreElement = document.getElementById('game-over-screen');
        if (scoreElement) {
            scoreElement.style.display = 'block';
        }
    }
    animate() {
        if (!this.isGameOver && !this.paused) {
            requestAnimationFrame(this.animate.bind(this));

            // Move pig forward
            this.pig.position.z -= this.speed;

            // Update camera position to follow pig
            this.camera.position.z = this.pig.position.z + 10;
            this.camera.position.y = 5;
            this.camera.lookAt(this.pig.position);

            this.checkCollisions();

            let time = performance.now();
            this.animateLegs(time);

            // Check if game is complete
            if (this.pig.position.z < -900) {
                this.gameover();
            } else {
                this.checkStartPortal();
                this.checkExitPortal();
            }

            this.renderer.render(this.scene, this.camera);
        }
    }

    createStartPortal(scene) {

        if (new URLSearchParams(window.location.search).get('portal')) {
            // <create start portal>
            // Create portal group to contain all portal elements
            const startPortalGroup = new THREE.Group();
            startPortalGroup.position.set(SPAWN_POINT_X, SPAWN_POINT_Y, SPAWN_POINT_Z);
            startPortalGroup.rotation.x = 0.35;
            startPortalGroup.rotation.y = 0;

            // Create portal effect
            const startPortalGeometry = new THREE.TorusGeometry(15, 2, 16, 100);
            const startPortalMaterial = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                transparent: true,
                opacity: 0.8
            });
            const startPortal = new THREE.Mesh(startPortalGeometry, startPortalMaterial);
            startPortalGroup.add(startPortal);

            // Create portal inner surface
            const startPortalInnerGeometry = new THREE.CircleGeometry(13, 32);
            const startPortalInnerMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const startPortalInner = new THREE.Mesh(startPortalInnerGeometry, startPortalInnerMaterial);
            startPortalGroup.add(startPortalInner);

            // Create particle system for portal effect
            const startPortalParticleCount = 1000;
            const startPortalParticles = new THREE.BufferGeometry();
            const startPortalPositions = new Float32Array(startPortalParticleCount * 3);
            const startPortalColors = new Float32Array(startPortalParticleCount * 3);

            for (let i = 0; i < startPortalParticleCount * 3; i += 3) {
                // Create particles in a ring around the portal
                const angle = Math.random() * Math.PI * 2;
                const radius = 15 + (Math.random() - 0.5) * 4;
                startPortalPositions[i] = Math.cos(angle) * radius;
                startPortalPositions[i + 1] = Math.sin(angle) * radius;
                startPortalPositions[i + 2] = (Math.random() - 0.5) * 4;

                // Red color with slight variation
                startPortalColors[i] = 0.8 + Math.random() * 0.2;
                startPortalColors[i + 1] = 0;
                startPortalColors[i + 2] = 0;
            }

            startPortalParticles.setAttribute('position', new THREE.BufferAttribute(startPortalPositions, 3));
            startPortalParticles.setAttribute('color', new THREE.BufferAttribute(startPortalColors, 3));

            const startPortalParticleMaterial = new THREE.PointsMaterial({
                size: 0.2,
                vertexColors: true,
                transparent: true,
                opacity: 0.6
            });

            const startPortalParticleSystem = new THREE.Points(startPortalParticles, startPortalParticleMaterial);
            startPortalGroup.add(startPortalParticleSystem);

            // Add portal group to scene
            scene.add(startPortalGroup);

            // Create portal collision box
            this.startPortalBox = new THREE.Box3().setFromObject(startPortalGroup);

            // Animate particles and portal and check for collision
            function animateStartPortal() {
                const positions = startPortalParticles.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] += 0.05 * Math.sin(Date.now() * 0.001 + i);
                }
                startPortalParticles.attributes.position.needsUpdate = true;
                // Update portal shader time
                if (startPortalInnerMaterial.uniforms && startPortalInnerMaterial.uniforms.time) {
                    startPortalInnerMaterial.uniforms.time.value = Date.now() * 0.001;
                }

                requestAnimationFrame(animateStartPortal);
            }
            animateStartPortal();
            // </create start portal>
        }
    }

    createExitPortal(scene) {

        // <create exit portal>
        // Create portal group to contain all portal elements
        const exitPortalGroup = new THREE.Group();
        exitPortalGroup.position.set(-20, 20, -300);
        exitPortalGroup.rotation.x = 0.35;
        exitPortalGroup.rotation.y = 0;

        // Create portal effect
        const exitPortalGeometry = new THREE.TorusGeometry(15, 2, 16, 100);
        const exitPortalMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        const exitPortal = new THREE.Mesh(exitPortalGeometry, exitPortalMaterial);
        exitPortalGroup.add(exitPortal);

        // Create portal inner surface
        const exitPortalInnerGeometry = new THREE.CircleGeometry(13, 32);
        const exitPortalInnerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const exitPortalInner = new THREE.Mesh(exitPortalInnerGeometry, exitPortalInnerMaterial);
        exitPortalGroup.add(exitPortalInner);

        // Add portal label
        const loader = new THREE.TextureLoader();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512; // Increased width
        canvas.height = 64;
        context.fillStyle = '#00ff00';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText('VIBEVERSE PORTAL', canvas.width / 2, canvas.height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        const labelGeometry = new THREE.PlaneGeometry(30, 5); // Increased width
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.y = 20;
        exitPortalGroup.add(label);

        // Create particle system for portal effect
        const exitPortalParticleCount = 1000;
        const exitPortalParticles = new THREE.BufferGeometry();
        const exitPortalPositions = new Float32Array(exitPortalParticleCount * 3);
        const exitPortalColors = new Float32Array(exitPortalParticleCount * 3);

        for (let i = 0; i < exitPortalParticleCount * 3; i += 3) {
            // Create particles in a ring around the portal
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + (Math.random() - 0.5) * 4;
            exitPortalPositions[i] = Math.cos(angle) * radius;
            exitPortalPositions[i + 1] = Math.sin(angle) * radius;
            exitPortalPositions[i + 2] = (Math.random() - 0.5) * 4;

            // Green color with slight variation
            exitPortalColors[i] = 0;
            exitPortalColors[i + 1] = 0.8 + Math.random() * 0.2;
            exitPortalColors[i + 2] = 0;
        }

        exitPortalParticles.setAttribute('position', new THREE.BufferAttribute(exitPortalPositions, 3));
        exitPortalParticles.setAttribute('color', new THREE.BufferAttribute(exitPortalColors, 3));

        const exitPortalParticleMaterial = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        const exitPortalParticleSystem = new THREE.Points(exitPortalParticles, exitPortalParticleMaterial);
        exitPortalGroup.add(exitPortalParticleSystem);

        // Add full portal group to scene
        scene.add(exitPortalGroup);

        // Create portal collision box
        this.exitPortalBox = new THREE.Box3().setFromObject(exitPortalGroup);

        // Animate particles and portal and check for collision
        function animateExitPortal() {
            const positions = exitPortalParticles.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.05 * Math.sin(Date.now() * 0.001 + i);
            }
            exitPortalParticles.attributes.position.needsUpdate = true;
            // Update portal shader time
            if (exitPortalInnerMaterial.uniforms && exitPortalInnerMaterial.uniforms.time) {
                exitPortalInnerMaterial.uniforms.time.value = Date.now() * 0.001;
            }

            requestAnimationFrame(animateExitPortal);
        }
        animateExitPortal();
        // </create exit portal>

    }

    checkStartPortal() {


        // <put this in your animate function>
        if (new URLSearchParams(window.location.search).get('portal')) {
            // <check if player has entered start portal>
            setTimeout(function () {
                if (typeof this.pig !== 'undefined' && this.pig) {
                    const playerBox = new THREE.Box3().setFromObject(this.pig);
                    const portalDistance = playerBox.getCenter(new THREE.Vector3()).distanceTo(this.startPortalBox.getCenter(new THREE.Vector3()));
                    if (portalDistance < 50) {
                        // Get ref from URL params
                        const urlParams = new URLSearchParams(window.location.search);
                        const refUrl = urlParams.get('ref');
                        if (refUrl) {
                            // Add https if not present and include query params
                            let url = refUrl;
                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                url = 'https://' + url;
                            }
                            const currentParams = new URLSearchParams(window.location.search);
                            const newParams = new URLSearchParams();
                            for (const [key, value] of currentParams) {
                                if (key !== 'ref') { // Skip ref param since it's in the base URL
                                    newParams.append(key, value);
                                }
                            }
                            const paramString = newParams.toString();
                            window.location.href = url + (paramString ? '?' + paramString : '');
                        }
                    }
                }
            }, 5000);
            // </check if player has entered start portal>

        }
    }

    checkExitPortal() {

        // <check if player has entered exit portal>
        if (typeof this.pig !== 'undefined' && this.pig && this.exitPortalBox && this.exitPortalBox.visible) {
            const playerBox = new THREE.Box3().setFromObject(this.pig);
            // Check if player is within 50 units of the portal

            const portalDistance = playerBox.getCenter(new THREE.Vector3()).distanceTo(this.exitPortalBox.getCenter(new THREE.Vector3()));
            if (portalDistance < 50) {
                // Start loading the next page in the background
                const currentParams = new URLSearchParams(window.location.search);
                const newParams = new URLSearchParams();
                newParams.append('portal', "true");
                newParams.append('username', this.selfUsername);
                newParams.append('color', 'white');
                newParams.append('speed', this.currentSpeed);

                for (const [key, value] of currentParams) {
                    newParams.append(key, value);
                }
                const paramString = newParams.toString();
                const nextPage = 'https://portal.pieter.com' + (paramString ? '?' + paramString : '');

                // Create hidden iframe to preload next page
                if (!document.getElementById('preloadFrame')) {
                    const iframe = document.createElement('iframe');
                    iframe.id = 'preloadFrame';
                    iframe.style.display = 'none';
                    iframe.src = nextPage;
                    document.body.appendChild(iframe);
                }

                // Only redirect once actually in the portal
                if (playerBox.intersectsBox(this.exitPortalBox)) {
                    window.location.href = nextPage;
                }
            }
        }
        // </check if player has entered exit portal>
        // </put this in your animate function>
    }

    createPortals(scene) {

        this.createStartPortal(scene);

        this.createExitPortal(scene);
    }
}

// Start the game
new PiggyRun();