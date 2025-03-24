import * as THREE from 'three';

export function createBarn(x, z) {
  const barnGroup = new THREE.Group();

  // Create solid walls (sides, back top portions)
  const solidWallShape = new THREE.Shape();
  // Left wall
  solidWallShape.moveTo(-2.5, -2);
  solidWallShape.lineTo(-0.75, -2);
  solidWallShape.lineTo(-0.75, 1);
  solidWallShape.lineTo(-2.5, 1);
  solidWallShape.lineTo(-2.5, 3);
  // Top section
  solidWallShape.lineTo(2.5, 3);
  solidWallShape.lineTo(2.5, 1);
  // Right wall
  solidWallShape.lineTo(0.75, 1);
  solidWallShape.lineTo(0.75, -2);
  solidWallShape.lineTo(2.5, -2);
  solidWallShape.lineTo(2.5, -2);
  solidWallShape.lineTo(-2.5, -2);

  const extrudeSettings = {
      steps: 1,
      depth: 4,
      bevelEnabled: false
  };

  // Solid walls
  const solidWallsGeometry = new THREE.ExtrudeGeometry(solidWallShape, extrudeSettings);
  const solidWallsMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      side: THREE.DoubleSide
  });
  const solidWalls = new THREE.Mesh(solidWallsGeometry, solidWallsMaterial);
  solidWalls.rotation.x = -Math.PI / 2;
  solidWalls.position.y = 3;

  // Transparent middle section
  const transparentWallGeometry = new THREE.BoxGeometry(1.5, 3, 4);
  const transparentWallMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
  });
  const transparentWall = new THREE.Mesh(transparentWallGeometry, transparentWallMaterial);
  transparentWall.position.set(0, 2.5, 0);

  // Barn roof
  const roofGeometry = new THREE.ConeGeometry(3.5, 2, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x4d2600 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 4;
  roof.rotation.y = Math.PI / 4;

  // Add door frames
  const doorFrame1 = this.createDoorFrame();
  doorFrame1.position.set(0, 1.5, 2);

  const doorFrame2 = this.createDoorFrame();
  doorFrame2.position.set(0, 1.5, -2);
  doorFrame2.rotation.y = Math.PI;

  barnGroup.add(solidWalls);
  barnGroup.add(transparentWall);
  barnGroup.add(roof);
  barnGroup.add(doorFrame1);
  barnGroup.add(doorFrame2);
  barnGroup.position.set(x, 0, z);

  this.scene.add(barnGroup);
}

// Helper function for door frames
export function createDoorFrame() {
  const frameGroup = new THREE.Group();

  const frameGeometry = new THREE.BoxGeometry(0.2, 3, 0.2);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4d2600 });

  const leftPost = new THREE.Mesh(frameGeometry, frameMaterial);
  leftPost.position.set(-0.75, 0, 0);
  const rightPost = new THREE.Mesh(frameGeometry, frameMaterial);
  rightPost.position.set(0.75, 0, 0);

  const topGeometry = new THREE.BoxGeometry(1.7, 0.2, 0.2);
  const top = new THREE.Mesh(topGeometry, frameMaterial);
  top.position.set(0, 1.5, 0);

  frameGroup.add(leftPost);
  frameGroup.add(rightPost);
  frameGroup.add(top);

  return frameGroup;
}
