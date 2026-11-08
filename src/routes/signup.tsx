import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — ElectroHub" },
      { name: "description", content: "Create your ElectroHub account." },
      { property: "og:title", content: "Sign up — ElectroHub" },
      { property: "og:description", content: "Create your ElectroHub account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
