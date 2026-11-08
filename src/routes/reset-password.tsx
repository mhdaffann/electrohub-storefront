import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";
export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — ElectroHub" }, { name: "description", content: "Set a new password for your ElectroHub account." }, { property: "og:title", content: "Reset Password — ElectroHub" }, { property: "og:description", content: "Set a new password for your ElectroHub account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AuthForm mode="reset" />,
});