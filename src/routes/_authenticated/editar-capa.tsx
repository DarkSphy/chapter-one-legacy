import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/editar-capa")({
  beforeLoad: () => {
    throw redirect({ to: "/inicio" });
  },
});
