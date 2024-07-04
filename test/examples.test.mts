import { assert, describe, test } from 'vitest'
import { RegKeys } from '../src/index.mjs'

/**
 * Be aware that even though I tried to make the tests use data that's available on all PCs, some tests might fail on your computer, due to different configuration, software installed, etc.
 */

describe('🧪 RegKeys tests - examples🧪', () => {
	test('1. keys array should not be empty', () => {
		const registry = new RegKeys('HKCR')
		const keys = registry.get()

		assert.isNotEmpty(keys)
	})

	test('2. should return true when checking whether the subkey "Microsoft" exists', () => {
		const registry = new RegKeys('HKLM/Software')

		assert.isTrue(registry.hasKey('Microsoft'))
	})

	test('3. should return [true, true, true, true] when checking for Software keys', () => {
		const registry = new RegKeys('HKLM/Software')

		assert.deepEqual(registry.hasKeys(['Microsoft', 'Classes', 'Policies']), [
			true,
			true,
			true
		])
	})

	test('4. should return true & [true, true, true, true] when checking for Software keys', () => {
		const registry = new RegKeys('HKLM/Software')

		assert.isTrue(registry.hasKey('Microsoft'))
		assert.deepEqual(registry.hasKeys(['Microsoft', 'Classes', 'Policies']), [
			true,
			true,
			true
		])
	})

	test('5. should return true when using a custom search predicate', () => {
		const registry = new RegKeys('HKLM/Software')

		// useful for custom search algorithms/behavior,
		// like demonstrated here, case-insensitive partial search
		assert.isTrue(
			registry.searchFor('micro', (key, searchFor, i) => {
				return key.toLowerCase().indexOf(searchFor.toLowerCase()) > -1
			})
		)
	})
})
