import * as THREE from  "https://cdn.skypack.dev/three@0.137";
import { RGBELoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
import { GLTFLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/GLTFLoader";
import { DRACOLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/DRACOLoader";
import { OrbitControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";
import GUI from 'lil-gui'
import { Clock, PerspectiveCamera } from "three";
import { roughness } from "three/examples/jsm/nodes/Nodes.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

const ringsScene = new THREE.Scene();
const ringsCamera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
ringsCamera.position.set(0, 0, 50);


// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
const sunLight = new THREE.DirectionalLight(0xffffff, 0);
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

// const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
// scene.add(ambientLight);





(async function () {
  try{
    //HDRI
    let pmrem = new THREE.PMREMGenerator(renderer);
    let envmapTexture = await new RGBELoader()
      .setDataType(THREE.FloatType)
      .loadAsync("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/cannon_1k.hdr");  // thanks to https://polyhaven.com/hdris !
    let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

    console.log('hdri downloaded')

    // Rings
    const ring1 = new THREE.Mesh(
      new THREE.RingGeometry(13.25, 13, 80, 1, 0),
      // new THREE.SphereGeometry(15, 70, 70),
      // new THREE.TorusGeometry(15,0.2, 3, 108),
      new THREE.MeshStandardMaterial({
        // color: new THREE.Color("#d2ff70").convertSRGBToLinear(),
        color: new THREE.Color("#d2ff70").convertSRGBToLinear().multiplyScalar(200),
        // roughness: 0.5,
        envMap,
        envMapIntensity: 10,
        side: THREE.DoubleSide,
        transparent: true,
        transmission: 0.9,
        thickness: 0.9,
        opacity: 0.8,
      })
    );
    // ring1.name = "ring";
    // ring1.sunOpacity = 0.35;
    // ring1.moonOpacity = 0.03;
    ring1.position.set(-2, 0, 0);

    ringsScene.add(ring1);
    // ring1.rotation.x = Math.PI * 1/2
    // ring1.rotation.z = Math.PI * 1/3
    // scene.add(ring1)

    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(16.5, 16, 80, 1, 0), 
      // new THREE.TorusGeometry(16.5,0.2, 3, 108),
      new THREE.MeshBasicMaterial({
        // color: new THREE.Color("#d2ff70").convertSRGBToLinear(),
        color: new THREE.Color("#d2ff70").convertSRGBToLinear().multiplyScalar(10),
        transparent: true,
        // envMap,
        // envMapIntensity: 10,
        side: THREE.DoubleSide,
        transmission: 0.9,
        thickness: 0.9,
        opacity: 0.8,
      })
    );
    ring2.name = "ring";
    ring2.position.set(-5, 0, 0);

    // ring2.sunOpacity = 0.35;
    // ring2.moonOpacity = 0.1;
    ringsScene.add(ring2);
    // ring2.rotation.y = Math.PI * 1/3
    // scene.add(ring2)

    const ring3 = new THREE.Mesh(
      new THREE.RingGeometry(19, 18.75, 80),
      // new THREE.TorusGeometry(20,0.2, 3, 108),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#d2ff70").convertSRGBToLinear().multiplyScalar(200),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
    );
    ring3.position.set(-7.5, 0, 0);
    ring3.name = "ring";
    // ring3.sunOpacity = 0.35;
    // ring3.moonOpacity = 0.03;
    ringsScene.add(ring3);
    
    // scene.add(ring3)
    console.log('ring added')


    // Texture
    let textures = {
      bump: await new THREE.TextureLoader().loadAsync('./earthbump_2.jpg'),
      map: await new THREE.TextureLoader().loadAsync('./earthmap.jpg'),
      spec: await new THREE.TextureLoader().loadAsync('./earthspec_2.jpg'),
      cloud: await new THREE.TextureLoader().loadAsync('./cloud.png'),
      ufoTrailMask: await new THREE.TextureLoader().loadAsync('./mask.png'),
    }

    console.log('texture added')

    
    // Continent
    const dLoader = ( await new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/').setDecoderConfig({type: 'js'}));
    let continent = ( await new GLTFLoader().setDRACOLoader(dLoader).loadAsync('./continent_highpoly_4.glb')).scene.children[0];
    console.log(continent)

    textures.bump.flipY = false;
    textures.spec.flipy = false;

    let continentMaterial = new THREE.MeshPhysicalMaterial({
      // roughnessMap: textures.spec,
      bumpMap: textures.bump,
      // roughnessScale: 10,
      bumpScale: 0.5,
      metalness: 0,
      roughness: 0.7,
      // color: new THREE.Color("#c1c1c1").convertSRGBToLinear(),
      envMap,
      envMapIntensity: 0.5,
      transmission: 1,
      thickness: 10,
    });

    continent.traverse((o) => {
      if (o.isMesh) o.material = continentMaterial;
      o.castShadow = false;

    })

    const continentScale = 20
    continent.scale.set(continentScale , continentScale, continentScale);
    continent.rotation.y -= Math.PI * 1.389;
    continent.rotation.x -= Math.PI * 0.01;



    scene.add(continent)
    // this.gltfLoader.setDRACOLoader(this.dLoader);
    // this.gltfLoader.load('./l_highpoly.glb', (glb) => {
    //   glb.scene.scale.set(0.2, 0.2, 0.2);
    //   this.earthmesh = glb.scene;
    //   glb.scene.traverse( o => {
    //     // o.geometry.center()
    //     // o.scale.set(0.25, 0.25, 0.25)
    //     // o.position.set(0, -0.5, 0)
    //     o.material = this.landMaterial
    //   })
    //   this.scene.add(this.earthmesh);
    // });

    // UFO
    let ufo = ( await new GLTFLoader().loadAsync('./element_1.glb')).scene.children[0];

    console.log('ufo added')


    let ufoMaterial = new THREE.MeshBasicMaterial()
    ufoMaterial.color.setHex( 0xdcfd7c )
    // ufoMaterial.color.setHex( 0x514918 )
    ufoMaterial.reflectivity = 0.5;
    // ufoMaterial.emissive = new THREE.Color("#dcfd7c").convertSRGBToLinear().multiplyScalar(1)
    // let ufoMaterial = new THREE.MeshPhysicalMaterial({
    //   // envMap: this.hoge,
    //   roughness: 0.7,
    //   metalness: 0,
    //   // color: new THREE.Color("#c1c1c1").convertSRGBToLinear(),
    //   envMap,
    //   envMapIntensity: 1,
    //   transmission: 1,
    //   thickness: 0.5,
    //   refractionRatio: 0.98,
    //   ior: 2.33
    //   // color: "green"
    // });


    ufo.traverse((o) => {
      if (o.isMesh) o.material = ufoMaterial;
    })

    let ufosData = [
      // North => Plus South => Minus East => Plus West => Minus
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 0.0405, -51.0561), // Brazil 1
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, -2.5307, -44.2989), // Brazil 2
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 30.8406, -115.2838), // Baja California
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 31.6904, -106.4245), // North America 1
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 39.1031, -84.512), // North America 2
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 64.961, -21.9408), // North America
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 51.3755, -4.1427), // UK
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 41.6488, -0.8891), // Spain 1,
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 37.3891, -5.9845), // Spain 2
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 41.3275, 19.8187 ), // Albania
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 50.4504, 30.5245 ), // Ukraine
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 41.0082, 28.9784 ), // Turkey1
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 39.9334, 32.8597 ), // Turkey2
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 31.0461, 34.8516 ), // Israel
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 21.5292, 39.1611 ), // Saudi Arabia 1
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 26.0667, 50.5577 ), // Bahrain
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 14.4974, -14.4524 ), // Snegal
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 9.082, 8.6753 ), // Nigeria
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, -30.5595, 22.9375 ), // South Africa
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, -22.3285, 24.6849), // Botswana
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 28.6139 , 77.2088 ), // India 1
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 21.1458, 79.0882 ), // India 2
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 12.2529, 109.1899), // Vietnam
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 24.8104, 113.5972 ), // Shaoguan China
      makeUFO(ufo, textures.ufoTrailMask, envMap, scene, 39.9042, 116.4074 ), // Haidian, Beijing, China

    ]

    // Earth
    let earth = new THREE.Mesh(
      new THREE.SphereGeometry(10, 70, 70),
      new THREE.MeshPhysicalMaterial({
        // map: textures.map,
        // roughnessMap: textures.spec,
        // bumpMap: textures.bump,
        // bumpScale: 0.05,
        color: new THREE.Color("#006B6D").convertSRGBToLinear(),
        envMap,
        envMapIntensity: 0.8,
        sheen: 0.5,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color("#183144").convertSRGBToLinear(),
        clearcoat: 1,
        transparent: true,
        opacity: 0.1
      }),
    );

    earth.rotation.y += Math.PI * 1.4;
    earth.receiveShadow = true;
    scene.add(earth);

    //Cloud
    let cloud = new THREE.Mesh(
      new THREE.SphereGeometry(10.2, 70, 70),
      new THREE.MeshPhysicalMaterial({
          map: textures.cloud,
          envMap,
          envMapIntensity: 0.6,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false // Often helpful with transparency issues
      })
    )
    // scene.add(cloud)
