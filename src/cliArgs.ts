import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export const argv = yargs(hideBin(process.argv))
	.option('in', {
		alias: 'i',
		describe: 'Input .pot files to merge (2 files only)',
		type: 'array',
		demandOption: true,
		coerce: (files: string[]) => {
			if (files.length <= 1) {
				throw new Error('Exactly two or more input files are required.')
			}
			return files
		},
	})
	.option('out', {
		alias: 'o',
		describe: 'Output path for the merged .pot file',
		type: 'string',
		demandOption: true,
	})
	.parse()
