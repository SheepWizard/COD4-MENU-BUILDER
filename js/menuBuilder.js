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
        name: false,
        rect: false,
        style: false,
        backcolor: false,
        forecolor: false,
        visible: false,
        exp: false,
        border: false,
        bordersize: false,
        bordercolor: false,
        type: false,
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
        decorate: false,
    }

    this.draw = () =>{
        ctx.fillText(this.prop.rect.aligny, 10, 10);
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
    for(var option in  new ItemDef("x").prop){
        const elm = document.getElementById(option);
        if (elm != null) {
            if (elm.className == "multitext"){
                var tag1 = [];
                var tag2 = [];
                tag1 = elm.getElementsByTagName("input");
                tag2 = elm.getElementsByTagName("select");
                for (var i = 0; i < tag1.length; i++) {
                    setEventListener(tag1[i], elm.id);
                }
                for (var i = 0; i < tag2.length; i++) {
                    setEventListener(tag2[i], elm.id);
                }
            }
            else{
                setEventListener(elm, undefined);
            }  
        }
        function setEventListener(element, id2){
            if (element.className == "optioncheckbox") {
                element.addEventListener("change", (event) => {
                    if (selectedItemDef != null) {
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][event.target.id] = event.target.checked == true ? 1 : 0;
                        }else{
                            itemDefs[selectedItemDef].prop[event.target.id] = event.target.checked == true ? 1 : 0;
                        }
                    }
                })
            }
            if (element.className == "optionstextbox"){
                element.addEventListener("input", (event) =>{
                    if (selectedItemDef != null){
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][event.target.id] = event.target.value;
                        }
                        else{
                            itemDefs[selectedItemDef].prop[event.target.id] = event.target.value;
                        }
                    }
                })
            }
            if (element.className == "optionnumberbox"){
                element.addEventListener("input", (event) =>{
                    if(selectedItemDef != null){
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][event.target.id] = event.target.value;
                        }
                        else{
                            itemDefs[selectedItemDef].prop[event.target.id] = event.target.value;
                        }
                    }
                })
            }
            if (element.className == "optionselectbox"){
                element.addEventListener("change", (event) =>{
                    if(selectedItemDef != null){
                        if(id2 != null){
                            itemDefs[selectedItemDef].prop[id2][event.target.id] = event.target.value;
                        }
                        else{
                            itemDefs[selectedItemDef].prop[event.target.id] = event.target.value;
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
    for(var option in itemDefs[num].prop){
        const elm = document.getElementById(option);
        if(elm != null){
            if (elm.className == "multitext") {
                var tag1 = [];
                var tag2 = [];
                var tkn = []
                //this wont work is select tag is before input tags
                tag1 = elm.getElementsByTagName("input");
                tag2 = elm.getElementsByTagName("select");
                for(var i = 0; i<tag1.length; i++){
                    tkn.push(tag1[i]);
                }
                for (var i = 0; i < tag2.length; i++) {
                    tkn.push(tag2[i]);
                }
                var index = 0;
                for (var option2 in itemDefs[num].prop[option]){     
                    setElmValue(tkn[index], itemDefs[num].prop[option][option2]);
                    index++;
                }
            }
            else{
                setElmValue(elm, itemDefs[num].prop[option])
            }
        } 
        function setElmValue(element, val) {
            if (element.className == "optionstextbox") {
                //element.value = "";
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

