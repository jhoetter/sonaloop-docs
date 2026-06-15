# Artifact inventory and naming

Sonaloop has several first-class primitives that are easy to confuse if they are
all called "artifacts". The product UI separates them deliberately:

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

The Library is the cross-project browser for these primitives. The project page
remains the primary context: the same objects appear as rows in the research
outline, grouped by phase, and open their canonical detail pages as slide-overs.
