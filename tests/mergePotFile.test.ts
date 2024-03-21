import { jest } from '@jest/globals'
import * as fs from 'fs/promises'
import { mergePotFile } from '../src'
import MockedFunction = jest.MockedFunction

jest.mock('fs/promises')

describe('Merge Pot Strings Function', () => {
	it('should merge two pot strings correctly', async () => {
		const potString1 = `# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\n"

msgid "Hello"
msgstr "Hola"

msgid "Goodbye"
msgstr "Adiós"`
		const potString2 = `msgid "Hello"
msgstr "Bonjour"

msgid "Thank you"
msgstr "Merci"`

		;(fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValueOnce(
			potString1
		)
		;(fs.readFile as jest.MockedFunction<typeof fs.readFile>).mockResolvedValueOnce(
			potString2
		)

		const result = await mergePotFile([
			'./tests/fixtures/file1.pot',
			'./tests/fixtures/file2.pot',
		])

		expect(result[1]).toMatchObject({
			blocks: [
				{
					msgid: 'msgid "Hello"',
					msgstr: ['msgstr "Hola"'],
					comments: {
						translator: [],
						reference: [],
						extracted: [],
						flag: '',
						previous: [],
					},
				},
				{
					msgid: 'msgid "Goodbye"',
					msgstr: ['msgstr "Adiós"'],
					comments: {},
				},
				{},
				{
					msgid: 'msgid "Thank you"',
					msgstr: ['msgstr "Merci"'],
					comments: {},
				},
			],
		})
	})
})
