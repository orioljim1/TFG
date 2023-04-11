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
                console.log(this.global)
                this.global.test2("clo");
            }});
            this.sidePanel.add(  this.sliders[part+"inspector"] );
           
        }
               
    }


    addslider() {
        
        
        this.sliders.Chininspector .add("slider", "Chin1", 0, { callback: (v) => {
            this.global.test3(v);
        }});
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
