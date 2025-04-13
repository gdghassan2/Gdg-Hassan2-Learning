import { generateIdFromEntropySize } from 'lucia';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import createRecord from '$lib/cloudflare/createZone';
import { createAccount } from '$lib/hestia/createStudent';
import { on } from 'events';
import { Subdomain } from 'cloudflare/resources/workers/scripts/index.mjs';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	let subdomain = null;
	const db = drizzle(event.platform?.env.DB as D1Database, { schema });
	if (event.locals.user.onBoardingStep > 0) {
		const hostingSpace = await db.query.hostingSpaceTable.findFirst({
			where: eq(schema.hostingSpaceTable.userId, event.locals.user.id)
		});
		if (!hostingSpace) {
			throw new Error('Hosting space not found');
		}
		subdomain = hostingSpace.subdomain;
	}
	
	return {
		username: event.locals.user.username,
		firstName: event.locals.user.firstName,
		lastName: event.locals.user.lastName,
		email: event.locals.user.email,
		onboardingStep: event.locals.user.onBoardingStep,
		subdomain
	};
};

export const actions = {
	createDnsRecord: async (event) => {
		const db = drizzle(event.platform?.env.DB as D1Database, { schema });
		const formData = await event.request.formData();
		const subdomain = formData.get('subdomain') || null;

		if (
			typeof subdomain !== 'string' ||
			subdomain.length < 2 ||
			subdomain.length > 30 ||
			!/^[a-zA-Z0-9-]+$/.test(subdomain)
		) {
			return fail(400, {
				message: 'Invalid subdomain'
			});
		}

		// Check if the subdomain is already taken
		const existingSpace = await db.query.hostingSpaceTable.findFirst({
			where: eq(schema.hostingSpaceTable.subdomain, subdomain)
		});

		if (existingSpace) {
			return fail(400, {
				message: 'Subdomain is already taken'
			});
		}

		try {
			const record = await createRecord(
				event.platform?.env.CLOUDFLARE_EMAIL as string,
				event.platform?.env.CLOUDFLARE_APIKEY as string,
				subdomain
			);
			if (!record) {
				return fail(500, {
					message: 'Failed to create DNS record'
				});
			}
			const spaceId = generateIdFromEntropySize(32);
			await db.insert(schema.hostingSpaceTable).values({
				id: spaceId,
				userId: event.locals.user.id,
				status: 'pending',
				subdomain,
				cloudflareRecordId: record.id,
				cpUsername: 'admin',
				domainUrl: `https://${subdomain}.learning.gdghassan2.com`,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
			await db.update(schema.userTable).set({
				onBoardingStep: 1,
				updatedAt: Date.now()
			}).where(eq(schema.userTable.id, event.locals.user.id));
			return {
				message: 'DNS record created successfully',
			};
		} catch (error) {
			return fail(500, {
				message: 'Failed to create DNS record'
			});
		}
	},
	createAccount: async (event) => {
		const db = drizzle(event.platform?.env.DB as D1Database, { schema });
		const formData = await event.request.formData();
		const username = formData.get('username') || null;
		const password = formData.get('password') || null;
		return {
			message: 'Account created successfully'
		}
	}
};
