import * as THREE from 'three';

export function createWitch() {
    const witchGroup = new THREE.Group();

    // Materials
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 }); // For robe
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x7D9B76 }); // Green skin
    const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 }); // For hat
    const broomMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown for broomstick
    const strawMaterial = new THREE.MeshStandardMaterial({ color: 0xDAA520 }); // Golden for straw

    // Robe (main body)
    const robeGeometry = new THREE.ConeGeometry(0.8, 2, 8);
    const robe = new THREE.Mesh(robeGeometry, blackMaterial);
    robe.position.y = 1;
    witchGroup.add(robe);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 2.3;
    witchGroup.add(head);

    // Witch Hat
    const hatBaseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const hatBase = new THREE.Mesh(hatBaseGeometry, hatMaterial);
    hatBase.position.y = 2.6;

    const hatTopGeometry = new THREE.ConeGeometry(0.4, 1, 16);
    const hatTop = new THREE.Mesh(hatTopGeometry, hatMaterial);
    hatTop.position.y = 3.2;

    witchGroup.add(hatBase, hatTop);

    // Nose
    const noseGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const nose = new THREE.Mesh(noseGeometry, skinMaterial);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 2.3, 0.4);
    witchGroup.add(nose);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);

    const leftArm = new THREE.Mesh(armGeometry, blackMaterial);
    leftArm.position.set(-0.8, 1.8, 0);
    leftArm.rotation.z = -Math.PI / 4;

    const rightArm = new THREE.Mesh(armGeometry, blackMaterial);
    rightArm.position.set(0.8, 1.8, 0);
    rightArm.rotation.z = Math.PI / 4;

    witchGroup.add(leftArm, rightArm);

    // Broomstick
    const broomGroup = new THREE.Group();

    const stickGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const stick = new THREE.Mesh(stickGeometry, broomMaterial);

    const strawBaseGeometry = new THREE.CylinderGeometry(0.15, 0.05, 0.6, 8);
    const strawBase = new THREE.Mesh(strawBaseGeometry, strawMaterial);
    strawBase.position.y = -1;

    // Add straw details
    for (let i = 0; i < 20; i++) {
        const strawGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.5, 4);
        const strawPiece = new THREE.Mesh(strawGeometry, strawMaterial);
        const angle = (i / 20) * Math.PI * 2;
        strawPiece.position.set(
            Math.cos(angle) * 0.15,
            -1.2,
            Math.sin(angle) * 0.15
        );
        strawPiece.rotation.x = Math.PI / 6;
        strawPiece.rotation.z = angle;
        broomGroup.add(strawPiece);
    }

    broomGroup.add(stick, strawBase);
    broomGroup.rotation.z = Math.PI / 4;
    broomGroup.position.set(1, 1.5, 0);

    witchGroup.add(broomGroup);

    // Add cape
    const capeGeometry = new THREE.BufferGeometry();
    const capePoints = [];
    const capeWidth = 1;
    const capeHeight = 1.5;
    const segments = 10;

    for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
            const x = (j / segments - 0.5) * capeWidth;
            const y = -(i / segments) * capeHeight;
            const z = -0.2 - 0.1 * Math.sin((j / segments) * Math.PI);
            capePoints.push(x, y + 2, z);
        }
    }

    const indices = [];
    const rowVertices = segments + 1;
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const current = i * rowVertices + j;
            indices.push(
                current, current + 1, current + rowVertices,
                current + 1, current + rowVertices + 1, current + rowVertices
            );
        }
    }

    capeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(capePoints, 3));
    capeGeometry.setIndex(indices);
    capeGeometry.computeVertexNormals();

    const cape = new THREE.Mesh(capeGeometry, blackMaterial);
    witchGroup.add(cape);

    // Animation properties
    let time = 0;
    const flyHeight = 0.3;
    const flySpeed = 0.005;
    const rotationSpeed = 0.02;

    // Animation function
    witchGroup.animate = () => {
        time += 0.1;

        // Hovering motion
        witchGroup.position.y = Math.sin(time * flySpeed) * flyHeight;

        // Cape animation
        const positions = cape.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] = -0.2 - 0.1 * Math.sin((i / positions.length + time * 0.05) * Math.PI);
        }
        cape.geometry.attributes.position.needsUpdate = true;

        // Broom swaying
        broomGroup.rotation.z = Math.PI / 4 + Math.sin(time * 0.05) * 0.1;
    };

    // Enable shadows
    witchGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });

    return witchGroup;
}
