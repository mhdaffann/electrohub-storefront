import { createFileRoute } from "@tanstack/react-router";
import { AuthPlaceholder } from "@/components/site/AuthPlaceholder";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ElectroHub" },
      { name: "description", content: "Sign in to your ElectroHub account." },
      { property: "og:title", content: "Login — ElectroHub" },
      { property: "og:description", content: "Sign in to your ElectroHub account." },
    ],
  }),
  component: () => <AuthPlaceholder mode="login" />,
});
