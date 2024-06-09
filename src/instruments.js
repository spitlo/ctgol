import {
  AutoFilter,
  Delay,
  Filter,
  Player,
  Reverb,
  Sampler,
  getDestination,
} from 'tone'

const SAMPLE_BASE_URL = './sounds/'

// Add reverb to master channel
const destinationReverb = new Reverb({
  decay: 0.8,
  wet: 0.5,
})
getDestination().chain(destinationReverb)

// Set up effects
const trackFilter = new AutoFilter('4n').start()
const trackDelay = new Delay(0.01)
const trackReverb = new Reverb({
  decay: 0.3,
  wet: 0.8,
})

// Low pass filter
const lopassFilter = new Filter({
  frequency: 18000,
})

const notes = [
  ['A3', 'Hit'],
  ['B3', 'Hit'],
  ['C3', 'Bass hit'],
  ['E3', '"Hello"'],
  ['D3', 'Kick hit'],
  ['F3', 'Short hit'],
  ['G3', 'Cymb hit'],
  ['A4', 'Snare 1'],
  ['C4', 'Hit'],
  ['B4', 'Snare 2'],
  ['D4', 'Guit chrd'],
  ['E4', 'Guit strm'],
  ['F4', 'Synth hit'],
  ['G4', 'Guit slide'],
  ['A5', 'Hit'],
  ['B6', 'Guit notes'],
  ['B5', 'Soft hit'],
  ['D5', 'Guit strm'],
  ['E5', 'Guit strm'],
  ['C5', '"Man"'],
  ['F5', 'Rhodes'],
  ['G5', 'Guit hit'],
  ['A6', 'Tom hit'],
  ['C6', 'Guit note'],
  ['D6', 'Guit hit'],
  ['E6', 'Bass slide'],
]

const urls = {
  A3: 'sampleA.mp3', // Hit
  B3: 'sampleB.mp3', // Hit
  C3: 'sampleC.mp3', // Bass hit
  D3: 'sampleD.mp3', // Kick hit
  E3: 'sampleE.mp3', // "Hello"
  F3: 'sampleF.mp3', // Short hit
  G3: 'sampleG.mp3', // Short cymb hit
  A4: 'sampleH.mp3', // Snare
  B4: 'sampleI.mp3', // Snare bounce
  C4: 'sampleJ.mp3', // Hit
  D4: 'sampleK.mp3', // Guitar chord
  E4: 'sampleL.mp3', // Guitar strum
  F4: 'sampleM.mp3', // Synth hit?
  G4: 'sampleN.mp3', // Guitar slide
  A5: 'sampleO.mp3', // Hit
  B5: 'sampleP.mp3', // Soft hit
  C5: 'sampleQ.mp3', // "Man"
  D5: 'sampleR.mp3', // Guitar strum
  E5: 'sampleS.mp3', // Guitar strum
  F5: 'sampleT.mp3', // Rhodes?
  G5: 'sampleU.mp3', // Guitar hit
  A6: 'sampleV.mp3', // Tom hit
  B6: 'sampleW.mp3', // Guitar hammer
  C6: 'sampleX.mp3', // Short guitar note
  D6: 'sampleY.mp3', // Guitar hit
  E6: 'sampleZ.mp3', // Bass slide
}

const sampler = new Sampler({
  urls,
  baseUrl: SAMPLE_BASE_URL,
}).sync()

const standaloneSampler = new Sampler({
  urls,
  baseUrl: SAMPLE_BASE_URL,
}).toDestination()

export {
  lopassFilter,
  notes,
  sampler,
  standaloneSampler,
  trackDelay,
  trackFilter,
  trackReverb,
}
