import { describe, expect, it } from "vitest";
import { Block, SetOfBlocks } from "../src";
import { writePo } from "../src/fs";

describe("Write Po Function", () => {
	it("should write consolidated blocks to a file", async () => {
		const blocks = new SetOfBlocks([
			new Block(['msgid "Hello"', 'msgstr "Hola"']),
		]);
		const outputFile = "output.pot";

		const result = await writePo(undefined, blocks, outputFile);

		expect(result).toEqual(`msgid "Hello"
msgstr "Hola"

`);
	});
});
