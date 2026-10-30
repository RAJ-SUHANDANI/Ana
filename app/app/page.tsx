import type { Metadata } from "next";
import { AssistantWorkspace } from "@/components/assistant-workspace";

export const metadata: Metadata = {
  title: "Your space to think",
  description: "A private-feeling, browser-based conversation space with ANA.",
};

export default function AssistantPage() {
  return <AssistantWorkspace />;
}
