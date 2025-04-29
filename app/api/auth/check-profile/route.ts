import {  NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ 
        isAuthenticated: false,
        error: "Authentication required" 
      }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email ?? undefined },
    });
    
    if (!user?.no_telp || !user?.alamat || !user?.date_of_birth || !user?.full_name) {
      return NextResponse.json({
        isAuthenticated: true,
        isAuthorized: false,
        error: "Complete your profile"
      }, { status: 200 });
    }
    
    return NextResponse.json({
      isAuthenticated: true,
      isAuthorized: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking profile:', error);
    return NextResponse.json({ 
      error: "An error occurred" 
    }, { status: 500 });
  }
}