(function () {
    ItemDef = function(itemname){
        this.prop = {
            name: itemname,
            rect: {
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                alignx: 1,
                aligny: 1,
            },
            style: 0,
            backcolor:  {
                r: 0.25,
                g: 0.25,
                b: 0.25,
                a: 1,
            },
            forecolor: {
                r: 0.25,
                g: 0.25,
                b: 0.25,
                a: 1,
            },
            visible: 1,
            exp: "",
            border: 0,
            bordersize: 0,
            bordercolor: {
                r: 0.5,
                g: 0.5,
                b: 0.5,
                a: 1,
            },  
            type: 0,
            text: "",
            textscale: 1,
            textstyle: 0,
            textalign: 0,
            textalignx: 0,
            textaligny: 0,
            background: "",
            onFocus: "",
            leaveFocus: "",
            mouseEnter: "",
            mouseExit: "",
            decorate: 1,
        }
        this.options = {
            name: true,
            rect: true,
            style: true,
            backcolor: true,
            forecolor: false,
            visible: true,
            exp: false,
            border: false,
            bordersize: false,
            bordercolor: false,
            type: true,
            text: false,
            textscale: false,
            textalign: false,
            textalignx: false,
            textaligny: false,
            background: false,
            onFocus: false,
            leaveFocus: false,
            mouseEnter: false,
            mouseExit: false,
            decorate: true,
        }

        this.menuDefIndex;

        this.draw = () =>{
            ctx.fillText("itemdef  " + this.prop.name, 10, 10);
            if(this.options.visible){
                if(this.prop.visible){

                }
                else{return;}
            }
        }
    }

    MenuDef = function(menuName){
        this.prop = {
            name: menuName,
            rect: {
                x: 0,
                y: 0,
                width: 640,
                height: 480,
            },
            visible: 1,
            border: 1,
            bordersize: 0,
            bordercolor: {
                r: 0.5,
                g: 0.5,
                b: 0.5,
                a: 1,
            },
            onOpen: "",
            onClose: "",
            onESC: "close self;",
            //exec keys
        }
        this.options = {
            name: true,
            rect: true,
            visible: true,
            border: false,
            bordersize: false,
            bordercolor: false,
            onOpen: true,
            onClose: true,
            onESC: true,
        }

        this.itemDefList = [];
        this.selectedItemDef;

        this.draw = () =>{
            ctx.fillText("menudef  " + this.prop.name, 10, 50);
            for (var i = 0; i < this.itemDefList.length; i++) {
                this.itemDefList[i].draw();
            }     
        }
    }

    //animation loop
    function loop(){
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if(menuDefs.length != 0){
            menuDefs[selectedMenuDef].draw();
        }  
    }



    //on windows loaded
    window.onload = () =>{
        //setup event listeners for text area
        optionsEventListeners();
    }
    //create a new itemdef
    document.getElementById("newitemdef").addEventListener("click", () =>{
        newItemDef();
    })

    document.getElementById("newmenudef").addEventListener("click", () =>{
        newMenuDef();
    })

    //create a new menuDef
    newMenuDef = () =>{

        //CHECK IF THERE IS A MENUDEF LIMIT

        selectedMenuDef = menuDefs.length;
        menuDefs.push(new MenuDef("menu_"+menuDefs.length));
        updateOptions();
        updateMenuDefTable();
    }

    //create a new item def
    newItemDef = () => {  
        if(menuDefs.length == 0){
            alert("Create a menuDef first");
            return;
        }
        //256 max itemdef per menudef
        if (menuDefs[selectedMenuDef].itemDefList.length == 256) {
            alert("You can not have not then 256 ItemDef's");
            return;
        }
        menuDefs[selectedMenuDef].itemDefList.push(new ItemDef("item_" + menuDefs[selectedMenuDef].itemDefList.length));
        menuDefs[selectedMenuDef].selectedItemDef = menuDefs[selectedMenuDef].itemDefList.length-1;
        updateOptions();
        updateItemDefTable();
    }

    updateMenuDefTable = () =>{
        const table = document.getElementById("menudeflist");
        table.innerHTML = "";
        for(var i = 0; i<menuDefs.length; i++){
            const tr = document.createElement("tr");
            const name = document.createElement("td");
            name.appendChild(document.createTextNode(menuDefs[i].prop.name));

            const select = document.createElement("td");
            const button1 = document.createElement("button");
            button1.type = "button";
            button1.id = "menudefselect_" + i;
            button1.appendChild(document.createTextNode("Select"));
            button1.addEventListener("click", (event) =>{
                const id = event.target.id.split("_");        
                selectedMenuDef = id[1];
                updateOptions();
                updateItemDefTable();
            })
            select.appendChild(button1);

            const del = document.createElement("td");
            const button2 = document.createElement("button");
            button2.type = "button";
            button2.id = "menudefdelete_" + i;
            button2.appendChild(document.createTextNode("Delete"));
            button2.addEventListener("click", (event) =>{
                const id = event.target.id.split("_");
                menuDefs.splice(id[1], 1);
                if(menuDefs.length != 0){
                    selectedMenuDef = menuDefs.length-1;
                    updateOptions();
                }
                else{
                    selectedMenuDef = null;
                }    
                updateMenuDefTable();
            })
            del.appendChild(button2)

            tr.appendChild(name);
            tr.appendChild(select);
            tr.appendChild(del);
            table.appendChild(tr);
        }
    }

    updateItemDefTable = () =>{
        const table = document.getElementById("itemdeflist");
        table.innerHTML = "";
        if(menuDefs.length != 0){
            for (var i = 0; i < menuDefs[selectedMenuDef].itemDefList.length; i++){
                const def = menuDefs[selectedMenuDef].itemDefList[i];
                const tr = document.createElement("tr");
                const name = document.createElement("td");
                name.appendChild(document.createTextNode(def.prop.name));

                const select = document.createElement("td");
                const button1 = document.createElement("button");
                button1.type = "button";
                button1.id = "itemdefselected_" + i;
                button1.appendChild(document.createTextNode("Select"));
                button1.addEventListener("click", (event) => {
                    const id = event.target.id.split("_");
                    menuDefs[selectedMenuDef].selectedItemDef = id[1];
                    updateOptions();
                })
                select.appendChild(button1);

                const del = document.createElement("td");
                const button2 = document.createElement("button");
                button2.type = "button";
                button2.id = "itemdefdeleted_" + i;
                button2.appendChild(document.createTextNode("Delete"));
                button2.addEventListener("click", (event) => {
                    const id = event.target.id.split("_");
                    menuDefs[selectedMenuDef].itemDefList.splice(id[1], 1);
                    if (menuDefs[selectedMenuDef].itemDefList.length != 0) {
                        menuDefs[selectedMenuDef].selectedItemDef = menuDefs[selectedMenuDef].itemDefList.length - 1;
                        updateOptions();
                    }
                    else {
                        menuDefs[selectedMenuDef].selectedItemDef = null;
                    }
                    updateItemDefTable();
                })
                del.appendChild(button2)

                tr.appendChild(name);
                tr.appendChild(select);
                tr.appendChild(del);
                table.appendChild(tr);
            }
        }
        
    }

    //add event listeners to all itemdef option boxes
    optionsEventListeners = () =>{
        //event listeners for item
        for(var option in new ItemDef("x").prop){
            const elm = document.getElementById(option + "_item");
            if (elm != null) {
                setEventListenerEnable(elm.id, option);
                if (elm.className == "multitext"){
                    var tag1 = [];
                    var tag2 = [];
                    tag1 = elm.getElementsByTagName("input");
                    tag2 = elm.getElementsByTagName("select");
                    for (var i = 0; i < tag1.length; i++) {
                        setEventListenerInputs(tag1[i], option);
                    }
                    for (var i = 0; i < tag2.length; i++) {
                        setEventListenerInputs(tag2[i], option);
                    }
                }
                else{
                    setEventListenerInputs(elm, undefined);
                }  
            }
        }
        //event listeners for menu
        for (var option in new MenuDef("x").prop) {
            const elm = document.getElementById(option + "_menu");
            if (elm != null) {
                setEventListenerEnable(elm.id, option);
                if (elm.className == "multitext") {
                    var tag1 = [];
                    var tag2 = [];
                    tag1 = elm.getElementsByTagName("input");
                    tag2 = elm.getElementsByTagName("select");
                    for (var i = 0; i < tag1.length; i++) {
                        setEventListenerInputs(tag1[i], option);
                    }
                    for (var i = 0; i < tag2.length; i++) {
                        setEventListenerInputs(tag2[i], option);
                    }
                }
                else {
                    setEventListenerInputs(elm, undefined);
                }
            }
        }
        function setEventListenerEnable(id, option){
            //enabled check box listeners
            const enablebox = document.getElementById(id + "_enable");
            if (enablebox != null) {
                enablebox.addEventListener("change", (event) => {
                    var tkn = event.target.id.split("_");
                    var def;
                    if (tkn[1] == "menu") {
                        if (selectedMenuDef != null) {
                            def = menuDefs[selectedMenuDef];
                        }
                    }
                    else if (tkn[1] == "item") {
                        if (selectedMenuDef != null) {
                            if (menuDefs[selectedMenuDef].selectedItemDef != null) {
                                def = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef];
                            }
                        }
                    }
                    if(def != null){
                        def.options[option] = !def.options[option];
                        updateOptions();
                    }
                })
            }
        }
        function setEventListenerInputs(element, id2){        
            //input box listeners
            if (element.className == "optioncheckbox") {
                element.addEventListener("change", (event) => {
                    var tkn = event.target.id.split("_");
                    var def;
                    if(tkn[1] == "menu"){
                        if(selectedMenuDef != null){
                            def = menuDefs[selectedMenuDef];
                        }
                    }
                    else if(tkn[1] == "item"){
                        if(selectedMenuDef != null){
                            if(menuDefs[selectedMenuDef].selectedItemDef != null){
                                def = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef];
                            }
                        }
                    }
                    if(def != null){
                        if (id2 != null) {
                            def.prop[id2][tkn[0]] = event.target.checked == true ? 1 : 0;
                        }else{
                            def.prop[tkn[0]] = event.target.checked == true ? 1 : 0;
                        }
                    }
                })
            }
            if (element.className == "optionstextbox" || element.className == "optionnumberbox" || element.className == "optionselectbox"){
                element.addEventListener("input", (event) =>{
                    var tkn = event.target.id.split("_");
                    var def;
                    if (tkn[1] == "menu") {
                        if (selectedMenuDef != null) {
                            def = menuDefs[selectedMenuDef];
                        }
                    }
                    else if (tkn[1] == "item") {
                        if (selectedMenuDef != null) {
                            if (menuDefs[selectedMenuDef].selectedItemDef != null) {
                                def = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef];
                            }
                        }
                    }
                    if (def != null) {
                        if (id2 != null) {
                            def.prop[id2][tkn[0]] = event.target.value;
                        } else {
                            def.prop[tkn[0]] = event.target.value;
                        }
                    }
                    //update menuDef table
                    if(event.target.id == "name_menu"){
                        updateMenuDefTable();
                    }
                    //update itemDef table
                    if(event.target.id == "name_item"){
                        updateItemDefTable();
                    }
                })
            }

        }
    }

    //update the options side bar for items defs
    updateOptions = () =>{
        var menuDef = menuDefs[selectedMenuDef];
        for (var option in menuDef.prop){
            const elm = document.getElementById(option + "_menu");
            if (elm != null) {
                //if the element has multiple inputs
                if (elm.className == "multitext") {
                    var tag1 = [];
                    var tag2 = [];
                    var tkn = [];
                    //this wont work if select tag is before input tags
                    //get inputs from there tag names
                    tag1 = elm.getElementsByTagName("input");
                    tag2 = elm.getElementsByTagName("select");
                    //create an array including all the input boxes
                    for (var i = 0; i < tag1.length; i++) {
                        tkn.push(tag1[i]);
                    }
                    for (var i = 0; i < tag2.length; i++) {
                        tkn.push(tag2[i]);
                    }
                    var index = 0;
                    //for each inputbox we set the value
                    for (var option2 in menuDef.prop[option]) {
                        setElmValue(tkn[index], menuDef.prop[option][option2], menuDef.options[option], option);
                        index++;
                    }
                }
                else {
                    setElmValue(elm, menuDef.prop[option], menuDef.options[option], option);
                }
            }  
        }
        //get selected itemdef in menudef
        var itemDef = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef];
        //loop though all itemdef options
        if(itemDef != null){
            for (var option in itemDef.prop) {
                //get the element with the same id
                const elm = document.getElementById(option + "_item");
                if (elm != null) {
                    //if the element has multiple inputs
                    if (elm.className == "multitext") {
                        var tag1 = [];
                        var tag2 = [];
                        var tkn = [];
                        //this wont work if select tag is before input tags
                        //get inputs from there tag names
                        tag1 = elm.getElementsByTagName("input");
                        tag2 = elm.getElementsByTagName("select");
                        //create an array including all the input boxes
                        for (var i = 0; i < tag1.length; i++) {
                            tkn.push(tag1[i]);
                        }
                        for (var i = 0; i < tag2.length; i++) {
                            tkn.push(tag2[i]);
                        }
                        var index = 0;
                        //for each inputbox we set the value
                        for (var option2 in itemDef.prop[option]) {
                            setElmValue(tkn[index], itemDef.prop[option][option2], itemDef.options[option]);
                            index++;
                        }
                    }
                    else {
                        setElmValue(elm, itemDef.prop[option], itemDef.options[option]);
                    }
                }
            }
        }
        
        function setElmValue(element, val, enabled) {
            //enabled check box
            var enabledbox = document.getElementById(element.id + "_enable");
            if (enabledbox != null) enabledbox.checked = enabled;
            element.disabled = !enabled;
            if (element.className == "optioncheckbox") {
                element.checked = val == 1 ? true : false;
            }
            if (element.className == "optionselectbox") {
                for (var i = 0; i < element.length; i++) {
                    if (element[i].value == val) {
                        element[i].selected = "selected";
                    }
                }
            }
            if (element.className == "optionnumberbox" || element.className == "optionstextbox") {
                element.value = val;
            }
        }
    }

    
    const menuDefs = [];
    var selectedMenuDef;
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    requestAnimationFrame(loop);

    //fix blurryness
    //deleting menudef where there is only 2 deletes wrong one

    (function () {
        var textFile;
        document.getElementById("export").addEventListener("click", () => {
            const string = createMenuFile();
            document.getElementById("exportlink").href = makeTextFile(string);
        })

        makeTextFile = (text) => {
            var data = new Blob([text], { type: 'text/plain' });
            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile);
            }
            textFile = window.URL.createObjectURL(data);
            return textFile;
        };

        createMenuFile = () =>{
            var text = "";
            text += "//This file was generated by Menu Builder - Created by Sheep Wizard\n\n";
            text += "//This header is not used in this file but required if you want to use common definitions\n"
            text += "#include \"ui / menudef.h\"\n\n";

            text += "{\n";

            for(var i = 0; i<menuDefs.length; i++){
                text += "\tmenuDef\n\t{\n";

                for (var option in menuDefs[i].prop){
                    if(menuDefs[i].options[option] == true){
                        if(option == "onOpen" || option == "onClose" || option == "onESC"){
                            text += "\t\t" + option + "\n\t{\n";
                            text += "\t\t\t" + menuDefs[i].prop[option] + "\n";
                            text += "\t}\n";
                        }
                        else{
                            text += "\t\t" + option + "\t\t\t" + menuDefs[i].prop[option] + "\n";
                        }
                        
                    }
                }

                for(var z = 0; z< menuDefs[i].itemDefList.length; z++){
                    text += "\t\titemdef\n\t{\n";

                    for (var option in menuDefs[i].itemDefList[z].prop) {
                        if (menuDefs[i].itemDefList[z].options[option] == true){
                            if(option == "decorate"){
                                text += "\t\t\t" + option + "\n";
                            }
                            else{
                                text += "\t\t\t" + option + "\t\t\t" + menuDefs[i].itemDefList[z].prop[option] + "\n";
                            }
                        }   
                    }
                    text += "\t\t}\n";
                }
                text += "\t}\n"
            }

            text += "}\n";

            return text;
        }
    })(); 

})();
