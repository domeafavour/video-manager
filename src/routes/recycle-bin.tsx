import { RecycleBinPage } from "@/features/recycle-bin";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/recycle-bin")({
  component: RecycleBinPage,
});
