import { notes } from '../instruments'
import { actions } from '../store'

import './Track.css'

const Track = (props) => {
  const { track, trackIndex } = props

  const trackLetter = String.fromCharCode(trackIndex + 97)
  const sampleName = trackIndex > -1 ? notes[trackIndex][1] : 'Step'

  return (
    <>
      <div
        class="track-info"
        onClick={() => {
          actions.toggleMute(trackIndex)
        }}
      >
        <span>{trackLetter}</span>
      </div>
      <div class={props.class}>
        {props.children}
        <span
          class="track-letter"
          onClick={() => {
            actions.playSample(notes[trackIndex][0])
          }}
        >
          {sampleName}
        </span>
      </div>
    </>
  )
}

export default Track
