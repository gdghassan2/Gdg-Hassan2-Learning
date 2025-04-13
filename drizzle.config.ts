import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  
  out: './migrations',

  dbCredentials: {
		url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/.sqlite",
	},
  
	verbose: true,
	strict: true,
  dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
});
