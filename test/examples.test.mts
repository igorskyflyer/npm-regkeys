import { RegKeys } from '../src/index.mjs'
import { assert, describe, it } from 'vitest'

/**
 * Be aware that even though I tried to make the tests use data that's available on all PCs, some tests might fail on your computer, due to different configuration, software installed, etc.
 */

describe('examples', () => {
  it('1. should return HKEY_LOCAL_MACHINE\\Software', () => {
    const registry = new RegKeys('HKLM/Software')

    assert.equal(registry.query, 'HKEY_LOCAL_MACHINE\\Software')
  })

  it('2. keys array should not be empty', () => {
    const registry = new RegKeys('HKCR')
    const keys = registry.get()

    assert.isNotEmpty(keys)
  })

  it('3. should return true when checking whether the subkey "Microsoft" exists', () => {
    const registry = new RegKeys('HKLM/Software')

    assert.isTrue(registry.hasKey('Microsoft'))
  })

  it('4. should return [true, true, true, true] when checking for Software keys', () => {
    const registry = new RegKeys('HKLM/Software')

    assert.deepEqual(registry.hasKeys(['Microsoft', 'Classes', 'Policies']), [true, true, true])
  })

  it('5. should return true & [true, true, true, true] when checking for Software keys', () => {
    const registry = new RegKeys('HKLM/Software')

    assert.isTrue(registry.hasKey('Microsoft'))
    assert.deepEqual(registry.hasKeys(['Microsoft', 'Classes', 'Policies']), [true, true, true])
  })

  it('6. should return true when using a custom search predicate', () => {
    const registry = new RegKeys('HKLM/Software')

    // useful for custom search algorithms/behavior,
    // like demonstrated here, case-insensitive partial search
    assert.isTrue(
      registry.searchFor('micro', (key, searchFor, i) => {
        return key.toLowerCase().indexOf(searchFor.toLowerCase()) > -1
      })
    )
  })

  it('7. should return true when using the clear() method', () => {
    const registry = new RegKeys('HKLM/Software')

    // .
    // .
    // .
    // 🔮 do something with the registry ⭐
    // .
    // .
    // .

    // clear the cached result
    registry.clear()

    assert.isEmpty(registry.keys)

    // refetch (new) keys
    registry.get()

    assert.isNotEmpty(registry.keys)
  })
})
