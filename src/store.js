import * as Tone from 'tone'
import { createEffect, untrack } from 'solid-js'
import { createStore, produce, unwrap } from 'solid-js/store'

import patterns from './patterns'
import {
  notes,
  sampler,
  standaloneSampler,
  trackDelay,
  trackFilter,
  trackReverb,
} from './instruments'
import { load, save, stash, storage } from './storage'
import {
  getArrayElement,
  getRandomInt,
  getRandomIntExcept,
  version,
} from './utils'

const INSTRUMENT_AMOUNT = notes.length
const TRACK_LENGTH = 32
const EFFECTS = [trackDelay, trackFilter, trackReverb]
const VELOCITIES = [0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1]
const DURATIONS = ['4n', '4n', '4n', '8n', '16n', '32n']

let index = 0

const generateTracks = () => {
  const tracks = []
  for (let id = 0; id < INSTRUMENT_AMOUNT; id++) {
    tracks.push({
      id,
      ticks: new Array(TRACK_LENGTH).fill(0),
    })
  }
  return tracks
}

const tracks = generateTracks()
const nextTracks = structuredClone(tracks)

const [store, setStore] = createStore({
  bpm: 42,
  createdWith: version,
  evolve: true,
  generation: 0,
  initiated: false,
  kaleidoX: false,
  kaleidoY: false,
  mutes: new Array(INSTRUMENT_AMOUNT).fill(false),
  playing: false,
  saved: true,
  steps: new Array(TRACK_LENGTH).fill(0),
  tracks,
})

const initContext = () => {
  Tone.setContext(new Tone.Context({ latencyHint: 'playback' }))
}

const isActive = (x, y) => {
  if (store.tracks && store.tracks[x] && store.tracks[x].ticks[y]) {
    return true
  } else {
    return false
  }
}

function countActiveNeighbours(x, y) {
  let activeNeighbours = 0

  for (let cx = x - 1; cx <= x + 1; cx++) {
    for (let cy = y - 1; cy <= y + 1; cy++) {
      if ((cx !== x || cy !== y) && isActive(cx, cy)) {
        activeNeighbours++
      }
    }
  }

  return activeNeighbours
}

const checkCells = () => {
  let activeNeighbours
  for (let cx = 0; cx < INSTRUMENT_AMOUNT; cx++) {
    for (let cy = 0; cy < TRACK_LENGTH; cy++) {
      activeNeighbours = countActiveNeighbours(cx, cy)

      if (activeNeighbours < 2) {
        // Any live cell with fewer than two live neighbours dies, as if caused by under-population
        nextTracks[cx].ticks[cy] = 0
      } else if (
        (activeNeighbours === 2 || activeNeighbours === 3) &&
        isActive(cx, cy)
      ) {
        // Any live cell with two or three live neighbours lives on to the next generation.
        nextTracks[cx].ticks[cy] = 1
      } else if (activeNeighbours > 3 && isActive(cx, cy)) {
        // Any live cell with more than three live neighbours dies, as if by overcrowding
        nextTracks[cx].ticks[cy] = 0
      } else if (activeNeighbours === 3 && !isActive(cx, cy)) {
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
        nextTracks[cx].ticks[cy] = 1
      }
    }
  }

  // Now make the new frame active
  // setStore('tracks', structuredClone(nextTracks))
  setStore(
    produce((str) => {
      str.tracks = structuredClone(nextTracks)
      str.generation = store.generation + 1
    })
  )
}

const loop = (time) => {
  for (let trackId = 0; trackId < store.tracks.length; trackId++) {
    let step = index % 32
    const currentTrack = store.tracks[trackId]
    if (!store.mutes[trackId]) {
      if (currentTrack.ticks[step]) {
        if (notes[trackId]) {
          const note = notes[trackId][0]
          sampler
            .chain(getArrayElement(EFFECTS), Tone.getDestination())
            .triggerAttackRelease(
              note,
              getArrayElement(DURATIONS),
              time,
              getArrayElement(VELOCITIES)
            )
        }
      }
    }

    Tone.Draw.schedule(() => {
      const steps = store.steps
      setStore('steps', trackId, step)
    }, time)
  }

  Tone.Draw.schedule(() => {
    if (store.evolve && (index + 3) % 4 === 0) {
      checkCells()
    }
  }, time)

  index++
}

const toggleTick = (trackId, tickId, force) => {
  setStore(
    'tracks',
    (tracks) => tracks.id === trackId,
    produce((track) => {
      if (force) {
        track.ticks[tickId] = 1
      } else {
        track.ticks[tickId] = track.ticks[tickId] ? 0 : 1
      }
    })
  )
  setStore('saved', false)
}

const kaleidoProxy = (trackId, tickId, force) => {
  toggleTick(trackId, tickId, force)

  if (store.kaleidoX && store.kaleidoY) {
    toggleTick(trackId, TRACK_LENGTH - tickId - 1, force)
    toggleTick(INSTRUMENT_AMOUNT - trackId - 1, tickId, force)
    toggleTick(
      INSTRUMENT_AMOUNT - trackId - 1,
      TRACK_LENGTH - tickId - 1,
      force
    )
  } else if (store.kaleidoX) {
    toggleTick(trackId, TRACK_LENGTH - tickId - 1, force)
  } else if (store.kaleidoY) {
    toggleTick(INSTRUMENT_AMOUNT - trackId - 1, tickId, force)
  }
}

