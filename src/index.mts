// Author: Igor Dimitrijević (@igorskyflyer)

import { type SpawnSyncReturns, spawnSync } from 'node:child_process'
import { platform } from 'node:os'
import type { SearchPredicate } from './SearchPredicate.mjs'

/**
 * RegKeys class.
 */
export class RegKeys {
	#query: string
	#keys: string[]
	/**
	 * Creates a RegKeys object.
	 */
	constructor(key: string) {
		this.#query = expandHive(key)
		this.#keys = []
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
	 * @throws Throws an error if the host machine is not running Windows OS.
	 */
	get(forceRefresh: boolean = false): string[] {
		if (!isWindows()) {
			throw new Error('This function only runs on Windows operating system.')
		}

		if (this.#keys.length > 0 && !forceRefresh) {
			return this.#keys
		}

		const count: number = this.#query.length

		if (count < 4) {
			return []
		}

		try {
			// quotes are needed when keys contain spaces
			const query: string = toQuoteOrNotToQuote(this.#query)

			const shell: SpawnSyncReturns<Buffer> = spawnSync(
				'reg.exe',
				['query', query, '/f "*" /k'],
				{
					stdio: 'pipe',
					shell: true
				}
			)

			if (shell?.stdout) {
				const output: string = shell.stdout.toString()
				let searchKey: string = this.#query

				this.#keys = output.split('\r\n')

				if (count > 0) {
					if (searchKey[count - 1] !== '\\') {
						searchKey += '\\'
					}
				}

				this.#keys = this.#keys
					.map((key) => {
						if (key.indexOf(this.#query) === 0) {
							return key.replace(searchKey, '')
						}

						return ''
					})
					.filter(Boolean)
			} else {
				return this.#keys
			}
		} catch (exp) {
			console.error(exp)
			return this.#keys
		}

		return this.#keys
	}

	/**
	 * Asynchronously gets the keys for the given root key.
	 *
	 * NOTE: Results are **cached**!
	 * @throws Throws an error if the host machine is not running Windows OS.
	 */
	async getAsync(forceRefresh: boolean = false): Promise<string[]> {
		return this.get(forceRefresh)
	}

	/**
	 * Synchronously checks whether the given key is a direct child of the currently selected key.
	 */
	hasKey(searchFor: string, caseSensitive: boolean = false): boolean {
		if (!searchFor || typeof searchFor !== 'string' || searchFor.length === 0) {
			return false
		}

		if (this.#keys.length === 0) {
			this.get()
		}

		let index: number = -1

		if (caseSensitive) {
			index = this.#keys.indexOf(searchFor)
		} else {
			index = this.#keys.findIndex((key) => {
				return key.toLowerCase() === searchFor.toLowerCase()
			})
		}

		return index > -1
	}

	/**
	 * Asynchronously checks whether the given key is a direct child of the currently selected key.
	 */
	async hasKeyAsync(
		searchFor: string,
		caseSensitive: boolean = false
	): Promise<boolean> {
		return this.hasKey(searchFor, caseSensitive)
	}

	/**
	 * Synchronously checks whether the given keys are a direct child of the currently selected key.
	 */
	hasKeys(list: string[], caseSensitive: boolean = false): boolean[] {
		if (!list || !Array.isArray(list)) {
			return []
		}

		const count: number = list.length
		const result: boolean[] = []

		if (count === 0) {
			return result
		}

		if (this.#keys.length === 0) {
			this.get()
		}

		for (let i = 0; i < count; i++) {
			let index: number = -1

			if (caseSensitive) {
				index = this.#keys.indexOf(list[i])
			} else {
				index = this.#keys.findIndex((key) => {
					return key.toLowerCase() === list[i].toLowerCase()
				})
			}

			result.push(index > -1)
		}

		return result
	}

	/**
	 * Asynchronously checks whether the given keys are a direct child of the currently selected key.
	 */
	async hasKeysAsync(
		list: string[],
		caseSensitive: boolean = false
	): Promise<boolean[]> {
		return this.hasKeys(list, caseSensitive)
	}

	/**
	 * A generic, synchronous method that checks whether the given key(s) is/are a direct child of the currently selected key. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter.
	 * @see hasKey
	 * @see hasKeys
	 */
	has(value: string | string[], caseSensitive = false): boolean | boolean[] {
		if (!value) {
			return false
		}

		if (Array.isArray(value)) {
			return this.hasKeys(value, caseSensitive)
		}

		if (typeof value === 'string') {
			return this.hasKey(value, caseSensitive)
		}

		return false
	}

	/**
	 * A generic, asynchronous method that checks whether the given key(s) is/are a direct child of the currently selected key. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter.
	 * @see hasKey
	 * @see hasKeys
	 */
	async hasAsync(
		value: string | string[],
		caseSensitive = false
	): Promise<boolean | boolean[]> {
		return this.has(value, caseSensitive)
	}

	/**
	 * Provides a synchronous way to do keys-checking
	 * using a custom predicate function.
	 * @returns it returns true upon finding the first match or false if no match is found or any of the both required parameters aren't set.
	 */
	searchFor(value: string, predicate: SearchPredicate): boolean {
		if (!value || typeof predicate !== 'function') {
			return false
		}

		if (this.#keys.length === 0) {
			this.get()
		}

		const count: number = this.#keys.length

		for (let i = 0; i < count; i++) {
			if (predicate(this.#keys[i], value, i)) {
				return true
			}
		}

		return false
	}

	/**
	 * Provides an asynchronous way to do keys-checking
	 * using a custom predicate function.
	 * @returns it returns true upon finding the first match or false if no match is found or any of the both required parameters aren't set.
	 */
	async searchForAsync(
		value: string,
		predicate: SearchPredicate
	): Promise<boolean> {
		return this.searchFor(value, predicate)
	}

	/**
	 * Clears the cached result, if any.
	 */
	clear(): void {
		this.#keys = []
	}
}

// 💪 Helper functions 💪
/**
 * Extracts the hive of the given key.
 */
function extractHive(key: any): string {
	if (key && typeof key === 'string') {
		// convert to uppercase for consistency,
		// and to avoid case mismatching
		key = key.toUpperCase()

		// magic 🔮😂
		const keys: string[] = key.split(/\/|\\/)

		if (keys.length > 0) {
			return keys[0]
		}

		return key
	}

	return ''
}

/**
 * Expands = converts short hive names to
 * fully-qualified ones and returns it
 * as a string.
 *
 * If no value is provided it will return 'HKEY_CURRENT_USER'.
 */
function expandHive(key: string): string {
	if (typeof key === 'string') {
		const hive: string = extractHive(key)
		let result: string = key

		if (hive.length === 0) {
			return 'HKEY_CURRENT_USER'
		}

		let didExpand: boolean = false

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
			result = key.replace(new RegExp(`^${hive}`, 'i'), result)
		}

		result = result.replace(new RegExp(/\//, 'gi'), '\\')

		return result
	}

	return 'HKEY_CURRENT_USER'
}

/**
 * Returns a Boolean whether we are running on a Windows machine.
 */
function isWindows(): boolean {
	return platform() === 'win32'
}

/**
 * Wraps the path argument around quotes,
 * so that spaces in the key names,
 * are supported.
 */
function toQuoteOrNotToQuote(arg: string): string {
	if (arg) {
		const count: number = arg.length

		if (count > 0) {
			if (arg[0] !== '"') {
				arg = `"${arg}`
			}

			if (arg[count - 1] !== '"') {
				arg += '"'
			}

			return arg
		}
	}

	return ''
}
