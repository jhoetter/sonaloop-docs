# Primitive inventory and naming

Sonaloop has several first-class primitives that are easy to confuse if they are
all called "artifacts". The product UI separates them deliberately:

Use three layers:

1. **Primitives** are the stable Library-level entities. They have a purpose, a
   route, a detail page and a presence declaration.
2. **Subtypes / formats** refine a primitive without creating a new top-level
   entity. Red-team and head-to-head are council formats; website, external
   prototype and A/B variant are reference subtypes; flow, prototype and live
   URL are session subjects.
3. **Methodology `artifact_type` tags** are open planning/build tags used by the
   methodology engine and prototype renderer registry. They are not
   automatically Library primitives.

- **Open questions** are the research uncertainties driving a project. They live
  in the project outline, the Library's Open questions tab and
  `/open-questions/{id}` detail pages.
- **References** are websites, external prototype links and A/B variants placed
  in a council room. They come from `add_artifact`, may carry a captured
  snapshot, and surface under `/references`. They are not uploaded files.
- **Assets** are real files attached to a project: screenshots, documents,
  exports and generated deliverables. They surface under `/assets` and the
  project files lens.
- **Flows** are ordered screenshot assets used for screen walkthroughs. They
  surface under `/flows` and collect replayable sessions.
- **Prototypes** are runnable local builds.
- **Sessions** are replayable usage traces against a flow, prototype or live
  URL. The compatibility fidelity value `artifact` means a screen walkthrough,
  not a generic artifact type.
- **Councils, surveys, hypotheses, decisions, notes and reports/syntheses** are
  also Library primitives. Their modes/statuses are subtypes or lifecycle
  states, not separate top-level entities.
- **Sections** are structural primitives: they group existing nodes and can have
  detail/export surfaces, but they are not evidence by themselves.

The Library is the cross-project browser for these primitives. The project page
remains the primary context: the same objects appear as rows in the research
outline, grouped by phase, and open their canonical detail pages as slide-overs.

A hallucinated `kind` from an LLM cannot silently create a new Library primitive:
the service layer validates or normalizes persisted values, and the web presence
gate fails when a project-scoped primitive is not registered. Open methodology
tags remain separate from this product taxonomy.
