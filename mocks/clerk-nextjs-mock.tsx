'use client';
import React from 'react';
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function SignInButton({ children }: any) {
  if (children) return <>{children}</>;
  return <button className="flex items-center gap-2 font-bold text-foreground">Sign In</button>;
}
export function UserButton({ afterSignOutUrl }: any) {
  return null; // replaced by server-aware component in Navbar
}
export function SignIn() { return null; }
export function SignUp() { return null; }
export function useUser() {
  return { isSignedIn: true, user: { id: 'mock', firstName: 'User' }, isLoaded: true };
}
export function authMiddleware(options?: any) {
  return (req: any) => {
    const { NextResponse } = require('next/server');
    return NextResponse.next();
  };
}
