A very basic system for playing ORE games. I run a hybrid of Reign and Wild Talents, so if anything is weird blame that. If anything is ugly or just bad UX, blame my general incompetence in the sphere of web development.

**How to use:**
The health boxes can be clicked for different damage states (/ or X). The number of boxes in each location can be changed with the + and - buttons. 
Stats, Powers, and Skills are a touch more complex: these are implemented as types of Item. Included are a couple of Compendia of attributes, which you can simply drag-and-drop onto the sheet and it'll fill them all in (if the game you want to play isn't on there, create an issue or ping me on discord and I'll add one). Otherwise the easiest way of adding them is via the little plus sign on the right-hand side of the relevant character sheet tabs. 
Attributes and Powers can be rolled by clicking on the icon to the left of their entry on the sheet. Buttons to edit or delete them are on the right. 

**List of attribute compendia:**
* Reign. Note that the sheet is a touch off for Reign; it has Willpower and a tab for superpowers.
* The Velvet Book, a fan-made game for playing in the world of the Persona video games. I haven't added support for this beyond the attributes compendium.
* My game, which is Reign minus the Eerie, Counterspell, and Sorcery skills. 

TODO: Deal with the github issues, which I created myself and then forgot about.
      Automation, e.g. 'auto-apply attack damage'.
      Prettify the sheet; this default css is horribly ugly.
      Add support for other ORE systems, e.g. A Dirty World. I'll probably do this in the order Reign -> Wild Talents -> Godlike -> Nemesis -> etc. I'm planning to do this modularly, enabling and disabling specific features.

Credits:
itamarcu, for the dice roller https://github.com/itamarcu/one-roll-engine
The people behind the Vampire 5th edition sheet for the health boxes https://github.com/Rayji96/foundry-V5
Matt Smith @Asacolips for the Boilerplate template https://gitlab.com/asacolips-projects/foundry-mods/boilerplate
aantia (me) for the rest of the system
Greg Stolze for the ORE itself.



License:
MIT, for anything I wrote. Check Mr Stolze's website for information on use of the ORE, and the links above to the other credits' sources for their respective licenses.
