import { mergePotFiles } from '../src/merge'

describe('mergePotFiles', () => {
	it('merges multiple POT files with header', async () => {
		const str1 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#. Description of the plugin
msgid "A magical plugin that brings unicorns to your website. Transform your content with enchanting features!"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
msgid "Unicorn Magic"
msgstr ""`

		const str2 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#. Description of the plugin
msgid "A magical plugin that brings unicorns to your website. Transform your content with enchanting features!"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
msgid "Unicorn Magic"
msgstr ""`

		const expected = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""


#. Description of the plugin
msgid "A magical plugin that brings unicorns to your website. Transform your content with enchanting features!"
msgstr ""

#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
msgid "Unicorn Magic"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
msgstr ""

`
		const result = mergePotFiles([str1, str2], true)

		expect(result).toBe(expected)
	})

	it('merges multiple POT files with header', async () => {
		const str1 = `#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#. Description of the plugin
msgid "A magical plugin that brings unicorns to your website. Transform your content with enchanting features!"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
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


#. Description of the plugin
msgid "A magical plugin that brings unicorns to your website. Transform your content with enchanting features!"
msgstr ""

#. Plugin Name of the plugin
msgid "Unicorn Plugin"
msgstr ""

#: admin/Unicorn_Admin_Core.php:82
#: admin/Unicorn_Admin_Core.php:83
#: admin/page.php:23
msgid "Unicorn Magic"
msgstr ""

#. Author of the plugin
msgid "FantasyTech"
msgstr ""

`
		const result = mergePotFiles([str1, str2], true)

		expect(result).toBe(expected)
	})
})
