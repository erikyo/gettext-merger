import { Block } from './block'
import { hashCompare } from './utils'

export class SetOfBlocks {
	/** An array of Block objects */
	blocks: Block[]

	/**
	 * Constructor for the Block class.
	 *
	 * @param {Block[]} arr - optional array of Block objects
	 */
	constructor(arr?: Block[]) {
		this.blocks = arr || []
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
	 * Adds an array of Block objects to the current instance.
	 *
	 * @param {Block[]} arr - The array of Block objects to add
	 * @return {void}
	 */
	addArray(arr: Block[]): void {
		for (let i = 0; i < arr.length; i++) this.add(arr[i])
		this.blocks.filter((b) => b.msgid)
	}
}
