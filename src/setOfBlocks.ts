import { Block } from './block.js'
import { hashCompare } from './utils.js'
import { GetTextTranslation, GetTextTranslations } from 'gettext-parser'

export class SetOfBlocks {
	/** An array of Block objects */
	blocks: Block[]
	path?: string

	/**
	 * Constructor for the Block class.
	 *
	 * @param {Block[]} arr - optional array of Block objects
	 * @param path - optional path to the file
	 */
	constructor(arr?: Block[], path?: string) {
		this.blocks = (arr as Block[]) || []
		this.path = path || undefined
	}

	/**
	 * Add a block to the collection, merging if a duplicate exists.
	 *
	 * @param {Block} block - the block to add
	 * @return {void}
	 */
	add(block: Block): void {
		const duplicate = this.getDuplicate(block.hash())

		if (duplicate) {
			duplicate.merge(block)
		} else {
			this.blocks.push(block)
		}
	}

	/**
	 * Find and return a duplicate block based on the given hash.
	 *
	 * @param {number} hash - the hash to search for
	 * @return {Block | undefined} the duplicate block, if found
	 */
	getDuplicate(hash: number): Block | undefined {
		for (let i = 0; i < this.blocks.length; i++) {
			if (this.blocks[i].hash() === hash) {
				return this.blocks[i]
			}
		}

		return undefined
	}

	/**
	 * Chainable sort function
	 *
	 * @param type - sorting type ('alphabetically', 'numerically', etc.)
	 * @returns {SetOfBlocks} the instance of SetOfBlocks
	 */
	sortBlocks(type: string = 'alphabetically'): SetOfBlocks {
		switch (type) {
			case 'alphabetically':
				this.blocks.sort((a, b) => a.msgid.localeCompare(b.msgid))
				break
			case 'hash':
				this.blocks.sort(hashCompare)
				break
		}
		return this
	}

	/**
	 * Chainable filter function used to remove blocks without mandatory fields
	 * Usually you want to fire this function to clean up the blocks without the msgid
	 *
	 * @returns {SetOfBlocks} the instance of SetOfBlocks
	 */
	cleanup(
		mandatoryField: keyof Pick<
			GetTextTranslation,
			'msgid' | 'msgstr' | 'msgid_plural' | 'msgctxt'
		> = 'msgid'
	): SetOfBlocks {
		this.blocks = this.blocks.filter((b) => !!b[mandatoryField])
		return this
	}

	/**
	 * Convert the blocks to a string representation.
	 *
	 * @return {string} the string representation of the blocks
	 */
	toStr(): string {
		return this.blocks
			.filter((b) => b.msgid)
			.sort(hashCompare)
			.reduce((prev, curr) => prev + curr.toStr() + '\n\n', '')
	}

	/**
	 * Convert the blocks to a JSON representation using a compatible format for gettext-parser module
	 *
	 * @return {GetTextTranslations['translations']} the JSON representation of the blocks
	 */
	toJson(): GetTextTranslations['translations'] {
		const newSet: Record<string, { [key: string]: GetTextTranslation }> = {}

		this.blocks
			.filter((b) => b.msgid)
			.sort(hashCompare)
			.forEach((b) => {
				const index = b.msgctxt || ''
				if (!newSet[index]) newSet[index] = {}
				newSet[index][b.msgid || ''] = b.toJson()
			})

		return newSet as GetTextTranslations['translations']
	}

	/**
	 * Adds an array of Block objects to the current instance.
	 *
	 * @param {Block[]} arr - The array of Block objects to add
	 * @return {void}
	 */
	addArray(arr: Block[]): void {
		// for each item in the array call add on the current instance
		for (const item of arr) this.add(item)
		// filter out any items that don't have a msgid
		this.blocks.filter((b) => b.msgid)
	}
}
