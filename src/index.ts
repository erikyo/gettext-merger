#!/usr/bin/env node

import { runMergePotWithArgs, writePo } from './gettext-fn'
import { argv } from './cliArgs'
import { extractPotHeader } from './utils'
import yargs from 'yargs'

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
			const header = extractPotHeader(args.in[0] as string)
			return writePo(header, res, args.out as string)
		})
		.then((res) => {
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
