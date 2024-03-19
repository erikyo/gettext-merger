import { Block, mergePotObject, SetOfBlocks } from '../src/'
import { GetTextTranslation } from 'gettext-parser'

describe('mergePotFiles', () => {
	it('should merge blocks with the same msgid with mergePotObject', async () => {
		const block1: Block = new Block([])
		block1.msgid = 'asd'
		block1.comments = {
			extracted: ['#. Translator comment'],
			reference: ['#: app.js'],
		}
		const blockGroup1 = new SetOfBlocks([block1])

		const block2: Block = new Block({
			msgid: 'asd',
			comments: {
				extracted: ['#. Translator comment'],
				reference: ['#: app.js'],
			},
		} as Block)
		const blockGroup2 = new SetOfBlocks([block2])

		const blocke: Block = new Block([])
		blocke.msgid = 'asd'
		blocke.comments = {
			extracted: ['#. Translator comment'],
			reference: ['#: app.js'],
		}
		const result = mergePotObject([blockGroup1, blockGroup2]).blocks
		expect(result[0].toStr()).toEqual(blocke.toStr())
	})
})
