/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */

export class ReignItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

    console.log('in pre-create');

    // TODO: make this just affect skills - I think I just need to do if(data.type == 'skill')
    // assign a default image
    if (!data.img && data.type === 'skill') {
      const img = "systems/oresystem/images/items/skills.svg";
      if (img) await this.data.update({ img });
    }
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.data.data);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  /* async roll() {
     const item = this.data;
 
     // Initialize chat data.
     const speaker = ChatMessage.getSpeaker({ actor: this.actor });
     const rollMode = game.settings.get('core', 'rollMode');
     const label = `[${item.type}] ${item.name}`;
 
     // If there's no roll data, send a chat message.
     if (!this.data.data.formula) {
       ChatMessage.create({
         speaker: speaker,
         rollMode: rollMode,
         flavor: label,
         content: item.data.description ?? ''
       });
     }
     // Otherwise, create a roll and send a chat message from it.
     else {
       // Retrieve roll data.
       const rollData = this.getRollData();
 
       // Invoke the roll and submit it to chat.
       const roll = new Roll(rollData.item.formula, rollData);
       // If you need to store the value first, uncomment the next line.
       // let result = await roll.roll({async: true});
       roll.toMessage({
         speaker: speaker,
         rollMode: rollMode,
         flavor: label,
       });
       return roll;
     }*/

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const ORE = game.oneRollEngine;

    const item = this.data;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const label = `[${item.type}] ${item.name}`;

    let fakeData = {
      content: '',
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: '',
      flags: { core: { canPopout: true } }
    }

    // Construct the roll
    let str;
    // if it's a skill we need to add a stat to it
    if (this.type == "skill") {
      let linkedStat = this.actor.items.getName(this.data.data.stat)
      let difficulty = this.actor.data.data.difficulty
      let penalty = this.actor.data.data.penalty
      str = "/ore " + (item.data.d + linkedStat.data.data.d) + "d " + (item.data.ed + linkedStat.data.data.ed) + "e" + item.data.ed_set + " dif " + difficulty + " pen " + penalty + " md " + (item.data.md + linkedStat.data.data.md) + " # " + item.name;
    } else {
      str = "/ore " + item.data.d + "d " + item.data.ed + "e" + item.data.ed_set + " dif " + difficulty + " pen " + penalty + " md " + item.data.md + " # " + item.name;
    }


    await ORE.rollFromChatMessageOreCommand(str, fakeData)
  }

}
