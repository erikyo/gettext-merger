#!/usr/bin/env node

import { writePo } from './gettext-fn'
import { argv } from './cliArgs'
import yargs from 'yargs'
import { runMergePot } from './merge'

/**
 * A function that performs gettext merging.
 *
 * @return {void} no return value
 */
export default function gettextMerger() {
	const startTime = new Date()
	const args = argv as unknown as { in: string[]; out: string }
	console.log('🔥 Merging ' + args.in.join(', ') + ' into ' + args.out)
	runMergePot(args.in)
		.then(([header, body]) => {
			return writePo(header[0], body, args.out as string)
		})
		.then(() => {
			console.log(
				'🚀 Done in ' + (new Date().getTime() - startTime.getTime()) / 1000 + 's'
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
