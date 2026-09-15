import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// No incremental cache override: this site is fully static (SSG) plus two
// dynamic API routes. There is no ISR to cache, so the R2 incremental cache
// the docs show is unnecessary here. Add it if ISR is ever introduced.
export default defineCloudflareConfig();
