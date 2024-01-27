import { SetOfBlocks } from './setOfBlocks'
import fs from 'fs/promises'
import { extractPotHeader } from './utils'
import { mergeBlocks, parseFile } from './gettext-fn'

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
	response += mergeBlocks(...mergedSet).toStr()

	// return the response
	return response
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
