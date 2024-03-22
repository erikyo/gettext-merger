import { Block } from './block.js'

/**
 * Compares the hash values of two blocks.
 *
 * @param {Block} a - the first block
 * @param {Block} b - the second block
 * @return {number} the difference between the hash values
 */
export function hashCompare(a: Block, b: Block): number {
	return a.hash() - b.hash()
}

/**
 * Removes quotes from the beginning and end of a string.
 *
 * @param {string} str - the input string with quotes
 * @return {string} the input string without quotes
 */
export function stripQuotes(str: string): string {
	return str.replace(/^(['"])(.*?)\1$/, '$2')
}

/**
 * Removes quotes from the beginning and end of a string.
 * @param str The string to unquote
 * @returns The unquoted string
 */
declare global {
	interface String {
		unquote(): string
	}
}

String.prototype.unquote = function (): string {
	if (typeof this !== 'string') {
		console.error(this, 'is not a string')
		return String(this)
	}
	return stripQuotes(this)
}

/**
 * Splits a multiline string into lines with a maximum length.
 *
 * @param {string | undefined} str - the string to split
 * @param {number} maxLength - the maximum length of each line
 * @return {string | undefined} the split multiline string, or undefined if input is undefined
 */
export function splitMultiline(
	str: string | undefined,
	maxLength: number = 80
): string | undefined {
	if (!str) {
		return undefined
	} else if (str.length <= maxLength || str.includes('\n')) {
		return str
	}

	const [__, type = '', string] = /^(\S+[\W])\s?(.*)$/.exec(str) as RegExpExecArray

	const words = stripQuotes(string).split(' ')
	let result = str.length > maxLength ? type + '""\n' : type // Adjusted for msgid format
	let currentLine = ''

	for (let i = 0; i < words.length; i++) {
		// Check if adding the next word exceeds the length limit
		if ((currentLine + ' ' + words[i]).length + 1 > maxLength) {
			result += `"${currentLine.trim()}"\n`
			currentLine = words[i] // Start a new line with the current word
		} else {
			currentLine += ' ' + words[i] // Add the current word to the line
		}
	}

	// Add the last line if there are any words left.
	if (currentLine) {
		result += `"${currentLine.trim()}"`
	}

	return result
}

/**
 * Extracts the header from the given .pot file content.
 *
 * @param {string} potFileContent - the content of the .pot file
 * @return {string} the header extracted from the .pot file content
 */
export function extractPotHeader(
	potFileContent: string
): [Block, string] | [undefined, string] {
	if (!potFileContent) {
		return [undefined, '']
	}

	// split the .pot file content into lines
	const lines = potFileContent.split('\n')
	let comment = lines
		.filter((line) => line.startsWith('#'))
		.map((line) => line.substring(1).trim())
	const firstNonEmptyIndex = lines.findIndex((line) => line.trim() === '')
	/**
	 * we skip the first line as it is the header of the .pot file
	 * and a line for each comment found in the array (assuming there are comments only at the beginning of the file)
	 */
	const parsedLines = lines.slice(comment.length, firstNonEmptyIndex)

	if (
		parsedLines.length === 0 ||
		!parsedLines.find((line) => line.toLowerCase().includes('project-id-version'))
	) {
		return [undefined, potFileContent]
	}

	const headerBlock = new Block(parsedLines)
	headerBlock.comments = { translator: comment }
	headerBlock.msgstr = [headerBlock.msgstr?.filter(Boolean).join('"\n"') || '""']

	return [
		headerBlock,
		lines.slice(firstNonEmptyIndex + comment.length, lines.length).join('\n'),
	]
}
