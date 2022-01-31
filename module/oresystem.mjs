// Import document classes.
import { ReignActor } from "./documents/actor.mjs";
import { ReignItem } from "./documents/item.mjs";
// Import sheet classes.
import { ReignActorSheet } from "./sheets/actor-sheet.mjs";
import { ReignItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { ORESYSTEM } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.oresystem = {
    ReignActor,
    ReignItem
  };

  // Add custom constants for configuration.
  CONFIG.ORESYSTEM = ORESYSTEM;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "100/(actor.items.getName(\"Sense\").data.data.d + 2 * actor.items.getName(\"Sense\").data.data.ed + 4 * actor.items.getName(\"Sense\").data.data.md)",
    decimals: 0
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = ReignActor;
  CONFIG.Item.documentClass = ReignItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("oresystem", ReignActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("oresystem", ReignItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('numLoop', function (num, options) {
  let ret = ''

  for (let i = 0, j = num; i < j; i++) {
    ret = ret + options.fn(i)
  }

  return ret
})

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
});




/* -------------------------------------------- */
/*  This section isn't anything to do with rolling, I just put it here because I'm lazy                                  */
/* -------------------------------------------- */
/*
 function setPoolTotal(document) {
  
  const item = document.data;

  if (document.isOwned)
    if (document.type == "skill") {
      let linkedStat = document.actor.items.getName(item.data.stat)
      if (linkedStat) {
        document.setFlag("oresystem", "poolTotal", (item.data.d + linkedStat.data.data.d) + "d/" + (item.data.ed + linkedStat.data.data.ed) + "e (" + item.data.ed_set + ")/" + (item.data.md + linkedStat.data.data.md) + "m");
      }
    } else {
      document.setFlag("oresystem", "poolTotal", item.data.d + "d/" + item.data.ed + "e (" + item.data.ed_set + ")/" + item.data.md + "m");
    }
}


Hooks.on('updateItem', (document, change, options, userId) => {

  setPoolTotal(document)

});


Hooks.on('updateActor', (document, change, options, userId) => {

  console.log("Triggered")
  console.log(document.data)
  console.log(document.data.items.length)
  console.log(document.data.items[0])
  for (i in document.data.items) {
    console.log("Looping")
    setPoolTotal(i)
  }

});*/
