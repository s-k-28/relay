import { Console } from "@/components/console/Console";

export const metadata = {
  title: "Relay console",
  description:
    "Connect your agent, browse the network, and relay a question. Answers come from a teammate's permitted context, with humans pulled in only on the exception.",
};

export default function AppPage() {
  return <Console />;
}
