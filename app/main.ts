import * as net from "net";

function parseClientRequest(data: string) {
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

function parseBulkString(input: string): [string | null, string] {
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

function consumeToken(input: string) {
	const nextBreakIdx = input.indexOf("\r\n");
	return [input.slice(0, nextBreakIdx), input.slice(nextBreakIdx + 2)];
}

function consumeBytes(input: string, num: number = 1) {
	if (num < 0) throw new Error("consumeBytes: num cannot be negative");
	return [input.slice(0, num), input.slice(num)];
}

const server: net.Server = net.createServer((connection: net.Socket) => {
	// Handle connection
	connection.on("data", (data) => {
		console.log("got data:", data.toString());
		const requestArr = parseClientRequest(data.toString());
		console.log("parsed data:", requestArr);
		const command = requestArr[0];
		if (command === null) {
			throw new Error("Command must not be null");
		}
		switch (command.toLowerCase()) {
			case "ping":
				connection.write("+PONG\r\n");
				break;
			case "echo": {
				const str = requestArr[1];
				if (str === null) {
					connection.write("$-1\r\n");
					break;
				}
				connection.write(`$${str.length}\r\n${str}\r\n`);
				break;
			}
			default: {
				throw new Error("Unsupported command");
			}
		}
	});
});

server.listen(6379, "127.0.0.1");
