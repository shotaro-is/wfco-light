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
  Raycaster
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

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;

// Load, Model, Animate
(async function () {
  // let envMap
  try{
    
    //HDRI
    const hdrLoader = new HDRJPGLoader(renderer);
    let envmapTexture = await hdrLoader.loadAsync('./cannon_1k.jpg')

    scene.environment = envmapTexture.renderTarget.texture
    scene.environment.mapping = EquirectangularReflectionMapping
    scene.environmentIntensity = 1;
    let envMap = envmapTexture.renderTarget.texture
    envMap.mapping = EquirectangularReflectionMapping

    // Texture
    let textures = {
      bump: await new TextureLoader().loadAsync('./earthbump-min.jpg'),
    }

    // Draco Loader
    const dLoader = ( await new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/').setDecoderConfig({type: 'js'}));
    
    // Continent
    let continent = ( await new GLTFLoader().setDRACOLoader(dLoader).loadAsync('./continent-draco.glb')).scene.children[0];

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
    })

    const continentScale = 20
    continent.scale.set(continentScale , continentScale, continentScale);
    continent.rotation.y -= Math.PI * 1.389;
    continent.rotation.x -= Math.PI * 0.01;

    continent.name = "continent"
    
    scene.add(continent)

    // Ocean
    let ocean = new Mesh(
      new SphereGeometry(10, 70, 70),
      new MeshPhysicalMaterial({
        color: new Color("#006B6D"),
        // envMap,
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
 

    // UFO
    let ufo = ( await new GLTFLoader().setDRACOLoader(dLoader).loadAsync('./element-5-draco.glb')).scene.children[0];
    // let ufo = ( await new GLTFLoader().loadAsync('./element_1.glb')).scene.children[0];

    // let ufoMaterial = new MeshPhysicalMaterial({
    //   roughness: 1,
    //   metalness: 1,
    //   color: new Color("#dcfd7c"),
    //   envMapIntensity: 1,
    // });


    // ufo.traverse((o) => {
    //   if (o.isMesh) o.material = new MeshPhysicalMaterial({
    //     roughness: 1,
    //     metalness: 1,
    //     color: new Color("#dcfd7c"),
    //     envMapIntensity: 1,
    //   });
    // })

    let ufosData = [
      // North => Plus South => Minus East => Plus West => Minus
      makeUFO(ufo, scene, 3, 0.0405, -51.0561), // Brazil 1
      makeUFO(ufo, scene, 2, -2.5307, -44.2989), // Brazil 2
      makeUFO(ufo, scene, 3, 30.8406, -115.2838), // Baja California
      makeUFO(ufo, scene, 2, 31.6904, -106.4245), // North America 1
      makeUFO(ufo, scene, 3, 39.1031, -84.512), // North America 2
      makeUFO(ufo, scene, 3, 64.961, -21.9408), // North America
      makeUFO(ufo, scene, 3, 51.3755, -4.1427), // UK
      makeUFO(ufo, scene, 3, 41.6488, -0.8891), // Spain 1,
      makeUFO(ufo, scene, 3, 37.3891, -5.9845), // Spain 2
      makeUFO(ufo, scene, 2, 41.3275, 19.8187 ), // Albania
      makeUFO(ufo, scene, 3, 50.4504, 30.5245 ), // Ukraine
      makeUFO(ufo, scene, 2, 41.0082, 28.9784 ), // Turkey1
      makeUFO(ufo, scene, 1, 39.9334, 32.8597 ), // Turkey2
      makeUFO(ufo, scene, 3, 31.0461, 34.8516 ), // Israel
      makeUFO(ufo, scene, 3, 21.5292, 39.1611 ), // Saudi Arabia 1
      makeUFO(ufo, scene, 2, 26.0667, 50.5577 ), // Bahrain
      makeUFO(ufo, scene, 3, 14.4974, -14.4524 ), // Snegal
      makeUFO(ufo, scene, 2, 9.082, 8.6753 ), // Nigeria
      makeUFO(ufo, scene, 3, -30.5595, 22.9375 ), // South Africa
      makeUFO(ufo, scene, 1, -22.3285, 24.6849), // Botswana
      makeUFO(ufo, scene, 3, 28.6139 , 77.2088 ), // India 1
      makeUFO(ufo, scene, 1, 21.1458, 79.0882 ), // India 2
      makeUFO(ufo, scene, 3, 12.2529, 109.1899), // Vietnam
      makeUFO(ufo, scene, 2, 24.8104, 113.5972 ), // Shaoguan China
      makeUFO(ufo, scene, 3, 39.9042, 116.4074 ), // Haidian, Beijing, China
    ]


    // Resize
    window.addEventListener( 'resize', resizeWindow );

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
        let ufo = ufoData.group;

        ufo.position.set(0, 0, 0);
        ufo.rotation.set(0, 0, 0);
        ufo.updateMatrixWorld();

        ufoData.lngRot += delta * 0.03;
        ufo.rotateOnAxis(new Vector3(0, 0, 1), ufoData.latRot); // Latitude Rotation
        ufo.rotateOnWorldAxis(new Vector3(0, 1, 0), ufoData.lngRot); // Longtitude Rotation
        ufo.rotateOnAxis(new Vector3(0, 1, 0), -20*ufoData.lngRot); // ufo rotation
        ufo.translateY(ufoData.yOff);
      });

      controls.update();
      renderer.render(scene, camera);

    });
} catch(err){
  console.log(err)
}
})();

