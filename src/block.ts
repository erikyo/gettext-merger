import { mergeComments } from './index.js'
import { GetTextComment } from './types.js'
import { splitMultiline } from './utils.js'
import { GetTextTranslation } from 'gettext-parser'

export const matcher: Record<string, RegExp> = {
	msgid: /^(msgid(?!_))(.*)/,
	msgstr: /^(msgstr(?:\[\d+])?)\s+(.*)/, // msgstr or msgstr[0]
	msgctxt: /^(msgctxt)\s+(.*)/,
	msgid_plural: /^(msgid_plural)\s+(.*)/,
	extracted: /^(#\.)(.*)/,
	reference: /^(#:)\s+(.*)/,
	flag: /^(#(?:[^:.,|]|$))\s+(.*)/,
	previous: /^(#\|)\s+(.*)/,
	translator: /^(#(?![.:,|]))\s+(.*)/, // OK, I'm lazy! Anyway, this will catch all "#" stuff that is not #. #: #, or #|
}

export interface Block {
	msgid: string // "%s example"
	msgstr?: string[] // ["% esempio", "%s esempi"],
	msgid_plural?: string // "%s examples"
	msgctxt?: string // context
	comments?: GetTextComment // #| Previous untranslated string
}

/**
 * This class represents a single block of PO file.
 */
export class Block {
	/**
	 * Constructor for initializing the message properties from the given lines.
	 *
	 * @param {string | string[] | Partial<Block>} data - The array of strings containing the message lines.
	 */
	constructor(data?: string | string[] | Partial<Block>) {
		if (typeof data === 'string') data = data.split('\n')
		if (Array.isArray(data)) {
			this.parseBlock(data)
		} else if (typeof data === 'object') {
			for (const key in data as Partial<Block>) {
				// check if the key exists in the class
				if (typeof this[key as keyof Block] !== null) {
					// @ts-ignore
					this[key as keyof Block] = data[key]
				}
			}
		}
	}

	private parseBlock(lines: string[]): Block | undefined {
		if (!lines.length) return undefined

		let currentType: string
		let rawBlock: Record<keyof typeof matcher, string[]> = {}

		lines.forEach((line) => {
			if (!line) return
			if (line.startsWith('"')) {
				currentType = currentType || 'msgid' // Assuming the default type is 'msgid' when the line starts with "
				rawBlock[currentType] = rawBlock[currentType] || [] // Initialize rawBlock[currentType] as an array if not yet defined
				rawBlock[currentType].push(line.unquote()) // Remove quotes and append
			} else {
				// Use the matcher object to find the type id
				for (const type in matcher) {
					const regexResult = matcher[type].exec(line.unquote())
					if (regexResult) {
						currentType = type
						// Initialize rawBlock[type] as an array if not yet defined
						if (!rawBlock[type]) {
							rawBlock[type] = []
						}
						// Append the matched string to rawBlock[type]
						rawBlock[type].push(regexResult[2].trim().unquote())
						break
					}
				}
			}
		})

		Object.assign(this, {
			msgid: rawBlock.msgid.join('"\n"') || '',
			msgid_plural: rawBlock.msgid_plural?.join('\n'),
			msgstr: rawBlock.msgstr || [],
			msgctxt: rawBlock.msgctxt?.join('\n'),
			comments: {
				translator: rawBlock?.translator,
				extracted: rawBlock?.extracted,
				reference: rawBlock?.reference,
				flag: rawBlock?.flag,
				previous: rawBlock?.previous,
			},
		})
	}

	/**
	 * Map an array of strings to a string representation.
	 *
	 * @param strings array of strings
	 * @param prefix string prefix for each line
	 */
	mapStrings(strings: string[] = [], prefix = '# '): string {
		return strings?.map((line) => prefix + line).join('\n')
	}

	/**
	 * Extracts a multi-line string from an array of strings.
	 *
	 * @param msgstr
	 * @param prefix
	 */
	extractMultiString(msgstr: string[], prefix = 'msgstr'): string {
		if (msgstr.length > 1) {
			return msgstr
				.map(
					(line, index) =>
						`${prefix}${msgstr.length > 1 ? '[' + index + ']' : ''} "${splitMultiline(line)}"`
				)
				.join('\n')
		} else if (msgstr.length === 1) {
			return `${prefix} "${msgstr[0]}"`
		}
		return `${prefix} ""`
	}

	/**
	 * Converts the object to a string representation.
	 *
	 * @return {string} The string representation of the object.
	 */
	toStr(): string {
		const { comments, msgid, msgid_plural, msgstr, msgctxt } = this
		const res = [
			this.mapStrings(comments?.translator), // Add key for translator comments
			this.mapStrings(comments?.extracted, '#. '), // Add key for extracted comments
			this.mapStrings(comments?.reference, '#: '), // Add key for reference comments
			comments?.flag ? `#, ${comments.flag}` : undefined, // Add key for flag comments
			this.mapStrings(comments?.previous, '#| '), // Add key for previous comments
			msgctxt ? `msgctxt "${msgctxt}"` : undefined, // Add key for msgctxt
			msgid ? `msgid "${splitMultiline(msgid)}"` : 'msgid ""', // Add key for msgid even if it's empty
			msgid_plural ? `msgid_plural "${msgid_plural}"` : undefined, // Add key for msgid_plural
			msgstr ? this.extractMultiString(msgstr) : 'msgstr ""', // Add keys for msgstr even if it's empty
		]
			.filter(Boolean)
			.filter((line) => line?.length)

		return res.join('\n')
	}

	toJson(): GetTextTranslation {
		const { comments, msgid = '', msgid_plural, msgstr = [], msgctxt = '' } = this
		return {
			msgctxt: msgctxt,
			msgid: msgid,
			msgid_plural: msgid_plural,
			msgstr: msgstr,
			comments: {
				translator: comments?.translator?.join('\n') || '',
				extracted: comments?.extracted?.join('\n') || '',
				reference: comments?.reference?.join('\n') || '',
				flag: comments?.flag || '',
				previous: comments?.previous?.join('\n') || '',
			},
		}
	}

	/**
	 * Generates a hash value for the concatenation of msgctxt, msgid, and msgid_plural.
	 *
	 * @return {number} the hash value generated
	 */
	hash(): number {
		const strToHash = (this.msgctxt || '') + '|' + (this.msgid || '') // match only the gettext with the same msgctxt and msgid (context and translation string)
		let hash = 0x811c9dc5 // FNV offset basis (32-bit)

		for (let i = 0; i < strToHash.length; i++) {
			hash ^= strToHash.charCodeAt(i) // XOR the hash with the current character code
			hash *= 0x01000193 // FNV prime (32-bit)
		}

		return hash >>> 0
	}

	/**
	 * Merges the other block with the current block.
	 */
	merge(other: Block) {
		if (this.msgid === other.msgid) {
			this.msgid_plural = this.msgid_plural || other.msgid_plural
			this.msgctxt = this.msgctxt || other.msgctxt
			this.msgstr = this.msgstr || other.msgstr
			this.comments = mergeComments(this.comments, other.comments)
		}
	}
}
