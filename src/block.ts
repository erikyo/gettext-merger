import { mergeComments } from './'
import { GetTextComment } from './types'
import { splitMultiline } from './utils'
import { GetTextTranslation } from 'gettext-parser'

export const matcher: Record<string, RegExp> = {
	msgid: /^(msgid(?!_))(.*)/,
	msgstr: /^msgstr(?:\[\d+])?(.*)/, // msgstr or msgstr[0]
	msgctxt: /^(msgctxt)(.*)/,
	msgid_plural: /^(msgid_plural)(.*)/,
	extracted: /^(#\.)(.*)/,
	reference: /^(#:)(.*)/,
	flag: /^(#,)(.*)/,
	previous: /^(#\|)(.*)/,
	translator: /^(#(?![.:,|]))(.*)/, // all # that is not #. #: #, or #|
}

export interface Block {
	msgid?: string // "%s example"
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
				if (key in Block.prototype) {
					// @ts-ignore
					this[key] = data[key]
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
				// @ts-ignore
				rawBlock[currentType].push(line) // Remove quotes and append
			} else {
				// Use the matcher object to find the type id
				for (const type in matcher) {
					const regexResult = matcher[type].exec(line)
					if (regexResult) {
						currentType = type
						if (!rawBlock[type]) {
							rawBlock[type] = []
						}
						rawBlock[type].push(regexResult[0])
						break
					}
				}
			}
		})

		Object.assign(this, {
			msgid: rawBlock.msgid?.join('\n'),
			msgid_plural: rawBlock.msgid_plural?.join('\n'),
			msgstr: rawBlock.msgstr,
			msgctxt: rawBlock.msgctxt?.join('\n'),
			comments: {
				translator: rawBlock.translator,
				extracted: rawBlock.extracted,
				reference: rawBlock.reference,
				flag: rawBlock.flag,
				previous: rawBlock.previous,
			},
		})
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
		const strToHash = this?.msgctxt || '' + this?.msgid // match only the gettext with the same msgctxt and msgid (context and translation string)
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
			this.msgid_plural = this.msgid_plural || other.msgid_plural
			this.msgctxt = this.msgctxt || other.msgctxt
			this.msgstr = this.msgstr || other.msgstr
			this.comments = mergeComments(this.comments, other.comments)
		}
	}
}
