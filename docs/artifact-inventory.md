# Primitive inventory and naming

Sonaloop has several first-class primitives that are easy to confuse if they are
all called "artifacts". The product UI separates them deliberately:

Use three layers:

1. **Primitives** are the stable Library-level entities. They have a purpose, a
   route, a detail page and a presence declaration.
2. **Subtypes / formats** refine a primitive without creating a new top-level
   entity. Red-team and head-to-head are council formats; website, external
   prototype and A/B variant are reference subtypes; a session can run against a
   screen walkthrough, prototype or live URL.
3. **Methodology `artifact_type` tags** are open planning/build tags used by the
   methodology engine and prototype renderer registry. They are not
   automatically Library primitives.

- **Open questions** are the research uncertainties driving a project. They live
  in the project outline, the Library's Open questions tab and
  `/open-questions/{id}` detail pages.
- **Hypotheses** are testable assumptions with predictions. They are not
  answers; they are framed bets that reality can validate or refute.
- **References** are websites, external prototype links and A/B variants placed
  in a council room. They come from `add_artifact`, may carry a captured
  snapshot, and surface under `/references`. They are not uploaded files.
- **Assets** are real files attached to a project: screenshots, documents,
  exports and generated deliverables. Assets can flow **in** as evidence or
  **out** as deliverables. They surface under `/assets`, `/assets/{id}` and in
  the project outline.
- **Councils** are moderated research rounds: a mediator asks; personas answer
  from memory. Red-team, head-to-head, price ladder and ideation are council
  formats, not new primitives.
- **Surveys** are structured question instruments for real responses.
- **Prototypes** are interactive surfaces personas can actually use.
- **Sessions** are replayable usage traces against a screen walkthrough,
  prototype or live URL. `define_flow` stores a reusable screen-walkthrough test
  script under `project["flows"]`, but that script is not a Library primitive;
  it exists so multiple sessions can reuse the same ordered screenshot sequence.
- **Notes** are captured signals, observations or concepts.
- **Reports / syntheses** are analyses that turn evidence into interpretation.
- **Decisions** are evidence-backed commitments about what to do. They are not
  answers; they are actions justified by evidence.
- **Sections** are structural primitives: they group existing nodes and can have
  detail/export surfaces, but they are not evidence by themselves.

The Library groups primitives as a user-facing work map:

- **Frame**: open questions and hypotheses — what still needs to be resolved or
  proven.
- **Material**: references and assets — linked or stored material, whether
  evidence in or deliverable out.
- **Ask**: councils and surveys — ways to ask personas or real respondents.
- **Test**: prototypes and sessions — what can be exercised and the recorded
  run through it.
- **Capture**: notes — low-friction signals, observations and concepts.
- **Conclude**: reports and decisions — analysis and commitments.
- **Structure**: sections — grouping, not evidence.

The Library is the cross-project browser for these primitives. The project page
remains the primary context: the same objects appear as rows in the research
outline, grouped by phase, and open their canonical detail pages as slide-overs.

A hallucinated `kind` from an LLM cannot silently create a new Library primitive:
the service layer validates or normalizes persisted values, and the web presence
gate fails when a project-scoped primitive is not registered. Open methodology
tags remain separate from this product taxonomy.
