import { describe, expect, it } from "vitest";
import { Block, SetOfBlocks } from "../src";

describe("mergeToJson", () => {
	it("toJson method converts blocks to a JSON representation", () => {
		const instance = new SetOfBlocks();
		instance.blocks = [
			new Block(['msgid "msgid1"', 'msgctxt "msgctxt1"']),
			new Block(['msgid "msgid2"', 'msgctxt "msgctxt2"']),
			new Block(['msgid "msgid3"', 'msgctxt "msgctxt1"']),
			new Block(['msgid "msgid4"', 'msgctxt "msgctxt2"']),
		];

		// Define the expected output
		const expectedOutput = {
			msgctxt1: {
				msgid1: instance.blocks[0].toJson(),
				msgid3: instance.blocks[2].toJson(),
			},
			msgctxt2: {
				msgid2: instance.blocks[1].toJson(),
				msgid4: instance.blocks[3].toJson(),
			},
		};

		// Call the method and check if the output matches the expected value
		expect(instance.toJson()).toEqual(expectedOutput);
	});
});
