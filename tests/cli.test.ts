// Import the required modules
import { describe, expect, it } from "vitest";
import * as mergePotFile from "../src/cli";

describe("gettextMerger", () => {
	it("merges input files and writes output file", async () => {
		global.require = {
			...require,
			main: undefined,
		} as unknown as typeof require;

		process.argv = [
			"",
			"",
			"--in",
			"tests/fixtures/file1.pot",
			"tests/fixtures/file2.pot",
			"--out",
			"output.po",
		];

		expect(await mergePotFile.gettextMerger()).toBe(undefined);
	});
});
