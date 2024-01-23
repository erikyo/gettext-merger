/**
 * This class represents a single block of PO file.
 */
export class Block {
	translator: string[] // #. Translators:
	references: string[] // #: plugin-name.php:12
	msgid: string // "%s example"
	msgstr: string // ["% esempio", "%s esempi"],
	msgid_plural: string // "%s examples"
	msgctxt: string // context

	/**
	 * Constructor for initializing the message properties from the given lines.
	 *
	 * @param {string[]} lines - The array of strings containing the message lines.
	 */
	constructor(lines: string[]) {
		this.translator = this.parseForLine(lines, '#.', false) as string[]
		this.references = this.parseForLine(lines, '#:', false) as string[]
		this.msgid = this.parseForLine(lines, 'msgid', true) as string
		this.msgid_plural = this.parseForLine(
			lines,
			'msgid_plural',
			true
		) as string
		this.msgstr = this.parseForLine(lines, 'msgstr', true) as string
		this.msgctxt = this.parseForLine(lines, 'msgctxt', true) as string
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
		let res: string[] = []
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
		const res: string[] = [
			...this.translator,
			...this.references,
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
	 * Generates a hash value for the concatenation of msgctxt, msgid, and msgid_plural.
	 *
	 * @return {number} the hash value generated
	 */
	merge(other: Block) {
		if (this.msgid === other.msgid) {
			// Helper function to merge arrays uniquely and exclude null values
			const mergeUnique = (
				current: string[],
				other: string[]
			): string[] => {
				return [
					...new Set(
						[...current, ...other].filter((item) => item !== null)
					),
				]
			}

			// Merge references and translator comments, excluding null values
			this.translator = mergeUnique(this.translator, other.translator)
			this.references = mergeUnique(this.references, other.references)
		}
	}
}
