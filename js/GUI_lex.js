
class GUI {

    constructor(global) {
    
        this.global = global;
        this.sliders = {}; //to store the blending sliders widgets ( different inspectors)
        this.general_inspector = null //new LiteGUI.Inspector();
        this.skin_inspector = null //new LiteGUI.Inspector();
        this.eyes_inspector = null;
        this.hair_inspector = null //new LiteGUI.Inspector();

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
        //this.sidePanel.branch("Morph");

        // var side_bottom_panel = rbottom.addPanel();
        // fillRightBottomPanel( side_bottom_panel, 'Vertical' );
        this.createMorphTabs(this.sidePanel);
        //this.sidePanel.tab("Another tab");
        this.sidePanel.addButton(null, "Click me, Im Full Width...");
        
        const branch = null//this.sidePanel.current_branch;
        //this.sidePanel.tab("tab2");
        // this.sidePanel.addDropdown("Best Engine", ["Godot", "Unity", "Unreal Engine"], "Godot", (value, event) => {

        //     this.sidePanel.queuedContainer = branch;
        //     this.sidePanel.addButton();
        //     delete this.sidePanel.queuedContainer;
        //     console.log(value);
        // });

        this.sidePanel.merge();
        //console.log(this.sidePanel.branches[0].addButton());

        //docked.content.id = "main-this.inspector-content";
        //docked.content.style.width = "100%";              
    }

    createMorphTabs(panel){


        panel.clear();

        panel.branch("Morph", {icon: "fa-solid fa-table-list"});


        let parts = ["Nose", "Chin", "Ears", "Jaw", "Eyes"];
        let tabs = {}

        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            //this.sliders[part+"inspector"] = new LiteGUI.Inspector();
            let tab = {name: part+"inspector", icon: null, callback:null};

            // if(part == "Eyes") this.eyes_inspector = this.sliders[part+"inspector"];
            
            // this.sliders[part+"inspector"].addSection(part);
            // this.sliders[part+"inspector"].add("button","", "Add target", { callback: (v) => {
            //     this.global.selection_state = "Add "+part;
            //     let p_idx = this.global.getPartIdx(part);
            //     this.displayOptionsDialog(this.global.avatars,"Select an avatar for the morph of the" + part +":" ,p_idx.names);
            // }});
            
            tab.callback = p => {
                p.addTitle(Part +" morph");
                panel.addButton(null, "Add target avatar", (value, event) => {
                    panel.queue( branch.content );
                    panel.addButton(null, "Hello");
                    panel.clearQueue();
                });
            };            
        }

        panel.addText(null, "Widgets below are out the tabs", null, { disabled: true })


        panel.addTabs([
            { 
                name: "Nose morph",
                callback: (p, content)  => {
                    const k = p.content;
                    
                    let ref= p;
                    p.addTitle("aaaaaaa");
                    p.addButton(null, "Add target", function(v, e) { 

                        
                        //const branch = p.getBranch("Morph");
                        p.queue(content);
                        console.log("****",ref);
                        p.addText("test", "text");
                        //p.addProgress("Morph influence", 0, { min: 0, max: 1, showValue: true, editable: true, callback: (value, event) => {} });
                        p.clearQueue();

    
                    }.bind(this));



                    // const branch = panel.getBranch("Information");
                    // panel.queue( branch.content );
                    // panel.addButton(null, "Hello");
                    // panel.clearQueue();
                    
                }
            },
            { 
                name: "Chin morph",
                icon: null,
                callback: (p, content)  => {
                    const k = p.content;
                    
                    let ref= p;
                    p.addTitle("aaaaaaa");
                    p.addButton(null, "Add target", function(v, e) { 

                        
                        //const branch = p.getBranch("Morph");
                        p.queue(content);
                        console.log("****",ref);
                        p.addText("test", "text");
                        //p.addProgress("Morph influence", 0, { min: 0, max: 1, showValue: true, editable: true, callback: (value, event) => {} });
                        p.clearQueue();

    
                    }.bind(this));



                    // const branch = panel.getBranch("Information");
                    // panel.queue( branch.content );
                    // panel.addButton(null, "Hello");
                    // panel.clearQueue();
                    
                }
            },
            { 
                name: "Jaw morph",
                icon: "fa-brands fa-github",
                callback: p => {
                    p.addTitle("Github tab");
                    p.addButton(null, "Go", () => {window.open("https://github.com/jxarco/lexgui.js/")});
                }
            }
        ]);
    }

    //fn that manages the avatar selection pop-up menu
    displayOptionsDialog(avatars, label, used_avatars)
    {
        
    //    // if(used_avatars.length >= (avatars.length -1)) return
    //     let values = avatars.map(obj => obj.name).sort();
    //     // Create a new dialog
    //     let dialog = new LiteGUI.Dialog('Avatar selector', { title:label, close: true, minimize: false, scroll: true, resizable: true, draggable: true });
    //     this.mainArea.content.appendChild(dialog.root);
    //     dialog.root.style.height = "110%";
    //     dialog.root.style.width = "100.3%";
    //     dialog.root.style.opacity = "90%";

    //     // Create a collection of widgets
    //     let widgets = new LiteGUI.Inspector();
    //     for(let i = 0; i < values.length; i++){

    //         if (values[i] == this.global.base_name || used_avatars.includes(values[i]) ) continue;
    //         widgets.addImageButton(values[i], null, {
    //             className: "avatarbutt",
    //             type: "image",
    //             image: "./data/images/"+values[i].toLowerCase() +".PNG",
    //             callback: function(v, e) { 
                    
    //                 dialog.close();
    //                 let avatar = avatars[avatars.findIndex(obj => obj.name.includes(values[i]))].model;

    //                 this.global.selection_scheduler(avatar,values[i]);

    //             }.bind(this)
    //         } )
    //     }
    //     widgets.root.id = "avatarcontainer";
    //     dialog.root.classList.add("grid");
    //     dialog.add(widgets);
    //     dialog.show();
    }


}

export { GUI };
