(function () {

     //   BUGS   //
    /*
        fullscreen alignment needs to stretch itemdef
        change how image colour overlay is applied
        load image from itemdef background name
        make snapgrid smoother -- make it work properly when zoomed in
    */

    //   FEATURES TO ADD   //
    /*
        add deroration warning, you want decoration on everything but buttons with action
        add way to deselect
        save progress
        console showing onopen / onclose / onesc text
        import menu files
        import header files
        support definitions
        default shader list
        add exec keys
    */
    //  VARIABLES   //  
    var currentScreenImage = "screen_image_1";
    var showScreenImage = true;
    var toggleOutline = true;
    var zoomAmount = 1;
    var selectedMenuDef;
    var backgroundImage = [];
    var mouseClickFlag = false;
    var gridSnap = 1;
    var buttonWarning = true;
    var guideLines;
    const menuDefs = [];
    const screenSize = {
        x: 640,
        y: 480
    }
    //720x480 16:10
    //853x480 16:9
    //640*480 4:3
    const oldMousePos = {
        x: 0,
        y: 0
    }
    const menuCanvas = document.getElementById("canvas");
    const ctx = menuCanvas.getContext("2d");
    const screen = document.getElementById("screencanvas");
    const screenctx = screen.getContext("2d");

    menuCanvas.width = 0;
    menuCanvas.height = 0;
    screen.width = screenSize.x;
    screen.height = screenSize.y;

    requestAnimationFrame(loop);

    //  CLASSES     //
    ItemDef = function(itemname){
        this.prop = {
            name: itemname,
            rect: {
                x: 100,
                y: 100,
                width: 100,
                height: 100,
                alignx: 0,
                aligny: 0,
            },
            style: 1,
            backcolor:  {
                r: 1,
                g: 0.25,
                b: 0.25,
                a: 1,
            },
            forecolor: {
                r: 0.25,
                g: 1,
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
                b: 1,
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
            action: "play \"mouse_click\" ;",
            onFocus: "",
            leaveFocus: "",
            mouseEnter: "play \"mouse_over\";",
            mouseExit: "",
            decoration: 1,
        }
        this.options = {
            name: true,
            rect: true,
            style: true,
            backcolor: true,
            forecolor: true,
            visible: true,
            exp: false,
            border: true,
            bordersize: true,
            bordercolor: true,
            type: true,
            text: true,
            textscale: true,
            textstyle: true,
            textalign: true,
            textalignx: true,
            textaligny: true,
            background: false,
            action: false,
            onFocus: false,
            leaveFocus: false,
            mouseEnter: false,
            mouseExit: false,
            decoration: false,
        }

        this.textBlink = true;
        this.textBlinkAlpha = 1;

        this.menuDefIndex;

        this.drawPos = {
            x: 0,
            y: 0
        }

        this.draw = () =>{

            if(this.options.exp){
                if(this.prop.exp == ""){
                    alert("Menu will not compile with empty exp value!");
                    this.prop.exp = "text(\"temp text \")";
                    updateOptions();
                    return;
                }
            } 

            if (buttonWarning && this.prop.type != 1 && (this.options.action || this.options.onFocus || this.options.leaveFocus || this.options.mouseEnter || this.options.mouseExit)){
                if (confirm("action, onFocus, leaveFocus, mouseEnter, mouseExit, will not work if type is not equal to \"ITEM_TYPE_BUTTON\".\n")){
                    buttonWarning = false;
                }
                else{
                    buttonWarning = true;
                }
            }

            if(this.options.visible){
                if(!this.prop.visible){
                    return;
                }
            }
            else {return;}
            const menu = menuDefs[selectedMenuDef];
            if (this.options.rect) {
                var xoffset = 0;
                var yoffset = 0;
                var x = 0;
                var y = 0;

                //HORIZONTAL_ALIGN_SUBLEFT
                if (this.prop.rect.alignx == 0) {
                    xoffset = ((screenSize.x - 640) / 2) + menu.prop.rect.x ;
                }
                //HORIZONTAL_ALIGN_LEFT
                if(this.prop.rect.alignx == 1){
                    xoffset = menuDefs[selectedMenuDef].prop.rect.x;
                }
                //HORIZONTAL_ALIGN_CENTER
                if(this.prop.rect.alignx == 2){
                    xoffset = menuCanvas.width/2;
                }
                //HORIZONTAL_ALIGN_RIGHT
                if (this.prop.rect.alignx == 3) {
                    xoffset = screen.width;
                }
                //HORIZONTAL_ALIGN_FULLSCREEN
                //not finished
                if (this.prop.rect.alignx == 4) {
                    alert("Not currently supported");
                    this.prop.rect.alignx = 1;
                    updateOptions();
                }
                //VERTIAL_ALIGN_SUBTOP
                if(this.prop.rect.aligny == 0){
                    yoffset = ((screenSize.y - 480)/2) + menu.prop.rect.y;  
                }
                //VERTICAL_ALIGN_TOP
                if(this.prop.rect.aligny == 1){
                    yoffset = menuDefs[selectedMenuDef].prop.rect.y;
                }
                //VERTICAL_ALIGN_CENTER
                if(this.prop.rect.aligny == 2){
                    yoffset = menu.prop.rect.height / 2;
                }
                //VERTICAL_ALIGN_BOTTOM
                if(this.prop.rect.aligny == 3){
                    yoffset = screen.height;
                }
                //VERTICAL_ALIGN_FULLSCREEN
                //not finished
                if (this.prop.rect.aligny == 4) {
                    alert("Not currently supported");
                    this.prop.rect.aligny = 1;
                    updateOptions();
                }

                if (menu.options.border && menu.options.bordercolor) {
                    x = this.prop.rect.x + menu.prop.bordersize + xoffset;
                    y = this.prop.rect.y + menu.prop.bordersize + yoffset;
                }
                else {
                    x = this.prop.rect.x + xoffset;
                    y = this.prop.rect.y + yoffset;
                }
                if (this.options.border && this.options.bordercolor && this.prop.border != 0){
                    x += this.prop.bordersize + 5;
                    y += this.prop.bordersize + 5;
                }
                
                x *= zoomAmount;
                y *= zoomAmount;

                this.drawPos.x = x;
                this.drawPos.y = y;

                const image = new Image();

                end: if(this.options.background && this.prop.backcolor != ""){
                    for(var i = 0; i<backgroundImage.length; i++){
                        if(backgroundImage[i].name.split(".")[0] == this.prop.background){
                            image.src = backgroundImage[i].src;
                            break end;
                        }  
                    }
                    image.src = "images/default.png";
                }

                
                //text seems to disapear when hovering over rectangle
                //align left goes from left to right
                //align center alignes text in center
                //align right goes right to left

                drawText = () =>{
                    if (this.options.text && this.prop.text != "") {
                        var font = 37;
                        var fontx = x;
                        var fonty = y - 10;
                        if(this.options.textscale){
                            font = this.prop.textscale*37;
                        }
                        if (this.options.border && this.options.bordercolor && this.prop.border != 0){
                            fontx += this.prop.bordersize;
                            fonty += this.prop.bordersize;
                        }
                        if(this.options.textalignx){
                            fontx += this.prop.textalignx;
                        }
                        if(this.options.textaligny){
                            fonty += this.prop.textaligny;
                        }
                        font *= zoomAmount;
                        ctx.font = "" + font + "px Arial";

                        if(this.options.textalign){
                            if(this.prop.textalign == 0){
                                ctx.textAlign = "left";
                            }
                            else if(this.prop.textalign == 1){
                                ctx.textAlign = "center";
                                fontx += (this.prop.rect.width/2) * zoomAmount;
                            }
                            else if(this.prop.textalign == 2){
                                ctx.textAlign = "right";
                                fontx += this.prop.rect.width * zoomAmount;
                            }
                        }

                        if (this.options.textstyle && this.options.forecolor && this.prop.textstyle == 3){
                            ctx.fillStyle = "rgba(0,0,0,"+this.prop.forecolor.a+")";
                            ctx.fillText(this.prop.text, fontx+1, fonty+1);
                        }
                        if (this.options.textstyle && this.options.forecolor && this.prop.textstyle == 1) {
                            //blinking could be improved
                            if (this.textBlink){
                                if(this.textBlinkAlpha >= this.prop.forecolor.a){
                                    this.textBlink = false;
                                    return;
                                }
                                this.textBlinkAlpha += 0.01;
                            }
                            else{
                                if (this.textBlinkAlpha <= this.prop.forecolor.a/1.3){
                                    this.textBlink = true;
                                    return;
                                }
                                this.textBlinkAlpha -= 0.01;
                            }
                            ctx.fillStyle = "rgba(" + convertColour(this.prop.forecolor.r) + "," + convertColour(this.prop.forecolor.g) + "," + convertColour(this.prop.forecolor.b) + "," + this.textBlinkAlpha + ")";
                            ctx.fillText(this.prop.text, fontx, fonty);
                            return;
                        }
                        else {
                            if (this.options.forecolor) {
                                ctx.fillStyle = "rgba(" + convertColour(this.prop.forecolor.r) + "," + convertColour(this.prop.forecolor.g) + "," + convertColour(this.prop.forecolor.b) + "," + this.prop.forecolor.a + ")";
                            }
                            else {
                                ctx.fillStyle = "rgba(255,255,255,1)";
                            }
                            ctx.fillText(this.prop.text, fontx, fonty);
                        }
                        
                        
                        
                    } 
                }

                drawRect = () =>{
                    if (this.options.style) {
                        if (this.prop.style == 1 || this.prop.style == 3) {
                            if (this.options.background) {
                                if (this.prop.style == 1) {
                                    //draw image wth backcolour overlay
                                    if (this.options.backcolor) {
                                        if (this.options.border && this.options.bordercolor && this.prop.border != 0) {
                                            ctx.drawImage(image, x, y, (this.prop.rect.width - this.prop.bordersize) * zoomAmount, (this.prop.rect.height - this.prop.bordersize) * zoomAmount);
                                            ctx.fillStyle = "rgba(" + convertColour(this.prop.backcolor.r) + "," + convertColour(this.prop.backcolor.g) + "," + convertColour(this.prop.backcolor.b) + "," + 0.5 + ")";
                                            ctx.fillRect(x, y, (this.prop.rect.width - this.prop.bordersize) * zoomAmount, (this.prop.rect.height - this.prop.bordersize) * zoomAmount);
                                        }
                                        else {
                                            ctx.drawImage(image, x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);
                                            ctx.fillStyle = "rgba(" + convertColour(this.prop.backcolor.r) + "," + convertColour(this.prop.backcolor.g) + "," + convertColour(this.prop.backcolor.b) + "," + 0.5 + ")";
                                            ctx.fillRect(x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);
                                        }
                                    }
                                    else {
                                        ctx.fillStyle = "rgba(0,0,0,1)";
                                        if (this.options.border && this.options.bordercolor && this.prop.border != 0) {
                                            ctx.fillRect(x, y, (this.prop.rect.width - this.prop.bordersize) * zoomAmount, (this.prop.rect.height - this.prop.bordersize) * zoomAmount);
                                        }
                                        else {
                                            ctx.fillRect(x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);
                                        }
                                    }
                                }
                                else if (this.prop.style == 3) {
                                    //draw image with forcolour overlay
                                    if (this.options.border && this.options.bordercolor && this.prop.border != 0) {
                                        ctx.drawImage(image, x, y, (this.prop.rect.width - this.prop.bordersize) * zoomAmount, (this.prop.rect.height - this.prop.bordersize) * zoomAmount);
                                        if (this.options.forecolor) {
                                            ctx.fillStyle = "rgba(" + convertColour(this.prop.forecolor.r) + "," + convertColour(this.prop.forecolor.g) + "," + convertColour(this.prop.forecolor.b) + "," + 0.5 + ")";
                                            ctx.fillRect(x, y, (this.prop.rect.width - this.prop.bordersize) * zoomAmount, (this.prop.rect.height - this.prop.bordersize) * zoomAmount);
                                        }
                                    }
                                    else {
                                        ctx.drawImage(image, x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);
                                        if (this.options.forecolor) {
                                            ctx.fillStyle = "rgba(" + convertColour(this.prop.forecolor.r) + "," + convertColour(this.prop.forecolor.g) + "," + convertColour(this.prop.forecolor.b) + "," + 0.5 + ")";
                                            ctx.fillRect(x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);
                                        }
                                    }
                                }
                            }
                            else {
                                if (this.options.backcolor && this.prop.style == 1) {
                                    ctx.fillStyle = "rgba(" + convertColour(this.prop.backcolor.r) + "," + convertColour(this.prop.backcolor.g) + "," + convertColour(this.prop.backcolor.b) + "," + this.prop.backcolor.a + ")";
                                    if (this.options.border && this.options.bordercolor && this.prop.border != 0) {
                                        ctx.fillRect(x, y, (this.prop.rect.width - this.prop.bordersize) * zoomAmount, (this.prop.rect.height - this.prop.bordersize) * zoomAmount);
                                    }
                                    else {
                                        ctx.fillRect(x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);
                                    }
                                }
                            }

                        }
                    }
                }

                drawRect();
                if (this.options.border && this.options.bordercolor && this.prop.border != 0) {
                    var bordersize = 1;
                    if (this.options.bordersize) {
                        bordersize = this.prop.bordersize;
                    }
                    if (this.prop.border != 0) {
                        var colour = {
                            r: this.prop.bordercolor.r,
                            g: this.prop.bordercolor.g,
                            b: this.prop.bordercolor.b,
                            a: this.prop.bordercolor.a,
                        }
                        //border are offset by 5 px in game for some reason
                        drawBorder(x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount, bordersize * zoomAmount, this.prop.border, colour);
                    }
                }
                drawText();
            }
            else { return; }
            //if style = 1 and there is a background, draw background but wiht backcolour overlayed
            //if ^ and no backcolour but background, draw black
            //if style = 3 and no background draw default texture. If there is a background draw image with forcolor overlayed
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
            blurworld: 0,
            border: 1,
            bordersize: 10,
            bordercolor: {
                r: 1,
                g: 0,
                b: 0,
                a: 1,
            },
            onOpen: "",
            onClose: "",
            onESC: "close self;",
        }
        this.options = {
            name: true,
            rect: true,
            blurworld: true,
            border: true,
            bordersize: true,
            bordercolor: true,
            onOpen: true,
            onClose: true,
            onESC: true,
        }

        this.itemDefList = [];
        this.selectedItemDef;

        this.draw = () =>{
            const xoffset = ((screenSize.x-640)/2)*zoomAmount;
            if(this.options.visible){
                if(!this.prop.visible){
                    menuCanvas.style.display = "none";
                    return;
                }
                else{
                    menuCanvas.style.display = "block";
                }
            }
            if(!this.options.rect){
                menuCanvas.width = 0 * zoomAmount;
                menuCanvas.height = 0 * zoomAmount;   
            }
            else{
                
                menuCanvas.width = screenSize.x * zoomAmount;
                menuCanvas.height = screenSize.y * zoomAmount;
                screen.width = screenSize.x * zoomAmount;
                screen.height = screenSize.y * zoomAmount;           

            }
            if(this.options.blurworld){
                screenctx.filter = "blur("+ this.prop.blurworld*0.5 +"px)";
            }
            if(this.options.border && this.options.bordercolor){
                var bordersize = 1;
                if(this.options.bordersize){
                    bordersize = this.prop.bordersize;
                }
                if(this.prop.border != 0){
                    var colour = {
                        r: this.prop.bordercolor.r,
                        g: this.prop.bordercolor.g,
                        b: this.prop.bordercolor.b,
                        a: this.prop.bordercolor.a,
                    }

                    drawBorder(this.prop.rect.x + xoffset, this.prop.rect.y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount, bordersize*zoomAmount, this.prop.border, colour);
                }
            }

            drawSelectorLines = () => {
                if (this.selectedItemDef != undefined) {
                    const def = this.itemDefList[this.selectedItemDef];
                    if (def == undefined) { return; }
                    ctx.beginPath();
                    ctx.strokeRect(def.drawPos.x - 5, def.drawPos.y - 5, (def.prop.rect.width * zoomAmount) + 10, (def.prop.rect.height * zoomAmount) + 10);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillRect(def.drawPos.x + (def.prop.rect.width * zoomAmount), def.drawPos.y + (def.prop.rect.height * zoomAmount),  10,  10);
                }
            }

            for (var i = 0; i < this.itemDefList.length; i++) {
                this.itemDefList[i].draw();
            }   
            drawGuideLines();
            drawSelectorLines();
        }
    }

    //  EVENT LISTENERS //
    window.onload = () => {
        browserCheck();
        optionsEventListeners();

        document.getElementById("newitemdef").addEventListener("click", () => {
            newItemDef();
        })
        //create a new menuDef
        document.getElementById("newmenudef").addEventListener("click", () => {
            newMenuDef();
        })
        //zoom in
        document.getElementById("zoomin").addEventListener("click", () => {
            zoomAmount += 0.1;
        })
        //zoom out
        document.getElementById("zoomout").addEventListener("click", () => {
            zoomAmount -= 0.1;
        })
        //toggle screen image
        document.getElementById("imagetoggle").addEventListener("click", () => {
            showScreenImage = !showScreenImage;
        })
        //toggle canvas outlines
        document.getElementById("outlinetoggle").addEventListener("click", () => {
            if (toggleOutline) {
                screen.style.borderWidth = "0px";
                menuCanvas.style.borderWidth = "0px";
            }
            else {
                screen.style.borderWidth = "2px";
                menuCanvas.style.borderWidth = "2px";
            }
            toggleOutline = !toggleOutline;

        })
        document.getElementById("screenratio").addEventListener("click", () => {
            screenSize.x = screenSize.x == 640 ? 720 : screenSize.x == 720 ? 853 : 640;
            currentScreenImage = currentScreenImage == "screen_image_1" ? "screen_image_2" : currentScreenImage == "screen_image_2" ? "screen_image_3" : "screen_image_1";
        })
        document.getElementById("uploadbackground").addEventListener("change", (e) =>{
            var reader = new FileReader();
            reader.onload = () =>{
                if (e.target.files[0] == undefined){return;}
                backgroundImage.push(new Image());
                backgroundImage[backgroundImage.length - 1].src = event.target.result;
                backgroundImage[backgroundImage.length - 1].name = e.target.files[0].name;
                updateImageTable();
            }
            reader.readAsDataURL(e.target.files[0]); 
        })
        document.getElementById("gridsnap").addEventListener("input", (e) =>{
            gridSnap = parseInt(event.target.value);
        })
        document.addEventListener("keydown", (e) =>{
            if(selectedMenuDef == undefined){return;}
            if (menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef] == undefined) return;
            const rect = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef].prop.rect;
            if(document.activeElement.nodeName == "BODY")
            {
                switch (e.keyCode) {
                    //left arrow
                    case 37:
                        rect.x -= gridSnap;
                        updateOptions();
                        break;
                    //up arrow
                    case 38:
                        rect.y -= gridSnap;
                        updateOptions();
                        break;
                    //right arrow
                    case 39:
                        rect.x += gridSnap;
                        updateOptions();
                        break;
                    //down arrow
                    case 40:
                        rect.y += gridSnap;
                        updateOptions();
                        break;
                    //delete
                    case 46:
                        deleteItemDef(menuDefs[selectedMenuDef].selectedItemDef);
                        break;
                    //space
                    case 32:
                        const copy = cloneDef(menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef], "itemDef");
                        menuDefs[selectedMenuDef].selectedItemDef = menuDefs[selectedMenuDef].itemDefList.length - 1;
                        menuDefs[selectedMenuDef].itemDefList.push(copy);
                        updateOptions();
                        updateItemDefTable();
                        break;
                    default:
                        break;
                }
            }
            
        })
        document.getElementById("guidelines").addEventListener("click", () =>{
            guideLines = !guideLines
        })
        
        menuCanvas.addEventListener("mousedown", (event) => {
            const cvn = canvas.getBoundingClientRect();
            oldMousePos.x = event.clientX - cvn.left;
            oldMousePos.y = event.clientY - cvn.top;
            mouseClickFlag = true;
        })
        document.addEventListener("mouseup", () =>{
            mouseClickFlag = false;
        })
        menuCanvas.addEventListener("mousemove", (event) => {
            const cvn = canvas.getBoundingClientRect();
            if (mouseClickFlag){
                const mousepos = {
                    x: event.clientX - cvn.left,
                    y: event.clientY - cvn.top
                }
                animateRect(mousepos, event);
            }
            
        })

        const colourPickers = document.querySelectorAll("input[type='color']")
        for (var i = 0; i < colourPickers.length; i++){
            colourPickers[i].addEventListener("change", (e) => {
                setColour(e.target.id, e.target.value);
            })
        }

    }

    //  FUNCTIONS   //

    //animation loop
    function loop(){
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if(menuDefs.length != 0){
            menuDefs[selectedMenuDef].draw();
        }  

        //we redraw the image incase a blur has been applied
        if (showScreenImage) {
            screenctx.clearRect(0, 0, screen.width, screen.height);
            var img = document.getElementById(currentScreenImage);
            screenctx.drawImage(img, 0, 0, screen.width, screen.height);
        }
        else {
            screenctx.clearRect(0, 0, screen.width, screen.height);
        }
    }

    setColour = (id, colour) =>{
        if(selectedMenuDef == undefined){return;}
        const rgb = hexToRgb(colour);
        const tkn = id.split("_");
        const div = tkn[0] + "_" + tkn[1];
        const menu = menuDefs[selectedMenuDef];
        const item = menu.itemDefList[menu.selectedItemDef];
        inputs = document.getElementById(div).querySelectorAll(".optionnumberbox");
        for(var i = 0; i<inputs.length-1; i++){
            if(i == 0){
                if(tkn[1] == "item" && item){
                    item.prop[tkn[0]].r = parseFloat((rgb.r / 255)).toFixed(3); continue; 
                }
                else if(tkn[1] == "menu"){
                    menu.prop[tkn[0]].r = parseFloat((rgb.r / 255)).toFixed(3); continue; 
                }  
            }
            if(i == 1){
                if (tkn[1] == "item" && item) {
                    item.prop[tkn[0]].g = parseFloat((rgb.g / 255)).toFixed(3); continue;
                }
                else if (tkn[1] == "menu") {
                    menu.prop[tkn[0]].g = parseFloat((rgb.g / 255)).toFixed(3); continue;
                }  
            } 
            if(i == 2){
                if (tkn[1] == "item" && item) {
                    item.prop[tkn[0]].b = parseFloat((rgb.b / 255)).toFixed(3); continue;
                }
                else if (tkn[1] == "menu") {
                    menu.prop[tkn[0]].b = parseFloat((rgb.b / 255)).toFixed(3); continue;
                }  
            }
        }
        updateOptions();
    }

    hexToRgb = (hex) => {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    //moving rects around
    animateRect = (mousepos, event) =>{
        if (menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef] == undefined) return;
        const rect = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef].prop.rect;
        const item = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef];

        if (mousepos.x > item.drawPos.x + (rect.width * zoomAmount) && mousepos.x < item.drawPos.x + (rect.width * zoomAmount) + 30 && mousepos.y > item.drawPos.y + (rect.height * zoomAmount) && mousepos.y < item.drawPos.y + (rect.height*zoomAmount) + 30){
            rect.width += mousepos.x - oldMousePos.x;
            rect.height += mousepos.y - oldMousePos.y;
        }
        else{
            //snapping
            const xval = rect.x + (mousepos.x - oldMousePos.x);
            const yval = rect.y + (mousepos.y - oldMousePos.y);
            //check if pos needs to be rounded up or down
            rect.x = (xval % gridSnap) > gridSnap / 2 ? Math.ceil(xval / gridSnap) * gridSnap : Math.floor(xval / gridSnap) * gridSnap;
            rect.y = (yval % gridSnap) > gridSnap / 2 ? Math.ceil(yval / gridSnap) * gridSnap : Math.floor(yval / gridSnap) * gridSnap;
        }
        
    
        const cvn = canvas.getBoundingClientRect();
        oldMousePos.x = event.clientX - cvn.left;
        oldMousePos.y = event.clientY - cvn.top;
        updateOptions();
    }

    //draw guide lines
    drawGuideLines = () => {
        if (guideLines) {
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.fillRect(0, (menuCanvas.height / 2) - 1, menuCanvas.width, 2);
            ctx.fillRect((menuCanvas.width / 2) - 1, 0, 2, menuCanvas.height);
        }
    }
    //stuff doesnt work on edge and cba to test on safari
    browserCheck = () =>{
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        var isEdge = !isIE && !!window.StyleMedia;
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
        if(isEdge || isSafari){
            alert("This website may not work properly on your browser. Please use the latest version of chrome or firefox instead.");
        }
    }

    //draw border function
    drawBorder = (x,y, width, height, bsize, type, colour) =>{

        //full
        if(type == 1){
            ctx.fillStyle = "rgba(" + convertColour(colour.r) + "," + convertColour(colour.g) + "," + convertColour(colour.b) + "," + colour.a + ")";
            drawBottom(true);
            drawTop(true);
            drawLeft(true);
            drawRight(true);

        }
        //horizontal
        else if(type == 2){
            ctx.fillStyle = "rgba(" + convertColour(colour.r) + "," + convertColour(colour.g) + "," + convertColour(colour.b) + "," + colour.a + ")";
            //top
            drawTop(false);
            drawBottom(false);
        }
        //vertical
        else if(type == 3){
            ctx.fillStyle = "rgba(" + convertColour(colour.r) + "," + convertColour(colour.g) + "," + convertColour(colour.b) + "," + colour.a + ")";
            //left
            drawLeft(false);
            drawRight(false);
        }
        //raised / sunked
        else if(type == 5 || type == 6){
            if(type == 5){
                ctx.fillStyle = "rgba(" + convertColour(colour.r) + "," + convertColour(colour.g) + "," + convertColour(colour.b) + "," + colour.a + ")";
            }
            else{
                ctx.fillStyle = "rgba(" + convertColour(colour.r) / 3 + "," + convertColour(colour.g) / 3 + "," + convertColour(colour.b) / 3 + "," + colour.a + ")";
            }
            drawTop(true);
            drawLeft(true);
            if (type == 6) {
                ctx.fillStyle = "rgba(" + convertColour(colour.r) + "," + convertColour(colour.g) + "," + convertColour(colour.b) + "," + colour.a + ")";
            }
            else {
                ctx.fillStyle = "rgba(" + convertColour(colour.r) / 3 + "," + convertColour(colour.g) / 3 + "," + convertColour(colour.b) / 3 + "," + colour.a + ")";
            }
            drawBottom(true);
            drawRight(true);
        }
        function drawLeft(angle){
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + height);
            //angle corners if border is aligned with another border
            if(angle){
                ctx.lineTo(x + bsize, (y + height) - bsize);
                ctx.lineTo(x + bsize, y + bsize);
            }
            else{
                ctx.lineTo(x+bsize, y+height);
                ctx.lineTo(x+bsize, y);
            } 
            ctx.fill();
        }
        function drawTop(angle){
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            if(angle){
                ctx.lineTo((x + width) - bsize, y + bsize);
                ctx.lineTo(x + bsize, y + bsize);
            }
            else{
                ctx.lineTo(x+width, y+bsize);
                ctx.lineTo(x, y+bsize);
            }  
            ctx.fill();
        }
        function drawRight(angle){
            ctx.beginPath();
            ctx.moveTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            if(angle){
                ctx.lineTo((x + width) - bsize, (y + height) - bsize);
                ctx.lineTo((x + width) - bsize, y + bsize);
            }
            else{
                ctx.lineTo((x+width) - bsize, y+height);
                ctx.lineTo((x+width) - bsize, y);
            }
            ctx.fill();
        }
        function drawBottom(angle) {
            ctx.beginPath();
            ctx.moveTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            if(angle){
                ctx.lineTo((x + width) - bsize, (y + height) - bsize);
                ctx.lineTo(x + bsize, (y + height) - bsize);
            }
            else{
                ctx.lineTo(x+width, (y+height) - bsize);
                ctx.lineTo(x, (y + height) - bsize);
            }
            ctx.fill();
        }  
    }

    //convert colours to 0-255 rgb number
    convertColour = (x) =>{
        return x*255;
    }

    //create a new menuDef
    newMenuDef = () =>{

        //think this is the limit 
        if (menuDefs.length == 640) {
            alert("You can not have not then 640 MenuDef's");
            return;
        }
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

    updateImageTable = () =>{
        const table = document.getElementById("imagelist");
        table.innerHTML = "";
        for(var i = 0; i<backgroundImage.length; i++){
            const tr = document.createElement("tr");
            const name = document.createElement("td");
            name.style.color = "#fff";
            name.appendChild(document.createTextNode(backgroundImage[i].name.split(".")[0]));

            const td = document.createElement("td");
            const img = document.createElement("img");
            img.style.width = "100px";
            img.style.height = "100px";
            img.src = backgroundImage[i].src;
            td.appendChild(img);

            const td2 = document.createElement("td");
            const del = document.createElement("button");
            del.type = "button";
            del.id = "imageslistid_"+i;
            del.appendChild(document.createTextNode("Delete"));
            del.addEventListener("click", (event) =>{
                const id = event.target.id.split("_");
                backgroundImage.splice(id[1], 1);
                updateImageTable();
            })
            td2.appendChild(del);

            tr.appendChild(name);
            tr.appendChild(td);
            tr.appendChild(td2);
            table.appendChild(tr);
        }

    }

    updateMenuDefTable = () =>{
        const table = document.getElementById("menudeflist");
        table.innerHTML = "";
        for(var i = 0; i<menuDefs.length; i++){
            const tr = document.createElement("tr");
            const name = document.createElement("td");
            if (i == selectedMenuDef){
                name.className = "selected";
            }
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
                updateMenuDefTable();//update this table to update the coloured text
                updateItemDefTable();
            })
            select.appendChild(button1);

            const cpy = document.createElement("td");
            const button3 = document.createElement("button");
            button3.type = "button";
            button3.id = "menudefcopy_" + i;
            button3.appendChild(document.createTextNode("Copy"));
            button3.addEventListener("click", (event) =>{
                //menuDefs[selectedMenuDef]
                const copy = cloneDef(menuDefs[selectedMenuDef], "menuDef");
                selectedMenuDef = menuDefs.length;
                menuDefs.push(copy);
                updateOptions();
                updateMenuDefTable();
            })
            cpy.appendChild(button3);

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
            tr.appendChild(cpy);
            tr.appendChild(del);
            table.appendChild(tr);
        }
    }

    cloneDef = (def, type) =>{
        var clone;
        if(type == "menuDef"){
            clone = new MenuDef("menu_" + menuDefs.length);
            for (op in def.prop) {
                if (op != "name") {
                    if (typeof clone.prop[op] != "object") {
                        
                        clone.prop[op] = def.prop[op];
                    }
                    else {
                        for (op2 in def.prop[op]) {
                            clone.prop[op][op2] = def.prop[op][op2];
                        }
                    }
                }
                clone.options[op] = def.options[op];
            }
            for (var i = 0; i < def.itemDefList.length; i++){
                clone.itemDefList.push(cloneItem(def.itemDefList[i]));
                clone.selectedItemDef = clone.itemDefList.length - 1;
            }  
        }
        else{
            clone = cloneItem(def);
        }
        function cloneItem(def){
            var item = new ItemDef(def.prop.name);
            for(op in def.prop){
                if (typeof item.prop[op] != "object") {
                    item.prop[op] = def.prop[op];
                }   
                else{
                    for(op2 in def.prop[op]){
                        item.prop[op][op2] = def.prop[op][op2];
                    }
                }
                item.options[op] = def.options[op];
            }
            return item;
        }
        return clone;
    }

    updateItemDefTable = () =>{
        const table = document.getElementById("itemdeflist");
        table.innerHTML = "";
        if(menuDefs.length != 0){
            for (var i = 0; i < menuDefs[selectedMenuDef].itemDefList.length; i++){
                const def = menuDefs[selectedMenuDef].itemDefList[i];
                const tr = document.createElement("tr");
                const name = document.createElement("td");
                if (i == menuDefs[selectedMenuDef].selectedItemDef){
                    name.className = "selected";
                }
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
                    updateItemDefTable();
                })
                select.appendChild(button1);

                const cpy = document.createElement("td");
                const button3 = document.createElement("button");
                button3.type = "button";
                button3.id = "menudefcopy_" + i;
                button3.appendChild(document.createTextNode("Copy"));
                button3.addEventListener("click", (event) => {
                    const copy = cloneDef(menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef], "itemDef");
                    menuDefs[selectedMenuDef].selectedItemDef = menuDefs[selectedMenuDef].itemDefList.length - 1;
                    menuDefs[selectedMenuDef].itemDefList.push(copy);
                    updateOptions();
                    updateItemDefTable();
                })
                cpy.appendChild(button3);

                const del = document.createElement("td");
                const button2 = document.createElement("button");
                button2.type = "button";
                button2.id = "itemdefdeleted_" + i;
                button2.appendChild(document.createTextNode("Delete"));
                button2.addEventListener("click", (event) => {
                    const id = event.target.id.split("_");
                    deleteItemDef(id[1]);
                })
                del.appendChild(button2)

                const down = document.createElement("td");
                const button4 = document.createElement("button");
                button4.type = "button";
                button4.id = "itemdefdown_" + i;
                button4.appendChild(document.createTextNode("Move down"));
                button4.addEventListener("click", (event) =>{
                    const id = parseInt(event.target.id.split("_")[1]);
                    if(id == 0)return;
                    const temp = menuDefs[selectedMenuDef].itemDefList[id-1];
                    menuDefs[selectedMenuDef].itemDefList[id-1] = menuDefs[selectedMenuDef].itemDefList[id]
                    menuDefs[selectedMenuDef].itemDefList[id] = temp;
                    updateItemDefTable();
                })
                down.appendChild(button4);

                const up = document.createElement("td");
                const button5 = document.createElement("button");
                button5.type = "button";
                button5.id = "itemdefup_" + i;
                button5.appendChild(document.createTextNode("Move up"));
                button5.addEventListener("click", (event) =>{
                    const id = parseInt(event.target.id.split("_")[1]);
                    if (id == menuDefs[selectedMenuDef].itemDefList.length-1) return;
                    const temp = menuDefs[selectedMenuDef].itemDefList[id+1];
                    menuDefs[selectedMenuDef].itemDefList[id+1] = menuDefs[selectedMenuDef].itemDefList[id]
                    menuDefs[selectedMenuDef].itemDefList[id] = temp;
                    updateItemDefTable();
                })
                up.appendChild(button5);

                tr.appendChild(name);
                tr.appendChild(select);
                tr.appendChild(cpy);
                tr.appendChild(del);
                tr.appendChild(down);
                tr.appendChild(up);
                table.appendChild(tr);
            }
        }
        
    }

    deleteItemDef = (id) =>{
        menuDefs[selectedMenuDef].itemDefList.splice(id, 1);
        if (menuDefs[selectedMenuDef].itemDefList.length != 0) {
            menuDefs[selectedMenuDef].selectedItemDef = menuDefs[selectedMenuDef].itemDefList.length - 1;
            updateOptions();
        }
        else {
            menuDefs[selectedMenuDef].selectedItemDef = null;
        }
        updateItemDefTable();
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
                        cookieSave();
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
                            if (!isNaN(event.target.value)){
                                def.prop[id2][tkn[0]] = parseFloat(event.target.value);
                            }
                            else{
                                def.prop[id2][tkn[0]] = event.target.value;
                            }  
                        } else {
                            if(!isNaN(event.target.value)){
                                def.prop[tkn[0]] = parseFloat(event.target.value);
                            }
                            else{
                                def.prop[tkn[0]] = event.target.value;
                            }  
                        }
                        cookieSave();
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
                        setElmValue(tkn[index], menuDef.prop[option][option2], menuDef.options[option], option+"_menu");
                        index++;
                    }
                }
                else {
                    setElmValue(elm, menuDef.prop[option], menuDef.options[option], null);
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
                            setElmValue(tkn[index], itemDef.prop[option][option2], itemDef.options[option], option+"_item");
                            index++;
                        }
                    }
                    else {
                        setElmValue(elm, itemDef.prop[option], itemDef.options[option], null);
                    }
                }
            }
        }
        
        function setElmValue(element, val, enabled, op) {
            //enabled check box
            var enabledbox;
            if(op != null){
                enabledbox = document.getElementById(op + "_enable");
            }
            else{
                enabledbox = document.getElementById(element.id + "_enable");
            } 
            if (enabledbox != null){   
                enabledbox.checked = enabled;
            } 
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
        cookieSave();
    }

    //cookie saving
    (function (){
        cookieSave = () =>{
            var cookie = "";
            for(var i = 0; i< menuDefs.length; i++){
                var menu = ""

                cookie += menu+";";
            }
            document.cookie = cookie;
        }
    })();
    
    //menufile expoer
    (function () {
        var textFile;
        document.getElementById("export").addEventListener("click", () => {
            const string = createMenuFile();
            const file =  makeTextFile(string);
            const elm = document.createElement("a");
            elm.href = file;
            elm.download = "export.menu";
            document.body.appendChild(elm);
            elm.click();
            document.body.removeChild(elm); 
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
            text += "//This file was generated by Cod4 Menu Builder - Created by Sheep Wizard\n";
            text += "//Project Github page: https://github.com/SheepWizard/COD4-MENU-BUILDER\n";
            text += "//If you find any bugs please report them here: https://github.com/SheepWizard/COD4-MENU-BUILDER/issues \n\n";
            text += "//This header is not used in this file but is required if you want to use common definitions\n"
            text += "#include \"ui/menudef.h\"\n\n";

            text += "{\n";

            for(var i = 0; i<menuDefs.length; i++){
                text += "\tmenuDef\n\t{\n";

                for (var option in menuDefs[i].prop){
                    if(menuDefs[i].options[option] == true){
                        if(option == "onOpen" || option == "onClose" || option == "onESC"){
                            text += "\t\t" + option + "\n\t\t{\n";
                            text += "\t\t\t" + menuDefs[i].prop[option] + "\n";
                            text += "\t\t}\n";
                        }
                        else{
                            if (typeof menuDefs[i].prop[option] == "string"){
                                text += "\t\t" + option + "\t\t\t\"" + menuDefs[i].prop[option] + "\"\n";
                            }
                            else if (typeof menuDefs[i].prop[option] == "object"){
                                text += "\t\t" + option + "\t\t\t";
                                for (var item in menuDefs[i].prop[option]){
                                    text += menuDefs[i].prop[option][item] + " ";
                                }
                                text += "\n";
                            }
                            else{
                                text += "\t\t" + option + "\t\t\t" + menuDefs[i].prop[option] + "\n";
                            }    
                        }      
                    }
                }
                text += "\n\n"
                for(var z = 0; z< menuDefs[i].itemDefList.length; z++){
                    text += "\t\titemdef\n\t\t{\n";
                    for (var option in menuDefs[i].itemDefList[z].prop) {
                        if (menuDefs[i].itemDefList[z].options[option] == true){
                            if(option == "decoration"){
                                text += "\t\t\t" + option + "\n";
                            }
                            else if(option == "exp"){
                                text += "\t\t\t" + option + "\t\t\t" + menuDefs[i].itemDefList[z].prop[option] + "\n";
                            }
                            else if (option == "onFocus" || option == "leaveFocus" || option == "mouseEnter" || option == "mouseExit" || option == "action"){
                                text += "\t\t\t" + option + "\n\t\t\t{\n";
                                text += "\t\t\t\t\t" + menuDefs[i].itemDefList[z].prop[option] + "\n";
                                text += "\t\t\t}\n";
                            }
                            else{
                                if (typeof menuDefs[i].itemDefList[z].prop[option] == "string"){
                                    text += "\t\t\t" + option + "\t\t\t\"" + menuDefs[i].itemDefList[z].prop[option] + "\"\n";
                                }
                                else if (typeof menuDefs[i].itemDefList[z].prop[option] == "object"){
                                    text += "\t\t\t" + option + "\t\t\t";
                                    for (var item in menuDefs[i].itemDefList[z].prop[option]){
                                        text += menuDefs[i].itemDefList[z].prop[option][item] + " ";
                                    }
                                    text += "\n";
                                }
                                else{
                                    text += "\t\t\t" + option + "\t\t\t" + menuDefs[i].itemDefList[z].prop[option] + "\n";
                                }
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
