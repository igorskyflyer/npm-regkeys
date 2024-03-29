<p align="center"><img src="https://raw.githubusercontent.com/igorskyflyer/npm-regkeys/master/assets/RegKeys.png" width="170" height="170"></p>

<h3>RegKeys,</h3>
<h6>an NPM package for querying Windows registry keys.</h6>

_Uses the **reg.exe** system executable._

<h6>If you are looking for a cool implementation of this module, click <a href="https://github.com/igorskyflyer/npm-registry-apppaths">here</a>.</h6>

<br>

✨Since version `2.1.0` `RegKeys` is a hybrid module that supports both CommonJS (legacy) and ES modules, thanks to [Modern Module](https://github.com/igorskyflyer/npm-modern-module).

<br>

> ✨ Since `v.2.0.0` async methods are available as well.

<p align="center">💻  💻  💻  💻</p>

#### API

```
constructor(key): RegKeys
```

> Creates the RegKeys object.
> Do **not** forget to set the **_key_** parameter.

- **key**: _string_, the key you later want to manipulate with, i.e. read keys, check for children keys, etc.,

> **key** can either be an expanded or a non-expanded key, i.e.:

| Non-expanded |          Expanded          |
| :----------: | :------------------------: |
|     HKCR     |     HKEY_CLASSES_ROOT      |
|     HKCU     |     HKEY_CURRENT_USER      |
|     HKLM     |     HKEY_LOCAL_MACHINE     |
|     HKU      |         HKEY_USERS         |
|     HKCC     | HKEY_CURRENT_CONFIGURATION |

returns the **RegKeys** object.

##### Example

```js
const RegKeys = require('@igor.dvlpr/regkeys')

// for your convenience, you can use forward slashes,
// since internally Windows only supports back slashes,
// which need to be escaped and look bad 😫😒

// so...
```

```js
// 😒
const registry = new RegKeys('HKLM\\Software')

// is the same as

// 🥳🎊
const registry = new RegKeys('HKLM/Software')
```

<p align="center">💻  💻  💻  💻</p>

```js
get(forceRefresh: boolean = false): string[]
```

> Gets the keys for the given root key.

- **forceRefresh**: _boolean_, indicates whether the registry should be queryied again since the result of this method is cached internally, for performance,

returns a **string[]**.

##### Example

```js
const RegKeys = require('@igor.dvlpr/regkeys')

const registry = new RegKeys('HKCR')
const keys = registry.get()

// do something with the keys,
// it's your fate, unlock it 😛
keys.forEach((key) => {
  console.log(key)
})
```

<p align="center">💻  💻  💻  💻</p>

<a name="hasKey"></a>

```js
hasKey(searchFor: string, caseSensitive: boolean = false): boolean
```

> Checks whether the given key is a direct child of the currently selected key.

- **searchFor**: _string_, the key to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean**.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

##### Example

```js
const RegKeys = require('@igor.dvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

// let's see if we have any
// Microsoft software on our Windows PC
// 😂😂😂😂😂😂
console.log(registry.hasKey('Microsoft'))
```

<a name="hasKeys"></a>

<p align="center">💻  💻  💻  💻</p>

```js
hasKeys(searchFor: string[], caseSensitive: boolean = false): boolean
```

> Checks whether the given keys are a direct child of the currently selected key.

- **list**: _string[]_, the keys to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean[]**.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

##### Example

```js
const RegKeys = require('@igor.dvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

console.log(registry.hasKeys(['Microsoft', 'Macromedia', 'Google', 'Adobe']))
```

<p align="center">💻  💻  💻  💻</p>

```js
has(value: string|string[], caseSensitive: boolean = false): boolean|boolean[]
```

> A generic method that checks whether the given key(s) is/are a direct child of the currently selected key. See both <a href="#hasKey">hasKey()</a> and <a href="#hasKeys">hasKeys()</a>. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter,

- **value**: _string|string[]_, the key(s) to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean|boolean[]**.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

##### Example

```js
const RegKeys = require('@igor.dvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

console.log(registry.has('Microsoft'))
console.log(registry.has(['Microsoft', 'Macromedia', 'Google', 'Adobe']))
```

<p align="center">💻  💻  💻  💻</p>

```js
searchFor(value: string, predicate: SearchPredicate): boolean
```

> Provides a way to do keys-checking using a custom predicate function,

- **value**: _string_, the key name to find,
- **predicate**: _SearchPredicate_, the callback that will do the actual querying, see the code example below,

returns a **boolean**, i.e. true upon finding the first match or false if no match is found or any of the both required parameters aren't set.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

##### Example

```js
const RegKeys = require('@igor.dvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

// useful for custom search algorithms/behavior,
// like demonstrated here, case-insensitive partial search
console.log(
  registry.searchFor('micro', (key, searchFor, i) => {
    return key.toLowerCase().indexOf(searchFor.toLowerCase()) > -1
  })
)
```

<p align="center">💻  💻  💻  💻</p>

```js
clear(): void
```

> Clears the cached result, if any,

returns a **void**.

##### Example

```js
const RegKeys = require('@igor.dvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

// fetch keys and cache them
let keys = registry.get()

// 🔮 do something with the registry ⭐

// clear the cached result
registry.clear()

// refetch (new) keys
keys = registry.get()

console.log(keys)
```

<p align="center">💻  💻  💻  💻</p>

> Don't forget to go through the tests too, they offer additional insight. 📚
