const RegKeys = require('../index')
const chai = require('chai').assert

/**
 * Be aware that even though I tried to make the tests use data that's available on all PCs, some tests might fail on your computer, due to different configuration, software installed, etc.
 */

// .query
describe('.query', () => {
  // test for null constructor value
  it('1. should return "HKEY_CURRENT_USER" when anything else than a string is passed in constructor', () => {
    chai.equal(new RegKeys().query, 'HKEY_CURRENT_USER')
    chai.equal(new RegKeys(3939).query, 'HKEY_CURRENT_USER')
    chai.equal(new RegKeys([]).query, 'HKEY_CURRENT_USER')
    chai.equal(new RegKeys(true).query, 'HKEY_CURRENT_USER')
    chai.equal(new RegKeys(null).query, 'HKEY_CURRENT_USER')
  })

  // test for empty constructor value
  it('2. should return "HKEY_CURRENT_USER" when initialized with an empty string', () => {
    chai.equal(new RegKeys('').query, 'HKEY_CURRENT_USER')
  })

  // test for root expansion
  it('3. should return "HKEY_LOCAL_MACHINE" as the query (expanded)', () => {
    chai.equal(new RegKeys('HKLM').query, 'HKEY_LOCAL_MACHINE')
  })

  // test for root not being expanded since,
  // it's already expanded
  it('4. should return "HKEY_USERS" as the query (not expanded)', () => {
    chai.equal(new RegKeys('HKEY_USERS').query, 'HKEY_USERS')
  })
})

// get()
describe('get()', () => {
  // test for empty constructor params + get()
  it('5. should return [] when an empty string is passed to constructor', () => {
    chai.isArray(new RegKeys('').get())
  })

  // test for reading the registry keys
  it('6. should return a non-empty string[] when passing a valid (non-expanded) rootkey', () => {
    chai.isAbove(new RegKeys('HKLM').get().length, 0)
  })

  // test for reading registry keys
  it('7. should return true when reading HKLM\\SOFTWARE and checking for the "Microsoft" subkey in the results', () => {
    // 👽 fun-fact: reg natively uses backslashes,
    //    for denoting registry structure but you can use slashes,
    //    for your (and my 🤗) convenience.
    chai.isTrue(new RegKeys('HKLM/SOFTWARE').get().indexOf('Microsoft') > -1)
  })
})

// hasKeys()
describe('hasKeys()', () => {
  // test for checking for registry keys
  it('8. should return [true, true] for the subkeys ["Software", "Hardware"], case-insensitive', () => {
    chai.deepEqual(new RegKeys('HKLM').hasKeys(['Software', 'Hardware']), [
      true,
      true,
    ])
  })

  // test for checking for registry keys
  it('9. should return [false, true] for subkeys ["Software", "HARDWARE"], case-sensitive', () => {
    chai.deepEqual(
      new RegKeys('HKLM').hasKeys(['Software', 'HARDWARE'], true),
      [false, true]
    )
  })
})

// hasKey()
describe('hasKey()', () => {
  // test for checking for registry keys
  it('10. should return true for the subkey "Software", case-insensitive', () => {
    // the actual subkey is in all capitals, SOFTWARE
    chai.isTrue(new RegKeys('HKLM').hasKey('Software'))
  })

  // test for checking for registry keys
  it('11. should return false for subkey "Software", case-sensitive', () => {
    // the actual subkey is in all capitals, SOFTWARE
    chai.isFalse(new RegKeys('HKLM').hasKey('Software', true))
  })
})

// has()
// there were tests for this method initially,
// but I deleted them 😂, not needed actually 👾

// clear()
describe('clear()', () => {
  // test for checking for registry keys
  it('12. should clear the keys-cache', () => {
    const registry = new RegKeys('HKLM/Software')
    const keys = registry.get()

    registry.clear()

    chai.isTrue(keys.length > 0 && registry.keys.length === 0)
  })
})
