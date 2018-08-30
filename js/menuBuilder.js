(function () {

     //   BUGS   //
    /*
        fullscreen alignment needs to stretch itemdef
        add filter to rect drawing
        .menu import onClose is being removed from trim? confused on dis.
        text font size is a bit off
        text that contains : wont load properly
    */

    //   FEATURES TO ADD   //
    /*
        convert save/load to json
        import header files
        default shader list
        add exec keys
        editfield / slider(Image of cod4 slider?)
        .menu import add support for capital letters 
        .menu export add support for definitions (rn exports the definitions values)
        clean up .menu import (redundancy(clean up ifs), make 1 func to get ops?, make actions not need an if)
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
    var notificationsOpen = [];
    var menuVariables = new Map();
    var menuIncludes = [];
    var guideLines = false;
    var menuDefs = [];
    var unSaved = false;
    var rectResize = false;
    var projectName = "";
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
    const snapPos = {
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
                x: 0,
                y: 0,
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
            forecolor: false,
            visible: true,
            exp: false,
            border: false,
            bordersize: false,
            bordercolor: false,
            type: true,
            text: false,
            textscale: false,
            textstyle: false,
            textalign: false,
            textalignx: false,
            textaligny: false,
            background: false,
            action: false,
            onFocus: false,
            leaveFocus: false,
            mouseEnter: false,
            mouseExit: false,
            decoration: true,
        }
        
        this.buttonWarning = true;
        this.decorationWarning = true;
        this.widthHeightWarning = true;
        this.textBlink = true;
        this.textBlinkAlpha = 1;
        this.find = false;

        this.menuDefIndex;

        this.drawPos = {
            x: 0,
            y: 0
        }

        this.debugConsole = () =>{
            var fullInfo = " === ITEM INFO === " + "\nNAME: " + this.prop.name + "\nrecX: " + this.prop.rect.x + "\nrecY: " + this.prop.rect.y + "\nrecWid: " + this.prop.rect.width + "\nrecHeight: " + this.prop.rect.height
            + "\nrecAlignX: " + this.prop.rect.alignx + "\nrecAlignY: " + this.prop.rect.aligny + "\nstyle: " + this.prop.style + "\nbackcolR: " + this.prop.backcolor.r + "\nbackcolG: " + this.prop.backcolor.g
            + "\nbackcolB: " + this.prop.backcolor.b + "\nbackcolA: " + this.prop.backcolor.a + "\nforecolR: " + this.prop.forecolor.r + "\nforecolG: " + this.prop.forecolor.g + "\nforecolB: " + this.prop.forecolor.b
            + "\nforecolA: " + this.prop.forecolor.a + "\nborder: " + this.prop.border + "\nbordersize: " + this.prop.bordersize + "\nbordercolR: " + this.prop.bordercolor.r + "\nbordercolG: " + this.prop.bordercolor.g 
            + "\nbordercolB: " + this.prop.bordercolor.b + "\nbordercolA: " + this.prop.bordercolor.a +  "\nvisible: " + this.prop.visible + "\ntype: " + this.prop.type + "\ntext: " + this.prop.text + "\ntextScale: " + this.prop.textscale
            + "\ntextStyle: " + this.prop.textstyle + "\ntextAlign: " + this.prop.textalign + "\ntextAlignX: " + this.prop.textalignx + "\ntextAlignY: " + this.prop.textaligny + "\nbackground: " + this.prop.background
            + "\naction: " + this.prop.action + "\onFocus: " + this.prop.onFocus + "\nleaveFocus: " + this.prop.leaveFocus + "\nmouseEnter: " + this.prop.mouseEnter + "\nmouseExit: " + this.prop.mouseExit 
            + "\ndecoration: " + this.prop.decoration + "\n=================";
            console.log(fullInfo);
        }

        this.draw = () =>{
            if(this.options.exp){
                if(this.prop.exp == ""){
                    createNotification("Menu error", "Menu will not compile with empty exp value!");
                    this.prop.exp = "text(\"temp text \")";
                    updateOptions();
                    return;
                }
            }

            if (this.buttonWarning && this.prop.type != 1 && (this.options.action || this.options.onFocus || this.options.leaveFocus || this.options.mouseEnter || this.options.mouseExit)){
                createNotification("Menu warning", "action, onFocus, leaveFocus, mouseEnter, mouseExit, will not work if type is not equal to \"ITEM_TYPE_BUTTON\"");
                this.buttonWarning = false;
                this.prop.type = 1;
                updateOptions();
            }

            if (this.decorationWarning && this.options.action && this.prop.action != "" && this.prop.type == 1 && this.options.decoration && this.prop.decoration == 1){
                createNotification("Menu warning", "Button action will not work with decoration enabled");
                this.decorationWarning = false;
            }

            if (this.prop.rect.width < 0 || this.prop.rect.height < 0){
                if (this.widthHeightWarning){
                    createNotification("Menu Warning", "ItemDef width and height can not be negative");
                    this.widthHeightWarning = false;    
                }
                return;
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
                    xoffset = (menu.prop.rect.width / 2) + menu.prop.rect.x + (((screenSize.x - 640) / 2) * zoomAmount);
                }
                //HORIZONTAL_ALIGN_RIGHT
                if (this.prop.rect.alignx == 3) {
                    xoffset = screenSize.x;
                }
                //HORIZONTAL_ALIGN_FULLSCREEN
                //not finished
                if (this.prop.rect.alignx == 4) {
                    createNotification("Menu warning", "HORIZONTAL_ALIGN_FULLSCREEN is not currently supported");
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
                    yoffset =( menu.prop.rect.height / 2) + menu.prop.rect.y;
                }
                //VERTICAL_ALIGN_BOTTOM
                if(this.prop.rect.aligny == 3){
                    yoffset = screenSize.y;
                }
                //VERTICAL_ALIGN_FULLSCREEN
                //not finished
                if (this.prop.rect.aligny == 4) {
                    createNotification("Menu warning", "VERTICAL_ALIGN_FULLSCREEN is not currently supported");
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
                    x += this.prop.bordersize;
                    y += this.prop.bordersize;
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

                drawText = () =>{
                    if (this.options.text && this.prop.text != "") {
                        var font = 37;
                        var fontx = x;
                        var fonty = y - 10;

                        var text = this.prop.text;
                        const re = /([^\\\w])?\\n/g;
                        text = text.replace(re, "\n");
                        const textLines = text.split("\n");
                        if(this.options.textscale){
                            font = this.prop.textscale*37;
                        }
                        else{
                            font = 0.55*37;
                        }
                        if (this.options.border && this.options.bordercolor && this.prop.border != 0){
                            fontx += this.prop.bordersize;
                            fonty += this.prop.bordersize;
                        }
                        if(this.options.textalignx){
                            fontx += (this.prop.textalignx*zoomAmount);
                        }
                        if(this.options.textaligny){
                            fonty += (this.prop.textaligny*zoomAmount);
                        }
                        font *= zoomAmount;
                        ctx.font = "" + font + "px Arial";
                        const lineHeight =  font;

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
                            for (var i = 0; i < textLines.length; i++) {
                                ctx.fillText(textLines[i], fontx+1, fonty + (lineHeight * i)+1);
                            }
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
                            for (var i = 0; i < textLines.length; i++) {
                                ctx.fillText(textLines[i], fontx, fonty + (lineHeight * i));
                            }
                            return;
                        }
                        else {
                            if (this.options.forecolor) {
                                ctx.fillStyle = "rgba(" + convertColour(this.prop.forecolor.r) + "," + convertColour(this.prop.forecolor.g) + "," + convertColour(this.prop.forecolor.b) + "," + this.prop.forecolor.a + ")";
                            }
                            else {
                                ctx.fillStyle = "rgba(255,255,255,1)";
                            }
                            for (var i = 0; i < textLines.length; i++){
                                ctx.fillText(textLines[i], fontx, fonty + (lineHeight*i));
                            }
                            
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
                                        else{
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
                                        if (this.options.forecolor) {
                                            const filter = new Image();
                                            filter.src = imageFilter(image, this.prop.forecolor)
                                            ctx.drawImage(filter, x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);               
                                        }
                                        else{
                                            ctx.drawImage(image, x, y, this.prop.rect.width * zoomAmount, this.prop.rect.height * zoomAmount);
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
                drawLine = () =>{
                    ctx.beginPath();
                    ctx.moveTo((screenSize.x/2)*zoomAmount, (screenSize.y/2)*zoomAmount);
                    ctx.lineTo(this.drawPos.x, this.drawPos.y);
                    ctx.stroke();
                }
                if (this.find) { drawLine();}
                
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

        this.debugConsole = () =>{
            var fullInfo = " === MENU INFO === " + "\nNAME: " + this.prop.name + "\nrecX: " + this.prop.rect.x + "\nrecY: " + this.prop.rect.y + "\nrecWid: " + this.prop.rect.width + "\nrecHeight: " + this.prop.rect.height
            + "\nblur: " + this.prop.blurworld + "\nborder: " + this.prop.border + "\nbordersize: " + this.prop.bordersize + "\nbordercolR: " + this.prop.bordercolor.r + "\nbordercolG: " + this.prop.bordercolor.g 
            + "\nbordercolB: " + this.prop.bordercolor.b + "\nbordercolA: " + this.prop.bordercolor.a + "\nonOpen: " + this.prop.onOpen + "\nonClose: " + this.prop.onClose + "\nonESC: " + this.prop.onESC + "\n=================";
            console.log(fullInfo);
        }
        
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
        //center itemDef
        document.getElementById("finditemdef").addEventListener("click", () =>{
            if(selectedMenuDef == undefined){return;}
            if(menuDefs[selectedMenuDef].selectedItemDef == undefined){return;}
            menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef].find = !menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef].find;
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
        //toggle screen ratio
        document.getElementById("screenratio").addEventListener("click", () => {
            screenSize.x = screenSize.x == 640 ? 720 : screenSize.x == 720 ? 853 : 640;
            currentScreenImage = currentScreenImage == "screen_image_1" ? "screen_image_2" : currentScreenImage == "screen_image_2" ? "screen_image_3" : "screen_image_1";
        })
        //upload images
        document.getElementById("uploadbackground").addEventListener("change", (event) =>{  
            var files = event.target.files;
            for(var i = 0, f; f = files[i]; i++){
                if (!f.type.match('image.*')) {
                    continue;
                }
                var reader = new FileReader();
                reader.onload = (function(file){
                    return function (e) {
                        backgroundImage.push(new Image());
                        backgroundImage[backgroundImage.length - 1].src = e.target.result;
                        backgroundImage[backgroundImage.length - 1].name = file.name;
                        updateImageTable();
                    }
                })(f);
                reader.readAsDataURL(f); 
            }
        })
        //change snapgrid
        document.getElementById("gridsnap").addEventListener("input", (event) =>{
            gridSnap = parseInt(event.target.value);
        })
        //get key press
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
        //toggle drawing guide lines
        document.getElementById("guidelines").addEventListener("click", () =>{
            guideLines = !guideLines
        })

        //get click event for deselect
        window.addEventListener("click", (event) =>{
            if (event.target.id == "" && (event.target.nodeName == "BODY"/*CHROME*/ || event.target.nodeName == "HTML"/*FIREFOX*/)){
                if(selectedMenuDef != undefined){
                    menuDefs[selectedMenuDef].selectedItemDef = undefined;
                    updateItemDefTable();
                }
            }
        })

        

        menuCanvas.addEventListener("mousedown", (event) => {
            const cvn = canvas.getBoundingClientRect();
            oldMousePos.x = event.clientX - cvn.left;
            oldMousePos.y = event.clientY - cvn.top;
            mouseClickFlag = true;
            const mousepos = {
                x: (event.clientX - cvn.left),
                y: (event.clientY - cvn.top)
            }
            if (menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef] != undefined){
                const rect = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef].prop.rect;
                const item = menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].selectedItemDef];
                if (mousepos.x > item.drawPos.x + (rect.width * zoomAmount) && mousepos.x < item.drawPos.x + (rect.width * zoomAmount) + 30 && mousepos.y > item.drawPos.y + (rect.height * zoomAmount) && mousepos.y < item.drawPos.y + (rect.height * zoomAmount) + 30) {
                    rectResize = true;
                    return;
                }
            }
            rectResize = false;
            
        })
        document.addEventListener("mouseup", () =>{
            mouseClickFlag = false;
        })
        menuCanvas.addEventListener("mousemove", (event) => {
            const cvn = canvas.getBoundingClientRect();
            if (mouseClickFlag){
                const mousepos = {
                    x: (event.clientX - cvn.left),
                    y: (event.clientY - cvn.top) 
                }
                animateRect(mousepos, event);
            }
            
        })
        //event listener for colour pickers
        const colourPickers = document.querySelectorAll("input[type='color']")
        for (var i = 0; i < colourPickers.length; i++){
            colourPickers[i].addEventListener("change", (e) => {
                setColour(e.target.id, e.target.value);
            })
        }

    }
    //check when tab is closed
    window.onbeforeunload = (e) => {
        if (!unSaved) { return undefined };
        e = e || window.event;

        // For IE and Firefox prior to version 4
        if (e) {
            e.returnValue = 'Sure?';
        }
        // For Safari
        return 'Sure?';
    };

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

    //create a notification on top left of screen
    createNotification = (heading ,text) =>{
        const elm = document.getElementById("notification");
        const clone = elm.cloneNode(true);        
        clone.style.display = "block";
        clone.style.top = 130 * notificationsOpen.length+"px";
        clone.id = "notification_" + notificationsOpen.length;
        elm.parentNode.appendChild(clone);
        const button = document.getElementById(clone.id).childNodes[1];
        button.addEventListener("click", (event) =>{
            const id = event.target.parentNode.id.split("_")[1];
            const arr = [];
            for(var i = 0; i<notificationsOpen.length; i++){
                if(i != id){
                    arr.push(notificationsOpen[i]);
                }
            }
            notificationsOpen = arr;
            const parent = document.getElementById(event.target.parentNode.id);
            parent.parentNode.removeChild(parent);
            reDrawNotifications = (function (id) {
                for (var i = id; i < notificationsOpen.length; i++) {
                    notificationsOpen[i].id = "notification_" + i;
                    notificationsOpen[i].style.top = 130 * i + "px";
                }
            })(id);     
        })
        const h1 = document.getElementById(clone.id).childNodes[3];
        h1.appendChild(document.createTextNode(heading));
        const p1 = document.getElementById(clone.id).childNodes[5];
        p1.appendChild(document.createTextNode(text));
        notificationsOpen.push(clone);     
    }

    closeNotification = () =>{
        document.getElementById("notification").style.display = "none";
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
        const cvn = canvas.getBoundingClientRect();

        if(gridSnap == 1){
            if (rectResize){
                rect.width += (mousepos.x - oldMousePos.x) / zoomAmount;
                rect.height += (mousepos.y - oldMousePos.y) / zoomAmount;
            }
            else{
                rect.x += ((mousepos.x - oldMousePos.x) / zoomAmount);
                rect.y += ((mousepos.y - oldMousePos.y) / zoomAmount);
            }  
        }
        else{
            //snapping
            const moveAmount = gridSnap * zoomAmount;
            if (mousepos.x - snapPos.x >= moveAmount) {               
                if(rectResize){
                    const newX = rect.width + gridSnap;
                    rect.width = Math.ceil(newX / gridSnap) * gridSnap;
                }
                else{
                    const newX = rect.x + gridSnap;
                    rect.x = Math.ceil(newX / gridSnap) * gridSnap;
                }  
                snapPos.x = mousepos.x;
            }
            if (mousepos.x - snapPos.x <= moveAmount * -1) {
                if(rectResize){
                    const newX = rect.width - gridSnap;
                    rect.width = Math.ceil(newX / gridSnap) * gridSnap;
                }
                else{
                    const newX = rect.x - gridSnap;
                    rect.x = Math.ceil(newX / gridSnap) * gridSnap;
                }
                snapPos.x = mousepos.x;
            }
            if (mousepos.y - snapPos.y >= moveAmount) {
                if(rectResize){
                    const newY = rect.height + gridSnap;
                    rect.height = Math.ceil(newY / gridSnap) * gridSnap;
                }
                else{
                    const newY = rect.y + gridSnap;
                    rect.y = Math.ceil(newY / gridSnap) * gridSnap;
                }
                snapPos.y = mousepos.y;
            }
            if (mousepos.y - snapPos.y <= moveAmount * -1) {
                if(rectResize){
                    const newY = rect.height - gridSnap;
                    rect.height = Math.ceil(newY / gridSnap) * gridSnap;
                }
                else{
                    const newY = rect.y - gridSnap;
                    rect.y = Math.ceil(newY / gridSnap) * gridSnap;
                }
                
                snapPos.y = mousepos.y;
            }
        }
        
        oldMousePos.x = event.clientX - cvn.left;
        oldMousePos.y = event.clientY - cvn.top;
        
        updateOptions();
    }

    imageFilter = (img, colour) => {
        const cv = document.createElement("canvas");
        cv.width = img.width;
        cv.height = img.height;
        const cvx = cv.getContext("2d");
        document.body.appendChild(cv);
        cvx.drawImage(img, 0, 0);

        var imageData = cvx.getImageData(0, 0, cv.width, cv.height);
        var data = imageData.data;

        for (var i = 0; i <= data.length; i += 4) {
            //red
            data[i] = (data[i] + colour.r) / 2;
            //green
            data[i + 1] = (data[i + 1] + colour.g) / 2;
            //blue
            data[i + 2] = (data[i + 2] + colour.b) / 2;

        }
        cvx.putImageData(imageData, 0, 0);
        const g = cv.toDataURL();
        document.body.removeChild(cv);
        return g;
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
            createNotification("Menu error", "You can not have more then 640 MenuDef's")
            return;
        }
        selectedMenuDef = menuDefs.length;
        menuDefs.push(new MenuDef("menu_"+menuDefs.length));
        updateOptions();
        updateMenuDefTable();
        return menuDefs[menuDefs.length-1];
    }

    //create a new item def
    newItemDef = () => {  
        if(menuDefs.length == 0){
            createNotification("Notification", "You must create a MenuDef first. One has been created for you.")
            newMenuDef();
            return;
        }
        //256 max itemdef per menudef
        if (menuDefs[selectedMenuDef].itemDefList.length == 256) {
            createNotification("Menu error", "You can not have more then 256 ItemDef's")
            return;
        }
        menuDefs[selectedMenuDef].itemDefList.push(new ItemDef("item_" + menuDefs[selectedMenuDef].itemDefList.length));
        menuDefs[selectedMenuDef].selectedItemDef = menuDefs[selectedMenuDef].itemDefList.length-1;
        updateOptions();
        updateItemDefTable();
        return menuDefs[selectedMenuDef].itemDefList[menuDefs[selectedMenuDef].itemDefList.length-1];
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
            var displayName = menuDefs[i].prop.name;
            if (i == selectedMenuDef){
                name.className = "selected";
            }
            if(menuDefs[i].prop.name.length > 25) {
                displayName = menuDefs[i].prop.name.substring(0, 25) + "...";
            }
            name.appendChild(document.createTextNode(displayName));

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
                var displayName = def.prop.name;
                if (i == menuDefs[selectedMenuDef].selectedItemDef){
                    name.className = "selected";
                }

                if(def.prop.name.length > 20) {
                    displayName = def.prop.name.substring(0, 7) + "...";
                }
                name.appendChild(document.createTextNode(displayName));

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
                    if (selectedMenuDef == undefined && tkn[1] == "menu") {
                        createNotification("Menu warning", "You have not selected a MenuDef");
                        return;
                    }
                    if (menuDefs[selectedMenuDef].selectedItemDef == undefined && tkn[1] == "item"){
                        createNotification("Menu warning", "You have not selected a ItemDef");
                    }
                    
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
                    if (selectedMenuDef == undefined && tkn[1] == "menu") {
                        createNotification("Menu warning", "You have not selected a MenuDef");
                        return;
                    }
                    if (menuDefs[selectedMenuDef].selectedItemDef == undefined && tkn[1] == "item") {
                        createNotification("Menu warning", "You have not selected a ItemDef");
                    }                           
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
                        unSaved = true;
                    }
                })
            }
            if (element.className == "optionstextbox" || element.className == "optionnumberbox" || element.className == "optionselectbox"){
                element.addEventListener("input", (event) =>{
                    var tkn = event.target.id.split("_");
                    if (selectedMenuDef == undefined && tkn[1] == "menu") {
                        createNotification("Menu warning", "You have not selected a MenuDef");
                        return;
                    }
                    if (selectedMenuDef == undefined && tkn[1] == "item"){
                        createNotification("Menu warning", "You have not created a MenuDef");
                        return;
                    }
                    if (menuDefs[selectedMenuDef].selectedItemDef == undefined && tkn[1] == "item") {
                        createNotification("Menu warning", "You have not selected a ItemDef");
                    }
                    unSaved = true;
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
                            if (event.target.value == "") {
                                def.prop[id2][tkn[0]] = "";
                            }
                            else if (!isNaN(event.target.value)){
                                def.prop[id2][tkn[0]] = parseFloat(event.target.value);
                            }
                            else{
                                def.prop[id2][tkn[0]] = event.target.value;
                            }  
                        } else {
                            if(event.target.value == ""){
                                def.prop[tkn[0]] = "";
                            }
                            else if (!isNaN(event.target.value)){
                                def.prop[tkn[0]] = parseFloat(event.target.value);
                            }
                            else{
                                //stop new line in text area
                                var elm = document.getElementById(event.target.id)
                                elm.value = elm.value.replace(/(\r\n|\n|\r)/gm, "");
                                def.prop[tkn[0]] = elm.value;
                            }  
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
            unSaved = true;
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
    }


    (function () {
        saveProgressFile = () =>{
            const string = createSaveText();

            const file = makeTextFile(string);
            const elm = document.createElement("a");
            elm.href = file;
            elm.download = "menuBuilderSave.cmb";
            document.body.appendChild(elm);
            elm.click();
            document.body.removeChild(elm);
            createNotification("Progress file downloaded", "You can upload this progress file to continue working on your project.");
            unSaved = false;
        }
        document.getElementById("uploadprogress").addEventListener("change", (event) => {
            if(confirm("Any unsaved progress will be lost")){
                var reader = new FileReader();
                const file = event.target.files[0];
                reader.onerror = errorHandler;
                if(event.target.files[0].name.includes(".menu")) {
                console.log("Custom .Menu File Loaded");
                reader.onloadend = () =>{
                    loadMenuSave(reader.result);
                    }
                } else {
                    console.log("Regular Save .Txt Loaded");
                    reader.onloadend = () =>{
                        loadSave(reader.result);
                    }
                }
                    reader.readAsText(file);
                }     
        })
        
        document.getElementById("export").addEventListener("click", () => {
            const string = createMenuText();
            const file = makeTextFile(string);
            const elm = document.createElement("a");
            elm.href = file;
            elm.download = "export.menu";
            document.body.appendChild(elm);
            elm.click();
            document.body.removeChild(elm);
            createNotification("Menu file exported", "You can follow the guide in the help section to learn how to load the menu in-game.");
        })
        function errorHandler(event) {
            switch (event.target.error.code) {
                case event.target.error.NOT_FOUND_ERR:
                    createNotification("File error", "File Not Found!");
                    break;
                case event.target.error.NOT_READABLE_ERR:
                    createNotification("File error", "File is not readable.");
                    break;
                case event.target.error.ABORT_ERR:
                    break;
                default:
                    createNotification("File error", "An error occurred reading this file.");
            }
        }
        localStorageSave = (itemName) => {
            const string = createSaveText();
            localStorage.setItem(itemName, string);
            unSaved = false;
            createNotification("Progress saved", "Your menu has been saved to local storage.");
        }
        localStorageLoad = (itemName) => {
            if (confirm("Any unsaved progress will be lost")) {
                projectName = itemName;
                const save = localStorage.getItem(itemName);
                if(save != undefined){
                    loadSave(save);
                }
            }
        }

        createNewSave = () =>{
            const name = document.getElementById("projectName").value;
            if(name == ""){
                createNotification("No project name", "Please enter a project name");
                return;
            }
            for (var i = 0; i < localStorage.length; i++) {
                if(name == localStorage.key(i)){
                    createNotification("Duplicate name", "You already have a project saved with that name");
                    return;
                }
            }

            localStorageSave(name);
            projectName = name;
            loadSaveMenu();
        }

        //add quick save for saving existing project
        //make it look nice lol

        quickSave = () =>{
            if(projectName == ""){
                createNotification("No project save", "You have not created a project save file");
                return;
            }
            localStorageSave(projectName);
            unSaved = false;

        }

        loadSaveMenu = () =>{
            const div = document.getElementById("saveLoadMenu");
            div.style.display = "block";
            const saves = [];

            const button = div.childNodes[1];
            button.addEventListener("click", (event) =>{
                document.getElementById(event.target.id).parentNode.style.display = "none";
            })

            const table = document.getElementById("loadSaveTable");
            table.innerHTML = "";
            for(var i = 0; i< localStorage.length; i++){
                saves.push(localStorage.key(i));
            }

            for (var i = 0; i < saves.length; i++){
                const tr = document.createElement("tr");
                //display is slot is empty or not
                var saveName;
                if(saves[i].length > 20){
                    saveName = saves[i].substring(0, 19) + "...";
                }
                else{
                    saveName = saves[i];
                }
                const text = document.createElement("td").appendChild(document.createTextNode(saveName));

                tr.appendChild(text);

                //save slot button
                const td = document.createElement("td");
                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn1";
                button.id = "saveButton_"+saves[i];
                button.appendChild(document.createTextNode("Save"));
                button.addEventListener("click", (event) =>{
                    const id = event.target.id.split("_")[1];
                    if(localStorage.getItem(id) != undefined){
                        if(projectName != id){
                            if (confirm("Do you want to override this slot")) {
                                localStorageSave(id);
                            }
                        }
                        else{
                            localStorageSave(id);
                        }  
                    }
                    else{
                        localStorageSave(id);
                    }
                })
                td.appendChild(button);

                //load slot button
                const td2 = document.createElement("td");
                const button2 = document.createElement("button");
                button2.type = "button";
                button2.className = "btn1";
                button2.id = "loadButton_"+saves[i];
                button2.appendChild(document.createTextNode("Load"));
                button2.addEventListener("click", (event) =>{
                    const id = event.target.id.split("_")[1];
                    localStorageLoad(id);
                    createNotification("Menu loaded", "Your menu has been loaded from local storage");
                })
                td2.appendChild(button2);

                //delete button
                const td3 = document.createElement("td");
                const button3 = document.createElement("button");
                button3.type = "button";
                button3.className = "btn1";
                button3.id = "deletebutton_"+saves[i];
                button3.appendChild(document.createTextNode("Delete"));
                button3.addEventListener("click", (event) =>{
                    const id = event.target.id.split("_")[1];
                    localStorage.removeItem(id);
                    loadSaveMenu();
                })
                td3.appendChild(button3);

                tr.appendChild(td);
                tr.appendChild(td2);
                tr.appendChild(td3);

                table.appendChild(tr);
            }
        }


        loadSave = (text) =>{
            menuDefs = [];
            const lines = text.split("\n");
            var menudef;
            var itemdef
            var menuOpen = false;
            var itemDefOpen = false;
            for(var i = 0; i< lines.length; i++){
                if(lines[i] == "menudef" && !menuOpen){
                    menudef = newMenuDef();
                    menuOpen = true;
                    continue;
                }
                if(menuOpen && !itemDefOpen){
                    if(lines[i] == "itemdef"){
                        itemdef = newItemDef();
                        itemDefOpen = true;
                        continue;
                    }
                    const tkn = lines[i].split(":");
                    if(tkn[0] == "prop"){
                        if(tkn.length > 2){
                            if(typeof menudef.prop[tkn[1]] == "string"){
                                menudef.prop[tkn[1]] = tkn[2];
                            }
                            else if(typeof menudef.prop[tkn[1]] == "number"){
                                menudef.prop[tkn[1]] = parseFloat(tkn[2]);
                            }
                            else if (typeof menudef.prop[tkn[1]] == "object"){
                                if(tkn.length > 3){
                                    menudef.prop[tkn[1]][tkn[2]] = parseFloat(tkn[3]);
                                }
                            }
                        }
                    }
                    else if(tkn[0] == "options"){
                        if(tkn.length > 2){
                            if(tkn[2] == "true"){
                                menudef.options[tkn[1]] = true;
                            }
                            else if(tkn[2] == "false"){
                                menudef.options[tkn[1]] = false;
                            }
                        }
                    }
                }
                if(itemDefOpen){
                    const tkn = lines[i].split(":");
                    if (tkn[0] == "prop") {
                        if (tkn.length > 2) {
                            if (typeof itemdef.prop[tkn[1]] == "string") {
                                itemdef.prop[tkn[1]] = tkn[2];
                            }
                            else if (typeof itemdef.prop[tkn[1]] == "number") {
                                itemdef.prop[tkn[1]] = parseFloat(tkn[2]);
                            }
                            else if (typeof itemdef.prop[tkn[1]] == "object") {
                                if (tkn.length > 3) {
                                    itemdef.prop[tkn[1]][tkn[2]] = parseFloat(tkn[3]);
                                }
                            }
                        }
                    }
                    else if (tkn[0] == "options") {
                        if (tkn.length > 2) {
                            if (tkn[2] == "true") {
                                itemdef.options[tkn[1]] = true;
                            }
                            else if (tkn[2] == "false") {
                                itemdef.options[tkn[1]] = false;
                            }
                        }
                    }
                }
                
                if(lines[i] == "}" && itemDefOpen){
                    itemDefOpen = false;
                    continue;
                }
                if(lines[i] == "}" && !itemDefOpen){
                    menuOpen = false;
                    continue;
                }
            }
            updateMenuDefTable();
            updateItemDefTable();
            updateOptions();
        }
        
        loadMenuSave = (menuText) => {
            menuDefs = [];
            const lines = menuText.split("\n");
            var menudef;
            var itemdef;
            var currentLine = "";
            var currentLineOriginal = "";
            var currentMenuVarOriginal = "";
            var currentItemVarOriginal = "";
            var currentVarName = "";
            var currentVarTrimmed = "";
            var varValue = "";
            var currentMenuVar = [];
            var currentItemVar = [];
            var supportedMenuVars = ["name", "blurworld", "border", "bordersize"];
            var supportedItemVars = ["name", "style", "visible", "exp", "border", "bordersize", "type", "textscale", "textstyle", "textalign", "textalignx", "textaligny", "text", "decoration"];
            var currentLineNums = undefined;

            for(var i = 0; i< lines.length; i++){
               currentLine = lines[i].toLowerCase().trim();
               if(currentLine === "menudef") {
                    menudef = newMenuDef();
                   for(q = i+1; currentLine !== " itemdef"; q++) {
                    if(currentLine !== " " && currentLine !== "") {
                        currentLine = fullyTrimMenuString(lines[q]).toLowerCase();
                    } else {
                        currentLine = fullyTrimMenuString(lines[q]);
                    }

                        if(currentLine === " " || currentLine === "" || currentLine === "}" || currentLine === "{") {
                            if(q === lines.length) {
                                break;
                            } else {
                                continue;
                            }
                        }

                        if(currentLine !== "itemdef" && currentLine !== "" && currentLine !== " " && currentLine !== "}" && currentLine !== "{") {
                            currentMenuVar = currentLine.split(" ");
                            currentMenuVarOriginal = fullyTrimMenuString(lines[q]).split(" ");
                            //need to check for certain ones because of more attributes than 1
                            if(currentMenuVarOriginal[0] === "rect") {
                                currentLineNums = getDefOptions(currentLine, 4).split(" ");
                                menudef.prop["rect"]["x"] = parseFloat(currentLineNums[0]);
                                menudef.prop["rect"]["y"]= parseFloat(currentLineNums[1]);
                                menudef.prop["rect"]["width"] = parseFloat(currentLineNums[2]);
                                menudef.prop["rect"]["height"] = parseFloat(currentLineNums[3]);
                                
                                
                            }
                            else if(currentMenuVarOriginal[0] === "bordercolor") {
                                currentLineNums = getDefOptions(currentLine, 11).split(" ");
                                menudef.prop["bordercolor"]["r"] = parseFloat(currentLineNums[0]);
                                menudef.prop["bordercolor"]["g"] = parseFloat(currentLineNums[1]);
                                menudef.prop["bordercolor"]["b"] = parseFloat(currentLineNums[2]);
                                menudef.prop["bordercolor"]["a"] = parseFloat(currentLineNums[3]);
                                menudef.options["bordercolor"] = true;
                            }
                            else if(currentMenuVarOriginal[1] === "onOpen") {
                                menudef.prop["onOpen"] = getDefOptionsActions(currentLine, lines, q, 6);
                                menudef.options["onOpen"] = true;
                            }
                            else if(currentMenuVarOriginal[1] === "onClose") {
                                //onclose just fucking disappears??? lol wut bug
                                menudef.prop["onClose"] = getDefOptionsActions(currentLine, lines, q, 7);
                                menudef.options["onClose"] = true;
                            }
                            else if(currentMenuVarOriginal[1] === "onEsc") {
                                menudef.prop["onESC"] = getDefOptionsActions(currentLine, lines, q, 5);
                                menudef.options["onESC"] = true;
                            }
                            else {
                                //check if we can actually load that menu attribute
                                for(p = 0; p < supportedMenuVars.length; p++) {
                                    if(currentMenuVarOriginal[0] === supportedMenuVars[p]) {
                                        menudef.prop[currentMenuVarOriginal[0]] = undefined;
                                        menudef.prop[currentMenuVarOriginal[0]] = getDefOp(currentMenuVar[1]);
                                        menudef.options[currentMenuVarOriginal[0]] = true;
                                        //menudef.debugConsole();
                                        continue;
                                    }
                                }
                            }
                        }
                   }
               } else if(currentLine === "itemdef") {
                   currentLine = "cash"; //workaround
                   
                   itemdef = newItemDef();
                    for(p = i+1; currentLine !== " itemdef"; p++) {
                        if(currentLine !== " " && currentLine !== "") {
                            currentLine = fullyTrimMenuString(lines[p]).toLowerCase();
                        } else {
                            currentLine = fullyTrimMenuString(lines[p]);
                        }
                        currentItemVar = currentLine.split(" ");
                        currentItemVarOriginal = fullyTrimMenuString(lines[p]).split(" ");

                        if(currentLine === " " || currentLine === "" || currentLine === "}" || currentLine === "{") {
                            if(p === lines.length) {
                                break;
                            } else {
                                continue;
                            }
                        }

                        //console.log("line: " + currentLine);
                        //console.log("var: " + currentItemVar[0]);
                        if(currentLine !== " menudef") {
                            if(currentItemVar[0] === "rect") {
                                currentLineNums = getDefOptions(currentLine, 4).split(" ");
                                itemdef.prop["rect"]["x"] = parseFloat(currentLineNums[0]);
                                itemdef.drawPos["x"] = itemdef.prop["rect"]["x"]
                                itemdef.prop["rect"]["y"] = parseFloat(currentLineNums[1]);
                                itemdef.drawPos["y"] = itemdef.prop["rect"]["y"]
                                itemdef.prop["rect"]["width"] = parseFloat(currentLineNums[2]);
                                itemdef.prop["rect"]["height"] = parseFloat(currentLineNums[3]);
                                if(currentLineNums.length > 3) {
                                    itemdef.prop["rect"]["alignx"] = parseFloat(currentLineNums[4]);
                                    itemdef.prop["rect"]["aligny"] = parseFloat(currentLineNums[5]);
                                }
                            }
                            else if(currentItemVar[0] === "origin") {
                                currentLineNums = getDefOptions(currentLine, 6).split(" ");
                                itemdef.prop["rect"]["x"] += parseFloat(currentLineNums[0]);
                                itemdef.drawPos["x"] += itemdef.prop["rect"]["x"]
                                itemdef.prop["rect"]["y"] += parseFloat(currentLineNums[1]);
                                itemdef.drawPos["y"] += itemdef.prop["rect"]["y"]
                            }
                            else if(currentItemVar[0] === "backcolor") {
                                currentLineNums = getDefOptions(currentLine, 9).split(" ");
                                itemdef.prop["backcolor"]["r"] = parseFloat(currentLineNums[0]);
                                itemdef.prop["backcolor"]["g"] = parseFloat(currentLineNums[1]);
                                itemdef.prop["backcolor"]["b"] = parseFloat(currentLineNums[2]);
                                itemdef.prop["backcolor"]["a"] = parseFloat(currentLineNums[3]);
                                itemdef.options["backcolor"] = true;
                            }
                            else if(currentItemVar[0] === "forecolor") {
                                currentLineNums = getDefOptions(currentLine, 9).split(" ");
                                itemdef.prop["forecolor"]["r"] = parseFloat(currentLineNums[0]);
                                itemdef.prop["forecolor"]["g"] = parseFloat(currentLineNums[1]);
                                itemdef.prop["forecolor"]["b"] = parseFloat(currentLineNums[2]);
                                itemdef.prop["forecolor"]["a"] = parseFloat(currentLineNums[3]);
                                itemdef.options["forecolor"] = true;
                            }
                            else if(currentItemVar[0] === "bordercolor") {
                                currentLineNums = getDefOptions(currentLine, 11).split(" ");
                                itemdef.prop["bordercolor"]["r"] = currentLineNums[0];
                                itemdef.prop["bordercolor"]["g"] = currentLineNums[1];
                                itemdef.prop["bordercolor"]["b"] = currentLineNums[2];
                                itemdef.prop["bordercolor"]["a"] = currentLineNums[3];
                                itemdef.options["bordercolor"] = true;
                            }
                            else if(currentItemVar[0] === "mouseenter") {
                                itemdef.prop[currentItemVarOriginal[0]] = getDefOptionsActions(currentLine, lines, p, 10);
                                itemdef.options[currentItemVarOriginal[0]] = true;
                            }
                            else if(currentItemVar[0] === "mouseexit") {
                                itemdef.prop[currentItemVarOriginal[0]] = getDefOptionsActions(currentLine, lines, p, 9);
                                itemdef.options[currentItemVarOriginal[0]] = true;
                            }
                            else if(currentItemVar[0] === "action") {
                                itemdef.prop[currentItemVarOriginal[0]] = getDefOptionsActions(currentLine, lines, p, 6);
                                itemdef.options[currentItemVarOriginal[0]] = true;
                            }
                            else if(currentItemVar[0] === "onfocus") {
                                itemdef.prop[currentItemVarOriginal[0]] = getDefOptionsActions(currentLine, lines, p, 7);
                                itemdef.options[currentItemVarOriginal[0]] = true;
                            }
                            else if(currentItemVar[0] === "leavefocus") {
                                itemdef.prop[currentItemVarOriginal[0]] = getDefOptionsActions(currentLine, lines, p, 10);
                                itemdef.options[currentItemVarOriginal[0]] = true;
                            }
                            else {
                                //check if we can actually load that item attribute
                                for(r = 0; r < supportedItemVars.length; r++) {
                                    if(currentItemVar[0] === supportedItemVars[r]) {
                                        if(currentItemVar[0] === "text") {
                                            itemdef.prop[currentItemVar[0]] = getDefOp(currentLine.substring(5, currentLine.length));
                                            //itemdef.debugConsole();
                                        } else {
                                            itemdef.prop[currentItemVarOriginal[0]] = getDefOp(currentItemVar[1]);
                                            //itemdef.debugConsole();
                                        }
                                        itemdef.options[currentItemVarOriginal[0]] = true;
                                        //console.log(currentItemVar[0] + " to: " + getDefOp(currentItemVar[1]));
                                        continue;
                                    }
                                }
                            }


                        } else {
                            break;
                            //leave loop if its a menudef
                        }
                        
                    }
                    
               } else if(currentLine.substring(0, 1) === "#") {

                   if(currentLine.includes("#include") && !currentLine.includes("#include \"ui/menudef.h\"")) {
                        menuIncludes[menuIncludes.length] = currentLine;
                    } 
                    else if(currentLine.includes("#define")) {
                        currentVarTrimmed = fullyTrimMenuString(currentLine.substring(8, currentLine.length));
                        for(j = 0; j < currentLine.length; j++) {
                            if(currentVarTrimmed.substring(j, j + 1) === " ") {
                                currentVarName = currentVarTrimmed.substring(0, j);
                                varValue = currentVarTrimmed.substring(j + 1, currentLine.length);
                                menuVariables.set(currentVarName, varValue);
                                break;
                            }
                        }
                        
                    }
               }
            }
            
            updateMenuDefTable();
            updateItemDefTable();
            createNotification("Custom .menu File Loaded", "Select a MenuDef to continue working on your menu.")
        }

        fullyTrimMenuString = (text) => {
            //this is cash lmao
            if(typeof text !== "undefined" && text !== "" && text !== " ") {
            text = text.trim();
            var colons = "";
                for(j = 0; j < text.length; j++) {
                    if(text.includes("\t")) {
                        text = text.replace("\t", ":");
                        colons += ":";
                    }
                }
                text = text.replace(colons, " ");
                if(text.length <= 2) {
                    text = text.replace(" ", "");
                }
            } else {
                text = "}";
            }
            return text;
        }

        getDefOptions = (text, subLength) => {
            var returnMe = text.substring(subLength, text.length).trim();;
            
            //check if they are using a variable 
            for(var varName of menuVariables.keys()) {
                if(text.includes(varName)) {
                    returnMe = menuVariables.get(varName);
                }
            }
            return returnMe;
        }

        getDefOp = (text) => {
            var returnThis = text;
            if(text !== " " && text !== "" && typeof text !== "undefined") {
                //check if they made a variable for this and input the var nums
            for(var varName of menuVariables.keys()) {
                if(text.includes(varName)) {
                    returnThis = menuVariables.get(varName);
                }
            }
                if(!returnThis.includes("\"")) {
                    if(/\d/.test(returnThis)) {
                            returnThis = parseFloat(returnThis);
                        }
            } else {
                if(!returnThis.includes("\\\"")) {
                    returnThis = returnThis.replace("\"", "");
                    returnThis = returnThis.substring(0, returnThis.length - 1);
                }
            }
            }
            return returnThis;
        }

        getDefOptionsActions = (lineOn, allLines, atPoint, subLength) => {
            var line = "";
            var returnThis = "";
            var actions = [];
            var replaceAction = ["mouseExit", "mouseEnter", "onFocus", "leaveFocus", "action", "onOpen", "onClose", "onESC"];
            
            if(lineOn.includes("}")) {
                returnThis = lineOn.substring(subLength, lineOn.length - 1).replace(/}|{/g,"");
            }
            else {
                for(q = atPoint; !line.includes("}"); q++) {
                    line = allLines[q];
                    returnThis += line;
                }
                returnThis = returnThis.replace(/}|{/g,"");
                for(l = 0; l < replaceAction.length; l++) {
                    returnThis = returnThis.replace(replaceAction[l],"");
                }
            }
            
            return returnThis;
            
        }

        createSaveText = () => {
            var text = "";
            for (var i = 0; i < menuDefs.length; i++) {
                text += "menudef\n{\n";
                for (prop in menuDefs[i].prop) {
                    if (typeof menuDefs[i].prop[prop] == "object") {
                        for (op2 in menuDefs[i].prop[prop]) {
                            text += "prop:" + prop + ":" + op2 + ":" + menuDefs[i].prop[prop][op2] + "\n";
                        }
                    }
                    else { 
                        text += "prop:" + prop + ":" + menuDefs[i].prop[prop] + "\n";
                    }
                }
                for (op in menuDefs[i].options) {
                    text += "options:" + op + ":" + menuDefs[i].options[op] + "\n";
                }
                for (var x = 0; x < menuDefs[i].itemDefList.length; x++) {
                    text += "itemdef\n{\n";
                    for (prop in menuDefs[i].itemDefList[x].prop) {
                        if (typeof menuDefs[i].itemDefList[x].prop[prop] == "object") {
                            for (op2 in menuDefs[i].itemDefList[x].prop[prop]) {
                                text += "prop:" + prop + ":" + op2 + ":" + menuDefs[i].itemDefList[x].prop[prop][op2] + "\n";
                            }
                        }
                        else {
                            text += "prop:" + prop + ":" + menuDefs[i].itemDefList[x].prop[prop] + "\n";
                        }
                    }
                    for (op in menuDefs[i].itemDefList[x].options) {
                        text += "options:" + op + ":" + menuDefs[i].itemDefList[x].options[op] + "\n";
                    }
                    text += "}\n";
                }

                text += "}\n";
            }
            return text;
        }
        

        createMenuText = () =>{
            var text = "";
            text += "//This file was generated by Cod4 Menu Builder - Created by Sheep Wizard\n";
            text += "//Project Github page: https://github.com/SheepWizard/COD4-MENU-BUILDER\n";
            text += "//If you find any bugs please report them here: https://github.com/SheepWizard/COD4-MENU-BUILDER/issues \n\n";
            text += "//This header is not used in this file but is required if you want to use common definitions\n"
            text += "#include \"ui/menudef.h\"\n\n";
            //loop through their includes and definitions for vars (incase they imported a custom .menu)
            for(j = 0; j < menuIncludes.length; j++) {
                text += menuIncludes[j] + "\n";
            }

            for(var [varName, varValue] of menuVariables) {
                text += "#define " + varName + "\t" + varValue + "\n";
            }
             
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
                            if (option == "decoration"){
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
        makeTextFile = (text) => {
            var textFile;
            var data = new Blob([text], { type: 'text/plain' });
            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile);
            }
            textFile = window.URL.createObjectURL(data);
            return textFile;
        };
    })(); 
})();
