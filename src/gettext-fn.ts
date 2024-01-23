import fs from 'fs/promises'
import { SetOfBlocks } from './setOfBlocks'
import { Block } from './block'
import { hashCompare } from './utils'

/**
 * Asynchronously runs mergePotStrings with the provided input files and returns
 * the resulting set of blocks.
 *
 * @param {string[]} inputFiles - An array of input file paths to be merged
 * @return {Promise<SetOfBlocks>} A Promise resolving to the set of blocks
 */
export async function runMergePotWithArgs(
	inputFiles: string[]
): Promise<SetOfBlocks> {
	// Ensure we have exactly two input files
	if (inputFiles.length <= 1) {
		console.error('You must provide at least two input files.')
		process.exit(1)
	}

	return await mergePotStrings(inputFiles)
}

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
function parseFile(data: string): Block[] {
	const lines = data.split(/\r?\n/).reverse()
	const blocks = readBlocks(lines)
	return blocks.sort(hashCompare)
}

/**
 * Merges multiple arrays of blocks into a single set of blocks.
 *
 * @param {Block[][]} arrays - arrays of blocks to merge
 * @return {SetOfBlocks} a set containing all the blocks from the input arrays
 */
function mergeBlocks(...arrays: Block[][]): SetOfBlocks {
	const set = new SetOfBlocks()
	for (const array of arrays) {
		set.addArray(array)
	}
	return set
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

/**
 * Writes the consolidated content of blocks to a specified output file.
 *
 * @return {Promise<string>} the consolidated content as a string
 * @param filePaths
 */
export async function mergePotStrings(
	filePaths: string[]
): Promise<SetOfBlocks> {
	const mergedSet = await Promise.all(
		filePaths.map(async (filePath) => {
			const fileContent = await fs.readFile(filePath, 'utf8')
			return new SetOfBlocks(parseFile(fileContent)).blocks
		})
	)

	// Retrieve the current blocks from the mergedSet
	const currentBlocks = Array.from(mergedSet)
	// Merge current blocks with the next array of blocks
	return mergeBlocks(...currentBlocks)
}
