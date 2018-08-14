# Welcome to MenuBuilder

This first tutorial will help you learn MenuBuilder controls.
Both MenuDef options and ItemDef options have a check box on the left to disable/enable the option and an area on the right the set the option value.
Options that are colours have a box underneath which will open a colour picker to help you choose the correct colour.

You can visit this website for more menu syntax (Some information on this page will not work in cod4)

https://www.icculus.org/homepages/phaethon/q3tamenu/q3tamenu.html#toc1

## Creating a menu
A menu is made from a MenuDef and is populated with ItemDef's. A MenuDef is like a screen within your game that displays ItemDef's.  **An itemDef can be displayed outside of the MenuDef but actions will not work e.g. buttons.**
### MenuDef
To create a MenuDef open the MenuDef Options menu then click 'New menuDef'.  If you open the MenuDef list menu you can see that you have created a MenuDef which you can select, copy or delete.

![](https://i.imgur.com/PIZF6Aj.png)
You can position the menu with the 'rect' options. I recommend applying a border while you are positioning the MenuDef so you can see where it is.
### ItemDef
To create a new ItemDef click the 'New itemDef' button. In the MenuDef Options you will see a menu called ItemDef list with all your ItemDef's. You can select, copy, delete, move down and move up the itemDef. You can also use delete key to delete and space bar to copy.

![](https://i.imgur.com/4IVsgMT.png)

You can position and resize the ItemDef by changing the 'rect' settings, by dragging it on the display or by using the arrow keys.
It is important to choose the correct alignments for your ItemDef. **Make sure you toggle the aspect ratio to check the ItemDef is aligned correctly in each ratio!**

![](https://i.imgur.com/WSJucxt.gif)

You can see your selected ItemDef as it will have a black square outlining it. You can de-select it by clicking outside of the display and you can select a different ItemDef from the ItemDef list.

## Builder Options
![](https://i.imgur.com/gUG6ots.png)
```
```
| Option      | Use           | 
| ------------- |:-------------|
| Export menu     | Export a .menu file that is ready for use in Call of Duty 4 | 
| Zoom in     |     Zoom into the display screen  | 
| Zoom out | Zoom out of the display screen      | 
| Toggle game image | Toggle if an image of the game is shown on the display screen      | 
| Toggle screen outline | Toggles an outline on the display screen      | 
| Toggle screen ratio | Toggle the display screen ratio     | 
| Grid snap | When dragging ItemDef's on screen apply snapping to a certain grid size    | 
| Guide lines| Toggle guides lines on display screen     | 


```
```

