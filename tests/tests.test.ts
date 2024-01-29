import * as fs from 'fs/promises'
import { writePo, extractPotHeader } from '../src/gettext-fn'
import { Block } from '../src/block'
import { SetOfBlocks } from '../src/setOfBlocks'
import { mergePotFile } from '../src/merge'
import { splitMultiline } from '../src/utils'

jest.mock('fs/promises')

describe('Block Class', () => {
	it('should create a Block instance with correct properties', () => {
		const lines = [
			'msgid "Hello"',
			'msgstr "Hola"',
			'#: app.js:12',
			'#. Some comment',
			'msgctxt "Context"',
		]

		const block = new Block(lines)

		expect(block.msgid).toEqual('msgid "Hello"')
		expect(block.msgstr).toEqual(['msgstr "Hola"'])
		expect(block.msgctxt).toEqual('msgctxt "Context"')
	})

	it('should create a Block instance with empty properties if lines are empty', () => {
		const block = new Block([])

		expect(block.msgid).toEqual(undefined)
		expect(block.msgstr).toEqual(undefined)
		expect(block.msgctxt).toEqual(undefined)
	})

	it('should correctly calculate hash for a Block instance', () => {
		const lines = `#. Importer view for successful product update
#: includes/admin/importers/views/html-csv-import-done.php:28
msgid "%s product updated"
msgid_plural "%s products updated"
msgstr[0] "Useless: One product has been updated"
msgstr[1] "Useless: %s products have been updated"`.split('\n')
		const block = new Block(lines)

		expect(block.toStr()).toEqual(`#. Importer view for successful product update
#: includes/admin/importers/views/html-csv-import-done.php:28
msgid "%s product updated"
msgid_plural "%s products updated"
msgstr[0] "Useless: One product has been updated"
msgstr[1] "Useless: %s products have been updated"`)
	})

	it('should correctly calculate hash for a Block instance', () => {
		const lines = ['msgid "Hello"', '#: app.js', 'msgctxt "Context"']
		const block = new Block(lines)
		const hash = block.hash()

		// The expected hash can be calculated manually based on the provided hash function
		const expectedHash = 1870341923

		expect(hash).toEqual(expectedHash)
	})

	it('should merge two Block instances correctly', () => {
		const lines1 = [
			'msgid "Hello"',
			'#: src/app.js:12',
			'msgctxt "Context"',
			'#. Translator comment',
		]
		const lines2 = ['msgid "Hello"', '#. Translator comment']
		const block1 = new Block(lines1)
		const block2 = new Block(lines2)

		block1.merge(block2)

		expect(block1.msgid).toEqual('msgid "Hello"')
		expect(block1.comments?.extracted).toEqual(['#. Translator comment']) // Duplicates are removed
	})
})

describe('SetOfBlocks Class', () => {
	it('should create a SetOfBlocks instance with correct properties', () => {
		const block1 = new Block(['msgid "Hello"', 'msgstr "Hola"'])
		const block2 = new Block(['msgid "Goodbye"', 'msgstr "Adiós"'])
		const setOfBlocks = new SetOfBlocks([block1])
		const setOfBlocks2 = new SetOfBlocks([block2])

		expect(setOfBlocks.blocks).toEqual([block1])
		expect(setOfBlocks.blocks).not.toEqual([block2])
		expect(setOfBlocks2.blocks).not.toEqual([block1])
	})

	it('should add a new block to SetOfBlocks instance', () => {
		const block1 = new Block(['msgid "Hello"', 'msgstr "Hola"'])
		const block2 = new Block(['msgid "Goodbye"', 'msgstr "Adiós"'])
		const setOfBlocks = new SetOfBlocks([block1])

		setOfBlocks.add(block2)

		expect(setOfBlocks.blocks).toEqual([block1, block2])
	})

	it('should merge two SetOfBlocks instances correctly', () => {
		const block1 = new Block(['msgid "Hello"', 'msgstr "Hola"'])
		const block2 = new Block(['msgid "Goodbye"', 'msgstr "Adiós"'])
		const set1 = new SetOfBlocks([block1])
		const set2 = new SetOfBlocks([block2])

		set1.addArray(set2.blocks)

		expect(set1.blocks[0]).toEqual(block1)
		expect(set1.blocks.length).toEqual(2)
	})

	it('should get a duplicate block from SetOfBlocks instance', () => {
		// generate some random blocks to test
		const blocks = [
			Array.from({ length: 5 })
				.fill(0)
				.map(
					() =>
						new Block([
							'msgid ' + Math.random() + '',
							'msgstr "Ciao ' + Math.random() + '"',
						])
				),
		]

		const setOfBlocks = new SetOfBlocks(...blocks)

		// check that the first block is returned and no duplicates are found
		blocks.some((block) => {
			const duplicate = setOfBlocks.getDuplicate(block[0].hash())
			expect(duplicate).toEqual(block[0])
			expect(duplicate).not.toEqual(block[1])
			expect(duplicate).not.toEqual(block[4])
			return true
		})
	})
})

