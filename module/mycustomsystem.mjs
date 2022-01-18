// Import document classes.
import { ReignActor } from "./documents/actor.mjs";
import { ReignItem } from "./documents/item.mjs";
// Import sheet classes.
import { ReignActorSheet } from "./sheets/actor-sheet.mjs";
import { ReignItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { MYCUSTOMSYSTEM } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.mycustomsystem = {
    ReignActor,
    ReignItem
  };

  // Add custom constants for configuration.
  CONFIG.MYCUSTOMSYSTEM = MYCUSTOMSYSTEM;

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
  Actors.registerSheet("mycustomsystem", ReignActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("mycustomsystem", ReignItemSheet, { makeDefault: true });

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