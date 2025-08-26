import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, targetRole, targetSalary } =
      await request.json();

    if (!email || !password || !name || !targetRole || !targetSalary) {
      return NextResponse.json(
        { error: "Email, password, name, and start date are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        targetRole: targetRole || "Backend Developer",
        targetSalary: targetSalary || "$30-40K USD",
      },
    });

    await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,

        targetRole: user.targetRole,
        targetSalary: user.targetSalary,
      },
    });
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}