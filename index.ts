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

          const body = await req.json() as {
               messages: Array<{
                    role: "system" | "user";
                    content: string;
               }>,
               model: string;
          }

          const request = await cloudflare.workers.ai.run("@hf/nousresearch/hermes-2-pro-mistral-7b", {
               messages: body.messages,
               max_tokens: 1024,
               account_id: process.env["cloudflare_id"]!,
          });

          const content = "response" in request ? request.response ?? "Sorry, I don't know what to say." : "There was an error.";

          const completion_tokens = content.split(" ").length;
          const prompt_tokens = body.messages.reduce((acc, cur) => acc + cur.content.split(" ").length, 0);
          const total_tokens = completion_tokens + prompt_tokens;

          const json = {

               choices: [
                    {
                         finish_reason: "stop",
                         index: 0,
                         message: {
                              content: content,
                              role: "assistant",
                         },
                    },
               ],
               created: Date.now(),
               id: "chatcmpl-" + Math.random().toString(36).substring(2),
               model: body.model,
               object: "chat.completion",
               usage: {
                    completion_tokens,
                    prompt_tokens,
                    total_tokens,
               },

          }


          return new Response(
               JSON.stringify(json),
               {
                    headers: {
                         "Content-Type": "application/json",
                         "Access-Control-Allow-Origin": "*",
                    },
               }
          )
     },
})

console.log("Listening on port http://localhost:30421")