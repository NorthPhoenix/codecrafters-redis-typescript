import type { Socket } from "node:net"
import storage from "../storage"

export default (connection: Socket, request: (string | null)[]) => {
	const key = request[1]
	if (key == null) {
		throw new Error("GET: Key cannot be null or undefined")
	}

	const target = storage[key]
	if (target === null || target === undefined) {
		connection.write("$-1\r\n")
		return
	}
	if (target.expiry && target.expiry < Date.now()) {
		connection.write("$-1\r\n")
		return
	}

	const value = target.value
	if (value === null || value === undefined) {
		connection.write("$-1\r\n")
		return
	}
	if (typeof value !== "string") {
		throw new Error("GET: Cannot GET a non-string value")
	}
	connection.write(`$${value.length}\r\n${value}\r\n`)
}
