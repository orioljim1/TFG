class GUI {

    constructor(global) {
    
        this.global = global;
        this.sliders = {}; //to store the blending sliders widgets ( different inspectors)
        this.general_inspector = new LiteGUI.Inspector();
        this.skin_inspector = new LiteGUI.Inspector();
        this.eyes_inspector = null;
        this.hair_inspector = new LiteGUI.Inspector();

        this.info_inspector = null;
        this.create(global);
        this.info_panel = null;
        this.t = null;
        this.inspectors = [];
    }

    //generate the gui istance
    create() {
        
        //this.global = glb;
        LiteGUI.init(); 
        
        // Create main area
        this.mainArea = new LiteGUI.Area({id: "mainarea", content_id:"canvasarea", height: "calc( 100% - 31px )", main: true, display: "none"});
        LiteGUI.add( this.mainArea );
        
        this.mainArea.onresize = window.onresize;
        
        this.createSidePanel()

        this.info_inspector = new LiteGUI.Inspector();
        this.info_panel = this.info_inspector.addInfo(null, "Welcome to the avatar creation app! Please select the main character you want to work on, this character will serve as a base and you will be able to add modifications to it! ", {id:"ip",color: "red"});
        this.sidePanel.add(  this.info_inspector); 
        this.t = this.info_panel;
        
        
    }

    //fn to replace the info panel text
    changeInfoPanel(str){
       
        document.querySelectorAll('.winfo')[0].innerHTML = str;

    }


    createSidePanel() {
        this.mainArea.split("horizontal", [null,"300px"], true);
        let docked = new LiteGUI.Panel("sidePanel", {title: 'Blending Characters', scroll: true, height:'100vh'});
        this.mainArea.getSection(1).add( docked );
        $(docked).bind("closed", function() { this.mainArea.merge(); });
        this.sidePanel = docked;
        
        docked.content.id = "main-this.inspector-content";
        docked.content.style.width = "100%";              
    }

    //function to create all the sections for the morphing options
    createMorphInspectors(){
        let parts = ["Nose", "Chin", "Ears", "Jaw", "Eyes"];

        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            this.sliders[part+"inspector"] = new LiteGUI.Inspector();
            this.global.test = this.sliders[part+"inspector"];
            if(part == "Eyes") this.eyes_inspector = this.sliders[part+"inspector"]; 
            this.sliders[part+"inspector"].addSection(part);
            this.sliders[part+"inspector"].add("button","", "Add target", { callback: (v) => {
                this.global.selection_state = "Add "+part;
                let p_idx = this.global.getPartIdx(part);
                this.displayOptionsDialog(this.global.avatars,"Select an avatar for the morph of the" + part +":" ,p_idx.names);
            }});
            this.sidePanel.add(  this.sliders[part+"inspector"] );
            
            this.InspectorToggle(this.sliders[part+"inspector"]);
            
        }

        this.changeInfoPanel("Now you can select any part of the face and select the target model you want to do the morphing with. Use the sliders to control how much morphing you want for each model! :)")
    }

    //function to only allow one inspector to be opened at the same time
    InspectorToggle(inspector){

        this.inspectors.push( inspector);
        let element = inspector.current_section;
        element.classList.toggle("collapsed");
        let seccont = element.querySelector(".wsectioncontent");
        seccont.style.display = seccont.style.display === "none" ? null : "none";    
        element.sectiontitle.addEventListener("click",function(e) {
            if(e.target.localName == "button" ) 
                return;
            for (let i = 0; i < this.inspectors.length; i++) {
                let el = this.inspectors[i];
                el = el.current_section;
                if (el == element) continue;
                el.classList.toggle("collapsed");
                let seccont = el.querySelector(".wsectioncontent");
                seccont.style.display =  "none";                   
            }
                            
        }.bind(this) );
    }

    //buttons for exportation and site reset
    createExportBtn(){

        let rBtn = this.general_inspector.addButton(null, "Export Model", { callback: v => {
            this.global.exportGLTF(this.global.getBlend());
        }})

        let tb = this.general_inspector.addButton(null, "Reset all", { callback: v => {
            //location.reload()
            console.log( this.global.camera)
           console.log( this.global.camera.toJSON())
        }})

        this.sidePanel.add(  this.general_inspector);
    }

    //fn to create the section for skin recoloring and swapping
    createSkinWidgets(values){


        this.skin_inspector.addSection("Skins");

        this.skin_inspector.addCombo("Swap skins", "current", { thumbnail : true,values: values ,callback: v => {
            this.global.changeSkin(v);
        }})

        this.skin_inspector.addColor("Color picker", [1,1,1],{ callback: (v) => {
            this.global.RGBskin(v);
        }});

        this.skin_inspector.addButton(null, "Reset Skin", { callback: v => {
            this.global.RGBskin([1,1,1]);
        }})

        this.sidePanel.add(  this.skin_inspector);

        this.InspectorToggle(this.skin_inspector)

    }

    //fn to add eyes recoloring
    createEyesWidgets(){


        this.eyes_inspector.addColor("Color picker", [1,1,1],{ callback: (v) => {
            this.global.RGBeyes(v);
        }});

        this.eyes_inspector.addButton(null, "Reset Eyes", { callback: v => {
            this.global.RGBeyes([1,1,1]);
            
        }});

        this.sidePanel.add(  this.eyes_inspector);

        this.InspectorToggle(this.eyes_inspector)

    }

    //fn to add the section for hair swapping and recoloring
    createHairWidgets(values){

        this.hair_inspector.addSection("Hair");

        this.hair_inspector.addCombo("Swap hairs", "current", { thumbnail : true, values: values ,callback: v => {
            this.global.changeHair(v);
        }})

        this.hair_inspector.addColor("Color picker", [1,1,1],{ callback: (v) => {
            this.global.RGBHair(v);
        }});

        this.hair_inspector.addButton(null, "Reset Hair", { callback: v => {
            this.global.RGBHair("reset");
            
        }});

        this.sidePanel.add(  this.hair_inspector);

        this.InspectorToggle(this.hair_inspector)

    }

    //fn to add sliders when a new morph is added by the user
    addslider(slider,morph_idx, target_idx, target_name, morph, helper_sliders,code) {
        
        slider.addSlider(target_name, 0, { callback: function(v) { 
            
            v *= 0.7;
            if( this.global.scene.children[morph_idx].children.length > 0 ){
                morph.morphTargetInfluences[target_idx]  =  v;
            }else{
            this.global.scene.children[morph_idx].morphTargetInfluences[target_idx]  =  v;
            }
            if(helper_sliders != undefined){ //  this is for multi meshes morph e.g eyes need to morph also eyelashes and eyeballs
            for (let i = 0; i < helper_sliders.length; i++) {
                let element = helper_sliders[i];
                element.mesh.morphTargetInfluences[element.idx]= v;
            }}

            //Multiple morph correction --> this is done becouse good results are achieved by limiting that all the weights of the morphs sum to 1
            let p_idx = this.global.getPartIdx(code);
            let part_array = p_idx.type_array.map(obj => obj.id);
            let value_sum = 0 ; 
            for (let i = 0; i < part_array.length; i++) {
                const element = part_array[i] -1;
                value_sum +=    morph.morphTargetInfluences[element]; 
            }

            if(value_sum > 0.7){
            let sum = 0;
            for (let i = 0; i < part_array.length; i++) {
                const element = part_array[i] -1;
                let new_val = Math.min(.7,morph.morphTargetInfluences[element]/value_sum);
                //if( new_val > .7) new_val *=.7
                morph.morphTargetInfluences[element] = new_val ; 
                sum += new_val;
            }

        }}.bind(this)} )
     }    

    //fn that manages the avatar selection pop-up menu
    displayOptionsDialog(avatars, label, used_avatars)
    {
       // if(used_avatars.length >= (avatars.length -1)) return
        let values = avatars.map(obj => obj.name)
        // Create a new dialog
        let dialog = new LiteGUI.Dialog('Avatar selector', { title:label, close: true, minimize: false, scroll: true, resizable: true, draggable: true });
        this.mainArea.content.appendChild(dialog.root);
        dialog.root.style.height = "110%";
        dialog.root.style.width = "100.3%";
        dialog.root.style.opacity = "90%";

        // Create a collection of widgets
        let widgets = new LiteGUI.Inspector();
        for(let i = 0; i < values.length; i++){

            if (values[i] == this.global.base_name || used_avatars.includes(values[i]) ) continue;
            widgets.addImageButton(values[i], null, {
                className: "avatarbutt",
                type: "image",
                image: "./data/images/"+values[i].toLowerCase() +".PNG",
                callback: function(v, e) { 
                    
                    dialog.close();
                    let avatar = avatars[avatars.findIndex(obj => obj.name.includes(values[i]))].model;

                    this.global.selection_scheduler(avatar,values[i]);

                }.bind(this)
            } )
        }
        widgets.root.id = "avatarcontainer";
        dialog.root.classList.add("grid");
        dialog.add(widgets);
        dialog.show();
    }
}  



export { GUI };
