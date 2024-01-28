import fs from 'fs/promises'
import { SetOfBlocks } from './setOfBlocks'
import { Block } from './block'
import { hashCompare } from './utils'

/**
 * Reads a block of lines from the input array and returns the block along with the remaining lines.
 *
 * @param {string[]} lines - The array of lines to read from.
 * @return {[string[], string[]]} An array containing the block of lines read and the remaining lines.
 */
function readBlock(lines: string[]): [string[], string[]] {
	const block: string[] = []
	let line = lines.pop()

	while (line) {
		block.push(line)
		line = lines.pop()
	}

	return [block, lines]
}

/**
 * Reads and processes blocks from the given array of lines.
 *
 * @param {string[]} lines - Array of lines to process
 * @return {Block[]} The processed blocks
 */
function readBlocks(lines: string[]): Block[] {
	const blocks: Block[] = []

	while (lines.length > 0) {
		const res = readBlock(lines)
		const b = new Block(res[0])
		blocks.push(b)
		lines = res[1]
	}

	return blocks
}

/**
 * Parses the given data string and returns an array of Block objects.
 *
 * @param {string} data - the string to be parsed
 * @return {Block[]} an array of Block objects
 */
export function parseFile(data: string): Block[] {
	const lines = data.split(/\r?\n/).reverse()
	const blocks = readBlocks(lines)
	return blocks.sort(hashCompare)
}

/**
 * Writes the consolidated content of the SetOfBlocks to a file specified by the
 * output parameter.
 *
 * @param header - the header to be written
 * @param {SetOfBlocks} blocks - the set of blocks to be consolidated
 * @param {string} output - the path of the file to write the consolidated content
 * @return {Promise<string>} a promise that resolves to the consolidated content
 */
export async function writePo(
	header: string,
	blocks: SetOfBlocks,
	output: string
): Promise<string> {
	const consolidated = header + '\n\n\n' + blocks.toStr()

	// override by default
	await fs.writeFile(output, consolidated, { encoding: 'utf8', flag: 'w' })
	return consolidated
}
