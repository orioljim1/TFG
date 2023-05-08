import { GUI } from './GUI.js'
import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
//import  *  as GLTFLoader from 'https://cdn.skypack.dev/pin/three@v0.149.0-eN5PpLTGoHq5IPENPwOt/mode=raw/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from './node_modules/three/examples/jsm/exporters/GLTFExporter.js';


import nose_vertices from './scripts/js/nose_test_5.json' assert { type: "json" };
import chin_vertices from './scripts/js/chin_vertices.json' assert { type: "json" };
import ears_vertices from './scripts/js/L_ear.json' assert { type: "json" };


class App{

    constructor(){

        this.test = "test";

        this.clock = new THREE.Clock();
        this.material = null;
        this.controls = null;
        this.stats = null;
        this.container = null;
        this.mixer= null;
        this.renderer= null;
        this.scene= null;
        this.camera = null;
        this.clone = null;
        this.clone2 = null;
        this.selection_state = null; // variables to manage the selection processs;
        this.selectedObject = null;
        this.hairs = [];
        this.skins = [];
        this.loaderGLB = new GLTFLoader();
        this.vertices = null;
        this.gui = new GUI(this);

    }

    init(){
        fetch("./scripts/js/Ears_2.json")
        .then(response => {
        return response.json();
        })
        .then(data => this.vertices = data);

        console.log(this.vertices);
        //this.container = document.getElementById( 'container' );
        this.container = document.getElementById("canvasarea");


        this.camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, .1, 1000 );
        this.camera.position.set( 0, 2,  5 );

        this.scene = new THREE.Scene();
           
        

        // lights
        // const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
        // this.scene.add( ambientLight );

        const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
        this.scene.add( this.camera );
        // this.camera.add( pointLight );

        
        let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
        this.scene.add( hemiLight );

        let dirLight = new THREE.DirectionalLight ( 0xffffff, 0.5 );
        dirLight.position.set( 3,5,3 );
        this.scene.add( dirLight );

        //ground & grid
        let ground = new THREE.Mesh( new THREE.PlaneGeometry( 300, 300 ), new THREE.MeshStandardMaterial( { color: 0x141414, depthWrite: true, roughness: 1, metalness: 0 } ) );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.name = "ground";
        this.scene.add( ground );
        const gridHelper = new THREE.GridHelper( 10, 20, 0xffffff, 0x444444 );
        this.scene.add( gridHelper );

        this.scene.background = new THREE.Color( 0xa0a0a0 );


        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.container.appendChild( this.renderer.domElement );
        this.renderer.setClearColor(0xbfe3dd);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = .001;
        this.controls.maxDistance = 8000;
        this.controls.target.set( 0, 2, 0 );
        this.controls.update();

        this.stats = new Stats();
        this.container.appendChild( this.stats.dom );

        window.addEventListener( 'resize', this.onWindowResize.bind(this) );


