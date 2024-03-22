import { describe, expect, it } from 'vitest'
import { extractPotHeader } from '../src'

describe('extractPotHeader', () => {
	it('should extract the header from .pot file content and return it to string without any changes', () => {
		const potContent = `# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2021-02-15 18:30+0000\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

msgid "Example1"
msgstr "Example1 Translation"

msgid "Example2"
msgstr "Example2 Translation"
`

		const expectedHeader = `# Copyright (C) 2024 FantasyTech
# This file is distributed under the same license as the Unicorn Plugin.
msgid ""
msgstr ""
"Project-Id-Version: Project Name\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2021-02-15 18:30+0000\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"`

		const result = extractPotHeader(potContent)

		expect(result[0]?.toStr()).toBe(expectedHeader)
	})

	it('should return an empty string if header is not present', () => {
		const noHeaderContent = `msgid "Example1"
msgstr "Example1 Translation"

msgid "Example2"
msgstr "Example2 Translation"

`

		expect(extractPotHeader(noHeaderContent)[0]).toBe(undefined)
	})
})
