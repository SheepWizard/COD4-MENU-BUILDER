# Using script actions

Action, onFocus, leaveFocus, mouseEnter, mouseExit all take script actions.

MenuBuilder does not currently support showing the effects of script actions

Here is a list of script actions you can use **(some of these I have not tested and may not work)**.
```
```
| Action | Syntax |  Example | Description|
|--|--|--|--|
| show | show [itemDef/menuDef name] | show "button_1";| Shows a itemDef or menuDef
|hide|hide [itemDef/menuDef name] | hide "button_1";|Hides a itemDef or menuDef
|open|open [menuDef name]| open "welcome_menu";| Opens a menuDef
|close| close[menuDef name]|hide "team_select";| Closes a menuDef
|setbackground|setbackground [background name]| setbackground "banner";| Sets a background image for a itemDef
|setitemcolor|setitemcolor [itemDef name] "backcolor" [color]| setitemcolor "item_0" "backcolor" 1 0 0 1;| Sets the backcolor for a ItemDef
|exec|exec [string] |exec "com_maxfps 250"; |Execute a string as a console command. Note this is NOT the same "exec" to load a .cfg file.
|setLocalVarInt| setLocalVarInt [variable] [value]|setLocalVarInt item_1 5; | Sets a local varibale int inside the menu. See expressions wiki for more information.
|setLocalVarString| see above||
|setLocalVarFloat| see above||
|setLocalVarBool| see above||
|play|play "sound name"| play "mouse_click";| Plays a sound|
|playlooped|playlooped "sound name"| playlooped"mouse_click";| Plays a looping sound|
|uiScript| uiScript [script] | see below| Activates a mod-specific action
```
```

See the expressions wiki for more information.

https://github.com/SheepWizard/COD4-MENU-BUILDER/wiki/Expressions

## uiScripts
Here is a list of uiScripts. Some of these will not work in cod4
https://www.icculus.org/homepages/phaethon/q3tamenu/q3tamenu-16.html

