#!/usr/bin/env node

import { writePo } from './fs'
import { argv } from './cliArgs'
import { mergePotFile } from './'

/**
 * A function that performs gettext merging.
 *
 * @return {void} no return value
 */
export default function gettextMerger(): void {
	const startTime = new Date()
	const args = argv as unknown as { in: string[]; out: string }
	// Ensure we have exactly two input files
	if (args.in.length <= 1) {
		console.error('You must provide at least two input files.')
		process.exit(1)
	}
	console.log('🔥 Merging ' + args.in.join(', ') + ' into ' + args.out)
	mergePotFile(args.in)
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
}

gettextMerger()

export { gettextMerger }
