import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Export locale-aware navigation functions from next-intl
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

// Re-export useSearchParams and useParams from next/navigation for compatibility
// These don't need locale-awareness as they work with query params and route params directly
export { useSearchParams, useParams } from 'next/navigation';
