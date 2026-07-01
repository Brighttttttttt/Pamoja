import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name, password, role } = body as {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
  };

  if (!email || !name || !password || (role !== "coach" && role !== "athlete")) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, name, passwordHash, role },
  });

  if (role === "athlete") {
    await prisma.athleteProfile.create({ data: { userId: user.id } });
  }

  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
}
