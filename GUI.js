class GUI {

    constructor(global) {
        console.log(global);

        this.global = global;

        this.sliders = {}; //to store the blending sliders widgets ( different inspectors)
        this.general_inspector = new LiteGUI.Inspector();
        this.skin_inspector = new LiteGUI.Inspector();
        this.eyes_inspector = new LiteGUI.Inspector();
        this.hair_inspector = new LiteGUI.Inspector();

        this.info_inspector = null;
        this.create(global);
        this.info_panel = null;
        this.t = null;
    }
    create() {
        
        //this.global = glb;
        LiteGUI.init(); 
        this.test ="testtt";

        // Create main area
        this.mainArea = new LiteGUI.Area({id: "mainarea", content_id:"canvasarea", height: "calc( 100% - 31px )", main: true});
        LiteGUI.add( this.mainArea );
        
        this.mainArea.onresize = window.onresize;
        
        this.createSidePanel()

        this.info_inspector = new LiteGUI.Inspector();
        this.info_panel = this.info_inspector.addInfo(null, "Welcome to the character blending app! Please select the main character you want to work on with the rest of the models ", {id:"ip",color: "red"});
        this.sidePanel.add(  this.info_inspector); 
        this.t = this.info_panel;
        console.log("test", this.info_panel, this);
        
    }

    changeInfoPanel(str){
       
        let bb = document.querySelectorAll('.winfo')[0].innerHTML = str;

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

    createMorphInspectors(){
        let parts = ["Nose", "Chin", "Ears"];

        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            this.sliders[part+"inspector"] = new LiteGUI.Inspector();
            this.sliders[part+"inspector"].addSection(part);
            this.sliders[part+"inspector"].add("button","", "Add "+ part, { callback: (v) => {
                this.global.selection_state = "Add "+part;
                let p_idx = this.global.getPartIdx(part);
                this.global.pick_scene(p_idx.names);
            }});
            this.sidePanel.add(  this.sliders[part+"inspector"] );
        }

        this.changeInfoPanel("Now you can select any part of the face and select the target model you want to do the blending with. Use the sliders to control how much blending you want for each model! :)")
    }

    createExportBtn(){

        let rBtn = this.general_inspector.addButton(null, "Export Model", { callback: v => {
            this.global.exportGLTF(this.global.getBlend());
        }})

        let tb = this.general_inspector.addButton(null, "testbutton", { callback: v => {
            this.global.removeHair(0);
        }})


        this.sidePanel.add(  this.general_inspector);
    }

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

    }


    createEyesWidgets(){


        this.eyes_inspector.addSection("Eyes");

        this.eyes_inspector.addColor("Color picker", [1,1,1],{ callback: (v) => {
            this.global.RGBeyes(v);
        }});

        this.eyes_inspector.addButton(null, "Reset Eyes", { callback: v => {
            this.global.RGBeyes([1,1,1]);
            
        }});

        this.sidePanel.add(  this.eyes_inspector);

    }


    createHairWidgets(values){


        this.hair_inspector.addSection("Hair");


        this.hair_inspector.addCombo("Swap hairs", "current", { thumbnail : true, values: values ,callback: v => {
            this.global.removeHair(v);
        }})

        this.hair_inspector.addColor("Color picker", [1,1,1],{ callback: (v) => {
            this.global.RGBHair(v);
        }});

        this.hair_inspector.addButton(null, "Reset Hair", { callback: v => {
            this.global.RGBHair("reset");
            
        }});

        this.sidePanel.add(  this.hair_inspector);

    }


    addslider(slider,morph_idx, target_idx, tag, morph) {
        
        slider.addSlider(tag, 0, { callback: (v) => {
            
            if( this.global.scene.children[morph_idx].children.length > 0 ){
                // let face_idx =this.global.scene.children[morph_idx].children.findIndex(obj => obj.name.includes("Face"));
                // this.global.scene.children[morph_idx].children[face_idx].morphTargetInfluences[target_idx]  =  v;
                morph.morphTargetInfluences[target_idx]  =  v;
            }else{
            this.global.scene.children[morph_idx].morphTargetInfluences[target_idx]  =  v;
            }

        }});
     }    


}  

export { GUI };
