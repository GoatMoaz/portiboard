import { AnimatedSection } from "@/components/motion/animated-section";
import { UsesList } from "@/components/uses/uses-list";
import { Badge } from "@/components/ui/badge";
import { usesItems } from "@/lib/uses-data";

export const metadata = {
  title: "Uses",
  description: "Tools, frameworks, and workflows behind the projects.",
};

export default function UsesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-10">
      <AnimatedSection className="space-y-4">
        <Badge>Tools and Workflow</Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          My Uses Stack
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-(--muted) md:text-base">
          This stack powers my day-to-day product engineering workflow. Toggle tools as
          currently learning to keep an evolving record in local state.
        </p>
      </AnimatedSection>

      <UsesList items={usesItems} />
    </div>
  );
}
