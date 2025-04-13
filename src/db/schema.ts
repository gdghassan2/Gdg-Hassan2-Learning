import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	onBoardingStep: integer("on_boarding_step").notNull().default(0), // 0 dns, 1 account, 2 website, 3 ssl, 4 forceSSL, 5 done
	username: text("username").notNull().unique(),
	googleId: text("google_id").unique(),
	email: text("email").notNull().unique(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const sessionTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),  
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer("expires_at").notNull()
});

export const hostingSpaceTable = sqliteTable("hosting_space", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	status: text("status").notNull().default("pending"), // pending, active, failed
	subdomain: text("subdomain").notNull().unique(),
	cloudflareRecordId: text("cloudflare_record_id"), // ID of the DNS record created in Cloudflare
	cpUsername: text("cp_username").notNull(), // Hestia CP username
	domainUrl: text("domain_url").notNull(), // Full URL to the provisioned space
	provisionedAt: integer("provisioned_at"), // When the space was successfully provisioned
	lastCheckedAt: integer("last_checked_at"), // When the status was last verified
	errorMessage: text("error_message"), // For storing error details if provisioning fails
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});