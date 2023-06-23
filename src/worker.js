export { Room } from "./DurableObjects/Room.js"

export default {
	async fetch(request, env, ctx) {
		let url = new URL(request.url);
		if (url.pathname == "/ws") {
			let roomId = env.rooms.idFromName("default");
			let room = await env.rooms.get(roomId);
			return await room.fetch(request);
		}
		return new Response("Not Found", { status: 404 });
	},
};
