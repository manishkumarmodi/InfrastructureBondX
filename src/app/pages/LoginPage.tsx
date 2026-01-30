import { useState } from "react";
import { Building2, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface LoginPageProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export function LoginPage({ role, onBack, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    const success = login(email, password, role);
    if (!success) {
      setError(
        role === "admin"
          ? "Invalid admin credentials. Use admin@gmail.com / 123456."
          : "Unable to sign in with the provided credentials."
      );
      return;
    }

    setError(null);
    onLoginSuccess(role);
  };

  const handleGoogleLogin = async () => {
    if (!role) {
      return;
    }

    setError(null);
    setIsGoogleLoading(true);
    const success = await loginWithGoogle(role);
    setIsGoogleLoading(false);

    if (!success) {
      setError(
        role === "admin"
          ? "Admin Google sign-in requires the admin@gmail.com account."
          : "Unable to sign in with Google. Please try again."
      );
      return;
    }

    onLoginSuccess(role);
  };

  const getRoleTitle = () => {
    switch (role) {
      case "investor":
        return "Investor Login";
      case "issuer":
        return "Issuer Login";
      case "admin":
        return "Admin Login";
      default:
        return "Login";
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case "investor":
        return "Access your investment portfolio and explore infrastructure projects";
      case "issuer":
        return "Manage your project listings and milestone submissions";
      case "admin":
        return "Access platform administration and verification tools";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c4a6e] to-[#075985] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-6"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle>{getRoleTitle()}</CardTitle>
            <CardDescription>{getRoleDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-accent rounded-lg text-sm">
                <strong>Demo Mode:</strong> Admin login currently supports only admin@gmail.com /
                123456. Investors and issuers can use any credentials.
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold text-[#4285F4]">
                    G
                  </span>
                )}
                Continue with Google
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" className="text-primary hover:underline">
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
