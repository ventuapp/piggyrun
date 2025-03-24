import * as THREE from 'three';

export function createCarrot() {
    const carrotGroup = new THREE.Group();

    // Carrot body (cone shape)
    const bodyGeometry = new THREE.ConeGeometry(0.3, 1.2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#FF6B00' });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI; // Point downward
    body.position.y = 0.6;
    carrotGroup.add(body);

    // Carrot top (green leaves)
    const leavesGroup = new THREE.Group();
    const leafGeometry = new THREE.ConeGeometry(0.1, 0.4, 4);
    const leafMaterial = new THREE.MeshStandardMaterial({ color: '#2D5A27' });

    // Create multiple leaves at different angles
    for (let i = 0; i < 6; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = 1.3;
        leaf.rotation.z = (i * Math.PI) / 3;
        leaf.rotation.x = Math.PI / 6;
        leavesGroup.add(leaf);
    }

    carrotGroup.add(leavesGroup);

    // Add some surface detail (optional rings)
    const ringGeometry = new THREE.TorusGeometry(0.25, 0.02, 8, 16);
    const ringMaterial = new THREE.MeshStandardMaterial({ color: '#E65C00' });

    // Add a few rings along the carrot body
    for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 0.3 + (i * 0.3);
        ring.rotation.x = Math.PI / 2;
        carrotGroup.add(ring);
    }

    // Make carrot cast shadows
    carrotGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });

    return carrotGroup;
}

export function createTurnip() {
    const turnipGroup = new THREE.Group();

    // Turnip bulb (main body)
    const bulbGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const bulbMaterial = new THREE.MeshStandardMaterial({
        color: '#F4F4F4',  // White with slight purple tint
        roughness: 0.7
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);

    // Make the bulb slightly elongated
    bulb.scale.y = 1.2;
    bulb.scale.z = 0.9;
    turnipGroup.add(bulb);

    // Purple top part
    const topGeometry = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 4);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: '#8B4513',  // Purple-ish top
        roughness: 0.6
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.3;
    turnipGroup.add(top);

    // Leaves
    const leavesGroup = new THREE.Group();
    const leafGeometry = new THREE.ConeGeometry(0.1, 0.5, 4);
    const leafMaterial = new THREE.MeshStandardMaterial({
        color: '#228B22',  // Forest green
        roughness: 0.8
    });

    // Create multiple leaves
    for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = 0.5;
        leaf.rotation.z = (i * Math.PI * 2) / 5;
        leaf.rotation.x = Math.PI / 6;
        leavesGroup.add(leaf);
    }

    // Add small stems
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: '#355E3B',  // Darker green
        roughness: 0.7
    });

    for (let i = 0; i < 3; i++) {
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.4;
        stem.rotation.x = Math.PI / 6;
        stem.rotation.z = (i * Math.PI * 2) / 3;
        leavesGroup.add(stem);
    }

    turnipGroup.add(leavesGroup);

    // Add root details at bottom
    const rootGeometry = new THREE.CylinderGeometry(0.05, 0.01, 0.3, 4);
    const rootMaterial = new THREE.MeshStandardMaterial({
        color: '#DEB887',  // Light brown
        roughness: 0.9
    });

    // Add a few small roots at the bottom
    for (let i = 0; i < 4; i++) {
        const root = new THREE.Mesh(rootGeometry, rootMaterial);
        root.position.y = -0.4;
        root.rotation.x = Math.PI / 4;
        root.rotation.z = (i * Math.PI * 2) / 4;
        turnipGroup.add(root);
    }

    // Enable shadows for all meshes
    turnipGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });

    return turnipGroup;
}

export function createCabbage() {
    const cabbageGroup = new THREE.Group();

    // Core sphere of the cabbage
    const coreGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const cabbageMaterial = new THREE.MeshStandardMaterial({
        color: '#90EE90',  // Light green
        roughness: 0.7
    });
    const core = new THREE.Mesh(coreGeometry, cabbageMaterial);
    cabbageGroup.add(core);

    // Create overlapping leaf layers
    const leafColors = [
        '#90EE90',  // Light green
        '#32CD32',  // Lime green
        '#228B22',  // Forest green
    ];

    // Create multiple layers of leaves
    for (let layer = 0; layer < 3; layer++) {
        const layerGroup = new THREE.Group();
        const radius = 0.4 + layer * 0.1;

        // Create leaves for this layer
        for (let i = 0; i < 8; i++) {
            const leafGeometry = new THREE.SphereGeometry(radius, 8, 8,
                i * Math.PI / 4, Math.PI / 2,
                Math.PI / 4, Math.PI / 2);

            const leafMaterial = new THREE.MeshStandardMaterial({
                color: leafColors[layer],
                roughness: 0.8,
                side: THREE.DoubleSide
            });

            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

            // Position and rotate the leaf
            leaf.rotation.y = (i * Math.PI / 4);
            leaf.rotation.x = Math.PI / 6 + (layer * Math.PI / 12);

            // Add some waviness to the leaves
            leaf.scale.z = 0.7;
            leaf.scale.y = 1.2;

            layerGroup.add(leaf);
        }

        // Rotate each layer slightly differently
        layerGroup.rotation.y = layer * Math.PI / 6;
        layerGroup.rotation.x = layer * Math.PI / 12;

        cabbageGroup.add(layerGroup);
    }

    // Add some texture details (veins) on the leaves
    const veinGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.3, 4);
    const veinMaterial = new THREE.MeshStandardMaterial({
        color: '#228B22',  // Darker green
        roughness: 0.9
    });

    // Add veins to outer leaves
    for (let i = 0; i < 12; i++) {
        const vein = new THREE.Mesh(veinGeometry, veinMaterial);
        vein.position.y = 0.2;
        vein.rotation.x = Math.PI / 3;
        vein.rotation.z = (i * Math.PI * 2) / 12;
        cabbageGroup.add(vein);
    }

    // Add bottom part (stem area)
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.2, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: '#90EE90',
        roughness: 0.8
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -0.3;
    cabbageGroup.add(stem);

    // Enable shadows for all meshes
    cabbageGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });

    // Slightly squash the overall cabbage to make it more realistic
    cabbageGroup.scale.y = 0.8;

    return cabbageGroup;
}




