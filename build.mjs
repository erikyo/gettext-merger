#!/usr/bin/env node
import * as esbuild from 'esbuild'
import * as fs from 'fs';
import * as path from 'path';

// Get a list of all .ts files in the src directory
const srcDir = 'src';
const tsFiles = fs.readdirSync(srcDir)
	.filter(file => path.extname(file) === '.ts');

// Exclude cli.ts
const entryPoints = tsFiles.filter(file => !file.startsWith('cli'))
	.map(file => path.join(srcDir, file));

/**
 * This function builds the package.
 *
 * @return {Promise<void>}
 */
async function build() {
	const cli = esbuild.build({
		format: 'iife',
		platform: 'node',
		entryPoints: ['src/cli.ts'],
		bundle: true,
		outdir: 'lib/cli',
		minify: true,
		tsconfig: 'tsconfig.json',
		globalName: 'gettextMerger',
	})

	const cjs = esbuild.build({
		tsconfig: 'tsconfig.cjs.json',
		format: 'cjs',
		platform: 'node',
		outdir: 'lib/cjs',
		legalComments: 'none',
		target: 'es2015',
		outExtension: { '.js': '.cjs' },
		entryPoints: entryPoints,
		minify: true,
	})

	const esm = esbuild.build({
		tsconfig: 'tsconfig.esm.json',
		format: 'esm',
		platform: 'node',
		entryPoints: entryPoints,
		outdir: 'lib/esm',
		legalComments: 'none',
		treeShaking: true,
		splitting: true,
		minify: true,
		keepNames: true,
		mainFields: ['module', 'main'],
	})

	await Promise.all([cli, cjs, esm])
}

build().catch((err) => {
	console.error(err)
	process.exit(1)
})
