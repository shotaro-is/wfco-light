import * as THREE from  "https://cdn.skypack.dev/three@0.137";
import { RGBELoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
import { GLTFLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/GLTFLoader";
import { OrbitControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";
import GUI from 'lil-gui'
import { Clock, PerspectiveCamera } from "three";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

const ringsScene = new THREE.Scene();
const ringsCamera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
ringsCamera.position.set(0, 0, 50);


// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;


// Light 
const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.right = 10;
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);





(async function () {
  try{
  //HDRI
  let pmrem = new THREE.PMREMGenerator(renderer);
  let envmapTexture = await new RGBELoader()
    .setDataType(THREE.FloatType)
    .loadAsync("./alps_field_1k.hdr");  // thanks to https://polyhaven.com/hdris !
  let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

  console.log('hdri downloaded')

  // Rings
  const ring1 = new THREE.Mesh(
    new THREE.RingGeometry(15, 13.5, 80, 1, 0),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d2ff70").convertSRGBToLinear().multiplyScalar(200),
      roughness: 0.25,
      envMap,
      envMapIntensity: 1.8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    })
  );
  // ring1.name = "ring";
  // ring1.sunOpacity = 0.35;
  // ring1.moonOpacity = 0.03;
  // ring1.position.set(-3, 0, 0);

  ringsScene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(16.5, 15.75, 80, 1, 0), 
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#d2ff70").convertSRGBToLinear(),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })
  );
  ring2.name = "ring";
  ring2.position.set(2, 0, 0);

  // ring2.sunOpacity = 0.35;
  // ring2.moonOpacity = 0.1;
  ringsScene.add(ring2);

  const ring3 = new THREE.Mesh(
    new THREE.RingGeometry(18, 17.75, 80),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#d2ff70").convertSRGBToLinear().multiplyScalar(50),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })
  );
  ring3.position.set(3, 0, 0);
  ring3.name = "ring";
  // ring3.sunOpacity = 0.35;
  // ring3.moonOpacity = 0.03;
  ringsScene.add(ring3);

  console.log('ring added')


  // Texture
  let textures = {
    bump: await new THREE.TextureLoader().loadAsync('./earthbump.jpg'),
    map: await new THREE.TextureLoader().loadAsync('./earthmap.jpg'),
    spec: await new THREE.TextureLoader().loadAsync('./earthspec.jpg'),
    ufoTrailMask: await new THREE.TextureLoader().loadAsync('./mask.png'),
  }

  console.log('texture added')

  // UFO
  let ufo = ( await new GLTFLoader().loadAsync('./element_1.glb')).scene.children[0];

  console.log('ufo added')


  // let ufoMaterial = new THREE.MeshStandardMaterial({color: 0x514a1d})
  let ufoMaterial = new THREE.MeshPhysicalMaterial({
    // envMap: this.hoge,
    roughness: 0.5,
    metalness: 0,
    // color: 0xFFEA00,
    transmission: 1,
    refractionRatio: 0.98,
    ior: 2.33
    // color: "green"
  });


  ufo.traverse((o) => {
    if (o.isMesh) o.material = ufoMaterial;
  })

  let ufosData = [
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
    makeUFO(ufo, textures.ufoTrailMask, envMap, scene),
  ]

  // Sphere
  let sphere = new THREE.Mesh(
    new THREE.SphereGeometry(10, 70, 70),
    new THREE.MeshPhysicalMaterial({
      map: textures.map,
      roughnessMap: textures.spec,
      bumpMap: textures.bump,
      bumpScale: 0.05,
      // envMap,
      // envMapIntensity: 0.6,
      // sheen: 0.5,
      // sheenRoughness: 0.5,
      // sheenColor: new THREE.Color("#d1ff6f").convertSRGBToLinear(),
      clearcoat: 1,
    }),
  );

  sphere.rotation.y += Math.PI * 1.4;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // Animation
  let clock = new Clock();

  renderer.setAnimationLoop(() => {

    let delta = clock.getDelta();

    ufosData.forEach((ufoData) => {
      let ufo = ufoData.group;

      ufo.position.set(0, 0, 0);
      ufo.rotation.set(0, 0, 0);
      ufo.updateMatrixWorld();

      ufoData.rot += delta * 0.25
      // ufoData.rot += delta * 0;
      ufo.rotateOnAxis(ufoData.randomAxis, ufoData.randomAxisRot);
      ufo.rotateOnAxis(new THREE.Vector3(0, 1, 0), ufoData.rot);
      ufo.rotateOnAxis(new THREE.Vector3(0, 0, 1), ufoData.rad);
      ufo.translateY(ufoData.yOff);
      ufo.rotateOnAxis(new THREE.Vector3(0, 1, 0), ufoData.rot*2);
    });

    controls.update();
    renderer.render(scene, camera);

    renderer.autoClear = false;
    renderer.render(ringsScene, ringsCamera)
    renderer.autoClear = true;
  });
} catch(err){
  console.log(err)
}
})();

