
import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import EpisodeForm from "@/Components/Auth/CreateNewEpisode/EpisodeForm";

export default function CreateNewEpisode() {
  return (
    <PageShell active="authors">
      <EpisodeForm />
    </PageShell>
  );
}
