import { createEffect, createSignal, Show } from 'solid-js'
import { Portal } from 'solid-js/web'

import './Modal.css'

const isOpenClass = 'modal-is-open'
const openingClass = 'modal-is-opening'
const closingClass = 'modal-is-closing'
const scrollbarWidthCssVar = '--pico-scrollbar-width'
const animationDuration = 400

// Get scrollbar width
const getScrollbarWidth = () => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth
  return scrollbarWidth
}

// Is scrollbar visible
const isScrollbarVisible = () => {
  return document.body.scrollHeight > screen.height
}

const createModal = () => {
  let elementRef
  const [open, setOpen] = createSignal(false)

  // Open modal
  const openModal = () => {
    const { documentElement } = document
    const scrollbarWidth = getScrollbarWidth()
    if (scrollbarWidth) {
      documentElement.style.setProperty(
        scrollbarWidthCssVar,
        `${scrollbarWidth}px`
      )
    }
    documentElement.classList.add(isOpenClass, openingClass)
    setTimeout(() => {
      documentElement.classList.remove(openingClass)
    }, animationDuration)
  }

  // Close modal
  const closeModal = (callback) => {
    const { documentElement } = document
    documentElement.classList.add(closingClass)
    setTimeout(() => {
      documentElement.classList.remove(closingClass, isOpenClass)
      documentElement.style.removeProperty(scrollbarWidthCssVar)
      callback()
    }, animationDuration)
  }

  const toggleModal = () => {
    if (open()) {
      closeModal(() => {
        setOpen(false)
      })
    } else {
      setOpen(true)
      openModal()
    }
  }

  // Figure out the timing of this, as it is now, the
  // // Close with a click outside
  // document.addEventListener('click', (event) => {
  //   if (!open()) {
  //     return
  //   }
  //   const modalContent = elementRef.querySelector('article')
  //   const isClickInside = modalContent.contains(event.target)
  //   if (!isClickInside) {
  //     closeModal(() => {
  //       setOpen(false)
  //     })
  //   }
  // })

  // Close with Esc key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open()) {
      closeModal(() => {
        setOpen(false)
      })
    }
  })

  const Modal = (props) => {
    return (
      <Portal>
        <dialog class="modal" open={open()} ref={elementRef}>
          <article>
            <header>
              <button
                aria-label="Close"
                rel="prev"
                onclick={toggleModal}
              ></button>
              <h3>{props.title}</h3>
            </header>
            {props.children}
            <footer>
              <Show when={props.secondaryButton}>
                <button
                  role="button"
                  class="secondary"
                  onClick={props.secondaryButton.onClick}
                >
                  {props.secondaryButton.text}
                </button>
              </Show>
              <button autofocus onClick={toggleModal}>
                OK!
              </button>
            </footer>
          </article>
        </dialog>
      </Portal>
    )
  }

  return [Modal, toggleModal]
}

export default createModal
