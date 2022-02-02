const HOOK_CLICK_SET = 'one-roll-engine clickSet'
const HOOK_CLICK_LOOSE_DIE = 'one-roll-engine clickLooseDie'


/*
 * Parse and roll dice when users type `/ore 6d10` and similar syntax
 */
Hooks.on('chatMessage', (_, messageText, data) => {
  if (messageText !== undefined && messageText.startsWith(`/ore`)) {
    rollFromChatMessageOreCommand(messageText, data)
    return false
  } else {
    return true
  }
})

/*
 * Toggle dashed outline of sets, when clicked
 */
Hooks.on('renderChatLog', () => {
  const chatLog = $('#chat-log')
  chatLog.on('click', '.ore-set-roll', (event) => {
    event.preventDefault()
    const setsDiv = event.currentTarget
    if (event.ctrlKey || event.shiftKey) {
      const hookCallAnswer = Hooks.call(HOOK_CLICK_SET, event)
      if (hookCallAnswer === false) return
    }
    setsDiv.style.outline = setsDiv.style.outline === 'dashed' ? 'none' : 'dashed'
  })
  chatLog.on('click', '.ore-single-roll.loose', (event) => {
    event.preventDefault()
    const looseDieDiv = event.currentTarget
    if (event.ctrlKey || event.shiftKey) {
      const hookCallAnswer = Hooks.call(HOOK_CLICK_LOOSE_DIE, event)
      if (hookCallAnswer === false) return
    }
    if (event.altKey) {
      const startingValue = parseInt(looseDieDiv.dataset.value)
      const currentValue = parseInt(looseDieDiv.style.backgroundImage.match(/(\d+)\.png/)[1])
      let newValue = currentValue - 1
      if (newValue === 0) newValue = `loose_${startingValue}`
      looseDieDiv.style.backgroundImage = `url("systems/oresystem/images/dice/d10_${newValue}.png")`
    } else {
      looseDieDiv.style.outline = looseDieDiv.style.outline === 'dashed' ? 'none' : 'dashed'
    }
  })
})

/**
 * @param {string} messageText
 * @param {object} data
 */
const rollFromChatMessageOreCommand = async (messageText, data) => {
  let match = messageText.match(new RegExp(`^/ore (.*?)(?:\\s*#\\s*([^]+)?)?$`))
  if (!match) return errorParsingOreCommand(messageText)
  const rollPart = match[1], flavorText = match[2]
  match = rollPart.match(new RegExp(`^([0-9]+)(?:d?1?0?\\s*?)([0-9]+)?(?:\\s*)([eEhH])?(?:\\s*)(10|[1-9])?(?:\\s*)(dif)?(?:\\s*)(10|[0-9])?(?:\\s*)(pen)?(?:\\s*)(10|[0-9])?(?:\\s*)(md|MD|m|M|wd|WD|w|W)?(?:\\s*)([0-9]+)?$`))
  if (!match) return errorParsingOreCommand(messageText)
  const diceCount = match[1]
  let expertCount = 0
  let expertValue = 10
  let difficulty = 0
  let penalty = 0
  let masterCount = 0
  // TODO: make this not be order-dependent.
  // note: when adding stuff, doing label: number works much better than vice versa
  // if e or E or h or H
  if (match[3]) {
    // if there is a number, e.g. 3H returns 3
    if (match[2]) {
      expertCount = match[2]
    } else {
      expertCount = 1
    }
    // if there is a number, e.g. e7 returns 7
    if (match[4]) {
      expertValue = match[4]
    }
  }
  // if 'dif'
  if (match[5]) {
    // e.g. dif 3 returns 3
    difficulty = match[6]
  }
  // if 'pen'
  if (match[7]) {
    // e.g. pen 2 returns 2
    penalty = match[8]
  }
  // if md|MD|m|M or any of the wiggle versions
  if (match[9]) {
    // if there is a number, e.g. md3 returns 3
    if (match[10]) {
      masterCount = parseInt(match[10], 10)
    } else {
      masterCount = 1
    }
  }
  const roll = createRawRoll(diceCount)
  const rollResult = parseRawRoll(roll, expertCount, expertValue, difficulty, penalty, flavorText, masterCount)
  data.content = await getContentFromRollResult(rollResult)
  data.type = CONST.CHAT_MESSAGE_TYPES.ROLL
  data.roll = roll
  data.flags = { core: { canPopout: true } }
  return ChatMessage.create(data, {})
}

