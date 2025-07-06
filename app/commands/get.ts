import type { Socket } from "node:net"
import storage from "../storage"

export default (connection: Socket, request: (string | null)[]) => {
	const key = request[1]
	if (key == null) {
		throw new Error("Key cannot be null or undefined")
	}

	const value = storage[key]
	if (value === null || value === undefined) {
		connection.write("$-1\r\n")
		return
	}
	if (typeof value !== "string") {
		throw new Error("Cannot GET a non-string value")
	}
	connection.write(`$${value.length}\r\n${value}\r\n`)
}
