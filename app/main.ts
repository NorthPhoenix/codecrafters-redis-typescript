import * as net from "node:net"
import echo from "./commands/echo"
import get from "./commands/get"
import ping from "./commands/ping"
import set from "./commands/set"
import { parseClientRequest } from "./utils"

const server: net.Server = net.createServer((connection: net.Socket) => {
	// Handle connection
	connection.on("data", (data) => {
		try {
			const requestArr = parseClientRequest(data.toString())
			console.log("parsed data:", requestArr)
			const command = requestArr[0]
			if (command === null) {
				connection.write("-ERR Command must not be null\r\n")
				return
			}
			switch (command.toLowerCase()) {
				case "ping":
					ping(connection)
					break
				case "echo":
					echo(connection, requestArr)
					break
				case "set":
					set(connection, requestArr)
					break
				case "get":
					get(connection, requestArr)
					break
				default: {
					connection.write("-ERR Unsupported command\r\n")
					return
				}
			}
			console.log(`Command ${command} successfully completed`)
		} catch (error) {
			console.error("Error handling command:", error)
			connection.write(
				`-ERR ${error instanceof Error ? error.message : "Unknown error"}\r\n`,
			)
		}
	})

	connection.on("error", (error) => {
		console.error("Connection error:", error)
		// Don't try to write to a potentially broken connection
		try {
			connection.write(`-ERR ${error.message}\r\n`)
		} catch (writeError) {
			console.error("Failed to write error response:", writeError)
		}
	})
})

server.listen(6379, "127.0.0.1", () => {
	console.log("Server listening on 127.0.0.1:6379")
})

server.on("error", (err: any) => {
	if (err.code === "EADDRINUSE") {
		console.log("Port 6379 is busy, retrying in 1 second...")
		setTimeout(() => {
			server.close()
			server.listen(6379, "127.0.0.1")
		}, 1000)
	} else {
		throw err
	}
})
