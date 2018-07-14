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

    this.draw = () =>{
        ctx.fillText(this.options.rect, 10, 10);
    }
}

MenuDef = function(menuName){
    this.prop = {
        name: itemname,
        rect: {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
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

    }
    this.options = {
        name: true,
        rect: true,
        visible: true,
        border: false,
        bordersize: false,
        onOpen: true,
        onClose: true,
        onESC: true,
    }

    this.itemDefList = [];

    this.draw = () =>{

    }
}

//animation loop
function loop(){
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for(var i = 0; i< itemDefs.length; i++){
        itemDefs[i].draw();
    }
}



//on windows loaded
window.onload = () =>{
    //setup event listeners for text area
    itemDefEventListeners();
}
//create a new itemdef
document.getElementById("newitemdef").addEventListener("click", () =>{
    newItemDef();
})

//add event listeners to all itemdef option boxes
itemDefEventListeners = () =>{

    for(var option in new ItemDef("x").prop){
        const elm = document.getElementById(option + "_item");
        if (elm != null) {
            setEventListenerEnable(elm, option);
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

        function setEventListenerEnable(element, op){
            //enabled check box listeners
            var enablebox = document.getElementById(op + "_enable");
            if (enablebox != null) {
                enablebox.addEventListener("change", (event) => {
                    if (selectedItemDef != null) {
                        itemDefs[selectedItemDef].options[op] = !itemDefs[selectedItemDef].options[op];
                        updateItemDefOptions(selectedItemDef);
                    }
                })
            }
        }
        function setEventListenerInputs(element, id2){
            
            //input box listeners
            if (element.className == "optioncheckbox") {
                element.addEventListener("change", (event) => {
                    if (selectedItemDef != null) {
                        var tkn = event.target.id.split("_");
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][tkn[0]] = event.target.checked == true ? 1 : 0;
                        }else{
                            itemDefs[selectedItemDef].prop[tkn[0]] = event.target.checked == true ? 1 : 0;
                        }
                    }
                })
            }
            if (element.className == "optionstextbox"){
                element.addEventListener("input", (event) =>{
                    if (selectedItemDef != null){
                        var tkn = event.target.id.split("_");
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][tkn[0]] = event.target.value;
                        }
                        else{
                            itemDefs[selectedItemDef].prop[tkn[0]] = event.target.value;
                        }
                    }
                })
            }
            if (element.className == "optionnumberbox"){
                element.addEventListener("input", (event) =>{
                    if(selectedItemDef != null){
                        var tkn = event.target.id.split("_");
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][tkn[0]] = event.target.value;
                        }
                        else{
                            itemDefs[selectedItemDef].prop[tkn[0]] = event.target.value;
                        }
                    }
                })
            }
            if (element.className == "optionselectbox"){
                element.addEventListener("change", (event) =>{
                    if(selectedItemDef != null){
                        var tkn = event.target.id.split("_");
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][tkn[0]] = event.target.value;
                        }
                        else{
                            itemDefs[selectedItemDef].prop[tkn[0]] = event.target.value;
                        }
                    }
                })
            }
        }
    }
}

//create a new item def
newItemDef = () =>{
    //256 max itemdef per menudef
    if(itemDefs.length == 256){
        alert("You can not have not then 256 ItemDef's");
        return;
    }
    selectedItemDef = itemDefs.length;
    itemDefs.push(new ItemDef("item_"+itemDefs.length));
    updateItemDefOptions(selectedItemDef);
}

//update the options side bar for items defs
updateItemDefOptions = (num) =>{
    //loop though all itemdef options
    for(var option in itemDefs[num].prop){
        //get the element with the same id
        const elm = document.getElementById(option + "_item");
        if(elm != null){
            //if the element has multiple inputs
            if (elm.className == "multitext") {
                var tag1 = [];
                var tag2 = [];
                var tkn = []
                //this wont work if select tag is before input tags
                //get inputs from there tag names
                tag1 = elm.getElementsByTagName("input");
                tag2 = elm.getElementsByTagName("select");
                //create an array including all the input boxes
                for(var i = 0; i<tag1.length; i++){
                    tkn.push(tag1[i]);
                }
                for (var i = 0; i < tag2.length; i++) {
                    tkn.push(tag2[i]);
                }
                var index = 0;
                //for each inputbox we set the value
                for (var option2 in itemDefs[num].prop[option]){     
                    setElmValue(tkn[index], itemDefs[num].prop[option][option2], itemDefs[num].options[option], option);
                    index++;
                }
            }
            else{
                setElmValue(elm, itemDefs[num].prop[option], itemDefs[num].options[option], option);
            }
        } 
        function setElmValue(element, val, enabled, optionname) {
            //enabled check box
            var enabledbox = document.getElementById(optionname + "_enable");
            if (enabledbox != null) enabledbox.checked = enabled;
            element.disabled = !enabled;

            if (element.className == "optionstextbox") {
                element.innerHTML = "";
                element.appendChild(document.createTextNode(val));
                
            }
            if (element.className == "optioncheckbox") {
                element.checked = val == 1 ? true : false;
            }
            if (element.className == "optionselectbox") {
                for (let i = 0; i < element.length; i++) {
                    if (element[i].value == val) {
                        element[i].selected = "selected";
                    }
                }
            }
            if (element.className == "optionnumberbox") {
                element.value = val;
            }
        }
    }
}

const itemDefs = [];
var selectedItemDef;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

requestAnimationFrame(loop);

//fix blurryness
//textbox value does not update on new itemdef if textbox contains text

