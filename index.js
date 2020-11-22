'use strict'

var spawnSync = require('child_process').spawnSync

/**
 * RegKeys,
 *
 * allows querying of Registry (sub)keys
 * on Windows, uses the OS internal **reg.exe** executable.
 *
 * License: MIT,
 *
 * Author: Igor Dimitrijević <igor.dvlpr@gmail.com>, 2020.
 */
class RegKeys {
  /**
   * Creates a RegKeys object.
   * @param {string} rootKey
   */
  constructor(rootKey) {
    this.query = expandRoot(rootKey)
    this.keys = []
  }

  /**
   * Gets the (sub)keys for the given (root)key.
   *
   * NOTE: Results are **cached**!
   * @param {boolean} [forceRefresh=false]
   * @returns {string[]}
   */
  get(forceRefresh = false) {
    if (this.keys.length > 0 && !forceRefresh) {
      return this.keys
    }

    const count = this.query.length

    if (count < 4) {
      return []
    }

    try {
      const shell = spawnSync('REG', ['QUERY', this.query, '/f "*" /k'], {
        stdio: 'pipe',
        shell: true,
      })
      const output = shell.stdout.toString()
      let searchKey = this.query

      this.keys = output.split('\r\n')

      if (count > 0) {
        if (searchKey[count - 1] !== '\\') {
          searchKey += '\\'
        }
      }

      this.keys = this.keys
        .map((key) => {
          if (key.indexOf(this.query) === 0) {
            return key.replace(searchKey, '')
          }
        })
        .filter(Boolean)
    } catch (exp) {
      console.error(exp)
      return this.keys
    }

    return this.keys
  }

  /**
   * Checks whether the given (sub)key is a direct child of the currently selected key.
   * @param {string} searchFor
   * @param {boolean} [caseSensitive=false]
   * @returns {boolean}
   */
  hasKey(searchFor, caseSensitive = false) {
    if (!searchFor || typeof searchFor !== 'string' || searchFor.length === 0) {
      return false
    }

    if (this.keys.length === 0) {
      this.keys = this.get()
    }

    let index = -1

    if (caseSensitive) {
      index = this.keys.indexOf(searchFor)
    } else {
      index = this.keys.findIndex((key) => {
        return key.toLowerCase() === searchFor.toLowerCase()
      })
    }

    return index > -1
  }

  /**
   * Checks whether the given (sub)keys are a direct child of the currently selected key.
   * @param {string[]} list
   * @param {boolean} [caseSensitive=false]
   * @returns {boolean[]}
   */
  hasKeys(list, caseSensitive = false) {
    if (!list || !(list instanceof Array)) {
      return []
    }

    const count = list.length
    const result = []

    if (count === 0) {
      return result
    }

    if (this.keys.length === 0) {
      this.keys = this.get()
    }

    for (let i = 0; i < count; i++) {
      let index = -1

      if (caseSensitive) {
        index = this.keys.indexOf(list[i])
      } else {
        index = this.keys.findIndex((key) => {
          return key.toLowerCase() === list[i].toLowerCase()
        })
      }

      result.push(index > -1)
    }

    return result
  }

  /**
   * A generic method that checks whether the given (sub)key(s) is/are a direct child of the currently selected key. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter.
   * @param {string|string[]} value
   * @param {boolean} [value=false]
   * @returns {boolean|boolean[]}
   * @see hasKey
   * @see hasKeys
   */
  has(value, caseSensitive = false) {
    if (!value) {
      return false
    }

    if (value instanceof Array) {
      return this.hasKeys(value, caseSensitive)
    } else if (typeof value === 'string') {
      return this.hasKey(value, caseSensitive)
    }

    return false
  }

  /**
   * Clears the cached result, if any.
   * @returns {void}
   */
  clear() {
    this.keys = []
  }
}

// 💪 Helper functions 💪

/**
 * Extracts the root key of the given (sub)key.
 * @param {*} key The root key to process.
 * @returns {string}
 */
function extractRootKey(key) {
  if (key && typeof key === 'string') {
    // convert to uppercase for consistency,
    // and to avoid case mismatching
    key = key.toUpperCase()

    // magic 🔮😂
    const keys = key.split(/\/|\\/)

    if (keys.length > 0) {
      return keys[0]
    }

    return key
  } else {
    return ''
  }
}

/**
 * Expands = converts short root keys to
 * fully-qualified ones and returns it
 * as a string.
 *
 * If no value is provided it will return 'HKEY_CURRENT_USER'.
 * @param {string} key The key to expand.
 * @returns {string} The expanded root key.
 */
function expandRoot(key) {
  if (typeof key === 'string') {
    const keyRoot = extractRootKey(key)
    let result = key

    if (keyRoot.length === 0) {
      return 'HKEY_CURRENT_USER'
    }

    let didExpand = false

    switch (keyRoot) {
      case 'HKCR': {
        result = 'HKEY_CLASSES_ROOT'
        didExpand = true
        break
      }

      case 'HKCU': {
        result = 'HKEY_CURRENT_USER'
        didExpand = true
        break
      }

      case 'HKLM': {
        result = 'HKEY_LOCAL_MACHINE'
        didExpand = true
        break
      }

      case 'HKU': {
        result = 'HKEY_USERS'
        didExpand = true
        break
      }

      case 'HKCC': {
        result = 'HKEY_CURRENT_CONFIGURATION'
        didExpand = true
        break
      }
    }

    if (didExpand) {
      result = key.replace(new RegExp('^' + keyRoot, 'i'), result)
    }

    result = result.replace(new RegExp(/\//, 'gi'), '\\')

    return result
  }

  return 'HKEY_CURRENT_USER'
}

module.exports = RegKeys
