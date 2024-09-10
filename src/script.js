import {
  PCFSoftShadowMap,
  MeshPhysicalMaterial,
  TextureLoader,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Mesh,
  SphereGeometry,
  Clock,
  Vector2,
  Vector3,
  Group,
  EquirectangularReflectionMapping,
  ACESFilmicToneMapping,
  Raycaster,
  Box3,
  Box3Helper,
  InstancedMesh,
  Object3D,
  Matrix4
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HDRJPGLoader } from '@monogrid/gainmap-js';

let scene = new Scene();

let camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

// Renderer
let renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

// Raycaster
let pointer = new Vector2();
let raycaster = new Raycaster();
raycaster.far = 50;

// Bounding Box (Hit Box)
let ufosData = [];
let ufoInstancedMesh;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

// Load, Model, Animate
(async function () {
  try {
    // HDRI
    const hdrLoader = new HDRJPGLoader(renderer);
    let envmapTexture = await hdrLoader.loadAsync('./cannon_1k.jpg');
    scene.environment = envmapTexture.renderTarget.texture;
    scene.environment.mapping = EquirectangularReflectionMapping;
    scene.environmentIntensity = 1;

    // Texture
    let textures = {
      bump: await new TextureLoader().loadAsync('./earthbump-min.jpg'),
    };

    // Draco Loader
    const dLoader = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/').setDecoderConfig({ type: 'js' });

    // Continent
    let continent = (await new GLTFLoader().setDRACOLoader(dLoader).loadAsync('./continent-draco.glb')).scene.children[0];
    textures.bump.flipY = false;
    let continentMaterial = new MeshPhysicalMaterial({
      bumpMap: textures.bump,
      bumpScale: 10,
      roughness: 0.6,
      envMapIntensity: 1.3,
      transmission: 0.4,
      thickness: 0,
    });
    continent.traverse((o) => {
      if (o.isMesh) o.material = continentMaterial;
      o.castShadow = false;
    });
    continent.scale.set(20, 20, 20);
    continent.rotation.y -= Math.PI * 1.389;
    continent.rotation.x -= Math.PI * 0.01;
    continent.name = "continent";
    scene.add(continent);

    // Ocean
    let ocean = new Mesh(
      new SphereGeometry(10, 70, 70),
      new MeshPhysicalMaterial({
        color: new Color("#006B6D"),
        envMapIntensity: 3,
        roughness: 0,
        transparent: true,
        transmission: 1,
        opacity: 0.1
      }),
    );
    ocean.receiveShadow = true;
    ocean.name = "ocean";
    scene.add(ocean);

    // Load UFO model
    let ufoGLTF = await new GLTFLoader().setDRACOLoader(dLoader).loadAsync('./flower_pedal_1_draco.glb');
    console.log(ufoGLTF); // Log the structure of the loaded GLTF model

    // Traverse the scene to find the Mesh object
    let ufoMesh;
    ufoGLTF.scene.traverse((child) => {
      if (child.isMesh) {
        ufoMesh = child;
      }
    });

    if (ufoMesh) {
      let ufoGeometry = ufoMesh.geometry;
      let ufoMaterial = new MeshPhysicalMaterial({
        roughness: 1,
        metalness: 1,
        color: new Color("#dcfd7c"),
        envMapIntensity: 1,
      });

      // Create InstancedMesh
      const ufoCount = 200; // Number of UFOs
      ufoInstancedMesh = new InstancedMesh(ufoGeometry, ufoMaterial, ufoCount);
      scene.add(ufoInstancedMesh);

      // Initialize UFOs
      ufosData = [
        // North => Plus South => Minus East => Plus West => Minus
        { size: 3, lat: 0.0405, lng: -51.0561 }, // Brazil 1
        { size: 2, lat: -2.5307, lng: -44.2989 }, // Brazil 2
        { size: 3, lat: 30.8406, lng: -115.2838 }, // Baja California
        { size: 2, lat: 31.6904, lng: -106.4245 }, // North America 1
        { size: 3, lat: 39.1031, lng: -84.512 }, // North America 2
        { size: 3, lat: 64.961, lng: -21.9408 }, // North America
        { size: 3, lat: 51.3755, lng: -4.1427 }, // UK
        { size: 3, lat: 41.6488, lng: -0.8891 }, // Spain 1
        { size: 3, lat: 37.3891, lng: -5.9845 }, // Spain 2
        { size: 2, lat: 41.3275, lng: 19.8187 }, // Albania
        { size: 3, lat: 50.4504, lng: 30.5245 }, // Ukraine
        { size: 2, lat: 41.0082, lng: 28.9784 }, // Turkey1
        { size: 1, lat: 39.9334, lng: 32.8597 }, // Turkey2
        { size: 3, lat: 31.0461, lng: 34.8516 }, // Israel
        { size: 3, lat: 21.5292, lng: 39.1611 }, // Saudi Arabia 1
        { size: 2, lat: 26.0667, lng: 50.5577 }, // Bahrain
        { size: 3, lat: 14.4974, lng: -14.4524 }, // Senegal
        { size: 2, lat: 9.082, lng: 8.6753 }, // Nigeria
        { size: 3, lat: -30.5595, lng: 22.9375 }, // South Africa
        { size: 1, lat: -22.3285, lng: 24.6849 }, // Botswana
        { size: 3, lat: 28.6139, lng: 77.2088 }, // India 1
        { size: 1, lat: 21.1458, lng: 79.0882 }, // India 2
        { size: 3, lat: 12.2529, lng: 109.1899 }, // Vietnam
        { size: 2, lat: 24.8104, lng: 113.5972 }, // Shaoguan China
        { size: 3, lat: 39.9042, lng: 116.4074 }, // Haidian, Beijing, China

        // Add 170 random locations
        ...Array.from({ length: 170 }, () => ({
          size: Math.floor(Math.random() * 3) + 1, // Random size between 1 and 3
          lat: (Math.random() * 180 - 90).toFixed(4), // Random latitude between -90 and 90
          lng: (Math.random() * 360 - 180).toFixed(4) // Random longitude between -180 and 180
        }))
      ]

      ufosData.forEach((data, index) => {
        const ufoObject = new Object3D();
        data.rad = Math.random() * Math.PI * 0.45 + 0.5;
        data.yOff = 10.3 + Math.random() * 0.5;
        data.latRot = -data.lat / 90 * Math.PI / 2 + Math.PI / 2;
        data.lngRot = Math.PI * data.lng / 180 + Math.PI / 3 + 0.2;
        makeUFO(ufoObject, data.size, data.latRot, data.lngRot, data.yOff, data.rad);
        ufoObject.updateMatrix();
        ufoInstancedMesh.setMatrixAt(index, ufoObject.matrix);
        data.object = ufoObject;
        data.index = index;
      });
    } else {
      console.error("UFO model structure is not as expected.");
    }

    // Resize
    window.addEventListener('resize', resizeWindow);

    // Hover Event
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Animation
    let clock = new Clock();

    renderer.setAnimationLoop(() => {
      let delta = clock.getDelta();

      // Earth Animation
      continent.rotation.y += delta * 0.03;

      // UFO Animation
      ufosData.forEach((ufoData) => {
        const ufoObject = ufoData.object;
        ufoData.lngRot += delta * 0.03;
        makeUFO(ufoObject, ufoData.size, ufoData.latRot, ufoData.lngRot, ufoData.yOff, ufoData.rad);
        ufoObject.updateMatrix();
        ufoInstancedMesh.setMatrixAt(ufoData.index, ufoObject.matrix);
      });
      ufoInstancedMesh.instanceMatrix.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.log(err);
  }
})();

function makeUFO(object, size, latRot, lngRot, yOff, rad) {
  const scale = size === 3 ? 5 : size === 2 ? 3 : 1.8;
  object.scale.set(scale, scale, scale);
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.updateMatrixWorld();

  object.rotateOnAxis(new Vector3(0, 0, 1), latRot); // Latitude Rotation
  object.rotateOnWorldAxis(new Vector3(0, 1, 0), lngRot); // Longitude Rotation
  object.rotateOnAxis(new Vector3(0, 1, 0), -20 * lngRot); // UFO rotation
  object.translateY(yOff);
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // Adjust raycaster logic for InstancedMesh
  const intersects = raycaster.intersectObject(ufoInstancedMesh, true);
  if (intersects.length > 0) {
    const instanceId = intersects[0].instanceId;
    if (instanceId !== undefined) {
      console.log('Intersection detected with UFO instance', instanceId);
    }
  }
}

function resizeWindow() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// ... existing code ...