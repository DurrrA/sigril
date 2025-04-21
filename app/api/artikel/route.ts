'use server';

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { loginIsRequiredServer } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";