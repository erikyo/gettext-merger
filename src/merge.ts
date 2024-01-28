import { SetOfBlocks } from './setOfBlocks'
import fs from 'fs/promises'
import { extractPotHeader } from './utils'
import { parseFile } from './gettext-fn'
import { Block, GetTextComment } from './block'

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

/**
 * Merges the contents of multiple POT files into a single string.
 *
 * @param {string[]} fileContents - an array of file contents to be merged
 * @param withHeader - indicates whether to include the header, the header is gathered from the first file
 * @return {string} the merged file contents as a single string
 */
export function mergePotFiles(
	fileContents: string[],
	withHeader: boolean = false
): string {
	let response: string = ''

	// maybe add the header
	if (withHeader) {
		response = extractPotHeader(fileContents[0] as string) + '\n\n\n'
	}

	// merge the files
	const mergedSet = fileContents.map((content) => {
		return new SetOfBlocks(parseFile(content)).blocks
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
		translator: current?.translator ?? other?.translator,
		reference: mergeUnique(current?.reference, other?.reference),
		extracted: current?.extracted ?? other?.extracted,
		flag: current?.flag ?? other?.flag,
		previous: current?.previous ?? other?.previous,
	}
}
