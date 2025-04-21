'use server';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany();
    return NextResponse.json(roles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

// Create a new role
export async function POST(req: Request) {
  try {
    // verifyAuth(req); // if you want protected routes
    const body = await req.json();
    const { name, deskripsi } = body;

    if (!name || !deskripsi) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const newRole = await prisma.role.create({
      data: { 
        role_name: name,
        deskripsi
       },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
