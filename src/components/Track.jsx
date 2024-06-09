import { notes } from '../instruments'
import { actions } from '../store'

import './Track.css'

const Track = (props) => {
  const { track } = props

  const trackLetter = String.fromCharCode(track.id + 97)
  const sampleName = notes[track.id][1]

  return (
    <>
      <div
        class="track-info"
        onClick={() => {
          actions.toggleMute(track.id)
        }}
      >
        <span>{trackLetter}</span>
      </div>
      <div class={props.class}>
        {props.children}
        <span
          class="track-letter"
          onClick={() => {
            actions.playSample(notes[track.id][0])
          }}
        >
          {sampleName}
        </span>
      </div>
    </>
  )
}

export default Track
