import * as Tone from 'tone'
import { createEffect, onCleanup, onMount, For, DEV } from 'solid-js'
import { useKeyDownEvent, useKeyDownList } from '@solid-primitives/keyboard'
import { writeClipboard } from '@solid-primitives/clipboard'

import Help from './components/Help'
import Track from './components/Track'
import createModal from './components/Modal'
import patterns from './patterns'
import { actions, setStore, store } from './store'
import { load, storage } from './storage'

import './App.css'

function App() {
  const initApp = async () => {
    load()
    if (storage && storage.bpm) {
      setStore(storage)
    } else {
      actions.randomizeGrid()
    }
  }

  const cleanup = () => {
    Tone.Transport.dispose()
  }

  const kdEvent = useKeyDownEvent()
  const kdList = useKeyDownList()

  const [SaveModal, toggleSaveModal] = createModal()

  createEffect(() => {
    const e = kdEvent()
    // Avoid shiftKey, might be needed on some keyboards?
    if (e && e.key && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const charCode = e.key.charCodeAt()
      if (charCode > 96 && charCode < 123) {
        // Letters a-z
        const trackId = charCode - 97
        actions.toggleMute(trackId)
        // e.preventDefault()
      } else if (charCode > 48 && charCode < 58) {
        // Numbers 1-9. Change current color
        setStore('currentColor', Number(e.key))
      } else if (charCode === 45) {
        // -
        // actions.prevColor()
        console.log('Unused') /* eslint-disable-line */
      } else if (charCode === 43) {
        // +
        // actions.nextColor()
        console.log('Unused') /* eslint-disable-line */
      } else if (charCode === 44) {
        // ,
        actions.prevFrame()
      } else if (charCode === 46) {
        // .
        actions.nextFrame()
      }
    }
  })

  onMount(initApp)
  onCleanup(cleanup)

  return (
    <>
      <div class="container">
        <div></div>
        <div class="header">
          <button
            onClick={(e) => {
              actions.randomizeGrid()
            }}
          >
            Randomize
          </button>
          <button
            onClick={(e) => {
              actions.clearGrid()
            }}
          >
            Clear
          </button>
          {DEV && (
            <button
              onClick={(e) => {
                actions.printPattern()
              }}
            >
              Print
            </button>
          )}
          <select
            name="patterns"
            id="patterns-selector"
            onChange={(event) => {
              actions.setPattern(event.currentTarget.value)
            }}
          >
            <option value="-1">Pick a pattern</option>
            <For each={patterns}>
              {(pattern, patternIndex) => {
                return <option value={patternIndex()}>{pattern.name}</option>
              }}
            </For>
          </select>
          <span class="kaleidoscope">
            Kaleidoscope:
            <label class="gol-kaleido-x">
              <input
                type="checkbox"
                checked={store.kaleidoX}
                onClick={() => {
                  setStore('kaleidoX', !store.kaleidoX)
                }}
              />
              X
            </label>
            <label class="gol-kaleido-y">
              <input
                type="checkbox"
                checked={store.kaleidoY}
                onClick={() => {
                  setStore('kaleidoY', !store.kaleidoY)
                }}
              />
              Y
            </label>
          </span>
          <label class="gol-evolve">
            <input
              type="checkbox"
              checked={store.evolve}
              onClick={() => {
                setStore('evolve', !store.evolve)
              }}
            />
            Evolve
          </label>
          <span class="gol-indicator">Generation: {store.generation}</span>
        </div>

        <For each={store.tracks}>
          {(track, trackIndex) => {
            const { id, ticks } = track
            return (
              <Track
                class={`track ${store.mutes[trackIndex()] ? 'muted' : 'unmuted'}`}
                track={track}
              >
                <For each={ticks}>
                  {(tick, tickIndex) => {
                    return (
                      <input
                        type="checkbox"
                        checked={tick}
                        onChange={() => {
                          actions.handleTickClick(
                            track.id,
                            tickIndex(),
                            kdList()
                          )
                          return false
                        }}
                        class={`${
                          store.steps[trackIndex()] === tickIndex()
                            ? 'onstep'
                            : 'offstep'
                        } color-${tick}`}
                      />
                    )
                  }}
                </For>
              </Track>
            )
          }}
        </For>

        <div></div>
        <div class="grid toolbar">
          <button
            onClick={(e) => {
              actions.saveStore()
              toggleSaveModal()
            }}
            disabled={store.saved}
          >
            Save
          </button>
          <button onClick={actions.togglePlay}>
            {store.playing ? 'Stop' : 'Play'}
          </button>
          <input
            disabled
            type="number"
            value={store.bpm}
            step="5"
            onChange={(e) => {
              actions.setBpm(e.target.value)
            }}
          />
          <button onClick={actions.reset}>Reset</button>
        </div>

        <div></div>
        <Help />
      </div>

      <SaveModal
        title="Saved!"
        secondaryButton={{
          text: 'Copy',
          onClick: () => {
            writeClipboard(location.href)
            toggleSaveModal()
          },
        }}
      >
        <p>
          This project is now saved in the URL. You can copy the URL and share
          with a friend, or keep it for yourself. Click "Copy" to put the URL in
          your clipboard.
        </p>
        <p>
          To update the URL after you have done some changes, just hit "Save"
          again.
        </p>
      </SaveModal>
    </>
  )
}

export default App
