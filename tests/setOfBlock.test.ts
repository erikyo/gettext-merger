import { beforeEach, describe, expect, it } from 'vitest'
import { Block } from '../src'
import { SetOfBlocks } from '../src'

describe('SetOfBlocks', () => {
	let setOfBlocks: SetOfBlocks

	beforeEach(() => {
		setOfBlocks = new SetOfBlocks()
	})

	it('add method adds a block to the collection', () => {
		const block = new Block(['msgid "Hello"', 'msgstr "Hola"'])
		setOfBlocks.add(block)
		expect(setOfBlocks.blocks.length).toBe(1)
	})

	it('add method merges duplicate blocks', () => {
		const block1 = new Block(['msgid "block1"'])
		const block2 = new Block(['msgid "block2"'])
		const block3 = new Block(['msgid "block3"'])
		setOfBlocks.add(block1)
		setOfBlocks.add(block2)
		setOfBlocks.add(block3)
		// check that the blocks have been added
		expect(setOfBlocks.blocks.length).toBe(3)
		// check that the blocks have been merged in the correct order
		expect(setOfBlocks.blocks[0].msgid).toBe('msgid "block1"')
		expect(setOfBlocks.blocks[1].msgid).toBe('msgid "block2"')
		expect(setOfBlocks.blocks[2].msgid).toBe('msgid "block3"')
	})

	it('getDuplicate method returns the duplicate block', () => {
		const block1 = new Block(['msgid "Hello"', 'msgstr "Hola"'])
		const block2 = new Block(['msgid "Goodbye"', 'msgstr "Adiós"'])
		setOfBlocks.add(block1)
		setOfBlocks.add(block2)
		const duplicate1 = setOfBlocks.getDuplicate(block1.hash())
		const duplicate2 = setOfBlocks.getDuplicate(block1.hash())
		expect(duplicate1).toBeDefined()
		expect(duplicate2).toBeDefined()
	})

	it('toStr method returns string representation of blocks', () => {
		const block1 = new Block(['msgid "Hello"', 'msgstr "Hola"'])
		const block2 = new Block(['msgid "Goodbye"', 'msgstr "Adiós"'])
		setOfBlocks.add(block1)
		setOfBlocks.add(block2)
		const str = setOfBlocks.toStr()
		expect(str).toBeDefined()
		expect(str).toBe(`msgid "Hello"
msgstr "Hola"

msgid "Goodbye"
msgstr "Adiós"

`)
	})
})
