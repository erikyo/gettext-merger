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

#### Merging Pot Strings

```typescript
import { mergePotStrings } from './gettext-merger';

const filePaths = ['file1.pot', 'file2.pot'];
const mergedSet = await mergePotStrings(filePaths);

// Use mergedSet as needed
```

#### Merging Pot Files

```typescript
import { mergePotFiles } from './gettext-merger';

const fileContents = ['content1', 'content2'];
const mergedContent = mergePotFiles(fileContents, true);

// Use mergedContent as needed
```

#### Merging Pot Objects

```typescript
import { mergePotObject } from './gettext-merger';

const setOfBlocksArray = /* Array of SetOfBlocks objects */;
const mergedSet = mergePotObject(setOfBlocksArray);

// Use mergedSet as needed
```

#### Merging Comments

```typescript
import { mergeComments } from './gettext-merger';

const comment1 = /* GetTextComment object 1 */;
const comment2 = /* GetTextComment object 2 */;
const mergedComment = mergeComments(comment1, comment2);

// Use mergedComment as needed
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
