"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Panel administracyjny</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
          >
            Zaloguj przez Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
