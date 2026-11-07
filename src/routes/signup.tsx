import { createFileRoute } from "@tanstack/react-router";
import { AuthPlaceholder } from "@/components/site/AuthPlaceholder";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — ElectroHub" },
      { name: "description", content: "Create your ElectroHub account." },
      { property: "og:title", content: "Sign up — ElectroHub" },
      { property: "og:description", content: "Create your ElectroHub account." },
    ],
  }),
  component: () => <AuthPlaceholder mode="signup" />,
});
