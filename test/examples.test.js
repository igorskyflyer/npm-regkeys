const RegKeys = require('../index')
const chai = require('chai').assert

/**
 * Be aware that even though I tried to make the tests use data that's available on all PCs, some tests might fail on your computer, due to different configuration, software installed, etc.
 */

describe('examples', () => {
  it('should return HKEY_LOCAL_MACHINE\\Software', () => {
    const registry = new RegKeys('HKLM/Software')

    chai.equal(registry.query, 'HKEY_LOCAL_MACHINE\\Software')
  })

  it('keys array should not be empty', () => {
    const registry = new RegKeys('HKCR')
    const keys = registry.get()

    chai.isNotEmpty(keys)
  })

  it('should return true when checking whether the subkey "Microsoft" exists', () => {
    const registry = new RegKeys('HKLM/Software')

    chai.isTrue(registry.hasKey('Microsoft'))
  })

  it('should return [true, true, true, true] when checking for Software keys', () => {
    const registry = new RegKeys('HKLM/Software')

    chai.deepEqual(
      registry.hasKeys(['Microsoft', 'Macromedia', 'Google', 'Adobe']),
      [true, true, true, true]
    )
  })

  it('should return true & [true, true, true, true] when checking for Software keys', () => {
    const registry = new RegKeys('HKLM/Software')

    chai.isTrue(registry.hasKey('Microsoft'))
    chai.deepEqual(
      registry.hasKeys(['Microsoft', 'Macromedia', 'Google', 'Adobe']),
      [true, true, true, true]
    )
  })

  it('should return true when using the clear() method', () => {
    const registry = new RegKeys('HKLM/Software')

    // fetch keys and cache them
    let keys = registry.get()

    // 🔮 do something with the registry ⭐

    // clear the cached result
    registry.clear()

    chai.isEmpty(registry.keys)

    // refetch (new) keys
    registry.get()

    chai.isNotEmpty(registry.keys)
  })
})
