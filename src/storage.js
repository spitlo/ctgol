import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import { debug } from './utils'

let storage = {}

const load = () => {
  if (location.hash) {
    let hash = location.hash.slice(1)
    let escaped
    if (hash.startsWith('LZ:')) {
      hash = hash.substring(3)
      escaped = decompressFromEncodedURIComponent(hash)
    } else {
      escaped = atob(hash)
    }
    const unescaped = unescape(escaped)
    const tempStorage = JSON.parse(unescaped)
    storage = tempStorage
    debug('In load: Storage is now', storage)
  }
}

const save = () => {
  const stringified = JSON.stringify(storage)
  const escaped = escape(stringified)
  const hash = compressToEncodedURIComponent(escaped)
  location.hash = 'LZ:' + hash
}

const stash = (values) => {
  debug('Stashing values', values)
  storage = {
    ...storage,
    ...values,
  }
  debug('In stash: Storage is now', storage)
}

export { load, save, stash, storage }
