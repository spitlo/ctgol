const debug = import.meta.env.DEV ? console.debug : () => {}

function getArrayElement(arr, forbidden = []) {
  const newArray = arr.filter((_, index) => {
    return !forbidden.includes(index)
  })
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomBoolean(probability = 0.5) {
  return Math.random() > 1 - probability
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function getRandomIntExcept(min, max, forbidden) {
  const choices = []
  for (let trackId = min; trackId <= max; trackId++) {
    if (!forbidden.includes(trackId)) {
      choices.push(trackId)
    }
  }
  return getArrayElement(choices)
}

const version = __APP_VERSION__

export {
  debug,
  getArrayElement,
  getRandomBoolean,
  getRandomInt,
  getRandomIntExcept,
  version,
}
