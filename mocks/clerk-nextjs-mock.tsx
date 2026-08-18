import React from 'react';

// ClerkProvider mock component
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Mock User object
const mockUser = {
  id: 'mock_user_1',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
  emailAddresses: [{ emailAddress: 'john.doe@tspl.group' }],
  primaryEmailAddress: { emailAddress: 'john.doe@tspl.group' },
};

// Server-side currentUser mock function
export async function currentUser() {
  return mockUser;
}

// Client-side useUser mock hook
export function useUser() {
  return {
    isSignedIn: true,
    user: mockUser,
    isLoaded: true,
  };
}

// SignInButton component
export function SignInButton({ afterSignInUrl, mode, children }: any) {
  if (children) {
    return <>{children}</>;
  }
  return (
    <button className="flex items-center gap-2 font-bold text-foreground">
      Sign In
    </button>
  );
}

// UserButton component
export function UserButton({ afterSignOutUrl }: any) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted overflow-hidden border border-border">
      <img
        src={mockUser.imageUrl}
        alt={mockUser.fullName}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// SignIn component
export function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-card text-card-foreground">
      <h2 className="text-xl font-bold mb-2">Sign In</h2>
      <p className="text-sm text-muted-foreground">Authentication is bypassed for testing.</p>
    </div>
  );
}

// SignUp component
export function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-card text-card-foreground">
      <h2 className="text-xl font-bold mb-2">Sign Up</h2>
      <p className="text-sm text-muted-foreground">Authentication is bypassed for testing.</p>
    </div>
  );
}

// authMiddleware mock helper
export function authMiddleware(options?: any) {
  return (req: any) => {
    const { NextResponse } = require('next/server');
    return NextResponse.next();
  };
}