describe('Merge Pot Strings Function', () => {
	it('should merge two pot strings correctly', async () => {
		const potString1 = `# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\n"

msgid "Hello"
msgstr "Hola"

msgid "Goodbye"
msgstr "Adiós"`
		const potString2 = `msgid "Hello"
msgstr "Bonjour"

msgid "Thank you"
msgstr "Merci"`

		;(fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValueOnce(
			potString1
		)
		;(fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValueOnce(
			potString2
		)

		const result = await mergePotFile([
			'tests/fixtures/file1.pot',
			'tests/fixtures/file2.pot',
		])

		expect(result[0][0].toStr()).toEqual(`# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\n"`)

		expect(result[1].toStr()).toEqual(
			`msgid "Hello"
msgstr "Hola"

msgid "Thank you"
msgstr "Merci"

msgid "Goodbye"
msgstr "Adiós"

`
		)
	})
})

describe('Write Po Function', () => {
	it('should write consolidated blocks to a file', async () => {
		const blocks = new SetOfBlocks([new Block(['msgid "Hello"', 'msgstr "Hola"'])])
		const outputFile = 'output.pot'

		const writeFileSpy = jest.spyOn(fs, 'writeFile')
		;(
			fs.writeFile as jest.MockedFunction<typeof fs.writeFile>
		).mockResolvedValueOnce()

		const result = await writePo(undefined, blocks, outputFile)

		expect(result).toEqual(`msgid "Hello"
msgstr "Hola"

`)
	})
})

describe('splitMultiline', () => {
	test('should return the original string if it is 80 characters or less', () => {
		const input = 'msgid "Short string"'
		const result = splitMultiline(input)
		expect(result).toBe(input)
	})

	test('should return the original string if it contains a newline character', () => {
		const input = 'msgid "Short string\nwith newline"'
		const result = splitMultiline(input)
		expect(result).toBe(input)
	})

	test('should split a string longer than 80 characters into multiple lines', () => {
		const input =
			"msgid \"? This plugin is incompatible with the enabled WooCommerce features '%1//$s' and '%2//$s', it shouldn't be activated.\""
		const result = splitMultiline(input)
		expect(result).toContain('\n')
		expect(result).toBe(
			`msgid ""
"? This plugin is incompatible with the enabled WooCommerce features '%1//$s'"
"and '%2//$s', it shouldn't be activated."`
		)
		result?.split('\n').forEach((line) => {
			expect(line.length).toBeLessThanOrEqual(80)
		})
	})

	test('should handle empty strings', () => {
		const input = ''
		const result = splitMultiline(input)
		expect(result).toBe(undefined)
	})

	test('should not exceed 66 characters per line when specified', () => {
		const input =
			'msgid "?This is a specific test string that needs to be broken down into segments of no more than sixty-six characters."'
		const length = 66
		const result = splitMultiline(input, length)
		result?.split('\n').forEach((line) => {
			expect(line.length).toBeLessThanOrEqual(66)
		})
	})
})

describe('extractPotHeader', () => {
	it('should extract the header from .pot file content', () => {
		const potContent = `# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2021-02-15 18:30+0000\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

msgid "Example1"
msgstr "Example1 Translation"

msgid "Example2"
msgstr "Example2 Translation"
`

		const expectedHeader = `# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2021-02-15 18:30+0000\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"`

		const result = extractPotHeader(potContent)

		expect(result[0]?.toStr()).toBe(expectedHeader)
	})

	it('should return an empty string if header is not present', () => {
		const noHeaderContent = `msgid "Example1"
msgstr "Example1 Translation"

msgid "Example2"
msgstr "Example2 Translation"

`

		expect(extractPotHeader(noHeaderContent)[0]).toBe(undefined)
	})
})