// 
    // Animation
    let clock = new Clock();

    renderer.setAnimationLoop(() => {

      let delta = clock.getDelta();

      // Earth Animation
      earth.rotation.y += delta * 0.05;

      continent.rotation.y += delta * 0.03;

      // Cloud Animation
      cloud.rotation.y -= delta * 0.015;

      // Ring1 animation
      // ring1.rotation.y += delta * 0.2

      // UFO Animation
      ufosData.forEach((ufoData) => {
        let ufo = ufoData.group;

        ufo.position.set(0, 0, 0);
        ufo.rotation.set(0, 0, 0);
        ufo.updateMatrixWorld();

        ufoData.lngRot += delta * 0.03;
        ufo.rotateOnAxis(new THREE.Vector3(0, 0, 1), ufoData.latRot); // Latitude Rotation
        ufo.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), ufoData.lngRot); // Longtitude Rotation
        ufo.rotateOnAxis(new THREE.Vector3(0, 1, 0), -20*ufoData.lngRot); // ufo rotation
        ufo.translateY(ufoData.yOff);
      });

      controls.update();
      renderer.render(scene, camera);

      // renderer.autoClear = false;
      // renderer.render(ringsScene, ringsCamera)
      // renderer.autoClear = true;
    });
} catch(err){
  console.log(err)
}
})();

