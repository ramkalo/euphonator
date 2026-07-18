import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";
import { ScaleExplorerTool } from "../tools/ScaleExplorerTool";
import { ProgressionGeneratorTool } from "../tools/ProgressionGeneratorTool";
import { useScaleSelection } from "../tools/useScaleSelection";

// Smoke tests: each component mounts and runs its real initial-render logic
// (chordsInNotes, overlapByCommon, generateProgression) without throwing.

// Both tools take the shared scale selection as a prop, so wrap them in a
// component that supplies it via the real hook.
function ScaleExplorerHarness() {
  const scale = useScaleSelection();
  return <ScaleExplorerTool scale={scale} />;
}
function ProgressionHarness() {
  const scale = useScaleSelection();
  return <ProgressionGeneratorTool scale={scale} />;
}

describe("component render smoke tests", () => {
  it("App renders the shell with the two remaining tools", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Euphonator");
    expect(html).toContain("Scale Explorer");
    expect(html).toContain("Progression Generator");
  });

  it("Scale Explorer renders real chords for C Major", () => {
    const html = renderToStaticMarkup(<ScaleExplorerHarness />);
    expect(html).toContain("C Maj");
    expect(html).toContain("G Maj");
    expect(html).toContain("Chords in Scale");
    expect(html).toContain("Overlapping Scales Table");
  });

  it("Progression Generator renders controls", () => {
    const html = renderToStaticMarkup(<ProgressionHarness />);
    expect(html).toContain("Generate progression");
    expect(html).toContain("Textbook Cadential");
  });
});
