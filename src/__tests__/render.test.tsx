import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";
import { ChordsInScaleTool } from "../tools/ChordsInScaleTool";
import { ProgressionGeneratorTool } from "../tools/ProgressionGeneratorTool";

// Smoke tests: each component mounts and runs its real initial-render logic
// (chordsInNotes, overlapByCommon, generateProgression) without throwing.

describe("component render smoke tests", () => {
  it("App renders the shell with the two remaining tools", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Euphonator");
    expect(html).toContain("Chords in Scale");
    expect(html).toContain("Progression Generator");
  });

  it("Chords in Scale renders real chords for C Major", () => {
    const html = renderToStaticMarkup(<ChordsInScaleTool />);
    expect(html).toContain("C Maj");
    expect(html).toContain("G Maj");
    expect(html).toContain("Chords in selection");
    expect(html).toContain("Overlapping scales");
  });

  it("Progression Generator renders controls", () => {
    const html = renderToStaticMarkup(<ProgressionGeneratorTool />);
    expect(html).toContain("Generate progression");
    expect(html).toContain("Textbook Cadential");
  });
});
