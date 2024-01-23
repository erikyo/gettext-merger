import { runMergePotWithArgs } from '../lib/gettext-fn'

describe('runMergePotWithArgs', () => {
	it('should merge pot strings when provided with at least two input files', async () => {
		const inputFiles = ['src/fixtures/file1.pot', 'src/fixtures/file2.pot']
		const result = await runMergePotWithArgs(inputFiles)
	})

	it('should log an error and exit if less than two input files are provided', async () => {
		const inputFiles = ['file1.pot']
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {})
		const processExitSpy = jest
			.spyOn(process, 'exit')
			.mockImplementation(() => null as never)

		await runMergePotWithArgs(inputFiles)

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'You must provide at least two input files.'
		)
		expect(processExitSpy).toHaveBeenCalledWith(1)
	})
})
