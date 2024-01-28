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

export function extractPotHeader(potFileContent: string): string {
	const header: string[] = []
	let inHeader = true

	// Split the content into lines
	const lines = potFileContent.split('\n')

	// Iterate through lines
	for (const line of lines) {
		const trimmedLine = line.trim()

		if (inHeader) {
			// Check for lines indicating the end of the header
			if (trimmedLine === '') {
				inHeader = false
			} else {
				// Collect lines in the header
				header.push(line)
			}
		} else {
			// Break if the first non-empty line after the header is found
			if (trimmedLine !== '') {
				break
			}
		}
	}

	return header.join('\n')
}
