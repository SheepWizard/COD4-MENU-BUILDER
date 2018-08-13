# Making a button with hover effect
- Firstly create two MenuDef's, the first one will contain the button and the second will be the menu that the button opens.  Call the first one "menu_0" and the second "menu_1".

- Select the first MenuDef and create 2 ItemDefs and position them in the same place and **make sure that they are inside the MenuDef borders**
- Make sure these properties are set
#### ItemDef 1
```
```
| Property| Value|
| ------------- |:-------------|
| Name | b1 |
| visible| true (right check box is checked) |
| type | ITEM_TYPE_TEXT |
| decoration| true (left check box is enabled) |

```
```
#### ItemDef 2
This ItemDef will show when you hover the mouse over it so change it's appearance a bit.
```
```
| Property | Value |
| ------------- |:-------------|
| Name | b1_hover |
| visible| false (right check box is unchecked) |
| type | ITEM_TYPE_TEXT |
| decoration| true (left check box is enabled) |

```
```
- Now create a third ItemDef and place it in the same positon as the others. This ItemDef will be the one you click.
- Give the third ItemDef these properties.
#### ItemDef 3
```
```
| Property | Value |
| ------------- |:-------------|
| Name | b1_click |
| Style | WINDOW_STYLE_EMPTY |
| visible| true (right check box is checked) |
| type | ITEM_TYPE_BUTTON |
| decoration| disabled (left check box is unchecked|
| action | open "menu_1"; close self;|
| mouseEnter| hide "b1"; show "b1_hover"; |
| mouseExit| hide "b1_hover"; show "b1"; |
```
```
Make sure your 3 ItemDef's are in this order
```
```
| Order |
| :--: |
|b1|
|b1_hover|
|b1_click|
```
```

![](https://i.imgur.com/HD5luG7.png)

You can now export your menu and load it into your mod.

![](https://image.ibb.co/nxkcfp/d77f7e3ca49ee46f1f301d68d82e7c65.gif)


You can download the example files here:

 [https://github.com/SheepWizard/COD4-MENU-BUILDER/tree/master/examples/Hover%20Button](https://github.com/SheepWizard/COD4-MENU-BUILDER/tree/master/examples/Hover%20Button)
