'use server';

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
      const { email, password } = await req.json(); // Extract email and password
  
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }
  
      // Find the user in the database
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
  
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );
  
      // Generate a remember token
      const rememberToken = crypto.randomBytes(32).toString("hex");
  
      // Update the user's remember token in the database
      await prisma.user.update({
        where: { id: user.id },
        data: { remember_token: rememberToken },
      });
  
      return NextResponse.json(
        {
          message: "Login successful",
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            is_blacklisted: user.is_blacklisted,
            role_id: user.role_id,
            remember_token: rememberToken,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Login Error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
