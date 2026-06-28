import { SignIn } from "@/components/auth/SignIn";

export const metadata = {
  title: "Sign in · Relay",
  description:
    "Sign in to Relay to reach your network. Your agent answers for you, and teammates only pull you in on the exception.",
};

export default function LoginPage() {
  return <SignIn mode="login" />;
}
