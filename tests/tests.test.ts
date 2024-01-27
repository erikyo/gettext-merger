import * as fs from 'fs/promises'
import { mergePotStrings, writePo } from '../src/gettext-fn'
import { Block } from '../src/block'
import { SetOfBlocks } from '../src/setOfBlocks'

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
		expect(block.msgstr).toEqual('msgstr "Hola"')
		expect(block.msgctxt).toEqual('msgctxt "Context"')
		expect(block.references).toEqual(['#: app.js:12'])
		expect(block.translator).toEqual(['#. Some comment'])
	})

	it('should create a Block instance with empty properties if lines are empty', () => {
		const block = new Block([])

		expect(block.msgid).toEqual('')
		expect(block.msgstr).toEqual('')
		expect(block.msgctxt).toEqual('')
		expect(block.references).toEqual([])
		expect(block.translator).toEqual([])
	})

	it('should correctly calculate hash for a Block instance', () => {
		const lines = ['msgid "Hello"', '#: app.js', 'msgctxt "Context"']
		const block = new Block(lines)
		const hash = block.hash()

		// The expected hash can be calculated manually based on the provided hash function
		const expectedHash = 104656459

		expect(hash).toEqual(expectedHash)
	})

	it('should merge two Block instances correctly', () => {
		const lines1 = [
			'msgid "Hello"',
			'#: app.js',
			'msgctxt "Context"',
			'#. First comment',
		]
		const lines2 = ['msgid "Hello"', '#. Some comment']
		const block1 = new Block(lines1)
		const block2 = new Block(lines2)

		block1.merge(block2)

		expect(block1.msgid).toEqual('msgid "Hello"')
		expect(block1.translator).toEqual([
			'#. First comment',
			'#. Some comment',
		]) // Duplicates are not removed
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
		const potString1 =
			'msgid "Hello"\nmsgstr "Hola"\n\nmsgid "Goodbye"\nmsgstr "Adiós"\n\n'
		const potString2 =
			'msgid "Hello"\nmsgstr "Bonjour"\n\nmsgid "Thank you"\nmsgstr "Merci"\n\n'

		;(
			fs.readFile as jest.MockedFunction<typeof fs.readFile>
		).mockResolvedValueOnce(potString1)
		;(
			fs.readFile as jest.MockedFunction<typeof fs.readFile>
		).mockResolvedValueOnce(potString2)

		const result = await mergePotStrings([
			'tests/fixtures/file1.pot',
			'tests/fixtures/file2.pot',
		])

		expect(result.toStr()).toEqual(
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
		const blocks = new SetOfBlocks([
			new Block(['msgid "Hello"', 'msgstr "Hola"']),
		])
		const outputFile = 'output.pot'

		const writeFileSpy = jest.spyOn(fs, 'writeFile')
		;(
			fs.writeFile as jest.MockedFunction<typeof fs.writeFile>
		).mockResolvedValueOnce()

		const result = await writePo('', blocks, outputFile)

		expect(result).toEqual(`


msgid "Hello"
msgstr "Hola"

`)
	})
})
