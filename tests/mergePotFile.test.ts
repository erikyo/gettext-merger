// Import jest for mocking
// Import the mergePotFile function
import { describe, expect, it } from 'vitest'
import { mergePotFile } from '../src'

describe('Merge Pot Strings Function', () => {
	it('should merge two pot strings correctly', async () => {
		// Call the mergePotFile function
		const result = await mergePotFile([
			'./tests/fixtures/file1.pot',
			'./tests/fixtures/file2.pot',
		])

		// Assert the result
		expect(result[1]).toMatchSnapshot()
	})
})
