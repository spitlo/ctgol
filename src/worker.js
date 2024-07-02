const TRACK_LENGTH = 32

const isActive = (x, y, tracks) => {
  if (tracks && tracks[y] && tracks[y][x]) {
    return true
  } else {
    return false
  }
}

function countActiveNeighbours(x, y, tracks) {
  let activeNeighbours = 0

  for (let cx = x - 1; cx <= x + 1; cx++) {
    for (let cy = y - 1; cy <= y + 1; cy++) {
      if ((cx !== x || cy !== y) && isActive(cx, cy, tracks)) {
        activeNeighbours++
      }
    }
  }

  return activeNeighbours
}

const checkCells = (startRow, endRow, tracks, nextTracks, evolve) => {
  let activeNeighbours
  for (let gy = startRow; gy < endRow; gy++) {
    for (let gx = 0; gx < TRACK_LENGTH; gx++) {
      activeNeighbours = countActiveNeighbours(gx, gy, tracks)

      if (activeNeighbours < 2) {
        // Any live cell with fewer than two live neighbours dies, as if caused by under-population
        nextTracks[gy][gx] = 0
      } else if (
        (activeNeighbours === 2 || activeNeighbours === 3) &&
        isActive(gx, gy, tracks)
      ) {
        // Any live cell with two or three live neighbours lives on to the next generation.
        nextTracks[gy][gx] = 1
      } else if (activeNeighbours > 3 && isActive(gx, gy, tracks)) {
        // Any live cell with more than three live neighbours dies, as if by overcrowding
        nextTracks[gy][gx] = 0
      } else if (activeNeighbours === 3 && !isActive(gx, gy, tracks)) {
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
        nextTracks[gy][gx] = 1
      }
    }
  }

  // Evolve!
  if (evolve) {
    postMessage(nextTracks)
  }
}

onmessage = (event) => {
  checkCells(
    event.data[0],
    event.data[1],
    event.data[2],
    event.data[3],
    event.data[4]
  )
}
