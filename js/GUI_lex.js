class GUI {

    constructor(global) {
    
        this.global = global;
        this.sliders = {}; //to store the blending sliders widgets ( different inspectors)
        this.general_inspector = new LiteGUI.Inspector();
        this.skin_inspector = new LiteGUI.Inspector();
        this.eyes_inspector = null;
        this.hair_inspector = new LiteGUI.Inspector();

        this.info_inspector = null;
        this.create();
        this.info_panel = null;
        this.t = null;
        this.inspectors = [];
    }


    create() {

        let c = document.getElementById('loading-screen');
        c.classList.toggle('hidden')
                
        // Create main area
        this.mainArea =  LX.init();
        console.log("thisssss", this.mainArea);
        
        this.mainArea.onresize = window.onresize;
        
        this.createSidePanel()

        // this.info_inspector = new LiteGUI.Inspector();
        // this.info_panel = this.info_inspector.addInfo(null, "Welcome to the avatar creation app! Please select the main character you want to work on, this character will serve as a base and you will be able to add modifications to it! ", {id:"ip",color: "red"});
        // this.sidePanel.add(  this.info_inspector); 
        // this.t = this.info_panel
    }

    createSidePanel() {
        this.mainArea.split({sizes:["75%","25%"]});
        var [left,right] = this.mainArea.sections;
        console.log("lefttts", left);
        left.root.id = "canvasarea";
        let docked = right.addPanel("sidePanel", {title: 'Customization tools', scroll: true, height:'100vh'});
        //right.add(docked);  
        $(docked).bind("closed", function() { this.mainArea.merge(); });
        this.sidePanel = docked;
        
        //docked.content.id = "main-this.inspector-content";
        //docked.content.style.width = "100%";              
    }


}

export { GUI };
