import { RootCause } from "@/components/root-cause";

export type IncidentRootCauseSectionProps = {
  text: string;
  /** Optional phrases to draw attention to in the explanation */
  highlightPhrases?: string[];
};

export function IncidentRootCauseSection({ text, highlightPhrases }: IncidentRootCauseSectionProps) {
  return (
    <section aria-label="Root cause">
      <RootCause
        text={text}
        highlightPhrases={highlightPhrases}
        headingId="incident-rc-heading"
        title="Root cause"
        emptyLabel="No root cause has been recorded for this incident yet."
      />
    </section>
  );
}
