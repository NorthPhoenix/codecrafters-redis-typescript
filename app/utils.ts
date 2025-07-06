export function parseClientRequest(data: string) {
	// verify that the input is an array
	let [asterisk, input] = consumeBytes(data);
	if (asterisk !== "*") {
		throw new Error("Invalid input");
	}

	// get length of the array
	let arrLengthStr: string;
	[arrLengthStr, input] = consumeToken(input);
	const arrLength = Number(arrLengthStr);
	if (Number.isNaN(arrLength)) {
		throw new Error("Invalid array length");
	}

	// create the array
	const arr = new Array<string | null>(arrLength);

	// loop the length of the array and add the elements in
	for (let i = 0; i < arrLength; i++) {
		[arr[i], input] = parseBulkString(input);
	}
	return arr;
}

export function parseBulkString(input: string): [string | null, string] {
	let typeSignifier: string;
	[typeSignifier, input] = consumeBytes(input);
	if (typeSignifier !== "$") {
		throw new Error(
			`parseBulkString > Invalid type signifier. Expected: "$" | Received: "${typeSignifier}"`,
		);
	}
	let lengthStr: string;
	[lengthStr, input] = consumeToken(input);
	const length = Number(lengthStr);

	if (length === -1) {
		//null string – nothing to consume
		return [null, input];
	}
	let target: string, rest: string;
	[target, input] = consumeBytes(input, length);
	[rest, input] = consumeToken(input);
	if (rest !== "") {
		throw new Error(
			`parseBulkString > String length mismatch. Consumed: "${target}" | Extra: "${rest}"`,
		);
	}
	return [target, input];
}

export function consumeToken(input: string) {
	const nextBreakIdx = input.indexOf("\r\n");
	return [input.slice(0, nextBreakIdx), input.slice(nextBreakIdx + 2)];
}

export function consumeBytes(input: string, num: number = 1) {
	if (num < 0) throw new Error("consumeBytes: num cannot be negative");
	return [input.slice(0, num), input.slice(num)];
}