function makeUFO(ufoMesh, scene, size, lat, lng) {
  // ufoMesh: the Mesh of ufo
  // Scene: Instance of THREE.scene()
  // Size: The size / importance / progress of each project, 3 sizes: 1, 2, 3
  // lat: Latitude North => Plus South => Minus Lookup "city name coordinates" on google
  // lng: Langitude East => Plus West => Minus

  // There are 3 sizes: 3, 2, 1
  let ufo = ufoMesh.clone();
  if (size == 3) {
    ufo.scale.set(5, 2, 5);
  } else if (size == 2){
    ufo.scale.set(3, 2, 3);
  } else if (size == 1){
    ufo.scale.set(1.8, 2, 1.8);
  } else console.log(`Undifined size of UFO for location {Latitude: ${lat}, longitude: ${lng}`)
  
  ufo.position.set(0,0,0);
  ufo.rotation.set(0,0,0);
  ufo.updateMatrixWorld();

  ufo.traverse((o) => {
    if (o.isMesh) {
      o.material = new MeshPhysicalMaterial({
      roughness: 1,
      metalness: 1,
      color: new Color("#dcfd7c"),
      envMapIntensity: 1,
      })
      
    // For reset color
    if (!o.material.userData) {
      o.material.userData = {};
    }
  
    // Store the color in userData
    o.material.userData.color = o.material.color.clone();
  };
  })

  let group = new Group();
  group.add(ufo);
  scene.add(group);

  return {
    group,
    rot: 0,
    rad: Math.random() * Math.PI * 0.45 + 0.5,
    yOff: 10.3 + Math.random() * 0.5,
    latRot: -lat / 90 * Math.PI/2 + Math.PI/2,
    lngRot: Math.PI * lng / 180 + Math.PI / 3 + 0.2 ,
  };

}

function nr (){
  return Math.random() * 2 - 1;
}

function resizeWindow() {

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( innerWidth, innerHeight );

}

function onPointerMove(event) {

	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(pointer, camera);
  
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  // reset colors
  
  scene.traverse( function( object ) {
   
    if ( object.isMesh === true &&object.name != "continent" && object.name !="ocean"){
      object.material.color.copy( object.material.userData.color );
    }
  });
  

  if (intersects.length > 0) {

    const object =  intersects[0].object;
    
    object.traverse( function( obj ) {
    
    	if ( obj.isMesh === true && obj.name !="continent" && obj.name != "ocean") {
      
      	obj.material.color.set( 0x504921 );
      
      }
    
    } );

  }

}