function makeUFO(ufoMesh, trailTexture, envMap, scene, lat, lng) {
  // lat: Latitude North => Plus South => Minus Lookup "city name coordinates" on google
  // lng: Langitude East => Plus West => Minus

  let ufo = ufoMesh.clone();
  ufo.scale.set(2.1, 2, 2.1);
  // ufo.scale.set(1,1,1);
  ufo.position.set(0,0,0);
  ufo.rotation.set(0,0,0);
  ufo.updateMatrixWorld();

  ufo.traverse((object) => {
    if(object instanceof THREE.Mesh) {
      object.material.envMap = envMap;
      // object.castShadow = true;
      // object.receiveShadow = true;
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
    rot: 0,
    rad: Math.random() * Math.PI * 0.45 + 0.5,
    yOff: 10.3 + Math.random() * 0.5,
    // yOff: 10.5,
    // latitudeAxis: new THREE.Vector3(0,0,1), // Latitude Z
    latRot: -lat / 90 * Math.PI/2 + Math.PI/2,
    lngRot: Math.PI * lng / 180 + Math.PI / 3 + 0.2 ,
    // rotSpeed : Math.random() + 0.5 
    // randomAxis: new THREE.Vector3 (nr(), nr(), nr()).normalize(),
    // randomAxisRot: Math.random() * Math.PI * 2,
    // randomAxisRot: 0,
  };

}

function nr (){
  return Math.random() * 2 - 1;
}
