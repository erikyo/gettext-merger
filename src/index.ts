import fs from 'fs/promises'
import { SetOfBlocks } from './setOfBlocks.js'
import { parseFileContent } from './fs.js'
import { Block } from './block.js'
import { GetTextComment } from './types.js'
import { extractPotHeader } from './utils'

/**
 * Merges multiple arrays of blocks into a single set of blocks.
 *
 * @param {Block[][]} arrays - arrays of blocks to merge
 * @return {SetOfBlocks} a set containing all the blocks from the input arrays
 */
export function mergeBlocks(...arrays: Block[][]): SetOfBlocks {
	const set = new SetOfBlocks()
	for (const array of arrays) {
		set.addArray(array)
	}
	return set
}

/**
 * Writes the consolidated content of blocks to a specified output file.
 *
 * @return {Promise<string>} the consolidated content as a string
 * @param filePaths
 */
export async function mergePotFile(filePaths: string[]): Promise<[Block[], SetOfBlocks]> {
	const headers: Block[] = []
	const mergedSet = await Promise.all(
		filePaths.map(async (filePath) => {
			const fileContent = await fs.readFile(filePath, 'utf8')
			const [header, content] = extractPotHeader(fileContent)
			// Store the header in the header array
			if (header) headers.push(header)
			// Parse the content and return the SetOfBlocks
			return new SetOfBlocks(parseFileContent(content)).blocks
		})
	)

	// Retrieve the current blocks from the mergedSet
	const currentBlocks = Array.from(mergedSet)

	// Merge current blocks with the next array of blocks
	return [Array.from(headers), mergeBlocks(...currentBlocks)]
}

/**
 * Merges the contents of multiple POT files into a single string.
 *
 * @param {string[]} fileContents - an array of file contents to be merged
 * @return {string} the merged file contents as a single string
 */
export function mergePotFileContent(fileContents: string[]): string {
	// merge the files
	const mergedSet = fileContents.map((content) => {
		return new SetOfBlocks(parseFileContent(content)).blocks
	})

	// Retrieve the current blocks from the mergedSet
	const currentBlocks = Array.from(mergedSet)
	// Merge current blocks with the next array of blocks
	return mergeBlocks(...currentBlocks).toStr()
}

/**
 * Merge PotObject with the given translationObject.
 *
 * @param {SetOfBlocks[]} translationObject - Array of SetOfBlocks objects to merge
 * @return {SetOfBlocks} Merged SetOfBlocks object
 */
export function mergePotObject(translationObject: SetOfBlocks[]): SetOfBlocks {
	// Merge the SetOfBlocks objects
	const mergedSet = translationObject.map((content) => {
		return new SetOfBlocks(content.blocks).blocks
	})

	return mergeBlocks(...mergedSet)
}

/**
 * Helper function to merge two strings into a unique array, excluding
 * undefined values.
 *
 * @param {string | undefined} current - The current string to merge.
 * @param {string | undefined} other - The other string to merge.
 * @return {string[]} The merged array with unique values.
 */
function mergeUnique(
	current: string | string[] = [],
	other: string | string[] = []
): string[] {
	const mergeSet = new Set([...current, ...other])
	return Array.from(mergeSet)
}

/**
 * Merges two comments into a single comment object.
 *
 * @param {GetTextComment | undefined} current - The current comment object
 * @param {GetTextComment | undefined} other - The other comment object to merge
 * @return {GetTextComment} The merged comment object
 */
export function mergeComments(
	current: GetTextComment | undefined,
	other: GetTextComment | undefined
): GetTextComment {
	return {
		translator: mergeUnique(current?.translator, other?.translator),
		reference: mergeUnique(current?.reference, other?.reference),
		extracted: mergeUnique(current?.extracted, other?.extracted),
		flag: mergeUnique(current?.flag, other?.flag).join('\n'),
		previous: mergeUnique(current?.previous, other?.previous),
	}
}

export { Block, SetOfBlocks, extractPotHeader }
