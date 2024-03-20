[![](https://img.shields.io/npm/v/gettext-merger.svg?label=npm%20version)](https://www.npmjs.com/package/gettext-merger)
[![](https://img.shields.io/npm/l/gettext-merger)](https://github.com/erikyo/gettext-merger?tab=GPL-3.0-1-ov-file#readme)
[![](https://github.com/erikyo/gettext-merger/actions/workflows/node.js.yml/badge.svg)](https://github.com/erikyo/gettext-merger/actions/workflows/node.js.yml)

# Gettext Merger

This tool is designed to merge translation files (pot files) for internationalization (i18n) in JavaScript projects. It is particularly useful when working with multiple contributors or maintaining translations across various versions of your project.

## Features

- **Merge Blocks:** The tool merges translation blocks that have matching `msgid` values. It intelligently combines translator comments and references, ensuring that valuable context is retained.

- **Handling Duplicates:** Duplicate translator comments are not added to the merged block. The tool maintains uniqueness in the merged set.

- **Flexible Merging:** Blocks are merged when the `msgid` values match, and either `msgctx` or `msgstr` is empty for one of the blocks. This flexibility allows merging blocks with different context or translations.

## Installation

1. Install Node.js: Make sure you have Node.js installed on your machine. You can download it from [https://nodejs.org/](https://nodejs.org/).

2. Clone the Repository: Clone this repository to your local machine using the following command:

```bash
git clone https://github.com/erikyo/gettext-merger.git
```

3. Install Dependencies: Navigate to the project directory and install the required dependencies.

```bash
cd gettext-merger
npm install

## optionally if you want to use the CLI to test the library
npm link
```

## Usage

The tool can be used either as a library in your Node.js project or as a command-line tool.


### Using as a Command-Line Tool

```bash
npx gettext-merger -i tests/fixtures/file1.pot tests/fixtures/file2.pot -o tests/fixtures/potfile.pot
```

### Using as a Library


#### Merging Pot Files

```typescript
import { mergePotFile } from 'gettext-merger';

const filePaths = ['file1.pot', 'file2.pot'];
const [headers, mergedSet] = await mergePotFile(filePaths);
```

#### Merging Pot Strings

```typescript
import { mergePotFileContent } from 'gettext-merger';

const fileContents = [
	`msgid "Product Status"
msgstr "Field: Useless Product Status"

#. Chunk file for editing product page
#: assets/client/admin/chunks/edit-product-page.js:1
msgid "Save Changes"
msgstr "Button: Save Useless Changes"`,

	`#. Field in products widget class
#: includes/widgets/class-wc-widget-products.php:53
msgid "Widget Title"
msgstr "Field: Useless Widget Title"`
];
const mergedContent = mergePotFileContent(fileContents);
```

#### Merging Pot Objects

```typescript
import { mergePotObject } from 'gettext-merger';

const setOfBlocksArray = [{
	msgid: 'text1',
	comments: {
		extracted: ['#. Translator comment'],
		reference: ['#: app.js'],
	},
},{
	msgid: 'text2',
	comments: {
		extracted: ['#. Translator comment'],
		reference: ['#: app.js'],
	},
}];

const mergedSet = mergePotObject(setOfBlocksArray);
```

#### Extract Pot Header

```typescript
import { extractPotHeader, Block } from 'gettext-merger';

const potFileContent = [`# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\n"

msgid "Hello"
msgstr "Hola"

msgid "Goodbye"
msgstr "Adiós"`];
const [header, remainingContent] = extractPotHeader(potFileContent);
```
---

### Block Class

The `Block` class represents a single block of a PO file.

#### Properties

- `msgid?: string`: The main message string.
- `msgstr?: string[]`: An array of translated strings.
- `msgid_plural?: string`: The plural form of the main message.
- `msgctxt?: string`: Context for the message.
- `comments?: GetTextComment`: Comments associated with the block.

#### Constructor

- **Constructor(data: string | string[] | Partial<Block>)**: Initializes a new instance of the `Block` class.

	- `data`: The data to initialize the block with, which can be a string, an array of strings, or a partial block object.

#### Methods

- **parseBlock(lines: string[]): Block | undefined**: Parses the provided lines and populates the block's properties.

- **toStr(): string**: Converts the block to a string representation.

- **toJson(): GetTextTranslation**: Converts the block to a JSON representation compatible with gettext-parser.

- **hash(): number**: Generates a hash value based on the concatenation of msgctxt and msgid.

- **merge(other: Block)**: Merges another block with the current block.

### Usage Example

```typescript
import { Block } from 'gettext-merger'

// Create a new block
const block1 = new Block('msgid "example"')

// Access and modify block properties
block1.msgstr = ['translated example']

// Convert the block to a string representation
console.log(block1.toStr())

// Merge two blocks
const block2 = new Block('msgid "example"')
block2.msgstr = ['another translated example']
block1.merge(block2)

// Output the merged block
console.log(block1.toStr())
```
---

### SetOfBlocks Class

The `SetOfBlocks` class represents a collection of `Block` objects.

#### Properties

- `blocks: Block[]`: An array of `Block` objects contained in the set.
- `path?: string`: Optional path to the file associated with the set.

#### Constructor

- **Constructor(arr?: Block[], path?: string)**: Initializes a new instance of the `SetOfBlocks` class.

	- `arr`: Optional array of `Block` objects to initialize the set with.
	- `path`: Optional path to the file associated with the set.

#### Methods

- **add(block: Block): void**: Adds a block to the collection, merging if a duplicate exists.

- **getDuplicate(hash: number): Block | undefined**: Finds and returns a duplicate block based on the given hash.

- **toStr(): string**: Converts the blocks in the set to a string representation.

- **toJson(): GetTextTranslations['translations']**: Converts the blocks in the set to a JSON representation compatible with the gettext-parser module.

- **addArray(arr: Block[]): void**: Adds an array of `Block` objects to the current instance.

### Usage Example

```typescript
import { SetOfBlocks, Block } from 'gettext-merger'

// Create a new set of blocks
const blockSet = new SetOfBlocks()

// Create a new block
const block1 = new Block('msgid "example"')

// Add the block to the set
blockSet.add(block1)

// Convert the set to a string representation
console.log(blockSet.toStr())

// Add an array of blocks to the set
const block2 = new Block('msgid "another example"')
blockSet.addArray([block2])

// Output the JSON representation of the set
console.log(blockSet.toJson())
```

## Tests

Run tests using the following command:

```bash
npm test
```

## Contributing

If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License

This tool is licensed under the [GNU General Public License v3](LICENSE).
