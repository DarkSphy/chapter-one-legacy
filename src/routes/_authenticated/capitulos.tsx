import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/capitulos")({
  beforeLoad: () => {
    throw redirect({ to: "/livro" });
  },
});
