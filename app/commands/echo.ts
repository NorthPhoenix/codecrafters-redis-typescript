import type { Socket } from "node:net";

export default (connection: Socket, request: (string | null)[]) => {
	const str = request[1];
	if (str === null) {
		connection.write("$-1\r\n");
		return;
	}
	connection.write(`$${str.length}\r\n${str}\r\n`);
};
