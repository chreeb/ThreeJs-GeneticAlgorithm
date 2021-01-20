/*
THREE.JS GENETIC ALGORITHM TEST
Code by _cheeb - @KeirClyne on Instagram - _chreeb on Twitter

HOW DOES IT WORK?:
  Each object is given its own DNA (an array of floats from 0-1). 
  
  This DNA can then be turned into an objects Phenotype (which converts these float values to usable values, such as the objects geometry and color) using the dnaToPhenotype() function.
  
  Each frame, a nested loop cycles each object against each other object. There is a random chance that any two objects will merge their DNA using the crossDna() function. In this function, the main object will replace it's dna using a combination of the main and the other object's dna. 
  
  During this time, there is a very small change that any part of the DNA might be a new random float value, this is a 'mutation' and is done to allow some potential variety to the 'offspring' of the two objects.
  
  This is a very simple version of a genetic algorithm but hopefully a good introduction to this style of algorithm.
*/

let scene,camera, renderer;
function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.01,
        5000
    );

    camera.position.z = 20;

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

window.addEventListener('resize', function (e) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
},false);

init();

// 1. LIGHTING
// --- 1A. Main Lighting
const mainLightIntensity = 0.5;
const mainLightColor1 = 0xFFFFFF;
const mainLightColor2 = 0xFFFFFF;
const mainLight = new THREE.HemisphereLight(mainLightColor1,mainLightColor2,mainLightIntensity);
scene.add(mainLight);
// --- 2A. Spot Lighting
const spotLightIntensity = 1;
const spotLightColor = 0xFFFFFF;
const spotLight = new THREE.SpotLight(spotLightColor,spotLightIntensity);
spotLight.position.set(0,0,10);
spotLight.target.position.set(0,0,0);
scene.add(spotLight);


// 2. OBJECTS
let objectArr = [];

class object {
    constructor(alt,x,y) {
        this.position = new THREE.Vector2(x,y);

        this.phenotype = {
            geo:0,
            red:0,
            green:0,
            blue:0,
            roughness:0,
            clearcoat:0,
        }

        this.dnaSize = Object.keys(this.phenotype).length;
        this.dna = [];
        for (let i = 0; i < this.dnaSize; i++) { this.dna.push(Math.random()); }

        this.dnaToPhenotype();

        this.cubeGeo = new THREE.BoxBufferGeometry(1.5,1.5,1.5);
        this.sphereGeo = new THREE.SphereBufferGeometry(1,5,5);
        this.tetroGeo = new THREE.TetrahedronBufferGeometry(1.2,0);

        this.mat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
        this.mesh = new THREE.Mesh(this.cubeGeo,this.mat);
        this.mesh.position.x = (this.position.x * 2.5) - alt;
        this.mesh.position.y = (this.position.y * 2.5) - alt;
        scene.add(this.mesh);
    }

    dnaToPhenotype() {
        // 1. Geoemtry (Cube, Sphere or Tetrahedron)
        if (this.dna[0] < 0.3) { this.phenotype.geo = "cube"; }
        else if (this.dna[0] < 0.6) { this.phenotype.geo = "sphere"; }
        else { this.phenotype.geo = "tetra"; }

        // 2. Color
        this.phenotype.red = this.dna[2];
        this.phenotype.green = this.dna[3];
        this.phenotype.blue = this.dna[4];

        // 3. Roughness
        this.phenotype.roughness = this.dna[5];

        // 4. Clearcoat
        this.phenotype.clearcoat = this.dna[6];
    }

    update() {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;

        if (this.phenotype.geo == "cube") { this.mesh.geometry = this.cubeGeo; }
        else if (this.phenotype.geo == "sphere") { this.mesh.geometry = this.sphereGeo; }
        else if (this.phenotype.geo == "tetra") { this.mesh.geometry = this.tetroGeo; }

        this.mesh.material.color.r = this.phenotype.red;
        this.mesh.material.color.g = this.phenotype.green;
        this.mesh.material.color.b = this.phenotype.blue;

        this.mesh.material.roughness = this.phenotype.roughness;
        this.mesh.material.clearcoat = this.phenotype.clearcoat;
    }

    crossDna(otherDna) {
        if (Math.random() < 0.005) {
            let newDna = [];
            for (let i = 0; i < this.dna.length; i++) {
                if (Math.random() < 0.5) { newDna.push(this.dna[i]) }
                else { newDna.push(otherDna[i]); }

                if (Math.random() < 0.001) { newDna[i] = Math.random() }
            }
            this.dna = newDna;
            this.dnaToPhenotype();
        }
    }
}

let numobjects = 6;
let alt = (5 * 2.5) / 2;
for (let y = 0; y < numobjects; y++) {
    for (let x = 0; x < numobjects; x++) {
        objectArr.push(new object(alt,x,y));
    }
}

animate();

function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < objectArr.length; i++) {
        for (let j = 0; j < objectArr.length; j++) {
            if (objectArr[i] == objectArr[j]) { continue; }
            else {
                objectArr[i].crossDna(objectArr[j].dna);
            }
        }
    }

    for (let i = 0; i < objectArr.length; i++) {
        objectArr[i].update();
    }

    renderer.render(scene,camera);
}
