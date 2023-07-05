// Copyright: Igor Dimitrijević (@igorskyflyer)

/**
 * RegKeys,
 *
 * allows querying of Registry keys
 * on Windows, uses the OS internal **reg.exe** executable.
 *
 * License: MIT,
 *
 * Author: Igor Dimitrijević <igor.dvlpr@gmail.com>, 2021.
 */

import { spawnSync } from 'node:child_process'
import { platform } from 'node:os'
import type { SearchPredicate } from './SearchPredicate.mjs'

/**
 * RegKeys class.
 */
export class RegKeys {
  query: string
  keys: string[]
  /**
   * Creates a RegKeys object.
   * @param {string} key
   */
  constructor(key: string) {
    this.query = expandHive(key)
    /** @type {string[]} */
    this.keys = []
  }

  // for faster referencing
  static HKLM = 'HKEY_LOCAL_MACHINE'
  static HKCR = 'HKEY_CLASSES_ROOT'
  static HKCU = 'HKEY_CURRENT_USER'
  static HKCC = 'HKEY_CURRENT_CONFIGURATION'
  static HKU = 'HKEY_USERS'

  /**
   * Synchronously gets the keys for the given root key.
   *
   * NOTE: Results are **cached**!
   * @param {boolean} [forceRefresh=false]
   * @throws Throws an error if the host machine is not running Windows OS.
   * @returns {string[]}
   */
  get(forceRefresh: boolean = false): string[] {
    if (!isWindows()) {
      throw new Error('This function only runs on Windows operating system.')
    }

    if (this.keys.length > 0 && !forceRefresh) {
      return this.keys
    }

    const count = this.query.length

    if (count < 4) {
      return []
    }

    try {
      // quotes are needed when keys contain spaces
      const query = toQuoteOrNotToQuote(this.query)

      const shell = spawnSync('reg.exe', ['query', query, '/f "*" /k'], {
        stdio: 'pipe',
        shell: true,
      })

      if (shell && shell.stdout) {
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

            return ''
          })
          .filter(Boolean)
      } else {
        return this.keys
      }
    } catch (exp) {
      console.error(exp)
      return this.keys
    }

    return this.keys
  }

  /**
   * Asynchronously gets the keys for the given root key.
   *
   * NOTE: Results are **cached**!
   * @param {boolean} [forceRefresh=false]
   * @throws Throws an error if the host machine is not running Windows OS.
   * @returns {Promise<string[]>}
   */
  async getAsync(forceRefresh: boolean = false): Promise<string[]> {
    return this.get(forceRefresh)
  }

  /**
   * Synchronously checks whether the given key is a direct child of the currently selected key.
   * @param {string} searchFor
   * @param {boolean} [caseSensitive=false]
   * @returns {boolean}
   */
  hasKey(searchFor: string, caseSensitive: boolean = false): boolean {
    if (!searchFor || typeof searchFor !== 'string' || searchFor.length === 0) {
      return false
    }

    if (this.keys.length === 0) {
      this.get()
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
   * Asynchronously checks whether the given key is a direct child of the currently selected key.
   * @param {string} searchFor
   * @param {boolean} [caseSensitive=false]
   * @returns {Promise<boolean>}
   */
  async hasKeyAsync(searchFor: string, caseSensitive: boolean = false): Promise<boolean> {
    return this.hasKey(searchFor, caseSensitive)
  }

  /**
   * Synchronously checks whether the given keys are a direct child of the currently selected key.
   * @param {string[]} list
   * @param {boolean} [caseSensitive=false]
   * @returns {boolean[]}
   */
  hasKeys(list: string[], caseSensitive: boolean = false): boolean[] {
    if (!list || !(list instanceof Array)) {
      return []
    }

    const count = list.length
    /** @type {boolean[]} */
    const result: boolean[] = []

    if (count === 0) {
      return result
    }

    if (this.keys.length === 0) {
      this.get()
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
   * Asynchronously checks whether the given keys are a direct child of the currently selected key.
   * @param {string[]} list
   * @param {boolean} [caseSensitive=false]
   * @returns {Promise<boolean[]>}
   */
  async hasKeysAsync(list: string[], caseSensitive: boolean = false): Promise<boolean[]> {
    return this.hasKeys(list, caseSensitive)
  }

  /**
   * A generic, synchronous method that checks whether the given key(s) is/are a direct child of the currently selected key. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter.
   * @param {string|string[]} value
   * @param {boolean} [value=false]
   * @returns {boolean|boolean[]}
   * @see hasKey
   * @see hasKeys
   */
  has(value: string | string[], caseSensitive = false): boolean | boolean[] {
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
   * A generic, asynchronous method that checks whether the given key(s) is/are a direct child of the currently selected key. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter.
   * @param {string|string[]} value
   * @param {boolean} [value=false]
   * @returns {Promise<boolean|boolean[]>}
   * @see hasKey
   * @see hasKeys
   */
  async hasAsync(value: string | string[], caseSensitive = false): Promise<boolean | boolean[]> {
    return this.has(value, caseSensitive)
  }

  /**
   * Provides a synchronous way to do keys-checking
   * using a custom predicate function.
   * @param {string} value
   * @param {SearchPredicate} predicate
   * @returns {boolean} it returns true upon finding the first match or false if no match is found or any of the both required parameters aren't set.
   */
  searchFor(value: string, predicate: SearchPredicate): boolean {
    if (!value || typeof predicate !== 'function') {
      return false
    }

    if (this.keys.length === 0) {
      this.get()
    }

    const count = this.keys.length

    for (let i = 0; i < count; i++) {
      if (predicate(this.keys[i], value, i)) {
        return true
      }
    }

    return false
  }

  /**
   * Provides an asynchronous way to do keys-checking
   * using a custom predicate function.
   * @param {string} value
   * @param {SearchPredicate} predicate
   * @returns {Promise<boolean>} it returns true upon finding the first match or false if no match is found or any of the both required parameters aren't set.
   */
  async searchForAsync(value: string, predicate: SearchPredicate): Promise<boolean> {
    return this.searchFor(value, predicate)
  }

  /**
   * Clears the cached result, if any.
   * @returns {void}
   */
  clear(): void {
    this.keys = []
  }
}

// 💪 Helper functions 💪
/**
 * Extracts the hive of the given key.
 * @param {*} key The key to process.
 * @returns {string}
 */
function extractHive(key: any): string {
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
 * Expands = converts short hive names to
 * fully-qualified ones and returns it
 * as a string.
 *
 * If no value is provided it will return 'HKEY_CURRENT_USER'.
 * @param {string} key The key to expand.
 * @returns {string} The expanded hive key.
 */
function expandHive(key: string): string {
  if (typeof key === 'string') {
    const hive = extractHive(key)
    let result = key

    if (hive.length === 0) {
      return 'HKEY_CURRENT_USER'
    }

    let didExpand = false

    switch (hive) {
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
      result = key.replace(new RegExp('^' + hive, 'i'), result)
    }

    result = result.replace(new RegExp(/\//, 'gi'), '\\')

    return result
  }

  return 'HKEY_CURRENT_USER'
}

/**
 * Returns a Boolean whether we are running on a Windows machine.
 * @returns {boolean}
 */
function isWindows(): boolean {
  return platform() === 'win32'
}

/**
 * Wraps the path argument around quotes,
 * so that spaces in the key names,
 * are supported.
 * @param {string} arg
 * @returns {string}
 */
function toQuoteOrNotToQuote(arg: string): string {
  if (arg) {
    const count = arg.length

    if (count > 0) {
      if (arg[0] !== '"') {
        arg = '"' + arg
      }

      if (arg[count - 1] !== '"') {
        arg += '"'
      }

      return arg
    }
  }

  return ''
}
