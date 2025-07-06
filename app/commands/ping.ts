import type { Socket } from "node:net";

export default (connection: Socket) => {
	connection.write("+PONG\r\n");
};
