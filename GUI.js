class GUI {

    constructor(global) {
        console.log(global);

        this.global = global;

        this.sliders = {};
        this.general_inspector = null;
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

        this.general_inspector = new LiteGUI.Inspector();
        let rBtn = this.general_inspector.addButton(null, "Export Model", { callback: v => {
            this.global.exportGLTF(this.global.getBlend());
        }})
        this.sidePanel.add(  this.general_inspector);
    }


    addslider(slider,morph_idx, target_idx, tag) {
        
        slider.addSlider(tag, 0, { callback: (v) => {
            
            if( this.global.scene.children[morph_idx].children.length > 0 ){
                let face_idx =this.global.scene.children[morph_idx].children.findIndex(obj => obj.name.includes("Face"));
                this.global.scene.children[morph_idx].children[face_idx].morphTargetInfluences[target_idx]  =  v;
            }else{
            this.global.scene.children[morph_idx].morphTargetInfluences[target_idx]  =  v;
            }

        }});

        // slider.add("slider", "Chin1", 0, {min: 0, max: 1, step: 0.01, callback: (v) => {
            
        //     if( this.global.scene.children[morph_idx].children.length > 0 ){
        //         let face_idx =this.global.scene.children[morph_idx].children.findIndex(obj => obj.name.includes("Face"));
        //         this.global.scene.children[morph_idx].children[face_idx].morphTargetInfluences[target_idx]  =  v;
        //     }else{
        //     this.global.scene.children[morph_idx].morphTargetInfluences[target_idx]  =  v;
        //     }

        // }});
     //     //let earsSection = this.inspector.sections.find((s) => s.name === "Ears");
    //   console.log(this.inspector);
    //     if (earsSection) {
    //       earsSection.addSlider("Slider Label", 50, { min: 0, max: 100 }, (value) => {
    //         console.log("Slider value: " + value);
    //       });
    //     }
     }
}  

export { GUI };
