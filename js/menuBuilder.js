ItemDef = function(itemname){
    this.prop = {
        name: itemname,
        rect: {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            alignx: 0,
            alignx: 0,
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
        decordate: false,
    }

    this.draw = () =>{

    }

}


function loop(){
    requestAnimationFrame(loop);
}

const itemDefs = [];
var selectedItemDef;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

requestAnimationFrame(loop);


window.onload = () =>{
    //setup event listeners for text area
}

document.getElementById("newitemdef").addEventListener("click", () =>{
    newItemDef();
})

//create a new item def
newItemDef = () =>{
    selectedItemDef = itemDefs.length;
    itemDefs.push(new ItemDef("item_"+itemDefs.length));
    updateItemDefOptions(selectedItemDef);
}

//update the options side bar for items defs
updateItemDefOptions = (num) =>{
    for(var option in itemDefs[num].prop){



        const elm = document.getElementById(option);
        if(elm != null){
            if (elm.className == "optionstextbox") {
                elm.innerHTML = "";
                elm.appendChild(document.createTextNode(itemDefs[num].prop[option]));
            }
            if (elm.className == "optioncheckbox"){
                elm.checked = itemDefs[num].prop[option] == 1 ? true : false;
            }
            if (elm.className == "optionselectbox"){
                for (let i = 0; i < elm.length; i++) {
                    if (elm[i].value == itemDefs[num].prop[option]){
                        elm[i].selected = "selected";
                    }
                    
                }
            }
        }
        
    }

}

