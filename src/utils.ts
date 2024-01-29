import { Block } from './block'
import { readFileSync } from 'fs'

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

export function stripQuotes(str: string): string {
	return str.replace(/^['"]+|['"]+$/g, '')
}

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