const handleTickClick = (trackId, tickId, keys) => {
  // If META is pressed, only paint every other tick
  let stepSize = 1
  if (keys.includes('META')) {
    stepSize = 2
  }

  // Paint user’s original click
  kaleidoProxy(trackId, tickId)

  // Now check if this is a line click
  if (keys.includes('ALT')) {
    // Horizontal line
    let togglePrev = true
    let toggleNext = true
    let counter = 0
    // Loop until we reach a stop on bothe sides
    while (togglePrev || toggleNext) {
      counter++
      if (tickId - counter < 0) {
        togglePrev = false
      }
      if (tickId + counter === TRACK_LENGTH) {
        toggleNext = false
      }
      if (togglePrev) {
        let prevTick = store.tracks[trackId].ticks[tickId - counter]
        if (prevTick < 1) {
          if (counter % stepSize === 0) {
            if (!store.kaleidoX && !store.kaleidoY) {
              kaleidoProxy(trackId, tickId - counter, true)
            } else {
              if (store.kaleidoX) {
              }
            }
          }
        } else {
          togglePrev = false
        }
      }
      if (toggleNext) {
        let nextTick = store.tracks[trackId].ticks[tickId + counter]
        if (nextTick < 1) {
          if (counter % stepSize === 0) {
            kaleidoProxy(trackId, tickId + counter, true)
          }
        } else {
          toggleNext = false
        }
      }
    }
  } else if (keys.includes('SHIFT')) {
    // Vertical line
    let togglePrev = true
    let toggleNext = true
    let counter = 0
    while (togglePrev || toggleNext) {
      counter++
      if (trackId - counter < 0) {
        togglePrev = false
      }
      if (trackId + counter === store.tracks.length) {
        toggleNext = false
      }
      if (togglePrev) {
        let prevTick = store.tracks[trackId - counter].ticks[tickId]
        if (prevTick < 1) {
          if (counter % stepSize === 0) {
            kaleidoProxy(trackId - counter, tickId, true)
          }
        } else {
          togglePrev = false
        }
      }
      if (toggleNext) {
        let nextTick = store.tracks[trackId + counter].ticks[tickId]
        if (nextTick < 1) {
          if (counter % stepSize === 0) {
            kaleidoProxy(trackId + counter, tickId, true)
          }
        } else {
          toggleNext = false
        }
      }
    }
  }

  setStore('saved', false)
}

const toggleMute = (trackId) => {
  setStore(
    produce((store) => {
      if (store.mutes.length >= trackId + 1) {
        store.mutes[trackId] = !untrack(() => store.mutes[trackId])
      }
      store.saved = false
    })
  )
}

const setBpm = (newBpm) => {
  Tone.getTransport().bpm.value = newBpm
  setStore(
    produce((store) => {
      store.bpm = newBpm
      store.saved = false
    })
  )
}

const saveStore = () => {
  Tone.getTransport().stop()
  const steps = new Array(store.steps.length).fill(0)
  setStore(
    produce((store) => {
      store.initiated = false
      store.playing = false
      store.saved = true
      store.steps = steps
      store.createdWith = version
    })
  )
  stash(store)
  save()
}

const initAndPlay = async () => {
  if (!store.initiated) {
    await Tone.start()
    Tone.getTransport().bpm.value = store.bpm
    Tone.getTransport().scheduleRepeat(loop, '16n')
  }

  Tone.getTransport().start()

  setStore(
    produce((store) => {
      store.initiated = true
      store.playing = true
    })
  )
}

const togglePlay = () => {
  if (!store.playing) {
    initAndPlay()
  } else {
    Tone.getTransport().pause()
    setStore('playing', false)
  }
}

const setColorScheme = (scheme) => {
  setStore('colorScheme', scheme)
}

const reset = () => {
  location.href = '.'
}

const randomizeGrid = (chance = 0.8) => {
  for (let cx = 0; cx < INSTRUMENT_AMOUNT; cx++) {
    for (let cy = 0; cy < TRACK_LENGTH; cy++) {
      nextTracks[cx].ticks[cy] = Math.random() < chance ? 0 : 1
    }
  }

  setStore('tracks', structuredClone(nextTracks))
}

const clearGrid = () => {
  for (let cx = 0; cx < INSTRUMENT_AMOUNT; cx++) {
    for (let cy = 0; cy < TRACK_LENGTH; cy++) {
      nextTracks[cx].ticks[cy] = 0
    }
  }

  setStore('tracks', structuredClone(nextTracks))
}

const setPattern = (patternIndex) => {
  if (patternIndex < 0) {
    return
  }
  const { pattern } = patterns[patternIndex]
  const tracks = []
  for (let id = 0; id < INSTRUMENT_AMOUNT; id++) {
    tracks.push({
      id,
      ticks: pattern[id],
    })
  }
  setStore('tracks', structuredClone(tracks))
}

const printPattern = () => {
  for (let id = 0; id < INSTRUMENT_AMOUNT; id++) {
    console.log(`${store.tracks[id].ticks}`)
  }
}

const playSample = async (note) => {
  if (!store.initiated) {
    await Tone.start()
    setStore('initiated', true)
  }
  standaloneSampler.triggerAttackRelease(note, '4n')
}

const actions = {
  clearGrid,
  handleTickClick,
  initAndPlay,
  initContext,
  playSample,
  printPattern,
  randomizeGrid,
  reset,
  saveStore,
  setBpm,
  setColorScheme,
  setPattern,
  toggleMute,
  togglePlay,
}

export { TRACK_LENGTH, actions, loop, setStore, store }
