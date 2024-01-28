import { mergeComments } from './merge'
import { GetTextComment } from './types'
import { stripQuotes } from './utils'

/**
 * This class represents a single block of PO file.
 */
export class Block {
	comments?: GetTextComment // #| Previous untranslated string
	msgid: string // "%s example"
	msgstr: string[] // ["% esempio", "%s esempi"],
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
			this.msgid = this.parseForLine(lines, /^msgid/, true) as string
			this.msgid_plural = this.parseForLine(lines, /^msgid_plural/, true) as string
			this.msgstr = this.parseForLine(lines, /^msgstr/, false) as string[]
			this.msgctxt = this.parseForLine(lines, /^msgctxt/, true) as string
			this.comments = {
				extracted: this.parseForLine(lines, /^#\./, true) as string,
				reference: this.parseForLine(lines, /^#:/, false) as string[],
				flag: this.parseForLine(lines, /^#,/, true) as string,
				previous: this.parseForLine(lines, /^#\|/, false) as string[],
				translator: this.parseForLine(
					lines,
					/^#(?!\.|:|,|\|)\s?/, // all # that is not #. #: #, or #|
					true
				) as string,
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
		id: RegExp,
		single: boolean = false
	): string | string[] {
		const res: string[] = []

		let startParse = false

		for (let i = 0; i < lines.length; i++) {
			if (id.test(lines[i]) || (startParse && lines[i].startsWith('"'))) {
				res.push(lines[i]) // Remove quotes at the start and end.
				startParse = true
			} else if (startParse) {
				break // Stop parsing if we have started and now reached a line that doesn't start with a quote
			}
		}

		return single ? res.join('').replace(/""/g, '') : res // Join the array into a single string if single is true.
	}

	/**
	 * Converts the object to a string representation.
	 *
	 * @return {string} The string representation of the object.
	 */
	toStr(): string {
		const { comments, msgid, msgid_plural, msgstr, msgctxt } = this
		const res = [
			comments?.translator,
			comments?.extracted,
			comments?.reference?.join('\n'),
			comments?.flag,
			comments?.previous?.join('\n'),
			msgctxt,
			msgid,
			msgid_plural,
			msgstr.join('\n'),
		]
			.filter(Boolean)
			.filter((i) => i?.length)

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
			this.msgid_plural = this.msgid_plural ?? other.msgid_plural
			this.msgctxt = this.msgctxt ?? other.msgctxt
			this.msgstr = this.msgstr ?? other.msgstr
			this.comments = mergeComments(this.comments, other.comments)
		}
	}
}
