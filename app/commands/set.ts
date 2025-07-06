import type { Socket } from "node:net"
import storage from "../storage"

export default (connection: Socket, request: (string | null)[]) => {
	const key = request[1]
	const value = request[2]
	if (key == null) {
		throw new Error("Key cannot be null or undefined")
	}

	storage[key] = value
	connection.write("+OK\r\n")
}
