import { jest } from '@jest/globals'
import { Block, SetOfBlocks } from '../src'
import fs from 'fs/promises'
import { writePo } from '../src/fs'

describe('Write Po Function', () => {
	it('should write consolidated blocks to a file', async () => {
		const blocks = new SetOfBlocks([new Block(['msgid "Hello"', 'msgstr "Hola"'])])
		const outputFile = 'output.pot'

		const writeFileSpy = jest.spyOn(fs, 'writeFile')
		;(
			fs.writeFile as jest.MockedFunction<typeof fs.writeFile>
		).mockResolvedValueOnce()

		const result = await writePo(undefined, blocks, outputFile)

		expect(result).toEqual(`msgid "Hello"
msgstr "Hola"

`)
	})
})
