

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ReignActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["oresystem", "sheet", "actor"],
      template: "systems/oresystem/templates/actor/actor-sheet.html",
      width: 1000,
      height: 768,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    return `systems/oresystem/templates/actor/actor-${this.actor.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.data.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const stats = [];
    const skills = [];
    const powers = [];
    const hitlocs = [];

    // Iterate through items, allocating to containers then adding the poolTotal flag
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
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

      const item = i.data;
      if (!i.flags.oresystem) {
        i.flags.oresystem = {}
      }
      if (i.type == "skill") {
        let linkedStat = context.items.find(x => x.name == item.stat)
        if (linkedStat) {
          //i.setFlag("oresystem", "poolTotal", (item.d + linkedStat.data.data.d) + "d/" + (item.ed + linkedStat.data.data.ed) + "e (" + item.ed_set + ")/" + (item.md + linkedStat.data.data.md) + "m");
          i.flags.oresystem["poolTotal"] = (item.d + linkedStat.data.d) + "d/" + (item.ed + linkedStat.data.ed) + "e (" + item.ed_set + ")/" + (item.md + linkedStat.data.md) + "m";
        }
      } else {
        //i.setFlag("oresystem", "poolTotal", item.d + "d/" + item.ed + "e (" + item.ed_set + ")/" + item.md + "m");
        i.flags.oresystem["poolTotal"] = (item.d + "d/" + item.ed + "e (" + item.ed_set + ")/" + item.md + "m");
      }

    }

    // split skills by base stat
    let sortedSkills = {};
    let myStatList = [];
    for (let i of stats) {
      myStatList.push(i.name)
    }
    myStatList.push("Any")
    for (let i of myStatList) {
      sortedSkills[i] = []
    }
    for (let i of skills) {
      //this puts them in a messy order, so I'm pre-defining the list above. Leaving this in to catch missing stats.
      if (!myStatList.includes(i.data.stat) && i.data.stat) {
        myStatList.push(i.data.stat)
        sortedSkills[i.data.stat] = [];
      }
      if (!i.data.stat) {
        //push skills with null stats to 'Any'
        sortedSkills["Any"].push(i);
      } else {
        sortedSkills[i.data.stat].push(i);
      }
    }

    // sort hitlocs by location
    hitlocs.sort((a, b) => (a.data.noEnd < b.data.noEnd) ? 1 : -1)

    // Assign and return
    context.stats = stats;
    context.skills = skills;
    context.sortedSkills = sortedSkills;
    context.powers = powers;
    context.hitlocs = hitlocs;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // for health
    this._setupSquareCounters(html)

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("itemId"));
      const name  = ev.currentTarget.dataset.name
      if (name) {
        item = this.actor.items.get(name)
      }
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Resource squares (Health)
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(li.data("itemId"));
      const name  = ev.currentTarget.dataset.name
      if (name) {
        item = this.actor.items.get(name)
      } else {
        li.slideUp(200, () => this.render(false));
      }
      item.delete();
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[roll] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  // Health stuff
  // this is accessing all of the data-x stuff in actor-health.html
  _onSquareCounterChange(event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const itemID = data.name
    const steps = parent.find('.resource-counter-step')
    const halfs = Number(data[states['/']]) || 0
    const crossed = Number(data[states.x]) || 0
    if (index < 0 || index > steps.length) {
      return
    }

    const allStates = ['', ...Object.keys(states)]
    const currentState = allStates.indexOf(oldState)
    if (currentState < 0) {
      return
    }

    const newState = allStates[(currentState + 1) % allStates.length]
    steps[index].dataset.state = newState

    if (oldState !== '') {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.

    if (newState !== '') {
      data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - halfs - crossed, 1)
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(itemID, newValue)
  }

  _setupSquareCounters(html) {
    html.find('.resource-counter').each(function () {
      const data = this.dataset
      const states = parseCounterStates(data.states)

      const halfs = Number(data[states['/']]) || 0
      const crossed = Number(data[states.x]) || 0

      const values = new Array(halfs + crossed)
      values.fill('/', 0, halfs)
      values.fill('x', halfs, halfs + crossed)


      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index]
        }
      })
    })
  }

  _onResourceChange(event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const dataset = element.dataset
    const resource = dataset.resource
    /*if (dataset.action === 'plus') {
      actorData.data.hitLocs[resource].max++
    } else if (dataset.action === 'minus') {
      actorData.data.hitLocs[resource].max = Math.max(actorData.data.hitLocs[resource].max - 1, 0)
    }

    if (actorData.data.hitLocs[resource].killing + actorData.data.hitLocs[resource].shock > actorData.data.hitLocs[resource].max) {
      actorData.data.hitLocs[resource].killing = actorData.data.hitLocs[resource].max - actorData.data.hitLocs[resource].shock
      if (actorData.data.hitLocs[resource].killing <= 0) {
        actorData.data.hitLocs[resource].killing = 0
        actorData.data.hitLocs[resource].shock = actorData.data.hitLocs[resource].max
      }
    }*/



    this.actor.update(actorData)
  }

  // Note from the original author: There's gotta be a better way to do this but for the life of me I can't figure it out
  _assignToActorField(itemID, value) {
    const actorData = duplicate(this.actor)
    // update actor owned items
    for (const i of actorData.items) {
      if (itemID === i._id) {
        i.data.shock = value.shock
        i.data.killing = value.killing
        break
      }
    }

    this.actor.update(actorData)
  }
}

function parseCounterStates(states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}
