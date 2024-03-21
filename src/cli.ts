#!/usr/bin/env node

import { writePo } from './fs.js'
import { getCliArgs } from './cliArgs.js'
import { mergePotFile } from './index.js'

/**
 * A function that performs gettext merging.
 *
 * @return {void} no return value
 */
export async function gettextMerger(): Promise<void> {
	const startTime = new Date()
	const args = getCliArgs() as { in: string[]; out: string }
	// Ensure we have exactly two input files
	if (args.in.length <= 1) {
		throw new Error('You must provide at least two input files.')
	}
	console.log('🔥 Merging ' + args.in.join(', ') + ' into ' + args.out)
	const [header, body] = await mergePotFile(args.in)
	await writePo(header[0], body, args.out as string)
	console.log('🚀 Done in ' + (new Date().getTime() - startTime.getTime()) / 1000 + 's')
}

// Call the function when the file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
	gettextMerger()
		.then(() => process.exit(0))
		.catch((e) => new Error(e) && process.exit(1))
}
