import { mergeBlocks, mergePotFiles, mergePotObject } from '../src/merge'
import { Block } from '../src/block'
import { SetOfBlocks } from '../src/setOfBlocks'

describe('mergePotFiles', () => {
	it('merges multiple POT files with header', async () => {
		const str1 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:86
msgid "Unicorn Magic"
msgstr ""`

		const str2 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
msgid "Unicorn Magic"
msgstr ""`

		const expected = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
#: admin/Unicorn_Admin_Core.php:86
msgid "Unicorn Magic"
msgstr ""

`
		const result = mergePotFiles([str1, str2], true)

		expect(result).toBe(expected)
	})

	it('merges multiple POT strings', async () => {
		const str1 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
msgid "Unicorn Magic"
msgstr ""`

		const str2 = `#: admin/page.php:23
msgid "Unicorn Magic"
msgstr ""`

		const expected = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
#: admin/page.php:23
msgid "Unicorn Magic"
msgstr ""

`
		const result = mergePotFiles([str1, str2], true)

		expect(result).toBe(expected)
	})
})

describe('mergePotFiles', () => {
	it('merges multiple POT files with header', async () => {
		const block1 = new Block([])
		block1.msgid = 'asd'
		block1.comments = {
			translator: '#. Translator comment',
			reference: ['#: app.js'],
		}
		const blockGroup1 = new SetOfBlocks([block1])

		const block2 = new Block([])
		block2.msgid = 'asd'
		block2.comments = {
			translator: '#. Translator comment',
			reference: ['#: app.js'],
		}
		const blockGroup2 = new SetOfBlocks([block2])

		const blocke = new Block([])
		blocke.msgid = 'asd'
		blocke.comments = {
			translator: '#. Translator comment',
			reference: ['#: app.js'],
		}
		const result = mergePotObject([blockGroup1, blockGroup2]).blocks
		expect(result[0]).toMatchObject(blocke)
	})
})
