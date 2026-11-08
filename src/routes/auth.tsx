import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Account Login — ElectroHub" }, { name: "description", content: "Securely access your ElectroHub account." }, { property: "og:title", content: "Account Login — ElectroHub" }, { property: "og:description", content: "Securely access your ElectroHub account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AuthForm mode="login" />,
});