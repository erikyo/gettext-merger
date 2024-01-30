import { mergePotObject } from '../src/'
import { Block } from '../src/block'
import { SetOfBlocks } from '../src/setOfBlocks'

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
