import { getOrCreateCsrfToken } from '@/lib/csrf';
import SignInForm from './SignInForm';

export const metadata = {
  title: 'Sign In | TSPL Forms',
  description: 'Sign in to access your employee workspace on TSPL Forms.',
};

export default async function SignInPage() {
  const csrfToken = await getOrCreateCsrfToken();
  return <SignInForm csrfToken={csrfToken} />;
}
