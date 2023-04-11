import { GUI } from './GUI.js'
import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
//import {GLTFLoader} from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import three from 'https://cdn.skypack.dev/three';
import  *  as GLTFLoader from 'https://cdn.skypack.dev/pin/three@v0.149.0-eN5PpLTGoHq5IPENPwOt/mode=raw/examples/jsm/loaders/GLTFLoader.js';


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

        this.gui = new GUI(this);

    }

    init(){
        let that = this;
        this.container = document.getElementById( 'container' );

        this.camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, .1, 1000 );
        this.camera.position.set( 0, 2,  5 );

        this.scene = new THREE.Scene();
           
        const gridHelper = new THREE.GridHelper( 10, 20, 0xffffff, 0x444444 );
        this.scene.add( gridHelper );

        const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
        this.scene.add( ambientLight );

        const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
        this.scene.add( this.camera );
        this.camera.add( pointLight );

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( this.renderer.domElement );
        this.renderer.setClearColor(0xbfe3dd);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 8000;
        this.controls.target.set( 0, 2, 0 );
        this.controls.update();

        this.stats = new Stats();
        container.appendChild( this.stats.dom );

        window.addEventListener( 'resize', this.onWindowResize.bind(this) );


        let dict = {
            "Boss": 'boss_final.glb',
            "Jen": "jen_final.glb",
            "Cleo": "cleo.glb",
            "Jack": "jack_g.glb",
            "B2": 'boss_hair_2.glb'
        }
        this.importAssets(dict);
        this.render();
        //charactgersGUI(null);	


    }


    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

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
        let c = document.getElementById('container');
        c.classList.toggle('hidden');
        c = document.getElementById('loading-screen');
        c.classList.toggle('hidden')
        charactgersGUI(null);	
    }

    getFace(mesh){
        let face_idx =mesh.children.findIndex(obj => obj.name.includes("Face"));
        if(mesh.name.includes("Face") || face_idx == -1 ) return mesh
        mesh.children[face_idx].morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[]}; //store each part which morphattribute it corresponds to 
        return mesh.children[face_idx]
    }

    //functio to adding a morph target into the existing blend
    addMorph(target ,vertices, type){

        let morph_idx = this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        let morph = this.scene.children[morph_idx];

        //fn to select face inside the head object 
        morph = getFace(morph);

        let source_p = new THREE.Float32BufferAttribute( morph.geometry.attributes.position.array, 3 );
        let source_n = new THREE.Float32BufferAttribute( morph.geometry.attributes.normal.array, 3 );
        let target_p = new THREE.Float32BufferAttribute( target.geometry.attributes.position.array, 3 );
        let target_n = new THREE.Float32BufferAttribute( target.geometry.attributes.normal.array, 3 );

                
        let name = type + morph.morphPartsInfo[type].length;
        
        if(morph.morphTargetInfluences == undefined) initiaizeTargets(morph,name);
        else{ 
            morph.morphTargetDictionary[morph.morphTargetInfluences.length]= name;
            morph.morphTargetInfluences.push(0);
        }
        morph.morphPartsInfo[type].push({id : morph.morphTargetInfluences.length, character: target.name}); //store index of the morph part for the slider to know what morph influence to alter 


        let mixed_p = morph_array_2(source_p,target_p, vertices,type);
        let mixed_n = morph_array_2(source_n, target_n, vertices,type);
        let mt_p = new THREE.Float32BufferAttribute( mixed_p, 3 );
        let mt_n = new THREE.Float32BufferAttribute(mixed_n, 3 );

        morph.geometry.morphAttributes.position.push(  mt_p );
        morph.geometry.morphAttributes.normal.push(  mt_n );  

        morph = this.scene.children[morph_idx];

        this.scene.remove(morph);
        this.scene.add(morph);
    }

    Add_chin(){
        console.log("Please Select Model to add Chin");
        //fn to load the scene to select the nose
        this.selection_state = "Add Chin"
        let p_idx = getPartIdx("Chin");
        console.log(p_idx,clone.name);
        pick_scene(p_idx.names);

        setTimeout(swap_visibility, 2000); //2s as when models are imported depending on the pc it takes a little bit longer for them to be displayed on the screen
        selection_state = "base";
                            
    }

    Add_Nose(){
        console.log("Please Select Model to add Nose");
        //fn to load the scene to select the nose
        this.selection_state = "Add Nose"
        let p_idx = getPartIdx("Nose");
        console.log(p_idx,clone.name);
        pick_scene(p_idx.names);
                            
    }

    Add_Ears(){
        console.log("Please Select Model to add Nose");
        //fn to load the scene to select the nose
        this.selection_state = "Add Ears"
        let p_idx = getPartIdx("Ears");
        console.log(p_idx,clone.name);
        pick_scene(p_idx.names);					
    }


    getPartIdx(type){

        let morph_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        if(morph_idx  == -1 ) return {};
        let morph = this.scene.children[morph_idx];
        morph = getFace(morph);
        if(morph.morphTargetInfluences == undefined ) return {part_len: 0, target_idx: 0, morph_idx: morph_idx, names: []};
        let type_array = morph.morphPartsInfo[type];
        const namesArr = morph.morphPartsInfo[type].map(obj => obj.name);

        return {part_len: type_array.length, target_idx: morph.morphTargetInfluences.length, morph_idx: morph_idx, names: namesArr}
    }

    morph_array_2(source, target, indices, type ){ //better optimized function that iterates the length of the object instead of the mesh which is x50 times smaller
        //function to modify a position array 

        let parts_dict= {
            "Nose": 214 , 	//good enough 
            "Chin": 45		//1 83 75   
        }
        source = source.array;
        target = target.array
        indices= indices.vertices;

        let d = calculate_distances(source,target,indices);
        let dis = getIdxDisp(source,target,indices, parts_dict[type]);
        console.log("displacements ", dis);
        
        for (let i = 0; i < indices.length; i++) {

            const index = indices[i] *3;										
            source[index] = target[index] ;
            source[index + 1] = target[index + 1] +dis.dy
            source[index + 2] = target[index + 2] +dis.dz
            
        }
        
        return source
    }


    getIdxDisp(source,target,indices, index){

        const i = indices[index] *3;	
        let dx = source [i] - target[i];
        let dy = source[i+1] - target[i+1];
        let dz = source[i+2] - target[i+2];
        return {dx:dx , dy: dy , dz: dz}
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
            //console.log("inx", i, dx , dy , dz );
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

        console.log("finals ", fx, fy , fz);
        console.log("finalsdiv ", fx/indices.length, fy/indices.length , fz/indices.length);
        console.log("closest", closestPoint, indices.length);
        console.log("closest",dist);
        //return source
    }

    
    add_event(){
    // Add event listener for click event on renderer's DOM element
    this.renderer.domElement.addEventListener( 'click', function ( event ) {
        
        if(selection_state != "finished"){
            // Calculate mouse position in normalized device coordinates
            const mouse = new THREE.Vector2(); 
            mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

            // Create a raycaster from the camera to the clicked position
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera( mouse, this.camera );

            // Check for intersections with objects in the scene
            const intersects = raycaster.intersectObjects( scene.children, true );

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

                selection_scheduler(this.selectedObject);
            }
        }
    } );
    }

    findHead(scene){

        console.log("heyyyyy", this);
        while( ! scene.name.includes("Head")  ){
            
            let son_idx = scene.children.findIndex(obj => obj.name.includes("Head"));
            // if  () scene= scene.children[son_idx]
            // else scene= scene.children[0]
            scene = son_idx !=-1 ? scene.children[son_idx] : scene.children[0];					
        }
        return scene;
    }

    importAssets(routes){
        //import assets
        const values = Object.values(routes);
        const keys = Object.keys(routes);
        this.loader_glb = new GLTFLoader().setPath( './models/gltf/webmorph_models/test old assets/export tests/Final_meshes/' );

        for (let i = 0; i < values.length; i++) {
            
            let route = values[i];
            let mesh = null;
            this.loader_glb.load( route, this.testb.bind(this,callback) );
            gltf_mesh = this.findHead(gltf_mesh);
            gltf_mesh.position.x += .25*(i+1) * (-1)**i ;
            if(gltf_mesh.type == 'Mesh')gltf_mesh.geometry.computeVertexNormals();
            gltf_mesh.name = keys[i]+gltf_mesh.name;
            this.scene.add(gltf_mesh);
            characters.push(gltf_mesh);
            importHairs(gltf_mesh);
        }
        
    }

    testb(){
        console.log("bind");
        
    }

    importHairs(face){
        let hair_idx = face.children.findIndex(obj => obj.name.includes("Hair"));
        if(hair_idx == -1) return
        let hair = face.children[hair_idx];
        this.hairs.push(hair);

    };


    emptyScene(){
        for (let index = (this.scene.children.length -1); index >= 0; index--) {
            const element = this.scene.children[index];
            if(element.type == "Mesh" || element.type == "Object3D")this.scene.children[index].visible = false; 
        }
    }

    blend_scene(){

        //fn to set the scene to have the blend character in the middle
        emptyScene()


        let morph_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        
        if (morph_idx == -1) {
        this.clone.position.x = 0;
        this.scene.add(clone);
        }else{
            let morph = scene.children[morph_idx];	
            morph.visible = true;
        }
    }

    pick_scene(avalible_char,main_name){

        emptyScene();

        for (let index = (this.scene.children.length -1); index >= 0; index--) {
            const element = this.scene.children[index];
            if(!avalible_char.includes(element.name) && !element.name.includes(clone.name) ) this.scene.children[index].visible = true;
        }
    }

    initiaizeTargets(blend, name){

        blend.morphTargetInfluences = [0];
        blend.morphTargetDictionary = { 0: name};
        blend.geometry.morphAttributes.position = [];
        blend.geometry.morphAttributes.position = [];
        blend.geometry.morphAttributes.normal = [];
    }

    blendPart(sel_obj, vertices,code, folder){
        console.log("Added", code, " sel_obj", sel_obj);
            let p_idx = getPartIdx(code);
            addMorph(sel_obj,vertices,code);
            let tag =  code + " #" + p_idx.part_len;
            params[tag] = 0;
            folder.add( params, tag, 0, 1 ).step( 0.01 ).onChange( function ( value ) {
                if( this.scene.children[p_idx.morph_idx].children.length > 0 ){
                    let face_idx =this.scene.children[p_idx.morph_idx].children.findIndex(obj => obj.name.includes("Face"));
                    this.scene.children[p_idx.morph_idx].children[face_idx].morphTargetInfluences[p_idx.target_idx]  =  value;

                }else{
                this.scene.children[p_idx.morph_idx].morphTargetInfluences[p_idx.target_idx]  =  value;
                }
            });

            console.log(p_idx.target_idx);
            console.log(this.scene.children[p_idx.morph_idx]);
            this.selection_state = "idle";
            //return to blend scene
            blend_scene();
            //fn to remove the non main meshes of the scene
    }

    checkHead(mesh){
        //function to separate the head (eyes, eyebrows , eyelashes, hair...) from the face mesh 
        
        if(mesh.name.includes("Head") ) return mesh
        let face_idx =mesh.parent.children.findIndex(obj => obj.name.includes("Face"));
        mesh.parent.children[face_idx].morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[]}; //store each part which morphattribute it corresponds to
        return mesh.parent
    }

    selection_scheduler(sel_obj){

        switch (selection_state) {
            case "base":
                

                sel_obj = checkHead(sel_obj);
                this.clone = sel_obj.clone();
                //move to create clone fn 
                this.clone.name = sel_obj.name+"Blend";
                this.clone.morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[]}; //store each part which morphattribute it corresponds to 
                this.selection_state = "idle";
                //set scene to have only blend model
                scene.remove(sel_obj);
                blend_scene();
                break;
            case "blend":
                console.log(sel_obj);
                this.clone2 = sel_obj.clone();
                //scene.remove(sel_obj);
                this.selection_state = "idle";
                break;
            case "Add Chin":
                blendPart(sel_obj,chin_vertices, "Chin", chin_folder);
                break;
            case "Add Nose":
                blendPart(sel_obj,nose_vertices, "Nose", nose_folder);
                break;
            case "Add Ears":
                blendPart(sel_obj,ears_vertices, "Ears", ears_folder);
                break;
            
            
        
            default:
                console.log("default")
                break;
        }

        // if(selection_state == "base"){
        // 	console.log(sel_obj);
            
        // 	clone = sel_obj.clone();
        // 	selection_state = "blend"
        // 	scene.remove(sel_obj);

        // }else if ( selection_state == "blend"){

        // 	clone2 = sel_obj.clone();
        // 	//scene.remove(sel_obj);
        // 	selection_state = "hold";
        // }

    }

    test2(b){
        console.log(b);
        this.gui.addslider();
    }

    test3(value){

        console.log("controling", value)
    }


}

let app = new App();
app.init();
window.global = {app:app};
export { app };