        let dict = {
            "Boss": 'boss_final.glb',
            "Jen": "jen_v2.glb",
            //"Cleo": "cleo.glb",
            //"Jack": "jack_eyes_tst.glb",
            "B2": 'boss_hair_2.glb',
            "cleo_body": "cleo_with_body.glb",
            "jack_body": "jack_with_body.glb",
            "jen_body": "jen_with_body.glb",
            "eden_body": "eden_with_body.glb",
            "sakura_body": "sakura_with_body.glb"
        }
        this.importAssets(dict);
        //this.render();
        //charactgersGUI(null);	
        setTimeout(this.swap_visibility, 2000); //2s as when models are imported depending on the pc it takes a little bit longer for them to be displayed on the screen
        this.selection_state = "base";
        this.animate();
        this.add_event();
    }


    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {

        requestAnimationFrame( this.animate.bind(this) );

        this.render();
        this.stats.update();

    }

    render() {

        const delta = this.clock.getDelta();

        if ( this.mixer !== undefined ) {

            //this.mixer.update( delta );

        }

        this.renderer.render( this.scene, this.camera );

    }

    areEqual( a1, a2){

         for (let index = 0; index < a1.length; index++) {
            if( a1[index] != a2[index]) return false	
        }

        return true; 
    }

    swap_visibility(){
        
        let c = document.getElementById('loading-screen');
        c.classList.toggle('hidden')
        //charactgersGUI(null);	
    }

    getPart(mesh, part){
        let face_idx = mesh.children.findIndex(obj => obj.name.includes(part));
        if(mesh.name.includes("Face")) return mesh
        else if (face_idx == -1){
            let head_idx =mesh.children.findIndex(obj => obj.name.includes("Head"));
            if (head_idx != -1) return this.getPart(mesh.children[head_idx],part);
            return this.getPart(mesh.children[0],part)
        }// body case
        //mesh.children[face_idx].morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[]}; //store each part which morphattribute it corresponds to 
        return mesh.children[face_idx]
    }

    //functio to adding a morph target into the existing blend
    addMorph(target ,vertices, code,type){

        let morph_idx = this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        let morph = this.scene.children[morph_idx];


        //fn to select face inside the head object 
        morph = this.getPart(morph,"Face");
        let face = morph;
        if (morph.morphPartsInfo == undefined ) morph.morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[]};


        let source_p = new THREE.Float32BufferAttribute( morph.geometry.attributes.position.array, 3 );
        let source_n = new THREE.Float32BufferAttribute( morph.geometry.attributes.normal.array, 3 );
        let target_p = new THREE.Float32BufferAttribute( target.geometry.attributes.position.array, 3 );
        let target_n = new THREE.Float32BufferAttribute( target.geometry.attributes.normal.array, 3 );

                
        let name = code + morph.morphPartsInfo[code].length;
        
        if(morph.morphTargetInfluences == undefined) this.initiaizeTargets(morph,name);
        else{ 
            morph.morphTargetDictionary[morph.morphTargetInfluences.length]= name;
            morph.morphTargetInfluences.push(0);
        }
        morph.morphPartsInfo[code].push({id : morph.morphTargetInfluences.length, character: target.name}); //store index of the morph part for the slider to know what morph influence to alter 
       
        let mixed_p = this.morph_array_2(source_p,target_p, vertices, type);
        let mixed_n = this.morph_array_2(source_n, target_n, vertices, type);
        let mt_p = new THREE.Float32BufferAttribute( mixed_p, 3 );
        let mt_n = new THREE.Float32BufferAttribute(mixed_n, 3 );

        morph.geometry.morphAttributes.position.push(  mt_p );
        morph.geometry.morphAttributes.normal.push(  mt_n );  

        morph = this.scene.children[morph_idx];

        this.scene.remove(morph);
        this.scene.add(morph);
        return face;
    }

    getPartIdx(type){

        let morph_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        if(morph_idx  == -1 ) return {};
        let morph = this.scene.children[morph_idx];
        morph = this.getPart(morph,"Face");
        if(morph.morphTargetInfluences == undefined ) return {part_len: 0, target_idx: 0, morph_idx: morph_idx, names: []};
        let type_array = morph.morphPartsInfo[type];
        const namesArr = morph.morphPartsInfo[type].map(obj => obj.name); 

        return {part_len: type_array.length, target_idx: morph.morphTargetInfluences.length, morph_idx: morph_idx, names: namesArr}
    }

    morph_array_2(source, target, indices, type ){ //better optimized function that iterates the length of the object instead of the mesh which is x50 times smaller
        //function to modify a position array 

        let parts_dict= {
            "Nose": 2065, 	//good enough 
            //"Nose": [48, 568, 2700, 4264, 4303],
            "Chin": 3878,		//1 83 75   
            "L_ear": 3847,
            "R_ear":1504
        }
        source = source.array;
        target = target.array
        //indices= indices.vertices;

        for (let i = 0; i < type.length; i++) {
            const type_i = type[i];
            const indices_i = indices[type_i];
            
            let dis = this.getIdxDisp_simple(source,target,indices_i, parts_dict[type_i]);
            
            for (let i = 0; i < indices_i.length; i++) {
            const index = indices_i[i] *3;										
            source[index] = target[index] +dis.dx;
            source[index + 1] = target[index + 1] +dis.dy;
            source[index + 2] = target[index + 2] +dis.dz;            
            }
        }

        // let dis = this.getIdxDisp_simple(source,target,indices, parts_dict[type]);
        // for (let i = 0; i < indices.length; i++) {

        //     const index = indices[i] *3;										
        //     source[index] = target[index] +dis.dx;
        //     source[index + 1] = target[index + 1] +dis.dy;
        //     source[index + 2] = target[index + 2] +dis.dz;            
        // }
        
        return source
    }

    getIdxDisp_simple(source,target,indices, index){

        const i = index *3;	
        let dx = source [i] - target[i];
        let dy = source[i+1] - target[i+1];
        let dz = source[i+2] - target[i+2];
        return {dx:dx , dy: dy , dz: dz}
    }


    getIdxDisp(source,target,indices, index){

        // const i = index *3;	
        // let dx = source [i] - target[i];
        // let dy = source[i+1] - target[i+1];
        // let dz = source[i+2] - target[i+2];
        let dx = 0;
        let dy = 0;
        let dz = 0;
        // return {dx:dx , dy: dy , dz: dz}
        for (let j = 0; j < index.length; j++) {
            const i = index[j]*3;
            dx += source [i] - target[i];
            dy += source[i+1] - target[i+1];
            dz += source[i+2] - target[i+2];
        }
        return {dx:dx/index.length , dy: dy/index.length , dz: dz/index.length}

    }

    calculate_distances(source, target, indices){ //better optimized function that iterates the length of the object instead of the mesh which is x50 times smaller
        //function to modify a position array 
        

        //let d = calculate_distances(source,target,indices);
        let fx=0;
        let fy= 0 ;
        let fz =0 ;

        let target_y = -0.015;
        let target_z = 0.008;


        let closestDistance = Infinity;
        let closestPoint = null;
        let dist= {};
        
        for (let i = 0; i < indices.length; i++) {

            const index = indices[i] *3;	
            let dx = source [index] - target[index];
            let dy = source[index+1] - target[index+1];
            let dz = source[index+2] - target[index+2];
            const distance = Math.sqrt(Math.pow(target_y - dy, 2) + Math.pow(target_z - dz, 2));
            if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = i;
            dist = {x: dx, y: dy, z: dz};
            }
            fx += dx;
            fy += dy;
            fz += dz;
        
        }

    }

    
    add_event(){
    // Add event listener for click event on renderer's DOM element
    
    this.renderer.domElement.addEventListener( 'click', function ( event ) {
        
        if(this.selection_state != "finished"){
            // Calculate mouse position in normalized device coordinates
            const mouse = new THREE.Vector2(); 
            mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

            // Create a raycaster from the camera to the clicked position
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera( mouse, this.camera );

            // Check for intersections with objects in the scene
            const intersects = raycaster.intersectObjects( this.scene.children, true );

            // If there are intersections, select the first one
            if ( intersects.length > 0 && intersects[0].object.type != 'GridHelper' ) {

                // Deselect the previously selected object (if any)
                if ( this.selectedObject) {
                    
                    // Restore the original material
                    //this.selectedObject.material = material;
                    this.selectedObject = null;
                }

                // Select the new object
                this.selectedObject = intersects[0].object;
                // Store the original material to restore it later
                //material = this.selectedObject.material;
                // Set a new material to indicate selection (e.g. red color)
                //this.selectedObject.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

                this.selection_scheduler(this.selectedObject);
            }
        }
    }.bind(this) );
    }
     
    //customisations
    getHead(){
        let blend =  this.getBlend();
        blend = this.getPart(blend,"Face");
        return blend.parent
    }

    //Skin customisation 
    addSkin(material, name){
        this.skins.push({name: name, mat: material});
    }

    changeSkin(skin_name){
       let blend =  this.getBlend();
       blend = this.getPart(blend,"Face");
       blend.material = this.skins[this.skins.findIndex(obj => obj.name.includes(skin_name))].mat;
    }

    RGBskin(v){

        let parts = ["Face", "Left_Arm", "Right_Arm"]//parts that are included in the skin change
        for (let i = 0; i < parts.length; i++) {
            let blend =  this.getBlend();
            blend = this.getPart(blend, parts[i]);
            // blend.material = this.skins[this.skins.findIndex(obj => obj.name.includes(skin_name))].mat;
            blend.material.color.r =v[0];
            blend.material.color.g= v[1];
            blend.material.color.b= v[2];      
        }       
    }

    //Eyes customisation
    RGBeyes(v){

        function changeEyeColor(v, eye){

            eye.material.color.r = v[0];
            eye.material.color.g= v[1];
            eye.material.color.b= v[2];
        
        }

        function getEyes(blend){
            
            let eye_L =blend.children.findIndex(obj => obj.name.includes("eye_color_L"));
            let eye_R = blend.children.findIndex(obj => obj.name.includes("eye_color_R"));
            return [ blend.children[eye_L], blend.children[eye_R]]
        }

        let blend =  this.getHead();
        let eyes = getEyes(blend);
        changeEyeColor(v, eyes[0]);
        changeEyeColor(v, eyes[1]);

    }

    RGBHair(v){

        function getHair(blend){
            let hair_idx =blend.children.findIndex(obj => obj.name.includes("Hair"));
            // if (blend.children[hair_idx].type =="Object3D"){
            //     return getHair(blend.children[hair_idx])
            // }
            return blend.children[hair_idx]
        }

        function recolourhair(hair, v){

            if( v == "reset"){
                hair.material.color.r = hair.material.default_color.r;
                hair.material.color.g= hair.material.default_color.g;
                hair.material.color.b= hair.material.default_color.b;
            }else{
                hair.material.color.r = v[0];
                hair.material.color.g= v[1];
                hair.material.color.b= v[2];
            }

        }
        
        let blend =  this.getHead();
        let hair = getHair(blend);
        if(hair.children.length > 0){
        for (let i = 0; i < hair.children.length; i++) {
            let i_hair = hair.children[i];
            recolourhair(i_hair, v);
        }
        }else{
            recolourhair(hair,v);
        }
        
        
    }
        
    removeHair(hair_name){

        function getHair(blend){
            let hair_idx =blend.children.findIndex(obj => obj.name.includes("Hair"));
            return blend.children[hair_idx]
        }
        //let name = "Hair"+v;

        let blend = this.getHead();
        let hair_idx =blend.children.findIndex(obj => obj.name.includes("Hair"));
        let pre_position = blend.children[hair_idx].position.clone();
        blend.remove(blend.children[hair_idx]);

        let hair = this.hairs[this.hairs.findIndex(obj => obj.name.includes(hair_name))].hair.clone();
        if(blend.scale.x < 1){
            hair.scale.y = 100;
            hair.scale.z =100;
            hair.scale.x =100; 
        }else if (hair_name == "CleoHead"){
            hair.scale.y = .01;
            hair.scale.z =.01;
            hair.scale.x =.01; 
        }
        hair.position.x = pre_position.x;
        hair.position.y = pre_position.y;
        hair.position.z = pre_position.z;
        blend.add(hair);    
      
        
    }

    
    importAssets(routes){

        function findHead(scene){

            while( ! scene.name.includes("Head")  ){
                
                let son_idx = scene.children.findIndex(obj => obj.name.includes("Head"));
                // if  () scene= scene.children[son_idx]
                // else scene= scene.children[0]
                scene = son_idx !=-1 ? scene.children[son_idx] : scene.children[0];					
            }
            return scene;
        }

        //import assets
        const values = Object.values(routes);
        const keys = Object.keys(routes);
        this.loader_glb = new GLTFLoader().setPath( './models/gltf/webmorph_models/test old assets/export tests/Final_meshes/' );
        

        for (let i = 0; i < values.length; i++) {
            
            let route = values[i];
            this.loader_glb.load( route, function ( gltf ) {
					
                let gltf_mesh = gltf.scene
                if (values[i].includes("body") ){//exception for final models with bodies
                    gltf_mesh.name = keys[i]+gltf_mesh.name;
                    gltf_mesh.position.x += .25*(i+1) * (-1)**i;
                    this.importHairs(gltf_mesh, gltf_mesh.name);
                    this.scene.add(gltf_mesh);
                    let face = this.getPart(gltf_mesh, "Face");
                    this.addSkin(face.material,gltf_mesh.name);

                }else{
                    gltf_mesh = findHead(gltf_mesh);
                    gltf_mesh.position.x += .25*(i+1) * (-1)**i ;
                    gltf_mesh.name = keys[i]+gltf_mesh.name;
                    this.importHairs(gltf_mesh, gltf_mesh.name);
                    this.scene.add(gltf_mesh);
                    let face = this.getPart(gltf_mesh, "Face");
                    this.addSkin(face.material,gltf_mesh.name);
                }
                
            }.bind(this) );
        }
        
    }

    importHairs(face, name){
        if(face.children.length == 0) return
        let hair_idx = face.children.findIndex(obj => obj.name.includes("Hair"));
        if(!face.children && hair_idx == -1) return
        if(hair_idx == -1) return this.importHairs(face.children[0], name);
        let hair = face.children[hair_idx];
        //Fill the base colors for the hairs
        if(hair.children.length >0){//case when hair is composed
            // hair_idx = hair.children.findIndex(obj => obj.name.includes("Hair"));
            // hair = hair.children[hair_idx];
            for (let i = 0; i < hair.children.length; i++) {
                let i_hair = hair.children[i];
                i_hair.material.default_color = i_hair.material.color.clone();
            }
        }else{
        hair.material.default_color = hair.material.color.clone();    
        }

        this.hairs.push({name: name, hair: hair});
    };



    emptyScene(){
        for (let index = (this.scene.children.length -1); index >= 0; index--) {
            const element = this.scene.children[index];    
            if(element.type == "Object3D" || element.type =="Group") this.scene.children[index].visible = false; 
        }
    }

    blend_scene(){

        //fn to set the scene to have the blend character in the middle
        this.emptyScene()
        let morph_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        
        if (morph_idx == -1) {
        this.clone.position.x = 0;
        this.scene.add(this.clone);
        }else{
            let morph = this.scene.children[morph_idx];	
            morph.visible = true;
        }
    }

    pick_scene(avalible_char,main_name){

        this.emptyScene();

        for (let index = (this.scene.children.length -1); index >= 0; index--) {
            const element = this.scene.children[index];
            if(!avalible_char.includes(element.name) && !element.name.includes(this.clone.name) ) this.scene.children[index].visible = true;
        }
    }

    initiaizeTargets(blend, name){

        blend.morphTargetInfluences = [0];
        blend.morphTargetDictionary = { 0: name};
        blend.geometry.morphAttributes.position = [];
        blend.geometry.morphAttributes.position = [];
        blend.geometry.morphAttributes.normal = [];
    }

    blendPart(sel_obj, vertices,code, folder, type){
        console.log("Added", code, " sel_obj", sel_obj);
        let p_idx = this.getPartIdx(code);
        let mph = this.addMorph(sel_obj,vertices,code, type);
        let tag =  code + " #" + p_idx.part_len;
        this.gui.addslider(folder,p_idx.morph_idx,p_idx.target_idx, tag, mph);
        this.selection_state = "idle";
        //return to blend scene
        this.blend_scene();
    }

    checkHead(mesh){
        //function to separate the head (eyes, eyebrows , eyelashes, hair...) from the face mesh 
        if(mesh.name.includes("Head") ) return mesh
        let face_idx =mesh.parent.children.findIndex(obj => obj.name.includes("Face"));
        mesh.parent.children[face_idx].morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[]}; //store each part which morphattribute it corresponds to
        return mesh.parent
    }


    getBlend(){
        let blend_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        return this.scene.children[blend_idx];
    }

    exportGLTF( input ) {

        const link = document.createElement( 'a' );
        link.style.display = 'none';
        document.body.appendChild( link ); // Firefox workaround, see #6594

        function save( blob, filename ) {

            link.href = URL.createObjectURL( blob );
            link.download = filename;
            link.click();
        }

        function saveString( text, filename ) {
            save( new Blob( [ text ], { type: 'text/plain' } ), filename );
        } 

        const gltfExporter = new GLTFExporter();

        const params2 = {
            trs: false,
            onlyVisible: true,
            binary: false,
            maxTextureSize: 4096
        };

        const options = {
            trs: params2.trs,
            onlyVisible: params2.onlyVisible,
            binary: params2.binary,
            maxTextureSize: params2.maxTextureSize
        };
        gltfExporter.parse(
            input,
            function ( result ) {

                if ( result instanceof ArrayBuffer ) {

                    saveArrayBuffer( result, 'scene.glb' );

                } else {

                    const output = JSON.stringify( result, null, 2 );
                    console.log( output );
                    saveString( output, 'scene.glb' );

                }

            },
            function ( error ) {

                console.log( 'An error happened during parsing', error );

            },
            options
        );

    }

    getRootGroup(child){

        while(child.parent && child.parent.type != "Scene"){
            child = child.parent;
        }
        return child;
    }

    selection_scheduler(sel_obj){

        switch (this.selection_state) {
            case "base":
                //sel_obj = this.checkHead(sel_obj);ç
                sel_obj = this.getRootGroup(sel_obj);
                this.clone = sel_obj;
                console.log(sel_obj)
                //move to create clone fn 
                this.clone.name = sel_obj.name+"Blend";
                this.clone.morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[]}; //store each part which morphattribute it corresponds to 
                this.selection_state = "idle";
                //set scene to have only blend model
                this.scene.remove(sel_obj);
                this.blend_scene();
                this.gui.createMorphInspectors();
                let s = this.skins.map(item => item.name);
                let h = this.hairs.map(item => item.name);
                //this.gui.addcombo(t);
                this.gui.createSkinWidgets(s);
                this.gui.createEyesWidgets();
                this.gui.createHairWidgets(h);
                this.gui.createExportBtn();
                break;
            case "blend":
                this.clone2 = sel_obj.clone();
                //scene.remove(sel_obj);
                this.selection_state = "idle";
                break;
            case "Add Chin":
                this.blendPart(sel_obj,chin_vertices, "Chin", this.gui.sliders["Chininspector"], ["Chin"]);
                break;
            case "Add Nose":
                this.blendPart(sel_obj,nose_vertices, "Nose", this.gui.sliders["Noseinspector"], ["Nose"]);
                break;
            case "Add Ears":
                this.blendPart(sel_obj,this.vertices, "Ears" , this.gui.sliders["Earsinspector"],["R_ear","L_ear"] );
                break;
            default:
                console.log("default")
                break;
        }
    }

}

let app = new App();
app.init();

window.global = {app:app};
export { app };