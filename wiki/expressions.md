# Expressions
Expressions (shortened to exp in the menu file) are used to dynamicly change stuff within your menu. **You can have multiple expressions per ItemDef.**

Menu builder does not currently support showing the effect of expressions.

List of expressions:
```
```
| Action | Syntax |  Example | Description|
|--|--|--|--|
|text| text(string)|text("Hello World")| Sets the text for an ItemDef
|material| material(string)| material("image_1")| Sets the material for an itemDef
|rect X | rect X(float)| rect X(dvarInt("pos_x"));| Sets the x coordinate for the itemDef
|rect Y | rect Y(float)| rect Y(23.5);| Sets the y coordinate for the itemDef
|rect W | rect W(float)| rect X(dvarFloat("width"));| Sets the width coordinate for the itemDef
|rect H | rect H(float)| rect H(500);| Sets the height coordinate for the itemDef
```
```

You can also use operations in expressions. A list of all operations can be found here:
https://github.com/D4edalus/CoD4x_Server/blob/9c83a47b75519f6e860e38935a29ba52133917a0/src/xassets/menu.c#L7

Some  examples of how you might use operations in an expression:

    //This example will displace the result for subtracting the dvar
    //"final_time" from the dvar "start_time"
    text("Final time: " + (dvarint("start_time") - dvarint("final_time")))

	//This example will display the value of the stat 2301
    text("Level: " + stat(2301))

	//This more complex example will move the Itemdef from left to right
    rect X(-163+(cos(milliseconds()/1000) * 60))
    

You can also use expression in visible option (this is not currently supported on menu builder)

A visible expression always starts with when( followed by the conditional statement.
Some example:

    //This example will show the ItemDef when the players team score is greater
    //then the enemy team score
    when( team( score ) < otherteam( score ) )

	//This example will show the ItemDef when the gametype is equal to 'war'
	when(gametype() == "war")


![](https://i.gyazo.com/d595b9ba61fca50ab7725dfff1d5e48f.gif)
