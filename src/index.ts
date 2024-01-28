#!/usr/bin/env node

import { writePo } from './gettext-fn'
import { argv } from './cliArgs'
import { extractPotHeader } from './utils'
import yargs from 'yargs'
import { readFileSync } from 'fs'
import { runMergePotWithArgs } from './merge'

/**
 * A function that performs gettext merging.
 *
 * @return {void} no return value
 */
export default function gettextMerger() {
	const startTime = new Date()
	const args = argv as unknown as { in: string[]; out: string }
	console.log('🔥 Merging ' + args.in.join(', ') + ' into ' + args.out)
	runMergePotWithArgs(args.in)
		.then((res) => {
			// write the header
			// read the file
			const potFile_0 = readFileSync(args.in[0], 'utf8')
			const header = extractPotHeader(potFile_0 as string)
			return writePo(header, res, args.out as string)
		})
		.then(() => {
			console.log(
				'🚀 Done in ' +
					(new Date().getTime() - startTime.getTime()) / 1000 +
					's'
			)
			process.exit(0)
		})
		.catch((err) => {
			console.error(err)
		})
	yargs.help()
}

gettextMerger()

export { gettextMerger }
