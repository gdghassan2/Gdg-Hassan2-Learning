import { Elysia } from "elysia";
import type { Context } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { initiateLucia } from "$lib/server/auth";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../../../db/schema";

interface CF extends Context {
    platform: App.Platform;
    locals: App.Locals;
}

const app = new Elysia({ aot: false, prefix: "/api" }).use(swagger());

app.post("/logout", async (c:CF) => {
    if (!c.locals.session) {
        return new Response(null, {
            status: 401,
        });
    }
    const lucia = initiateLucia(c.platform.env.DB as D1Database);
    await lucia.invalidateSession(c.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    c.cookie.sessionCookie.set(sessionCookie)
    return new Response(null, {
        status: 200,
    });
})
app.post("/recordAvailablity", async (c:CF) => {
    const db = drizzle(c.platform?.env.DB as D1Database, {schema});
    const data = await c.body as {subdomain: string};
    const subdomain = data.subdomain;
    console.log(data);
    const existingSpace = await db.query.hostingSpaceTable.findFirst({
        where: eq(schema.hostingSpaceTable.subdomain, subdomain)
    });
    if (existingSpace) {
        return new Response(JSON.stringify({available: false}), {
            status: 200,
            headers: {
                "content-type": "application/json"
            }
        });
    }
    return new Response(JSON.stringify({available: true}), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    });
})

app.post("/usernameAvailablity", async (c:CF) => {
    const db = drizzle(c.platform?.env.DB as D1Database, {schema});
    const data = await c.body as {username: string};
    const username = data.username;
    console.log(data);
    const existingUser = await db.query.userTable.findFirst({
        where: eq(schema.userTable.username, username)
    });
    if (existingUser) {
        return new Response(JSON.stringify({available: false}), {
            status: 200,
            headers: {
                "content-type": "application/json"
            }
        });
    }
    return new Response(JSON.stringify({available: true}), {
        status: 200,
        headers: {
            "content-type": "application/json"
        }
    });
}
)

type RequestHandler = (v: { request: Request, platform: App.Platform, locals:App.Locals }) => Response | Promise<Response>

export const GET: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const POST: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const PUT: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const DELETE: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const PATCH: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const OPTIONS: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const HEAD: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)

