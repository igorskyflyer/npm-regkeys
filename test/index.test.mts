import { assert, describe, suite, test } from 'vitest'
import { RegKeys } from '../src/index.mjs'

/**
 * Be aware that even though I tried to make the tests use data that's available on all PCs by default, some tests might fail on your computer due to different configuration, software installed, etc.
 */

describe('🧪 RegKeys tests 🧪', () => {
	// get()
	suite('get()', () => {
		// test for empty constructor params + get()
		test('1. should return [] when an empty string is passed to constructor', () => {
			assert.isArray(new RegKeys('').get())
		})

		// test for reading the registry keys
		test('2. should return a non-empty string[] when passing a valid (non-expanded) key', () => {
			assert.isAbove(new RegKeys('HKLM').get().length, 0)
		})

		// test for reading the registry keys - spaces in path
		test('3. should return a non-empty string[] when passing a valid (non-expanded) key with spaces in path', () => {
			assert.isAbove(
				new RegKeys(
					'HKLM/SOFTWARE/Microsoft/Windows/CurrentVersion/App Paths'
				).get().length,
				0
			)
		})

		// test for reading registry keys
		test('4. should return true when reading HKLM\\SOFTWARE and checking for the "Microsoft" subkey in the results', () => {
			// 👽 fun-fact: reg natively uses backslashes,
			//    for denoting registry structure but you can use slashes,
			//    for your (and my 🤗) convenience.
			assert.isTrue(
				new RegKeys('HKLM/SOFTWARE').get().indexOf('Microsoft') > -1
			)
		})
	})

	// hasKeys()
	suite('hasKeys()', () => {
		// test for checking for registry keys
		test('5. should return [true, true] for the subkeys ["Software", "Hardware"], case-insensitive', () => {
			assert.deepEqual(new RegKeys('HKLM').hasKeys(['Software', 'Hardware']), [
				true,
				true
			])
		})

		// test for checking for registry keys
		test('6. should return [false, true] for subkeys ["Software", "HARDWARE"], case-sensitive', () => {
			assert.deepEqual(
				new RegKeys('HKLM').hasKeys(['Software', 'HARDWARE'], true),
				[false, true]
			)
		})
	})

	// hasKey()
	suite('hasKey()', () => {
		// test for checking for registry keys
		test('7. should return true for the subkey "Software", case-insensitive', () => {
			// the actual subkey is in all capitals, SOFTWARE
			assert.isTrue(new RegKeys('HKLM').hasKey('Software'))
		})

		// test for checking for registry keys
		test('8. should return false for subkey "Software", case-sensitive', () => {
			// the actual subkey is in all capitals, SOFTWARE
			assert.isFalse(new RegKeys('HKLM').hasKey('Software', true))
		})
	})

	// searchFor()
	suite('searchFor()', () => {
		test('9. should return true when searching for "Microsoft" using a custom predicate', () => {
			const registry = new RegKeys('HKLM/Software')

			assert.isTrue(
				registry.searchFor('Microsoft', (key, searchFor, _i) => {
					return key === searchFor
				})
			)
		})
	})
})