const errorParsingOreCommand = (messageText) => {
  ui.notifications.error(
    `<div>Failed parsing your command:</div>
    <div><p style="font-family: monospace">${messageText}</p></div>
    <div>Try instead: <p style="font-family: monospace">/ore 7d 6e9 dif 3 pen 2 m5 #blah</p></div>`,
  )
  return null
}

/**
 * returns a Foundry Roll object.
 *
 * To get the array of results:
 *
 * roll.terms[0].results.map(r => r.result)    will returns an array, e.g. [2, 10, 5, 6, 5, 5, 3, 1, 1, 8]
 *
 * @param {number} diceCount
 */
const createRawRoll = (diceCount) => {
  return new Roll(`${diceCount}d10`).roll({ async: false })
}

/**
 * @typedef ORESet
 * @type {object}
 * @property {number} width - e.g. 3
 * @property {height} width - e.g. 2
 * @property {number[]} rollsInSet - e.g. [2, 2, 2]
 */

/**
 * @typedef ORERollResult
 * @type {object}
 * @property {number[]} rawRolls - e.g. [1, 2, 4, 2, 10, 2, 1]
 * @property {string} flavorText - e.g. "Flaming sword attack"
 * @property {ORESet[]} sets - e.g. [{width: 3, height: 2, rollsInSet: [2, 2, 2]}, {width: 2, height: 1, rollsInSet: [1, 1]}]
 * @property {number[]} looseDice - e.g. [4, 10]
 */

/**
 * @param roll - a Foundry Roll object that has been rolled
 * @param {string} flavorText - e.g. "Flaming sword attack"
 * @returns {ORERollResult}
 */
const parseRawRoll = (roll, expertCount, expertValue, difficulty, penalty, flavorText, masterCount) => {
  const rawRolls = roll.terms[0].results.map(r => r.result)
  // apply penalty to master dice
  if (masterCount > 0) {
    masterCount -= penalty
    if (masterCount < 0) {
      penalty = masterCount * (-1)
      masterCount = 0
    } else {
      penalty = 0
    }
  }
  // then apply remaining penalty to expert dice
  if (expertCount > 0) {
    expertCount -= penalty
    if (expertCount < 0) {
      penalty = expertCount * (-1)
      expertCount = 0
    } else {
      penalty = 0
    }
  }
  // apply remaining penalty to normal dice
  for (let i = 0; i < penalty; i++) {
    if (rawRolls.length > 0) {
      rawRolls.pop()
    }
  }
  const expertRolls = new Roll(`${expertCount}d${expertValue}`).roll({ async: false, maximize: true }).terms[0].results.map(r => r.result)
  const counts = new Array(11).fill(0)  // [0, 1, ..., 9, 10].  the 0 is not used
  rawRolls.forEach(k => {
    counts[k] += 1
  })
  expertRolls.forEach(k => {
    counts[k] += 1
  })
  const sets = {}  // key = height, value = width
  const looseDice = []
  let masterDice = new Array(masterCount).fill(10)
  counts.forEach((count, num) => {
    if (count === 0) return  // (will also skip the "0" count)
    if (num < difficulty) return // drop dice lower than the difficulty
    if (count === 1) looseDice.push(num)
    if (count >= 2) sets[num] = count
  })
  return {
    rawRolls,
    flavorText,
    sets: Object.entries(sets)
      .map(s => [parseInt(s[0], 10), s[1]])
      .sort((s1, s2) => s1[0] - s2[0])
      .map(s => ({
        width: s[1],
        height: s[0],
        rollsInSet: new Array(s[1]).fill(s[0]),
      })),
    looseDice,
    masterDice,
  }
}

/**
 * @param {ORERollResult} rollResult
 */
const getContentFromRollResult = async (rollResult) => {
  const { sets, looseDice, flavorText, masterDice } = rollResult
  return await renderTemplate(`systems/oresystem/templates/ore-roll.html`, {
    sets, looseDice, flavorText, masterDice,
  })
}

export const ORE = {
  createRawRoll,
  parseRawRoll,
  getContentFromRollResult,
  rollFromChatMessageOreCommand,
  hooks: {
    HOOK_CLICK_SET,
    HOOK_CLICK_LOOSE_DIE,
  },
}

Hooks.on('init', () => {
  game.oneRollEngine = ORE
  // if you're reading this code and planning to use this module in macros/systems - I suggest doing:
  //
  //     const ORE = game.oneRollEngine
  console.log(`ORE | Initialized.`)
})