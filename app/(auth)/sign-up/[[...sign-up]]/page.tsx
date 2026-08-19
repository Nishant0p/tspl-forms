import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div>
      <SignUp fallbackRedirectUrl={'/dashboard'} />
    </div>
  );
}
