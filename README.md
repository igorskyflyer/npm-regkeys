<p align="center"><img src="./assets/RegKeys.png" style="max-width: 200px"></p>

<h3>RegKeys,</h3>
<h6>an NPM package for querying Windows registry (sub)keys.</h6>

_Uses the **reg.exe** system executable._

<h6>If you are looking for a cool implementation of this module, click <a href="https://github.com/igorskyflyer/npm-registry-apppaths">here</a>.</h6>

<p align="center">💻  💻  💻  💻</p>

#### API

```
constructor(rootKey): RegKeys
```

> Creates the RegKeys object.
> Do **not** forget to set the **_rootKey_** parameter.

- **rootKey**: _string_, the key you later want to manipulate with, i.e. read subkeys, check for subkeys, etc.,

> **rootKey** can either be an expanded or a non-expanded key, i.e.:

| Non-expanded |          Expanded          |
| :----------: | :------------------------: |
|     HKCR     |     HKEY_CLASSES_ROOT      |
|     HKCU     |     HKEY_CURRENT_USER      |
|     HKLM     |     HKEY_LOCAL_MACHINE     |
|     HKU      |         HKEY_USERS         |
|     HKCC     | HKEY_CURRENT_CONFIGURATION |

returns the **RegKeys** object.

##### Example

```
const RegKeys = require('@igordvlpr/regkeys')

// for your convenience, you can use forward slashes,
// since internally Windows only supports back slashes,
// which need to be escaped and look bad 😫😒

// so...
```

```
// 😒
const registry = new RegKeys('HKLM\\Software')
```

<p align="center"><strong>=</strong></p>

```
// 🥳🎊
const registry = new RegKeys('HKLM/Software')
```

<p align="center">💻  💻  💻  💻</p>

```
get(forceRefresh: boolean = false): string[]
```

> Gets the (sub)keys for the given (root)key.

- **forceRefresh**: _boolean_, indicates whether the registry should be queryied again since the result of this method is cached internally, for performance,

returns a **string[]**.

##### Example

```
const RegKeys = require('@igordvlpr/regkeys')

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

```
hasKey(searchFor: string, caseSensitive: boolean = false): boolean
```

> Checks whether the given (sub)key is a direct child of the currently selected key.

- **searchFor**: _string_, the key to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean**.

> **NOTE**: it will auto-fetch the subkeys if the internal cache is empty = you didn't call **get()** before calling this method.

##### Example

```
const RegKeys = require('@igordvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

// let's see if we have any
// Microsoft software on our Windows PC
// 😂😂😂😂😂😂
console.log(registry.hasKey('Microsoft'))
```

<a name="hasKeys"></a>

<p align="center">💻  💻  💻  💻</p>

```
hasKeys(searchFor: string[], caseSensitive: boolean = false): boolean
```

> Checks whether the given (sub)keys are a direct child of the currently selected key.

- **list**: _string[]_, the keys to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean[]**.

> **NOTE**: it will auto-fetch the subkeys if the internal cache is empty = you didn't call **get()** before calling this method.

##### Example

```
const RegKeys = require('@igordvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

console.log(registry.hasKeys(['Microsoft', 'Macromedia', 'Google', 'Adobe']))
```

<p align="center">💻  💻  💻  💻</p>

```
has(value: string|string[], caseSensitive: boolean = false): boolean|boolean[]
```

> A generic method that checks whether the given (sub)key(s) is/are a direct child of the currently selected key. See both <a href="#hasKey">hasKey()</a> and <a href="#hasKeys">hasKeys()</a>. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter,

- **value**: _string|string[]_, the key(s) to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean|boolean[]**.

> **NOTE**: it will auto-fetch the subkeys if the internal cache is empty = you didn't call **get()** before calling this method.

##### Example

```
const RegKeys = require('@igordvlpr/regkeys')

const registry = new RegKeys('HKLM/Software')

console.log(registry.has('Microsoft'))
console.log(registry.has(['Microsoft', 'Macromedia', 'Google', 'Adobe']))
```

<p align="center">💻  💻  💻  💻</p>

> Don't forget to go through the tests too, they offer additional insight. 📚

<p align="center">💻  💻  💻  💻</p>
