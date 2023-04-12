class GUI {

    constructor(global) {
        console.log(global);

        this.global = global;

        this.sliders = {};
        this.create(global);
        

    }
    create(glb) {
        
        //this.global = glb;
        LiteGUI.init(); 
        this.test ="testtt";

        // Create main area
        this.mainArea = new LiteGUI.Area({id: "mainarea", content_id:"canvasarea", height: "calc( 100% - 31px )", main: true});
        LiteGUI.add( this.mainArea );
        
        this.mainArea.onresize = window.onresize;
        
        this.createSidePanel()
       
    }

    createSidePanel() {
        this.mainArea.split("horizontal", [null,"300px"], true);
        let docked = new LiteGUI.Panel("sidePanel", {title: 'Blending Characters', scroll: true, height:'100vh'});
        this.mainArea.getSection(1).add( docked );
        $(docked).bind("closed", function() { this.mainArea.merge(); });
        this.sidePanel = docked;
        
        docked.content.id = "main-this.inspector-content";
        docked.content.style.width = "100%";

        let parts = ["Nose", "Chin", "Ears"];

        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];

            this.sliders[part+"inspector"] = new LiteGUI.Inspector();
            this.sliders[part+"inspector"].addSection(part);
            this.sliders[part+"inspector"].add("button","", "Add "+ part, { callback: (v) => {
                this.global.selection_state = "Add "+part;
                let p_idx = this.global.getPartIdx("Nose");
                console.log(p_idx,this.global.clone.name);
                this.global.pick_scene(p_idx.names);
            }});
            this.sidePanel.add(  this.sliders[part+"inspector"] );
           
        }
               
    }


    addslider(slider,morph_idx, target_idx) {
        
        slider.addSlider("Chin1", 0, { callback: (v) => {
            
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
