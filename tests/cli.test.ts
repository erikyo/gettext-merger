import gettextMerger from '../src/cli'

describe('gettextMerger', () => {
	test('merges input files and writes output file', async () => {
		// Mock the mergePotFile function
		const mergePotFileMock = jest.fn().mockResolvedValue([['header'], 'body'])
		// Mock the writePo function
		const writePoMock = jest.fn().mockResolvedValue('Success')

		const originalProcessExit = process.exit
		// @ts-ignore
		process.exit = jest.fn()

		const originalConsoleError = console.error
		console.error = jest.fn()

		// Set up argv for testing
		const originalArgv = process.argv
		process.argv = [
			'',
			'',
			'--in',
			'../tests/fixtures/file1.pot',
			'../tests/fixtures/file2.pot',
			'--out',
			'output.po',
		]

		gettextMerger()

		expect(mergePotFileMock).toHaveBeenCalledWith(['file1.pot', 'file2.pot'])
		expect(writePoMock).toHaveBeenCalledWith('header', 'body', 'output.po')
		expect(console.error).not.toHaveBeenCalled()
		expect(process.exit).toHaveBeenCalledWith(0)

		process.exit = originalProcessExit
		console.error = originalConsoleError
		process.argv = originalArgv
	})
})
