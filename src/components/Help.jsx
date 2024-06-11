import { createEffect, createSignal, Show } from 'solid-js'
import { version } from '../utils'
import { storage } from '../storage'

import './Help.css'

const Help = () => {
  let createdWith = version

  const [showVersionWarning, setShowVersionWarning] = createSignal(false)

  createEffect(() => {
    if (storage && storage.createdWith) {
      // This is a saved composition, compare versions
      createdWith = storage.createdWith
      const createdWithParts = createdWith.split('.')
      const currentVersionParts = version.split('.')

      // Do some heavy handed semver logic
      if (currentVersionParts[1] === '0') {
        // Semver minor is still 0, warn on patch version mismatch
        if (createdWithParts[2] !== currentVersionParts[2]) {
          setShowVersionWarning(true)
        }
      } else {
        // Semver minor is > 0, show warning on minor and major mismatch.
        // This logic probably has some pitfalls but it’s good enough for us.
        if (
          createdWithParts[1] !== currentVersionParts[1] ||
          createdWithParts[0] !== currentVersionParts[0]
        ) {
          setShowVersionWarning(true)
        }
      }
    }
  })

  return (
    <div class="help">
      <h1>Help!</h1>
      <p>
        Conway Twitty’s Game of Live is an experiment in sequencing. It’s an
        evolving step sequencer that follows the rules of Conway’s Game of Life.
      </p>
      <p>
        To help you feel the groove of these seemingly random hits of Conway
        Twitty samples, an 84 BPM drum pattern is looping in the background.
      </p>

      <hr />

      <details>
        <summary>Placing ticks</summary>
        <p>
          To help you place ticks faster, there are some keyboard modifiers. If
          you press <code>alt</code>/<code>option</code> while painting a pixel,
          you will get a horizontal line. If you press <code>shift</code> while
          painting a pixel, you will get a vertical line. Lines extend through
          all active ticks, so you can put a start and end tick and the line
          will cover the area between them. If you hold down
          <code>windows</code>/<code>command</code>/<code>meta</code> (depending
          on your OS) as well while painting a line, the line will only paint
          every other tick.
        </p>
      </details>

      <hr />

      <details>
        <summary>Sounds</summary>
        <p>
          Each track (line) represents a specific sound. Each tick on that track
          will trigger the sound to be played.
        </p>
        <p>
          You can use keys <code>a</code>-<code>z</code> to mute tracks. The
          mute letter of the track is indicated in the column to the left of the
          track.
        </p>
        <p>
          On the right side of each track is a short description of the sound.
        </p>
      </details>

      <hr />

      <details>
        <summary>Evolution</summary>
        <p>
          When you click PLAY, the grid will start evolving according to the
          rules of Conway’s Game of Life. The rules are:
        </p>

        <ol>
          <li>
            Any live cell with fewer than two live neighbors dies, as if by
            underpopulation.
          </li>
          <li>
            Any live cell with two or three live neighbors lives on to the next
            generation.
          </li>
          <li>
            Any live cell with more than three live neighbors dies, as if by
            overpopulation.
          </li>
          <li>
            Any dead cell with exactly three live neighbors becomes a live cell,
            as if by reproduction.
          </li>
        </ol>

        <p>
          Some shapes have special properties. For example, a square made up of
          four ticks will not change and not die, as long as no other shape
          collides with it. And a line made up of three ticks will oscillate
          between horizontal or vertical. For some inspiration, check out the
          patterns "Beat 1", "Beat 2", "Survivors" and "Spaceships".{' '}
          <i class="emoticon elims" />
        </p>
      </details>

      <hr />

      <details>
        <summary>Saving</summary>
        <p>
          Save works OK but I wouldn’t trust it with my life. It saves the
          current state of your composition in the URL, just copy it from the
          address bar to share it.
        </p>
        <p>
          If you don’t get any sound when you press PLAY, try hitting SAVE and
          reloading your browser.
        </p>
      </details>

      <hr />

      <details>
        <summary>How do I stop this thing?!?</summary>
        <p>
          I’m trying to get Tone.js’ start/stop mechanism functioning reliably,
          but I’ve not had any success so far. Stop seems to work, but starting
          again doesn’t always. <i class="emoticon confusion" />
        </p>
        <p>
          For now, do what I do: Save, then reload you browser. This also
          encourages you to save often, so... you’re welcome!{' '}
          <i class="emoticon nerd" />
        </p>
      </details>

      <hr />

      <details>
        <summary>Credits</summary>
        <p>
          Icons from{' '}
          <a
            href="https://emoji.serenityos.net/"
            target="_blank"
            rel="noopener noreferrer"
          >
            SerenityOS
          </a>
        </p>
        <p>
          Fonts: <br />
          Pixel Cowboy by{' '}
          <a
            href="https://wwww.sauce.nl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bruno Herfst
          </a>{' '}
          and Pixel Cowboy Regular by{' '}
          <a
            href="http://www.pixelsagas.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pixel Sagas
          </a>
        </p>
        <p>
          Drum loop by{' '}
          <a
            href="https://freesound.org/people/johntrap/"
            target="_blank"
            rel="noopener noreferrer"
          >
            johntrap
          </a>
        </p>
        <p>
          Sounds by{' '}
          <a
            href="https://tonejs.github.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tone.js
          </a>
        </p>
        <p>
          Looks by{' '}
          <a
            href="https://picocss.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pico CSS
          </a>
        </p>
        <p>
          Reactivity by{' '}
          <a
            href="https://www.solidjs.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Solid
          </a>
        </p>
        <p>
          URL Compression by{' '}
          <a
            href="https://github.com/pieroxy/lz-string"
            target="_blank"
            rel="noopener noreferrer"
          >
            lz-string
          </a>
        </p>
      </details>

      <hr />

      <p>Version: {version}</p>
      <Show when={showVersionWarning()}>
        <p class="warning">
          The current composition is saved with version {createdWith}. PIKSEQ is
          running version {version}. Some sounds may not represent what the
          original composer intended. <i class="emoticon scream" />
        </p>
      </Show>
    </div>
  )
}

export default Help
