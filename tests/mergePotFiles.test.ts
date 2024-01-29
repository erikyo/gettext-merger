import { mergeBlocks, mergePotFileContent, mergePotObject } from '../src/merge'
import { Block } from '../src/block'
import { SetOfBlocks } from '../src/setOfBlocks'

describe('mergePotFiles', () => {
	it('should merge blocks of strings with the same msgid', async () => {
		const str1 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
msgstr ""

#: src/FeaturesController.php:1083
msgid ""
"? This plugin is incompatible with the enabled WooCommerce features "
"'%1//$s' and '%2//$s', it shouldn't be activated."
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

		const expected = `#: src/FeaturesController.php:1083
msgid ""
"? This plugin is incompatible with the enabled WooCommerce features "
"'%1//$s' and '%2//$s', it shouldn't be activated."
msgstr ""

#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:86
#: admin/Unicorn_Admin_Core.php:83
msgid "Unicorn Magic"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
msgstr ""

`
		const result = mergePotFileContent([str1, str2])

		expect(result).toBe(expected)
	})

	it('should merge blocks of strings', async () => {
		const str1 = `msgid "Unicorn Plugin"
msgstr ""

msgid "Unicorn Magic"
msgstr ""`

		const str2 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

msgid "Unicorn Magic"
msgstr ""`

		const expected = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

msgid "Unicorn Magic"
msgstr ""

`
		const result = mergePotFileContent([str1, str2])

		expect(result).toBe(expected)
	})

	it('should merge blocks of strings msgid_plural and multiple msgstr', async () => {
		const str1 = `msgid "Unicorn Plugin"
msgstr ""

#. Importer view for successful product update
#: includes/admin/importers/views/html-csv-import-done.php:28
msgid "%s product updated"
msgid_plural "%s products updated"
msgstr[0] "Useless: Un prodotto è stato aggiornato"
msgstr[1] "Useless: %s prodotti sono stati aggiornati"

msgid "Unicorn Magic"
msgstr ""`

		const str2 = `#. Importer view for successful product update
#: includes/admin/importers/views/html-csv-import-done.php:28
msgid "%s product updated"
msgid_plural "%s products updated"
msgstr[0] "Useless: Un prodotto è stato aggiornato"
msgstr[1] "Useless: %s prodotti sono stati aggiornati"`

		const expected = `msgid "Unicorn Plugin"
msgstr ""

msgid "Unicorn Magic"
msgstr ""

#. Importer view for successful product update
#: includes/admin/importers/views/html-csv-import-done.php:28
msgid "%s product updated"
msgid_plural "%s products updated"
msgstr[0] "Useless: Un prodotto è stato aggiornato"
msgstr[1] "Useless: %s prodotti sono stati aggiornati"

`
		const result = mergePotFileContent([str1, str2])

		expect(result).toBe(expected)
	})
})

describe('mergePotFiles', () => {
	it('should merge blocks with the same msgid with mergePotObject', async () => {
		const block1 = new Block([])
		block1.msgid = 'asd'
		block1.comments = {
			extracted: ['#. Translator comment'],
			reference: ['#: app.js'],
		}
		const blockGroup1 = new SetOfBlocks([block1])

		const block2 = new Block({
			msgid: 'asd',
			comments: {
				extracted: ['#. Translator comment'],
				reference: ['#: app.js'],
			},
		} as Block)
		const blockGroup2 = new SetOfBlocks([block2])

		const blocke = new Block([])
		blocke.msgid = 'asd'
		blocke.comments = {
			extracted: ['#. Translator comment'],
			reference: ['#: app.js'],
		}
		const result = mergePotObject([blockGroup1, blockGroup2]).blocks
		expect(result[0].toStr()).toEqual(blocke.toStr())
	})
})
