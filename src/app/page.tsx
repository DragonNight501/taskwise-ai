import SiteHeader from "@/components/site-header";
import TaskwiseApp from "@/components/taskwise-app";
import { site } from "@/lib/site";

const steps = [
  { title: "Describe the goal", text: "In any language. Add “in 8 steps” to control the length." },
  { title: "Gemini drafts the plan", text: "Ordered, concrete tasks returned as structured JSON." },
  { title: "Execute on the board", text: "Drag between columns or use the arrows. Saved in your browser." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[640px]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-56 left-1/4 h-[520px] w-[720px] animate-[drift_18s_ease-in-out_infinite] rounded-full bg-accent/15 blur-[130px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[560px] animate-[drift_22s_ease-in-out_infinite_reverse] rounded-full bg-cyan/15 blur-[130px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-24 sm:px-6 md:pt-20">
          <TaskwiseApp
            intro={
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                  AI planning engine
                </p>

                <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
                  Turn any goal into{" "}
                  <span className="text-gradient">a plan you can execute.</span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-muted md:text-lg md:leading-8">
                  {site.description}
                </p>

                <ol className="mt-10 max-w-lg divide-y divide-line border-y border-line">
                  {steps.map((step, index) => (
                    <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-4">
                      <span className="font-mono text-[11px] text-accent">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium tracking-tight">{step.title}</p>
                        <p className="mt-0.5 text-sm text-muted">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            }
          />
        </div>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 font-mono text-[11px] text-faint sm:px-6 md:flex-row md:justify-between">
          <p>
            Built by{" "}
            <a href={site.portfolio} target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:text-accent hover:underline">
              {site.author}
            </a>
          </p>
          <p>Next.js · TypeScript · Tailwind CSS · Gemini</p>
        </div>
      </footer>
    </>
  );
}
