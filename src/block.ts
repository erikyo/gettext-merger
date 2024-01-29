import { mergeComments } from './merge'
import { GetTextComment } from './types'
import { splitMultiline, stripQuotes } from './utils'

export const matcher = {
	msgid: /^(msgid)(.*)/,
	msgstr: /^(msgstr)(.*)/,
	msgctxt: /^(msgctxt)(.*)/,
	msgid_plural: /^(msgid_plural)(.*)/,
	extracted: /^(#\.)(.*)/,
	reference: /^(#:)(.*)/,
	flag: /^(#,)(.*)/,
	previous: /^(#\|)(.*)/,
	translator: /^(#(?![.:,|]))(.*)/, // all # that is not #. #: #, or #|
}

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
			this.msgid = this.parseForLine(lines, 'msgid')
			this.msgid_plural = this.parseForLine(lines, 'msgid_plural')
			this.msgstr = this.parseForLines(lines, 'msgstr')
			this.msgctxt = this.parseForLine(lines, 'msgctxt')
			this.comments = {
				extracted: this.parseForLine(lines, 'extracted'),
				reference: this.parseForLines(lines, 'reference'),
				flag: this.parseForLine(lines, 'flag'),
				previous: this.parseForLines(lines, 'previous'),
				translator: this.parseForLines(lines, 'translator'),
			}
		}
	}

	/**
	 * Parses the given array of strings for a specific id and returns the matching
	 * string or array of strings.
	 *
	 * @param {string[]} lines - the array of strings to parse
	 * @param {string} id - the id to search for
	 * @return {string} the matching string or array of strings
	 */
	private parseForLine(lines: string[], id: string): string {
		return this.parseForLines(lines, id)?.join('\n')
	}

	private parseForLines(lines: string[], id: string): string[] {
		if (!lines.length) return []

		const res: string[] = []

		let startParse = false

		for (let i = 0; i < lines.length; i++) {
			const regexResult = matcher[id as keyof typeof matcher].exec(
				lines[i]
			) as RegExpExecArray
			if (regexResult?.length && regexResult[2]) {
				if (regexResult[2]) {
					res.push(regexResult[1] + ' ' + regexResult[2].trim())
					startParse = true
				}
			} else if (startParse && lines[i].startsWith('"')) {
				res.push(lines[i])
			} else if (startParse) {
				break // Stop parsing if we have started and now reached a line that doesn't start with a quote
			}
		}

		// Join the array into a single string if single is true.
		return res
	}

	/**
	 * Converts the object to a string representation.
	 *
	 * @return {string} The string representation of the object.
	 */
	toStr(): string {
		const { comments, msgid, msgid_plural, msgstr, msgctxt } = this
		const res = [
			comments?.translator?.join('\n'),
			comments?.extracted,
			comments?.reference?.join('\n'),
			comments?.flag,
			comments?.previous?.join('\n'),
			msgctxt,
			splitMultiline(msgid),
			msgid_plural,
			msgstr?.map((i) => splitMultiline(i))?.join('\n') || '""',
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
		const strToHash = this?.msgctxt + this?.msgid
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
