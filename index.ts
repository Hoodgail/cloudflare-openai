import Cloudflare from 'cloudflare';
import Bun from 'bun';

if (!process.env.cloudflare_id) throw new Error("Cloudflare ID not set");
if (!process.env.cloudflare_key) throw new Error("Cloudflare API key not set");
if (!process.env.cloudflare_email) throw new Error("Cloudflare email not set");

const cloudflare = new Cloudflare({
     apiEmail: process.env['cloudflare_email'],
     apiKey: process.env['cloudflare_key'],
});


Bun.serve({
     port: 30421,
     fetch: async (req, ctx) => {

          console.log(
               req.headers.toJSON(),
               await req.json()
          )

          // const response = await cloudflare.workers.ai.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
          //      messages: [
          //           { role: "system", content: system },
          //           { role: "user", content: segments.join("\n\n") }
          //      ],
          //      max_tokens: 1024,
          //      account_id: process.env["cloudflare_id"]!,
          // })

          return new Response("ok")
     },
})

console.log("Listening on port http://localhost:30421")