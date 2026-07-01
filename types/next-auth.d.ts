import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "coach" | "athlete";
    } & DefaultSession["user"];
  }

  interface User {
    role: "coach" | "athlete";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "coach" | "athlete";
  }
}
