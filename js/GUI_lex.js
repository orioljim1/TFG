
class GUI {

    constructor(global) {
    
        this.global = global;
        this.sliders = {}; //to store the blending sliders widgets ( different inspectors)
        this.general_inspector = null //new LiteGUI.Inspector();
        this.skin_inspector = null //new LiteGUI.Inspector();
        this.eyes_inspector = null;
        this.hair_inspector = null //new LiteGUI.Inspector();
        this.side_panel = null;
        this.info_inspector = null;
        this.info_panel = null;
        this.t = null;
        this.inspectors = [];
        this.create();
        
    }


    create() {

        let c = document.getElementById('loading-screen');
        c.classList.toggle('hidden')
                
        // Create main area
        this.mainArea =  LX.init();        
        this.mainArea.onresize = window.onresize;
        
        this.createSidePanel()

        // this.info_inspector = new LiteGUI.Inspector();
        // this.info_panel = this.info_inspector.addInfo(null, "Welcome to the avatar creation app! Please select the main character you want to work on, this character will serve as a base and you will be able to add modifications to it! ", {id:"ip",color: "red"});
        // this.sidePanel.add(  this.info_inspector); 
        // this.t = this.info_panel
    }

    createSidePanel() {
        this.mainArea.split({sizes:["75%","25%"]});
        let [left,right] = this.mainArea.sections;
        left.root.id = "canvasarea";
        this.side_panel = right;             
    }


    createTools(){
        const main_tabs = this.side_panel.addTabs();
        let morph_panel = new LX.Panel();
        let hair_panel = new LX.Panel();
        let skin_panel = new LX.Panel();
        let eye_color_panel = new LX.Panel();
        this.createMorphTabs(morph_panel);
        this.createHairTab(hair_panel);
        this.createSkinTab(skin_panel);
        this.createEyeTab(eye_color_panel);
        main_tabs.add("SKIN", skin_panel);
        main_tabs.add("HAIR", hair_panel);
        main_tabs.add( "EYE COLOR", eye_color_panel);
        main_tabs.add( "MORPH", morph_panel );
    }

    createMorphTabs(panel){


        //panel.clear();

        panel.branch("Morph", {icon: "fa-solid fa-table-list"});


        let parts = ["Nose", "Chin", "Ears", "Jaw", "Eyes"];
        let tabs = []

        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            //this.sliders[part+"inspector"] = new LiteGUI.Inspector();
            let tab = {name: part+"inspector", icon: null, callback:null};

            // if(part == "Eyes") this.eyes_inspector = this.sliders[part+"inspector"];
            
            // this.sliders[part+"inspector"].addSection(part);
            // this.sliders[part+"inspector"].add("button","", "Add target", { callback: (v) => {
            //     
            // }});
            
            tab.callback = (p, content) => {
                p.addTitle(part +" morph");
                let k = 0;
                p.addButton(null, "Add target", function(v, e) {

                    this.global.selection_state = "Add "+part;
                    let p_idx = this.global.getPartIdx(part);
                    this.displayOptionsDialog(this.global.avatars,"Select an avatar for the morph of the" + part +":" ,p_idx.names);
                    p.queue(content);
                    p.addProgress( part + " influence"+ k, 0, { min: 0, max: 1, showValue: true, editable: true, callback: (value, event) => {} });
                    p.clearQueue();
                    k++;
                }.bind(this));
            };  
            tabs.push(tab);          
        }

        panel.addText(null, "Widgets below are out the tabs", null, { disabled: true })
        panel.addTabs(tabs);
    }

    createHairTab(panel){

        panel.branch("Hairs", {icon: "fa-solid fa-table-list"});

        let names =['Cleo', 'Jack', 'Eden', 'Jen', 'Sakura', 'Boss']; //temp measure
        let options = [];
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            let option = {value: name, src: "./data/images/"+ name.toLowerCase() +".PNG"}
            options.push(option);
        }

        panel.addDropdown("Swap hair", options, options[0].value, (value, event) => {
        
        console.log("wow");
        console.log(value);
        }, {filter:true});

        panel.addColor("Hair color", [1, 1, 1], (value, event) => {
            console.log("C: ", value);
        },{useRGB: true});

    }

    createSkinTab(panel){

        panel.addBlank(12);
        panel.branch("Skin", {icon: "fa-solid fa-table-list"});

        let names =['Cleo', 'Jack', 'Eden', 'Jen', 'Sakura', 'Boss']; //temp measure
        let options = [];
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            let option = {value: name, src: "./data/images/"+ name.toLowerCase() +".PNG"}
            options.push(option);
        }

        panel.addDropdown("Swap skin", options, options[0].value, (value, event) => {
        
        console.log("wow");
        console.log(value);
        }, {filter:true});

        panel.addColor("Skin color", [1, 1, 1], (value, event) => {
            this.global.RGBskin(value);
        },{useRGB: true});

    }

    createEyeTab(panel){

        panel.addBlank(12);
        panel.addColor("Eye color", [1, 1, 1], (value, event) => {
            this.global.RGBeyes(value);
        },{useRGB: true});

    }

    //fn that manages the avatar selection pop-up menu
    displayOptionsDialog(avatars, label, used_avatars)
    {
        
        let values = avatars.map(obj => obj.name).sort();
        // Create a new dialog
        // let dialog = new LiteGUI.Dialog('Avatar selector', { title:label, close: true, minimize: false, scroll: true, resizable: true, draggable: true });
        // this.mainArea.content.appendChild(dialog.root);
        // dialog.root.style.height = "110%";
        // dialog.root.style.width = "100.3%";
        // dialog.root.style.opacity = "90%";

        // // Create a collection of widgets
        // let widgets = new LiteGUI.Inspector();
        // for(let i = 0; i < values.length; i++){

        //     if (values[i] == this.global.base_name || used_avatars.includes(values[i]) ) continue;
        //     widgets.addImageButton(values[i], null, {
        //         className: "avatarbutt",
        //         type: "image",
        //         image: "./data/images/"+values[i].toLowerCase() +".PNG",
        //         callback: function(v, e) { 
                    
        //             dialog.close();
        //             let avatar = avatars[avatars.findIndex(obj => obj.name.includes(values[i]))].model;

        //             this.global.selection_scheduler(avatar,values[i]);

        //         }.bind(this)
        //     } )
        // }
        // widgets.root.id = "avatarcontainer";
        // dialog.root.classList.add("grid");
        // dialog.add(widgets);
        // dialog.show();
        let avatar = avatars[avatars.findIndex(obj => obj.name.includes(values[0]))].model;
        this.global.selection_scheduler(avatar,values[0]);
    }


}

export { GUI };
