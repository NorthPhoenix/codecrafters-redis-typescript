import type { Socket } from "node:net"
import storage from "../storage"

type SetConfigType = {
	expiry: null | number
}

export default (connection: Socket, request: (string | null)[]) => {
	const key = request[1]
	const value = request[2]
	const args = request.slice(3)
	if (key == null) {
		throw new Error("SET: Key cannot be null or undefined")
	}
	const config: SetConfigType = { expiry: null }
	let arg = args.shift()
	while (arg !== null && arg !== undefined) {
		switch (arg?.toLowerCase()) {
			case "px": {
				const expireTimeStr = args.shift()
				if (expireTimeStr === null || expireTimeStr === undefined) {
					throw new Error("SET: Expiry time is missing")
				}
				const expireTime = Number(expireTimeStr)
				if (Number.isNaN(expireTime)) {
					throw new Error(
						`SET: Expiry time is invalid | Received ${expireTimeStr}`,
					)
				}
				config.expiry = Date.now() + expireTime
			}
		}
		arg = args.shift()
	}
	storage[key] = { value: value, expiry: config.expiry }
	connection.write("+OK\r\n")
}
