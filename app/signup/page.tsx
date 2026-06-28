import { SignIn } from "@/components/auth/SignIn";

export const metadata = {
  title: "Create your account · Relay",
  description:
    "Create a Relay account, then connect your Aicoo agent so teammates can reach you and get an answer in seconds.",
};

export default function SignupPage() {
  return <SignIn mode="signup" />;
}