function makeUFO(ufoMesh, trailTexture, envMap, scene) {
  let ufo = ufoMesh.clone();
  ufo.scale.set(4, 4, 4);
  ufo.position.set(0,0,0);
  ufo.rotation.set(0,0,0);
  ufo.updateMatrixWorld();

  ufo.traverse((object) => {
    if(object instanceof THREE.Mesh) {
      object.material.envMap = envMap;
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  let trail = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 2),
    new THREE.MeshPhysicalMaterial({
      envMap,
      envMapIntensity: 3,

      // roughness: 0.4,
      // metalness: 0,
      // transmission: 1,

      transparent: true,
      opacity: 1,
      alphaMap: trailTexture,
    })
  );

  // trail.rotateX(Math.PI);
  trail.translateY(1.1);

  let group = new THREE.Group();
  group.add(ufo);
  // group.add(trail);
  scene.add(group);

  return {
    group,
    rot: Math.random() * Math.PI * 2.0,
    rad: Math.random() * Math.PI * 0.45 + 0.2,
    yOff: 10.5 + Math.random() * 1.0,
    randomAxis: new THREE.Vector3 (nr(), nr(), nr()).normalize(),
    randomAxisRot: Math.random() * Math.PI * 2,
    // randomAxisRot: 0,
  };

}

function nr (){
  return Math.random() * 2 - 1;
}



// export default class Sketch {
//   constructor(options) {
//     this.scene = new THREE.Scene();

//     this.container = options.dom;
//     this.width = this.container.offsetWidth;
//     this.height = this.container.offsetHeight;
//     this.renderer = new THREE.WebGLRenderer();
//     this.renderer.setPixelRatio(window.devicePixelRatio);
//     this.renderer.setSize(this.width, this.height);
//     this.renderer.setClearColor(0xeeeeee, 1); 
//     // this.renderer.outputEncoding = THREE.sRGBEncoding;

//     this.container.appendChild(this.renderer.domElement);

//     this.camera = new THREE.PerspectiveCamera(
//       70,
//       window.innerWidth / window.innerHeight,
//       0.001,
//       1000
//     );

//     // var frustumSize = 10;
//     // var aspect = window.innerWidth / window.innerHeight;
//     // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
//     this.camera.position.set(0, 0, 2);
//     this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//     this.time = 0;

//     this.isPlaying = true;
    
//     this.addObjects();
//     this.resize();
//     this.render();
//     this.setupResize();
//     // this.settings();
//   }

//   settings() {
//     let that = this;
//     this.settings = {
//       progress: 0,
//     };
//     this.gui = new GUI();
//     this.gui.add(this.settings, "progress", 0, 1, 0.01);
//   }

//   setupResize() {
//     window.addEventListener("resize", this.resize.bind(this));
//   }

//   resize() {
//     this.width = this.container.offsetWidth;
//     this.height = this.container.offsetHeight;
//     this.renderer.setSize(this.width, this.height);
//     this.camera.aspect = this.width / this.height;
//     this.camera.updateProjectionMatrix();
//   }

//   addObjects() {
//     let that = this;
//     this.material = new THREE.ShaderMaterial({
//       extensions: {
//         derivatives: "#extension GL_OES_standard_derivatives : enable"
//       },
//       side: THREE.DoubleSide,
//       uniforms: {
//         time: { type: "f", value: 0 },
//         resolution: { type: "v4", value: new THREE.Vector4() },
//         uvRate1: {
//           value: new THREE.Vector2(1, 1)
//         }
//       },
//       // wireframe: true,
//       // transparent: true,
//       vertexShader: vertex,
//       fragmentShader: fragment
//     });

//     this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

//     this.plane = new THREE.Mesh(this.geometry, this.material);
//     this.scene.add(this.plane);
//   }

//   stop() {
//     this.isPlaying = false;
//   }

//   play() {
//     if(!this.isPlaying){
//       this.render()
//       this.isPlaying = true;
//     }
//   }

//   render() {
//     if (!this.isPlaying) return;
//     this.time += 0.05;
//     this.material.uniforms.time.value = this.time;
//     requestAnimationFrame(this.render.bind(this));
//     this.renderer.render(this.scene, this.camera);
//   }
// }

// new Sketch({
//   dom: document.getElementById('webgl')
// });