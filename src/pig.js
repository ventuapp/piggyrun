import * as THREE from 'three';

export function createPig() {
    const group = new THREE.Group();

    // Pig body
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.2, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#FFC0CB' });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.5, 0);
    body.castShadow = true;
    group.add(body);

    // Pig head
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: '#FFC0CB' });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.7, -0.6);
    head.castShadow = true;
    group.add(head);

    // Pig snout
    const snoutGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16);
    const snoutMaterial = new THREE.MeshStandardMaterial({ color: '#FFB6C1' });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(0, 0.6, -0.9);
    snout.rotation.x = Math.PI / 2;
    snout.castShadow = true;
    group.add(snout);

    // Nostrils
    const nostrilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const nostrilMaterial = new THREE.MeshStandardMaterial({ color: '#FF69B4' });

    const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    leftNostril.position.set(-0.07, 0.6, -1);
    leftNostril.castShadow = true;
    group.add(leftNostril);

    const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    rightNostril.position.set(0.07, 0.6, -1);
    rightNostril.castShadow = true;
    group.add(rightNostril);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: '#000000' });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.8, -0.75);
    leftEye.castShadow = true;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.8, -0.75);
    rightEye.castShadow = true;
    group.add(rightEye);

    // Ears
    const earGeometry = new THREE.CapsuleGeometry(0.1, 0.2, 8, 8);
    const earMaterial = new THREE.MeshStandardMaterial({ color: '#FFB6C1' });

    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.25, 0.9, -0.6);
    leftEar.rotation.z = -Math.PI / 4;
    leftEar.castShadow = true;
    group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.25, 0.9, -0.6);
    rightEar.rotation.z = Math.PI / 4;
    rightEar.castShadow = true;
    group.add(rightEar);

    // Create legs
    function createLeg(x, z) {
        const legGroup = new THREE.Group();

        const legGeometry = new THREE.CapsuleGeometry(0.08, 0.4, 8, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: '#FFC0CB' });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.castShadow = true;
        legGroup.add(leg);

        const footGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const footMaterial = new THREE.MeshStandardMaterial({ color: '#FFB6C1' });
        const foot = new THREE.Mesh(footGeometry, footMaterial);
        foot.position.y = -0.25;
        foot.castShadow = true;
        legGroup.add(foot);

        legGroup.position.set(x, 0.3, z);
        return legGroup;
    }

    // Add legs
    const frontLeftLeg = createLeg(-0.25, -0.2);
    const frontRightLeg = createLeg(0.25, -0.2);
    const backLeftLeg = createLeg(-0.25, 0.2);
    const backRightLeg = createLeg(0.25, 0.2);
    group.add(frontLeftLeg, frontRightLeg, backLeftLeg, backRightLeg);

    // Tail
    const tailGeometry = new THREE.CapsuleGeometry(0.05, 0.2, 8, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: '#FFB6C1' });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.6, 0.4);
    tail.rotation.z = Math.PI / 4;
    tail.castShadow = true;
    group.add(tail);

    // Animation function
    function animate(time) {
        const legAnimation = time * 0.002;
        frontLeftLeg.rotation.x = Math.sin(legAnimation) * 0.3;
        frontRightLeg.rotation.x = -Math.sin(legAnimation) * 0.3;
        backLeftLeg.rotation.x = -Math.sin(legAnimation) * 0.3;
        backRightLeg.rotation.x = Math.sin(legAnimation) * 0.3;
    }

    return { group, animate, legs: {fl: frontLeftLeg, fr: frontRightLeg, bl: backLeftLeg, br: backRightLeg} };
}