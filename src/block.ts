import { mergeComments } from './merge'

export interface GetTextComment {
	translator?: string
	reference?: string[]
	extracted?: string
	flag?: string
	previous?: string
}

/**
 * This class represents a single block of PO file.
 */
export class Block {
	comments?: GetTextComment // #| Previous untranslated string
	msgid: string // "%s example"
	msgstr: string // ["% esempio", "%s esempi"],
	msgid_plural?: string // "%s examples"
	msgctxt?: string // context

	/**
	 * Constructor for initializing the message properties from the given lines.
	 *
	 * @param {string[]} lines - The array of strings containing the message lines.
	 */
	constructor(lines: string[] | Block) {
		if (lines instanceof Block) {
			this.msgid = lines.msgid
			this.msgid_plural = lines.msgid_plural
			this.msgstr = lines.msgstr
			this.msgctxt = lines.msgctxt
			this.comments = lines.comments
		} else {
			this.msgid = this.parseForLine(lines, 'msgid', true) as string
			this.msgid_plural = this.parseForLine(
				lines,
				'msgid_plural',
				true
			) as string
			this.msgstr = this.parseForLine(lines, 'msgstr', true) as string
			this.msgctxt = this.parseForLine(lines, 'msgctxt', true) as string
			this.comments = {
				translator: this.parseForLine(lines, '#.', false) as string,
				reference: this.parseForLine(lines, '#:', false) as string[],
			}
		}
	}

	/**
	 * Parses the given array of strings for a specific id and returns the matching
	 * string or array of strings.
	 *
	 * @param {string[]} lines - the array of strings to parse
	 * @param {string} id - the id to search for
	 * @param {boolean} single - indicates whether to return a single string or an array
	 * @return {string|string[]} the matching string or array of strings
	 */
	private parseForLine(
		lines: string[],
		id: string,
		single: boolean = false
	): string | string[] {
		const res: string[] = []
		let startParse = false

		for (let i = 0; i < lines.length; i++) {
			if (
				lines[i].includes(id) ||
				(startParse && lines[i].startsWith('"'))
			) {
				res.push(lines[i]) // Remove quotes at the start and end.
				startParse = true
			} else if (startParse) {
				break // Stop parsing if we have started and now reached a line that doesn't start with a quote
			}
		}

		return single ? res.join('') : res // Join the array into a single string if single is true.
	}

	/**
	 * Converts the object to a string representation.
	 *
	 * @return {string} The string representation of the object.
	 */
	toStr(): string {
		const res = [
			this.comments?.translator,
			this.comments?.reference,
			this.msgid,
			this.msgid_plural,
			this.msgstr,
			this.msgctxt,
		].filter(Boolean)

		return res.join('\n')
	}

	/**
	 * Generates a hash value for the concatenation of msgctxt, msgid, and msgid_plural.
	 *
	 * @return {number} the hash value generated
	 */
	hash(): number {
		const strToHash = this?.msgctxt + this?.msgid + this?.msgid_plural
		let hash = 0
		for (let i = 0; i < strToHash.length; i++) {
			const chr = strToHash.charCodeAt(i)
			hash = ((hash << 5) - hash + chr) | 0
		}
		return hash
	}

	/**
	 * Merges the other block with the current block.
	 */
	merge(other: Block) {
		if (this.msgid === other.msgid) {
			this.msgctxt = this.msgctxt ?? other.msgctxt
			this.msgstr = this.msgstr ?? other.msgstr
			this.comments = mergeComments(this.comments, other.comments)
		}
	}
}
