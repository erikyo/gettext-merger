import { describe, expect, it } from 'vitest'
import { splitMultiline } from '../src/utils'

describe('splitMultiline', () => {
	it('should return the original string if it is 80 characters or less', () => {
		const input = 'msgid "Short string"'
		const result = splitMultiline(input)
		expect(result).toBe(input)
	})

	it('should return the original string if it contains a newline character', () => {
		const input = 'msgid "Short string\nwith newline"'
		const result = splitMultiline(input)
		expect(result).toBe(input)
	})

	it('should split a string longer than 80 characters into multiple lines', () => {
		const input =
			"msgid \"? This plugin is incompatible with the enabled WooCommerce features '%1//$s' and '%2//$s', it shouldn't be activated.\""
		const result = splitMultiline(input)
		expect(result).toContain('\n')
		expect(result).toBe(
			`msgid ""
"? This plugin is incompatible with the enabled WooCommerce features '%1//$s'"
"and '%2//$s', it shouldn't be activated."`
		)
		result?.split('\n').forEach((line) => {
			expect(line.length).toBeLessThanOrEqual(80)
		})
	})

	it('should handle empty strings', () => {
		const input = ''
		const result = splitMultiline(input)
		expect(result).toBe(undefined)
	})

	it('should not exceed 66 characters per line when specified', () => {
		const input =
			'msgid "?This is a specific test string that needs to be broken down into segments of no more than sixty-six characters."'
		const length = 66
		const result = splitMultiline(input, length)
		result?.split('\n').forEach((line) => {
			expect(line.length).toBeLessThanOrEqual(66)
		})
	})
})
