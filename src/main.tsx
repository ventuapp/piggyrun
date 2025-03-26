import * as THREE from 'three';

import { createPig } from './pig';
import { createCarrot, createTurnip, createCabbage } from './food';
import { createWitch } from './witch';

const SPAWN_POINT_X = 30;
const SPAWN_POINT_Y = 20;
const SPAWN_POINT_Z = -400;

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
        this.introPlayed = false;
        this.selfUsername = new URLSearchParams(window.location.search).get('username') || 'Choose a Username';
        this.currentSpeed = new URLSearchParams(window.location.search).get('speed') || '0.1';
        this.colour = new URLSearchParams(window.location.search).get('color') || 'white';
        this.pigdata = null;
        this.user_uid = null;
        this.geoData = null;
        this.hitWitch = false;
        this.hitBadFood = false;
        // extra params
       this.avatar_url = new URLSearchParams(window.location.search).get('avatar_url') || '';
       this.team = new URLSearchParams(window.location.search).get('team') || '';
       this.speed_x = new URLSearchParams(window.location.search).get('speed_x') || '0.1';
       this.speed_y = new URLSearchParams(window.location.search).get('speed_y') || '0.1';
       this.speed_z = new URLSearchParams(window.location.search).get('speed_z') || '0.1';
       this.rotation_x = new URLSearchParams(window.location.search).get('rotation_x') || '0';
       this.rotation_y = new URLSearchParams(window.location.search).get('rotation_y') || '0';
       this.rotation_z = new URLSearchParams(window.location.search).get('rotation_z') || '0';

        // Add touch handling properties
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50; // Minimum pixel distance for a swipe

        // Add tap handling properties
        this.tapTimeout = 200; // Maximum ms for a tap
        this.tapStartTime = 0;
        this.hasMoved = false;
        this.screenCenterX = window.innerWidth / 2;
        this.screenCenterY = window.innerHeight / 2;

        // Add mouse handling properties
        this.isMouseDown = false;
        this.mouseStartX = 0;
        this.mouseStartY = 0;

        // Add GeoIP request
        this.fetchGeoIP().then(geoData => {
            this.geoData = geoData;
            console.log('GeoIP data:', geoData);
        }).catch(error => {
            console.warn('Failed to fetch GeoIP data:', error);
        });

        ///////
        this.init();
        this.createEnvironment();
        this.createPig();
        this.createFood();
        this.createWitch();
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

        let pigdata = localStorage.getItem('piggyrun_data');
        if (pigdata) {
            this.pigdata = JSON.parse(pigdata);
        } else {
            let uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            this.pigdata = {
                uid: uid,
                score: 0,
                colour: this.colour,
                avatar_url: this.avatar_url,
                team: this.team,

            };
            localStorage.setItem('piggyrun_data', JSON.stringify(this.pigdata));
        }

        this.user_uid = this.pigdata.uid;

        if (this.isMobileDevice()) {
            this.addMobileControlsOverlay();
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
                isWitch: z < -500 && Math.random() > 0.8,
                isBad: z < -500 && Math.round(Math.random() * 100) % 6 === 0
            });
        }
        //console.log("foodScores", this.foodScores);
    }

    createWitch() {
        const witch = createWitch();
        witch.position.set(30, 30, -50); // Adjust position as needed
        this.scene.add(witch);
        this.witch = witch;
        this.witch.visible = false;
    }

    playIntro() {
        if (!this.introPlayed) {
            var audio = new Audio('./audio/runpiggy.mp3');
            audio.play();
            this.introPlayed = true;
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            //console.log("keydown", e.key);

            this.playIntro();

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
                    this.animate();
                    break;
                case 'q':
                    this.gameover();
                    break;
                case ' ':
                    this.pig.position.y += 0.5;
                    break;
            }
        });

        // Update tap detection in touch handlers
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
            this.tapStartTime = Date.now();
            this.hasMoved = false;
        }, false);

        document.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
            this.hasMoved = true;
        }, false);

        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
            this.handlePossibleTap(e);
        }, false);

        // Add mouse event listeners
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e), false);
        document.addEventListener('click', (e) => this.handleClick(e), false);

        // Update screen center on resize
        window.addEventListener('resize', () => {
            this.screenCenterX = window.innerWidth / 2;
            this.screenCenterY = window.innerHeight / 2;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    handleTouchStart(event) {
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchEndX = touch.clientX; // Initialize end position
        this.touchEndY = touch.clientY;
    }

    handleTouchMove(event) {
        // Prevent scrolling while swiping
        event.preventDefault();

        const touch = event.touches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;

        // Calculate swipe distance
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        // Reduce movement multiplier from 0.01 to 0.005
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && this.pig.position.x < 15) {
                // Right swipe
                this.pig.position.x = Math.min(15, this.pig.position.x + (deltaX * 0.0005));
                this.camera.position.x = this.pig.position.x;
                this.camera.lookAt(this.pig.position);
            } else if (deltaX < 0 && this.pig.position.x > -15) {
                // Left swipe
                this.pig.position.x = Math.max(-15, this.pig.position.x + (deltaX * 0.0005));
                this.camera.position.x = this.pig.position.x;
                this.camera.lookAt(this.pig.position);
            }
        }
    }

    handleTouchEnd(event) {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const deltaTime = event.timeStamp - this.touchStartTime;

        // Check if it's a quick swipe
        const isQuickSwipe = deltaTime < 300;

        // Only process swipe if minimum distance is met
        if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
            this.playIntro(); // Play sound if it hasn't been played yet

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0 && this.pig.position.x < 15) {
                    // Right swipe - move right with momentum
                    this.addMomentum('right', isQuickSwipe);
                } else if (deltaX < 0 && this.pig.position.x > -15) {
                    // Left swipe - move left with momentum
                    this.addMomentum('left', isQuickSwipe);
                }
            } else {
                // Vertical swipe
                if (deltaY > 0 && this.pig.position.y > 0) {
                    // Down swipe
                    this.pig.position.y = Math.max(0, this.pig.position.y - 0.5);
                } else if (deltaY < 0) {
                    // Up swipe - jump
                    this.pig.position.y += 0.5;
                }
            }
        }
    }

    handlePossibleTap(event) {
        // Check if it was a tap (quick touch without movement)
        const touchDuration = Date.now() - this.tapStartTime;
        if (touchDuration < this.tapTimeout && !this.hasMoved) {
            const touch = event.changedTouches[0];
            this.handleTap(touch.clientX, touch.clientY);
        }
    }

    handleTap(x, y) {
        // Show visual feedback
        this.showTouchFeedback(x, y);

        // Calculate tap position relative to screen center
        const relativeX = x - this.screenCenterX;
        const relativeY = y - this.screenCenterY;

        // Determine which third of the screen was tapped
        const screenThirdX = window.innerWidth / 3;
        const screenThirdY = window.innerHeight / 3;

        // Movement amounts
        const horizontalMove = 0.005;
        const verticalMove = 0.005;

        // Handle horizontal movement
        if (x < screenThirdX) {
            // Left third of screen
            if (this.pig.position.x > -15) {
                this.addMomentum('left', true);
            }
        } else if (x > screenThirdX * 2) {
            // Right third of screen
            if (this.pig.position.x < 15) {
                this.addMomentum('right', true);
            }
        }

        // Handle vertical movement
        if (y < screenThirdY) {
            // Top third of screen - Jump
            this.pig.position.y += verticalMove;
        } else if (y > screenThirdY * 2 && this.pig.position.y > 0) {
            // Bottom third of screen - Move down
            this.pig.position.y = Math.max(0, this.pig.position.y - verticalMove);
        }

        // Show movement indicator
        this.showMovementIndicator(x, y);
    }

    showTouchFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        document.body.appendChild(feedback);

        // Animate and remove
        feedback.animate([
            { opacity: 0.5, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(2)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        }).onfinish = () => feedback.remove();
    }

    showMovementIndicator(x, y) {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            pointer-events: none;
            z-index: 1000;
            border: 2px solid white;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.6;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
        `;
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        document.body.appendChild(indicator);

        // Animate and remove
        indicator.animate([
            { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0.6 },
            { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 }
        ], {
            duration: 400,
            easing: 'ease-out'
        }).onfinish = () => indicator.remove();
    }

    showGameMessage(message) {
        let gameMessageElement = document.getElementById('game-message');
        if (!gameMessageElement) {
            gameMessageElement = document.createElement('div');
            gameMessageElement.id = 'game-message';
            gameMessageElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 18px;
                pointer-events: none;
                z-index: 1000;
                display: none;
            `;
            document.body.appendChild(gameMessageElement);
        }

        gameMessageElement.textContent = message;
        gameMessageElement.style.display = 'block';

        setTimeout(() => {
            gameMessageElement.style.display = 'none';
        }, 2000);
    }

    checkCollisions() {
        this.foodItems.forEach((food, index) => {
            if (food.visible &&
                Math.abs(this.pig.position.x - food.position.x) < 1 &&
                Math.abs(this.pig.position.z - food.position.z) < 1) {
                food.visible = false;
                this.score += this.foodScores[index].score;
                //console.log("score", this.score);

                if (this.foodScores[index].isBad && !this.hitBadFood) {
                    this.showGameMessage("That was bad food! You vomited and lost 60% of your score!");
                    this.hitBadFood = true;
                    this.score = Math.round(this.score * 0.4 );
                } else if (this.foodScores[index].isWitch && !this.hitWitch) {
                    this.showGameMessage("A witch caught you! You lost 50% of your score!");
                    this.hitWitch = true;
                    this.score -= Math.round(this.score / 2);
                    this.witch.position.set(food.position.x, food.position.y, food.position.z);
                    this.witch.visible = true;
                    this.paused = true;

                    setTimeout(() => {
                        this.paused = false;
                        this.witch.visible = false;
                        this.animate();
                    }, 5000);
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

        let formScoreElement = document.getElementById('form-score');
        if (formScoreElement) {
            formScoreElement.value = this.score;
        }

        let userUidElement = document.getElementById('user-uid');
        if (userUidElement) {
            userUidElement.value = this.user_uid;
        }

        let formGameNameElement = document.getElementById('username');
        if (formGameNameElement) {
            formGameNameElement.value = this.selfUsername;
        }

        // show the game over screen
        let scoreElement = document.getElementById('game-over-screen');
        if (scoreElement) {
            scoreElement.style.display = 'block';
        }

    }
    animate() {
        if (!this.isGameOver && !this.paused) {
            requestAnimationFrame(this.animate.bind(this));

            let time = performance.now();
            // Show/hide wings based on height
            if (this.pig.wings) {
                this.pig.wings.visible = this.pig.position.y > 0;
                this.pig.wings.animate(time);
            }

            // Move pig forward
            this.pig.position.z -= this.speed;

            // Update camera position to follow pig
            this.camera.position.z = this.pig.position.z + 10;
            this.camera.position.y = 5;
            this.camera.lookAt(this.pig.position);

            this.checkCollisions();

            // The animate function now handles both legs and wings
            this.animateLegs(time);

            // Animate witch
            if (this.witch) {
                this.witch.animate();
            }

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
        //  if (new URLSearchParams(window.location.search).get('portal') ) {
        if (1 > 0 ) {
            // <create start portal>
            // Create portal group to contain all portal elements
            const startPortalGroup = new THREE.Group();
            startPortalGroup.position.set(SPAWN_POINT_X, SPAWN_POINT_Y, SPAWN_POINT_Z);
            startPortalGroup.rotation.x = 0.35;
            startPortalGroup.rotation.y = 0;

            //console.log("startPortalGroup", startPortalGroup);

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
            //console.log("animateStartPortal");
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

        //console.log("exitPortalGroup", exitPortalGroup);

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
                newParams.append('color',this.colour);
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

    async fetchGeoIP() {
        try {
            const response = await fetch('https://geoip.pieter.com', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'omit' // Don't send cookies
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('GeoIP request failed:', error);
            return null;
        }
    }

    // Add helper method to check if device is mobile
    isMobileDevice() {
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0);
    }

    // Add mobile controls overlay (optional)
    addMobileControlsOverlay() {
        if (!this.isMobileDevice()) return;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            opacity: 0.3;
        `;

        // Add grid lines for visual reference (optional, can be removed in production)
        const gridColors = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'];
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.style.cssText = `
                border: 1px solid ${gridColors[i % 2]};
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255,255,255,0.3);
                font-size: 12px;
            `;
            overlay.appendChild(cell);
        }

        document.body.appendChild(overlay);

        // Fade out overlay after a few seconds
        setTimeout(() => {
            overlay.style.transition = 'opacity 1s';
            overlay.style.opacity = '0';
        }, 3000);
    }

    addMomentum(direction, isQuickSwipe) {
        // Reduce momentum distance
        const momentumDistance = isQuickSwipe ? 0.075 : 0.025; // Reduced from 1.5/0.5
        const momentumSteps = 10;
        let step = 0;

        const applyMomentum = () => {
            if (step < momentumSteps) {
                const movement = (momentumDistance * (momentumSteps - step)) / momentumSteps;

                if (direction === 'right' && this.pig.position.x < 15) {
                    this.pig.position.x = Math.min(15, this.pig.position.x + movement);
                    this.camera.position.x = this.pig.position.x;
                } else if (direction === 'left' && this.pig.position.x > -15) {
                    this.pig.position.x = Math.max(-15, this.pig.position.x - movement);
                    this.camera.position.x = this.pig.position.x;
                }

                this.camera.lookAt(this.pig.position);
                step++;
                requestAnimationFrame(applyMomentum);
            }
        };

        applyMomentum();
    }

    handleMouseDown(event) {
        this.isMouseDown = true;
        this.mouseStartX = event.clientX;
        this.mouseStartY = event.clientY;
    }

    handleMouseMove(event) {
        if (!this.isMouseDown) return;

        const deltaX = event.clientX - this.mouseStartX;
        const deltaY = event.clientY - this.mouseStartY;

        // Only handle drag if it's significant
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal movement
                if (deltaX > 0 && this.pig.position.x < 15) {
                    this.pig.position.x = Math.min(15, this.pig.position.x + (deltaX * 0.005));
                } else if (deltaX < 0 && this.pig.position.x > -15) {
                    this.pig.position.x = Math.max(-15, this.pig.position.x + (deltaX * 0.005));
                }
                this.camera.position.x = this.pig.position.x;
                this.camera.lookAt(this.pig.position);
            }
        }
    }

    handleMouseUp(event) {
        this.isMouseDown = false;
    }

    handleClick(event) {
        // Show visual feedback
        this.showClickFeedback(event.clientX, event.clientY);

        // Calculate which section of the screen was clicked
        const screenThirdX = window.innerWidth / 3;
        const screenThirdY = window.innerHeight / 3;
        const x = event.clientX;
        const y = event.clientY;

        // Movement amounts
        const horizontalMove = 0.5;
        const verticalMove = 0.5;

        // Handle horizontal movement
        if (x < screenThirdX) {
            // Left third of screen
            if (this.pig.position.x > -15) {
                this.pig.position.x = Math.max(-15, this.pig.position.x - horizontalMove);
                this.camera.position.x = this.pig.position.x;
            }
        } else if (x > screenThirdX * 2) {
            // Right third of screen
            if (this.pig.position.x < 15) {
                this.pig.position.x = Math.min(15, this.pig.position.x + horizontalMove);
                this.camera.position.x = this.pig.position.x;
            }
        }

        // Handle vertical movement
        if (y < screenThirdY) {
            // Top third of screen - Jump
            this.pig.position.y += verticalMove;
        } else if (y > screenThirdY * 2 && this.pig.position.y > 0) {
            // Bottom third of screen - Move down
            this.pig.position.y = Math.max(0, this.pig.position.y - verticalMove);
        }

        this.camera.lookAt(this.pig.position);
        this.showMovementIndicator(x, y);
    }

    showClickFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        document.body.appendChild(feedback);

        // Animate and remove
        feedback.animate([
            { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(2)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        }).onfinish = () => feedback.remove();
    }
}

// Start the game
new PiggyRun();