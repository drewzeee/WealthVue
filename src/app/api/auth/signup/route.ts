import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { hashPassword } from '@/lib/auth/password'
import { signupSchema } from '@/lib/auth/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.flatten()
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data
    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'An account with this email already exists',
            code: 'EMAIL_EXISTS',
          },
        },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        linkStatus: 'NONE',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
