import { runMergePot } from '../src/merge'

describe('runMergePotWithArgs', () => {
	it('should merge pot strings when provided with at least two input files', async () => {
		const inputFiles = ['tests/fixtures/file1.pot', 'tests/fixtures/file2.pot']
		const result = await runMergePot(inputFiles)
	})

	it('should log an error and exit if less than two input files are provided', async () => {
		const inputFiles = ['tests/fixtures/file1.pot']
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
		const processExitSpy = jest
			.spyOn(process, 'exit')
			.mockImplementation(() => null as never)

		await runMergePot(inputFiles)

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'You must provide at least two input files.'
		)
		expect(processExitSpy).toHaveBeenCalledWith(1)
	})
})
