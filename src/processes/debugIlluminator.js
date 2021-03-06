// This labels displays

module.exports = async room => {
  const em = 0.05
  const right_x = 1 - 5 * em
  const activeProcesses = new Map()

  const facts = [
    `draw label display at (${em}, ${em})`,
    `table: draw label table at (${em}, ${em + em})`,
    `whiteboard: draw label whiteboard at (${em}, ${em + em})`,
    `whiteboard: draw text "active processes" at (${right_x}, ${em})`
  ]

  room.subscribe(
    [`debugIllimnator is active`, `hueIndex $hueIndex is $r, $g, $b, $a`],
    ({ assertions, retractions }) => {
      assertions.forEach(
        ({
          hueIndex: { value: hueIndex },
          r: { value: r },
          g: { value: g },
          b: { value: b },
          a: { value: a }
        }) => {
          const radius = 0.8
          const x = 0.9 * radius
          const y = 0.9 * radius * (2 + hueIndex)
          room.assert(
            `whiteboard: draw a (${r}, ${g}, ${b}) circle at (${x}, ${y}) with radius ${radius}`
          )
        }
      )
    }
  )

  room.subscribe(`$name is active`, ({ assertions, retractions }) => {
    retractions.forEach(({ name }) => {
      const index =
        (activeProcesses.get(name.word) &&
          activeProcesses.get(name.word).index) ||
        activeProcesses.size + 1
      activeProcesses.set(name.word, { index, active: false })
    })

    assertions.forEach(({ name }) => {
      const index =
        (activeProcesses.get(name.word) &&
          activeProcesses.get(name.word).index) ||
        activeProcesses.size + 1
      activeProcesses.set(name.word, { index, active: true })
    })

    if (
      activeProcesses.has('debugIlluminator') &&
      !activeProcesses.get('debugIlluminator').active
    ) {
      facts.forEach(room.retract.bind(room))
      Array.from(activeProcesses.entries()).forEach(([name, { index }]) => {
        const y = (2 + index + 1) * em
        const fact = `whiteboard: draw label ${name} at (${right_x}, ${y})`
        room.retract(fact)
      })
    }

    if (
      activeProcesses.has('debugIlluminator') &&
      activeProcesses.get('debugIlluminator').active
    ) {
      facts.forEach(room.assert.bind(room))
      Array.from(activeProcesses.entries()).forEach(
        ([name, { index, active }]) => {
          const y = (2 + index + 1) * em
          const fact = `whiteboard: draw label ${name} at (${right_x}, ${y})`
          if (active) {
            room.assert(fact)
          } else {
            room.retract(fact)
          }
        }
      )
    }
  })
}
