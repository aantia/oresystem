/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ReignItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["oresystem", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/oresystem/templates/item";
    // Return a single sheet for all item types.
    //return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();

      // We need to be able to choose from the other stats.
      // Initialize containers.
      const stats = [];
      const skills = [];
      const powers = [];
      const hitlocs = [];

      // Iterate through items, allocating to containers
      for (let i of actor.items) {
        // Append to appropriate arrays.
        if (i.type === 'stat') {
          stats.push(i);
        } else if (i.type === 'skill') {
          skills.push(i);
        } else if (i.type === 'power') {
          powers.push(i);
        } else if (i.type === 'hitloc') {
          hitlocs.push(i);
        }
      }

      // Assign and return
      context.stats = stats;
      context.skills = skills;
      context.powers = powers;
      context.hitlocs = hitlocs;
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = itemData.data;
    context.flags = itemData.flags;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
