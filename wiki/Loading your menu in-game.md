# Loading your menu in-game
This is a tutorial on how to load your menu into Call of Duty 4.
**This is not a modding tutorial, for more information on modding visit these links**
http://wiki.modsrepository.com/index.php/Call_of_Duty_4:_Modding_Tutorial
https://docs.cod4x.me/modding/scriptingguide/quickstart.html

Once you have finished designing your menu click the 'Export menu' button in builder options.
(Before you export make sure your menu works on all screen ratios).

You will now have a export.menu, you can rename it if you like.

Now go into you mods folder and navigate to

    ui_mp\scriptmenus

And place your menu file in here.

Next open you mod.csv and add this line and save:

    menufile,ui_mp/scriptmenus/[menuname].menu

Mine looks like this:

    menufile,ui_mp/scriptmenus/homemenu.menu
Now make sure that your make mod .bat file contains this line

    xcopy ui_mp ..\..\raw\ui_mp /SY
Now open the .gsc/.gsx file where you want to load your menu. You will need to precache the name of your menu file plus name of every MenuDef in your .menu file (this needs to be done at the start of your gsc).

    precacheMenu("homemenu");//name of my menu file
    precacheMenu("home");//name of my MenuDef
    
  To open your menu within gsc use this line
  

    self openMenu(MenuDef name); //self is a player entity
In my .gsc I will do:

    self openMenu("home");

![](https://i.imgur.com/HTraK78.png)

Here is an example script of opening a menu when the players use button is pressed.

```c
init()
{
	precacheMenu("homemenu");//precache menu file
	precacheMenu("home");//precache menudef
	thread menuCheck();
}

menuCheck()
{
	while(1)
	{
		players = getEntArray( "player", "classname" );
		for(i = 0; i<players.size; i++)
		{
			if(players[i]  UseButtonPressed())
			{
				players[i] OpenMenu("home");
			}
			
		}
		wait 0.05;
	}
}
```

If you get an error when opening the menu saying it cant find the file, change the menuDef name to the same name as the file. It should fix the problem.

