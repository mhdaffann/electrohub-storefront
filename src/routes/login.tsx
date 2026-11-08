import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ElectroHub" },
      { name: "description", content: "Sign in to your ElectroHub account." },
      { property: "og:title", content: "Login — ElectroHub" },
      { property: "og:description", content: "Sign in to your ElectroHub account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
