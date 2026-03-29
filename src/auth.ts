import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ user }) {
      const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      return allowed.includes(user.email ?? "");
    },
  },
});
