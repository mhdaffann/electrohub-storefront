import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";
export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — ElectroHub" }, { name: "description", content: "Request a secure ElectroHub password reset link." }, { property: "og:title", content: "Forgot Password — ElectroHub" }, { property: "og:description", content: "Request a secure ElectroHub password reset link." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AuthForm mode="forgot" />,
});