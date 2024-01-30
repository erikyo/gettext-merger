# Gettex Merger

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


## Tests

Run tests using the following command:

```bash
npm test
```

## Contributing

If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License

This tool is licensed under the [MIT License](LICENSE).
