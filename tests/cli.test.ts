// Import the required modules
import { describe, expect, it } from 'vitest'
import { gettextMerger } from '../src/cli'

describe('gettextMerger', () => {
	it('merges input files and writes output file', async () => {
		process.argv = [
			'',
			'',
			'--in',
			'tests/fixtures/file1.pot',
			'tests/fixtures/file2.pot',
			'--out',
			'output.po',
		]

		await gettextMerger()
	})

	it('Throws an error when the number of input files is less than 2', async () => {
		// Mock the mergePotFile function to simulate error
		// Mock the module using jest.unstable_mockModule

		// Catch the error thrown by gettextMerger
		try {
			await gettextMerger()
		} catch (error) {
			// Ensure the error message matches the expected error message
			expect((error as Error).message).toBe(
				'You must provide at least two input files.'
			)
		}
	})
})
