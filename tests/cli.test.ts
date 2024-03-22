// Import the required modules
import { describe, expect, it, vi } from 'vitest'
import * as mergePotFile from '../src/cli'

describe('gettextMerger', () => {
	it('merges input files and writes output file', async () => {
		require = {
			main: null,
		} as any

		process.argv = [
			'',
			'',
			'--in',
			'tests/fixtures/file1.pot',
			'tests/fixtures/file2.pot',
			'--out',
			'output.po',
		]

		expect(await mergePotFile.gettextMerger()).toBe(undefined)
	})
})
