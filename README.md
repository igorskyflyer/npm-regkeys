<div align="center">
  <img src="https://raw.githubusercontent.com/igorskyflyer/npm-regkeys/main/assets/regkeys.png" alt="Icon of RegKeys" width="256" height="256">
<h1 align="center">RegKeys</h1>
</div>

<br>

<div align="center">
  📚 A package for fetching Windows registry keys. 🗝
</div>

<br>
<br>

## 📃 Table of Contents

- [Features](#-features)
- [Usage](#-usage)
- [API](#️-api)
- [Changelog](#-changelog)
- [Support](#-support)
- [License](#-license)
- [Related](#-related)
- [Author](#-author)

<br>
<br>

## 🤖 Features

- 🔍 Enumerates Windows Registry subkeys via the native reg.exe command
- 🗂 Automatically expands short hive names to their full forms
- ⚡ Supports both synchronous and asynchronous usage patterns
- 🧠 Caches retrieved keys for faster repeated lookups, with optional refresh
- ✅ Checks for the existence of single or multiple registry keys
- 🎯 Allows custom predicate‑based key matching
- 🔡 Offers optional case‑sensitive matching
- ♻️ Provides a way to clear cached results
- 🖥 Ensures execution only on Windows systems
- 🔧 Includes helper utilities for hive extraction, expansion, and OS detection

<br>
<br>

## 🕵🏼 Usage

Install it by executing:

```shell
npm i @igorskyflyer/regkeys
```

<br>
<br>

## 🤹🏼‍♂️ API

```ts
constructor(key): RegKeys
```

> Creates the RegKeys object.
> Do **not** forget to set the **_key_** parameter.

- **key**: `string`, the key you later want to manipulate with, i.e. read keys, check for children keys, etc.,

> **key** can either be an expanded or a non-expanded key, i.e.:

| Non-expanded |          Expanded          |
| :----------: | :------------------------: |
|     HKCR     |     HKEY_CLASSES_ROOT      |
|     HKCU     |     HKEY_CURRENT_USER      |
|     HKLM     |     HKEY_LOCAL_MACHINE     |
|     HKU      |         HKEY_USERS         |
|     HKCC     | HKEY_CURRENT_CONFIGURATION |

returns the **RegKeys** object.

<br>

##### Example

```ts
import { RegKeys } from '@igorskyflyer/regkeys'

// for your convenience, you can use forward slashes,
// since internally Windows only supports back slashes,
// which need to be escaped and look bad 😫😒

// so...
```

```ts
// 😒
const registry: RegKeys = new RegKeys('HKLM\\Software')

// is the same as

// 🥳🎊
const registry: RegKeys = new RegKeys('HKLM/Software')
```

<br>

```ts
get(forceRefresh: boolean = false): string[]
```

> Gets the keys for the given root key.

- **forceRefresh**: _boolean_, indicates whether the registry should be queried again since the result of this method is cached internally, for performance,

returns a **string[]**.

<br>

##### Example

```ts
import { RegKeys } from '@igorskyflyer/regkeys'

const registry: RegKeys = new RegKeys('HKCR')
const keys: string[] = registry.get()

// do something with the keys,
// it's your fate, unlock it 😛
keys.forEach((key: string) => {
  console.log(key)
})
```

<br>

<a name="hasKey"></a>

```ts
hasKey(searchFor: string, caseSensitive: boolean = false): boolean
```

> Checks whether the given key is a direct child of the currently selected key.

- **searchFor**: _string_, the key to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean**.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

<br>

##### Example

```ts
import { RegKeys } from '@igorskyflyer/regkeys'

const registry: RegKeys = new RegKeys('HKLM/Software')

// let's see if we have any
// Microsoft software on our Windows PC
// 😂😂😂😂😂😂
console.log(registry.hasKey('Microsoft'))
```

<a name="hasKeys"></a>

<br>

```ts
hasKeys(searchFor: string[], caseSensitive: boolean = false): boolean
```

> Checks whether the given keys are a direct child of the currently selected key.

- **list**: _string[]_, the keys to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean[]**.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

<br>

##### Example

```ts
import { RegKeys } from '@igorskyflyer/regkeys'

const registry: RegKeys = new RegKeys('HKLM/Software')

console.log(registry.hasKeys(['Microsoft', 'Macromedia', 'Google', 'Adobe']))
```

<br>

```ts
has(value: string|string[], caseSensitive: boolean = false): boolean|boolean[]
```

> A generic method that checks whether the given key(s) is/are a direct child of the currently selected key. See both <a href="#hasKey">hasKey()</a> and <a href="#hasKeys">hasKeys()</a>. You can use this method for own convenience, it will pick the suited method depending on the type of the **value** parameter,

- **value**: _string|string[]_, the key(s) to search for,
- **caseSensitive**: _boolean_, indicates whether the search should be case-sensitive or not. Defaults to **false**,

returns a **boolean|boolean[]**.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

<br>

##### Example

```ts
import { RegKeys } from '@igorskyflyer/regkeys'

const registry: RegKeys = new RegKeys('HKLM/Software')

console.log(registry.has('Microsoft'))
console.log(registry.has(['Microsoft', 'Macromedia', 'Google', 'Adobe']))
```

<br>

```ts
searchFor(value: string, predicate: SearchPredicate): boolean
```

> Provides a way to do keys-checking using a custom predicate function,

- **value**: _string_, the key name to find,
- **predicate**: _SearchPredicate_, the callback that will do the actual querying, see the code example below,

returns a **boolean**, i.e. true upon finding the first match or false if no match is found or any of the both required parameters aren't set.

> **NOTE**: it will auto-fetch the keys if the internal cache is empty = you didn't call **get()** before calling this method.

<br>

##### Example

```ts
import { RegKeys } from '@igorskyflyer/regkeys'

const registry: RegKeys = new RegKeys('HKLM/Software')

// useful for custom search algorithms/behavior,
// like demonstrated here, case-insensitive partial search
console.log(
  registry.searchFor('micro', (key: string, searchFor: string, i: number) => {
    return key.toLowerCase().indexOf(searchFor.toLowerCase()) > -1
  })
)
```

<br>

```ts
clear(): void
```

> Clears the cached result, if any,

returns a **void**.

<br>

##### Example

```ts
import { RegKeys } from '@igorskyflyer/regkeys'

const registry: RegKeys = new RegKeys('HKLM/Software')

// fetch keys and cache them
let keys = registry.get()

// 🔮 do something with the registry ⭐

// clear the cached result
registry.clear()

// refetch (new) keys
keys = registry.get()

console.log(keys)
```

<br>
<br>

## 📝 Changelog

📑 The changelog is available here, [CHANGELOG.md](https://github.com/igorskyflyer/npm-regkeys/blob/main/CHANGELOG.md).

<br>
<br>

## 🪪 License

Licensed under the MIT license which is available here, [MIT license](https://github.com/igorskyflyer/npm-regkeys/blob/main/LICENSE.txt).

<br>
<br>

## 💖 Support

<div align="center">
  I work hard for every project, including this one and your support means a lot to me!
  <br>
  Consider buying me a coffee. ☕
  <br>
  <br>
  <a href="https://ko-fi.com/igorskyflyer" target="_blank"><img src="https://raw.githubusercontent.com/igorskyflyer/igorskyflyer/main/assets/ko-fi.png" alt="Donate to igorskyflyer" width="180" height="46"></a>
  <br>
  <br>
  <em>Thank you for supporting my efforts!</em> 🙏😊
</div>

<br>
<br>

## 🧬 Related

[@igorskyflyer/is-rootdir](https://www.npmjs.com/package/@igorskyflyer/is-rootdir)

> _🔼 Provides a way to check if the given path is the root drive/directory. ⛔_

[@igorskyflyer/mp3size](https://www.npmjs.com/package/@igorskyflyer/mp3size)

> _🧮 Calculates an estimated file size of Mp3 files. 🎶_

[@igorskyflyer/aria](https://www.npmjs.com/package/@igorskyflyer/aria)

> _🧬 Meet Aria, an efficient Adblock filter list compiler, with many features that make your maintenance of Adblock filter lists a breeze! 🗡_

[@igorskyflyer/keppo](https://www.npmjs.com/package/@igorskyflyer/keppo)

> _🎡 Parse, manage, compare and output SemVer-compatible version numbers. 🛡_

[@igorskyflyer/simple-exec](https://www.npmjs.com/package/@igorskyflyer/simple-exec)

> _🕺 Command. Execution. Made. Simple. ▶_


<br>
<br>
<br>

## 👨🏻‍💻 Author
Created by **Igor Dimitrijević** ([*@igorskyflyer*](https://github.com/igorskyflyer/)).
