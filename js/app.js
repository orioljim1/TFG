import { GUI } from './GUI.js'
import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import {GLTFLoader} from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from '../node_modules/three/examples/jsm/exporters/GLTFExporter.js';

import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js';


class App{

    constructor(){

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
        this.avatars = []
        this.base_name = null;
        this.animations= [];
        this.mixer = null;

    }

    init(){
        
        fetch("../data/vertices/Vertices_selection.json")
        .then(response => {
        return response.json();
        })
        .then(data => this.vertices = data);

        this.container = document.getElementById("canvasarea");

        this.camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, .3, 1000 );
        this.camera.position.set( 0, 2, 3);
        this.camera.updateProjectionMatrix();

        this.scene = new THREE.Scene();
           
        // lights

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
        //this.scene.add( ground );
        const gridHelper = new THREE.GridHelper( 10, 20, 0xffffff, 0xbbbbbb );
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
        this.controls.target.set( 0, 1.5, 0 );
        this.controls.update();

        this.stats = new Stats();
        //this.container.appendChild( this.stats.dom );

        window.addEventListener( 'resize', this.onWindowResize.bind(this) );

        this.setLighting();

        let dict = {
            "Cleo": "cleo.glb",
            "Jack": "jack.glb",
            "Eden": "eden.glb",
            "Jen": "jen.glb",
            "Sakura": "sakura.glb",
            "Boss":"boss.glb"    
        }
        this.importAssets(dict);
        this.selection_state = "base";
        this.animate();
    
    }

    setLighting(){

        new RGBELoader()
        .setPath( './data/models/hdr/')
        .load( 'royal_esplanade_1k.hdr', function ( texture ) {

            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = texture;

            this.render();

        }.bind(this) );    
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

        if ( this.mixer !== null ) 
            this.mixer.update( delta );
        
        this.renderer.render( this.scene, this.camera );

    }

    //fn to change the loading screen to the app screen
    swap_visibility(){
        
        let element = document.getElementById("mainarea");
        element.style.display = "block";

        let c = document.getElementById('loading-screen');
        c.classList.toggle('hidden')
       
        this.gui.displayOptionsDialog(this.avatars, "Select base avatar!",[]);
        	
    }

    getPart_armature(mesh, part){

        if(mesh.name.includes(part)) return mesh
        else if(mesh.children.length == 1){return this.getPart_armature(mesh.children[0],part )} // case where it's the root object and not armature
        else{
            let part_idx =mesh.children.findIndex(obj => obj.name.includes(part));
            if(part_idx == -1){
                return this.getPart_armature(mesh.parent, part);
            }else{
                return mesh.children[part_idx];
            }
            
        }
    }

    //fn to retrieve a children of the parent avatar mesh group
    getPart(mesh, part){
        let face_idx = mesh.children.findIndex(obj => obj.name.includes(part));
        if(mesh.name.includes(part)) return mesh
        else if (face_idx == -1){
            let head_idx =mesh.children.findIndex(obj => obj.name.includes("Head"));
            if (head_idx != -1) return this.getPart(mesh.children[head_idx],part);
            return this.getPart(mesh.children[0],part)
        }// body case
        return mesh.children[face_idx]
    }

    //functio to adding a morph target into the existing blend
    addMorph(target ,vertices, code,type,sel_name){

        let morph_idx = this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        let morph = this.scene.children[morph_idx];

        //fn to select face inside the head object 
        morph = this.getPart(morph,"Face");
        let face = morph;

        let source_p = new THREE.Float32BufferAttribute( morph.geometry.attributes.position.array, 3 );
        let source_n = new THREE.Float32BufferAttribute( morph.geometry.attributes.normal.array, 3 );
        let target_p = new THREE.Float32BufferAttribute( target.geometry.attributes.position.array, 3 );

        let name = code + morph.morphPartsInfo[code].length;
        
        if(morph.morphTargetInfluences == undefined) this.initiaizeTargets(morph,name);
        else{ 
            morph.morphTargetDictionary[morph.morphTargetInfluences.length]= name;
            morph.morphTargetInfluences.push(0);
        }
        
        morph.morphPartsInfo[code].push({id : morph.morphTargetInfluences.length, character: sel_name}); //store index of the morph part for the slider to know what morph influence to alter 
        let combined =   this.morphArray(source_p,target_p, vertices, type);
        let mixed_p = combined.res;
        let mt_p = new THREE.Float32BufferAttribute( mixed_p, 3 );

        morph.geometry.morphAttributes.position.push(  mt_p );
        morph.geometry.morphAttributes.normal.push(  source_n );  

        morph = this.scene.children[morph_idx];
        let helper_sliders;

        //eye morph needs to morph other meshes that are not the face
        if(code == "Eyes"){ 
            let dis = combined.dis ;
            helper_sliders= this.addEyeMorph(target, morph, dis);
        }

        this.scene.remove(morph);
        this.scene.add(morph);
        return {mph: face, helper_sliders: helper_sliders};
    }

    //fn to create the morphtargets for the additional eye morph meshes (eyelashes, and eyes)
    addEyeMorph(target, source,dis){

        function displaced_array(target_array, dis){
            let L_dis = dis["L_eye"];
            let R_dis = dis["R_eye"];
            for (let i = 0; i < target_array.length; i+=3) {
            const index = i	;
            if (target_array[index] > 0) dis = L_dis;
            else dis = R_dis;
            target_array[index] = target_array[index] +dis.dx
            target_array[index + 1] = target_array[index + 1] +dis.dy;
            target_array[index + 2] = target_array[index + 2] +dis.dz;            
            }
            return target_array;
        }

        let eye_meshes = ["Eyelashes", "Eye_L", "eye_color_L", "Eye_R", "eye_color_R"];
        let sliders = [];
        
        for (let i = 0; i < eye_meshes.length; i++) {
            let element = eye_meshes[i];
            let target_part = this.getPart_armature(target, element);
            let source_part = this.getPart_armature(source, element);
            let target_p = new THREE.Float32BufferAttribute( target_part.geometry.attributes.position.array, 3 );
            let target_n = new THREE.Float32BufferAttribute( target_part.geometry.attributes.normal.array, 3 );

            if(source_part.morphTargetInfluences == undefined) this.initiaizeTargets(source_part,"null");
            else{ 
                source_part.morphTargetInfluences.push(0);
            }

            let target_pp = displaced_array(target_p.array, dis);
            target_p = new THREE.Float32BufferAttribute( target_pp, 3 );

            source_part.geometry.morphAttributes.position.push(  target_p );
            source_part.geometry.morphAttributes.normal.push(  target_n );  

            let current_slider = {mesh : source_part, idx :(source_part.morphTargetInfluences.length-1)} ;
            sliders.push(current_slider);
            

        }
        return sliders
    } 

    //fn to initialize a morph target info inside an object
    initiaizeTargets(blend, name){

        blend.morphTargetInfluences = [0];
        blend.morphTargetDictionary = { 0: name};
        blend.geometry.morphAttributes.position = [];
        blend.geometry.morphAttributes.position = [];
        blend.geometry.morphAttributes.normal = [];
    }


    //fn to get the info of the current morph targets of a particular part of the face, e.g get all the info for nose morphs
    getPartIdx(type){
        
        let morph_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        if(morph_idx  == -1 ) return {};
        let morph = this.scene.children[morph_idx];
        morph = this.getPart(morph,"Face");
        if(morph.morphTargetInfluences == undefined ) return {part_len: 0, target_idx: 0, morph_idx: morph_idx, names: []};
        let type_array = morph.morphPartsInfo[type];
        const namesArr = morph.morphPartsInfo[type].map(obj => obj.character); 

        return {part_len: type_array.length, target_idx: morph.morphTargetInfluences.length, morph_idx: morph_idx, names: namesArr, type_array: type_array}
    }

    //better optimized function that iterates the length of the object instead of the mesh which is x50 times smaller
    //function to modify a position array     
    morphArray(source, target, indices, type ){ 

        //dict to store the feature vertices used to calculate the displacements for each of the parts of the face
        let parts_dict= {
            "Nose": 3882,
            "Chin": 3878,
            "L_ear": 3847,
            "R_ear":1504,
            "R_jaw":1219,
            "L_jaw": 4344,
            "L_eye": 3048,
            "R_eye": 904
        }
        source = source.array;
        target = target.array

        let final_dis = {};
        for (let i = 0; i < type.length; i++) {
            const type_i = type[i];
            const indices_i = indices[type_i];
            
            let dis = this.getIdxDisp_simple(source,target, parts_dict[type_i]);
            final_dis[type_i] = dis;
            for (let i = 0; i < indices_i.length; i++) {
            const index = indices_i[i] *3;										
            source[index] = target[index] +dis.dx //Only composite morphs need the x displacement as there's no simetry
            source[index + 1] = target[index + 1] +dis.dy;
            source[index + 2] = target[index + 2] +dis.dz;            
            }
        }
        
        return {res: source, dis: final_dis}
    }

    //Fn to check for the distance between feature vertices between source and target positions
    getIdxDisp_simple(source,target, index){

        const i = index *3;	
        let dx = source [i] - target[i];
        let dy = source[i+1] - target[i+1];
        let dz = source[i+2] - target[i+2];
        return {dx:dx , dy: dy , dz: dz}
    }
    
    //Minor fn to retrieve character face mesh
    getHead(){
        let blend =  this.getBlend();
        blend = this.getPart(blend,"Face");
        return blend.parent
    }

    //Fn to replace skin 
    changeSkin(skin_name){

       let skin =  this.skins[this.skins.findIndex(obj => obj.name.includes(skin_name))];
       let blend =  this.getBlend();
       let parts = ["Face", "Left_Arm", "Right_Arm"]//parts that are included in the skin change
        for (let i = 0; i < parts.length; i++) {
            
            let part = this.getPart(blend, parts[i]);
            part.material = skin[parts[i]];
        }
    }

    //Fn to recolor skin
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

    //Fn to recolor eyes
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

    //Fn to recolor hairs
    RGBHair(v){

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
        
        let hair = this.hairs.find(item => item.hair.visible === true).hair;
        if(hair.children.length > 0){
        for (let i = 0; i < hair.children.length; i++) {
            let i_hair = hair.children[i];
            recolourhair(i_hair, v);
        }
        }else{
            recolourhair(hair,v);
        }
        
    }
    
    //Fn to change the hair
    changeHair(hair_name){
        
        for (let i = 0; i < this.hairs.length; i++) {
            const hair = this.hairs[i];
            if( hair.name != hair_name){
                hair.hair.visible = false;
            }else{
                hair.hair.visible = true;
            }
            
        }  
    }

    //Fn to import all the base avatars
    importAssets(routes){

        //import assets
        const values = Object.values(routes);
        const keys = Object.keys(routes);
        //this.avatars = keys;
        this.loader_glb = new GLTFLoader().setPath( './data/models/glb/' );
        

        let counter = 0;
        for (let i = 0; i < values.length; i++) {
            
            let route = values[i];
            this.loader_glb.load( route, function ( gltf ) {
					
                let gltf_mesh = gltf.scene
                let animations = gltf.animations;
                let mixer = new THREE.AnimationMixer( gltf_mesh );

                let idleAction = mixer.clipAction( animations[ 0 ] );
                let char_animations = [idleAction];
                gltf_mesh.name = keys[i];
                gltf_mesh.position.x += .25*(i+1) * (-1)**i;
                this.importSkins(gltf_mesh,gltf_mesh.name);
                this.generateHairs(gltf_mesh, gltf_mesh.name, false);
                counter ++;
                //stop loading screen when all models are loaded
                this.avatars.push({name: keys[i],model: gltf_mesh, mixer: mixer, char_animations: char_animations});
                if (counter >= 6 ) this.swap_visibility();

                
                              
            }.bind(this) );
        }  
    }

    //fn to manage the avatar's avaliable hairs, sets the hairs to invisible except for the avatars base one
    generateHairs(mesh,name, ismain){

        
        function getChildrenByName(object, name) {
            let childrenArray = [];
            object.traverse(function(child) {
              if (child.name.includes(name)) {
                childrenArray.push(child);
              }
            });
            return childrenArray;
        }
        let availiable_hairs = getChildrenByName(mesh,"Hair");      
        
        for (let i = 0; i < availiable_hairs.length; i++) {
            const hair = availiable_hairs[i];
            if ( hair.name != "Hair_"+name.toLowerCase()) hair.visible = false;
            if(hair.children.length >0){//case when hair is composed
                for (let i = 0; i < hair.children.length; i++) {
                    let i_hair = hair.children[i];
                    i_hair.material.default_color = i_hair.material.color.clone();
                }
            }else{
            hair.material.default_color = hair.material.color.clone();    
            }
    
            if ( ismain) this.hairs.push({name: hair.name, hair: hair});
            
        }
    }

    //Fn to import the skins for the skin swapping
    importSkins(mesh, name){

        let skin = {name: name}
        let parts = ["Face", "Left_Arm", "Right_Arm"]//parts that are included in the skin change
        for (let i = 0; i < parts.length; i++) {
            
            let blend = this.getPart(mesh, parts[i]);
            skin[parts[i]] = blend.material;
        }
        this.skins.push(skin);

    }

    //fn to emtpy avtars from the scene
    emptyScene(){
        for (let index = (this.scene.children.length -1); index >= 0; index--) {
            const element = this.scene.children[index];    
            if(element.type == "Object3D" || element.type =="Group") this.scene.children[index].visible = false; 
        }
    }

    //fn to set the scene to have the blend character in the middle
    blend_scene(){

        let morph_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        
        if (morph_idx == -1) {
        this.clone.position.x = 0;
        this.scene.add(this.clone);
        }else{
            let morph = this.scene.children[morph_idx];	
            morph.visible = true;
        }
    }

    //retrieve the base avatar currently used
    getBlend(){
        let blend_idx =this.scene.children.findIndex(obj => obj.name.includes("Blend"));
        return this.scene.children[blend_idx];
    }

    //fn to export and download the model.
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
        function saveArrayBuffer( buffer, filename ) {

            save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

        }

        const gltfExporter = new GLTFExporter();

        const options = {
            trs: false,
            onlyVisible: true,
            binary: true,
            maxTextureSize: 4096
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

    //fn to retrive the first parent (armature) of an avatar
    getRootGroup(child){

        while(child.parent && child.parent.type != "Scene"){
            child = child.parent;
        }
        return child;
    }

    //fn to manage the facial features morphing
    blendPart(sel_obj, vertices,code, folder, type, sel_name){
        sel_obj = this.getPart_armature(sel_obj,"Face");
        let p_idx = this.getPartIdx(code);
        let mph = this.addMorph(sel_obj,vertices,code, type,sel_name);
        this.gui.addslider(folder,p_idx.morph_idx,p_idx.target_idx, sel_name, mph.mph, mph.helper_sliders, code);
        this.selection_state = "idle";
    }

    //Function to manage the flow of the application
    selection_scheduler(sel_obj, name){

        switch (this.selection_state) {
            case "base":

                this.base_name = name;
                sel_obj = this.getRootGroup(sel_obj);
                this.clone = sel_obj; //global to store the final mesh we're going to use
                let n = sel_obj.name;
                //move to create clone fn 
                this.generateHairs(this.clone,sel_obj.name, true);
                this.clone.name = sel_obj.name+"Blend";
                let face = this.getPart(this.clone,"Face");
                face.morphPartsInfo = {"Nose":[], "Chin": [], "Ears":[], "Jaw":[], "Eyes":[]}; //store each part which morphattribute it corresponds to 
                this.selection_state = "idle";

                //animation 
                let animation_idx = this.avatars.findIndex(obj => obj.name.includes(name));

                this.mixer = this.avatars[animation_idx].mixer;
                this.animations = this.avatars[animation_idx].char_animations;

                this.animations.forEach( function ( animation ) {

                    animation.play();
        
                } );
                
                //set scene to have only blend model
                this.scene.remove(sel_obj);
                this.blend_scene();
                this.gui.createMorphInspectors();

                //arays of avaliable options
                let s = this.skins.map(item => item.name).sort(function(a, b) {
                    if (a.includes(n)) {
                      return -1; // "jen" comes before any other item
                    } else if (b.includes(n)) {
                      return 1; // Any other item comes after "jen"
                    } else {
                      return a.localeCompare(b); // Sort remaining items in alphabetical order
                    }
                  });;
                let h = this.hairs.map(item => item.name).sort(function(a, b) {
                    if (a.includes(n)) {
                      return -1; // "jen" comes before any other item
                    } else if (b.includes(n)) {
                      return 1; // Any other item comes after "jen"
                    } else {
                      return a.localeCompare(b); // Sort remaining items in alphabetical order
                    }
                });;;

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
                this.blendPart(sel_obj,this.vertices["Chin"], "Chin", this.gui.sliders["Chininspector"], ["Chin"], name);
                break;
                
            case "Add Nose":
                this.blendPart(sel_obj,this.vertices["Nose"], "Nose", this.gui.sliders["Noseinspector"], ["Nose"], name);
                break;
                
            case "Add Ears":
                this.blendPart(sel_obj,this.vertices["Ears"], "Ears" , this.gui.sliders["Earsinspector"],["R_ear","L_ear"], name );
                break;
            case "Add Jaw":
                this.blendPart(sel_obj,this.vertices["Jaw"], "Jaw" , this.gui.sliders["Jawinspector"],["R_jaw","L_jaw"] , name);
                break;
            case "Add Eyes":
                this.blendPart(sel_obj,this.vertices["Eyes"], "Eyes" , this.gui.sliders["Eyesinspector"],["L_eye", "R_eye"], name );
                break;
                
            default:
                break;
        }
    }

}

let app = new App();
app.init();

window.global = {app:app};
export { app };