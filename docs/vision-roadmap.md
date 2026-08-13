# Fahrplan zur sonaloop-v4-Produktvision

Dieser Fahrplan übersetzt die langfristige Vision in rückwärtskompatible,
nutzbare Produktschnitte. Er ist keine Kalenderzusage: Die Reihenfolge folgt
Abhängigkeiten, und jeder Meilenstein endet mit einer echten End-to-End-
Abnahme.

!!! note "Ausgangspunkt"

    Canvas, Application Capture, Product Inventory, Multi-Variant-Ausführung,
    Play, sichere Customer Runner, Provider-Verträge und eine observe-only
    Customer Compute Environment sind bereits reale Grundlagen. Der Fahrplan
    baut darauf auf, statt ein zweites System daneben zu stellen.

## Value Spine

Jeder Schritt verlängert denselben Produktpfad:

```text
Anwendung erfassen
→ Product Inventory kuratieren
→ Issue und Varianten definieren
→ kontextgebunden implementieren
→ in der echten App vergleichen
→ Evidenz sammeln
→ entscheiden
→ kontrolliert ausliefern
```

Das bestehende MVP Release Gate wird unverändert abgeschlossen. Neue
Inventory-, Placement- oder Managed-Compute-Anforderungen öffnen dieses fast
fertige Gate nicht rückwirkend.

## Abhängigkeiten

```text
MVP Release Gate
├── Product Context: Inventory Integration
│   ├── gepinnter Agent Context
│   └── User Tests, Findings und Decision Ledger
├── Product Intake: Native Work Item und Sync Policy
└── Execution Platform: Provider Installations
    └── Variant Revision, Placement, Runtime und Preview v2
        └── Warm Scheduler, Quoten und Kosten
            └── Managed Environment
                └── Managed Agent
                    └── Devbox und persönliche Agent-Workflows
```

Product Context, Product Intake und Execution Platform können teilweise
parallel fortschreiten. Managed Compute bleibt jedoch vom portablen Runtime-
und Placement-Kern abhängig.

## R0 — Bestehenden Pilot belastbar halten

Der laufende Canvas-/Play-Pfad bleibt die Produktbasis:

- logische Screens statt Theme- oder Capture-Duplikate;
- Cmd+K-Suche über große Applications;
- gespeicherte Evidenz ohne weißen Zwischenzustand;
- echte App mit sicherem Fallback;
- kleine warme Runtime-Menge statt einer VM pro Variant;
- sichere Tickets, Isolation, Cleanup und historische Links.

**Exit:** Ein Referenzprojekt mit mindestens 40 Screens und Current plus drei
Varianten funktioniert wiederholt ohne manuelle Ports, Prozesse oder
Worktrees. Abbrüche hinterlassen keine unbekannten Ressourcen.

## R1 — Unveränderlicher Produktkontext

### Product Inventory

- immutable Inventory- und Item-Revisionen;
- persistierte Mining Runs;
- fail-soft Re-Mining nach neuen Current Captures;
- Accept, Reject, Rename, Merge, Deprecate und begründeter Override;
- Drift-/Conflict-Findings statt stiller Überschreibung;
- bidirektionale Navigation zwischen Item und Canvas-Occurrence;
- sichere Shared-Inventory-Export- und Löschgrenzen.

### Context Binding und Lineage

- Implementation Runs und Variant Revisions pinnen Inventory Revision und
  Content Hash;
- Agent Context enthält nur akzeptierte, für das Ziel-Project anwendbare und
  budgetierte Items;
- `variant_revision.v1` bündelt Commit, Baseline, Run, Fidelity und Tests;
- Preview v2 unterscheidet Live Working Copy, immutable Review Revision und
  externes Deployment.

**Exit:** Spätere Inventory-Curation oder ein neuer Current Pointer verändern
weder einen historischen Run noch eine veröffentlichte Variant Revision.

## R2 — Produktloop auf vorhandener Kunden-Compute

- bewusst kleines Native Work Item statt Linear-Klon;
- externe und native Issues auf stabile interne Identität normalisieren;
- explizites Variant Set mit Baseline, Entscheidungsfrage, Leitplanken, Budget
  und Ziel-Fidelity;
- Feedback an Revision, Route, Viewport und Screenshot binden;
- Folgeiteration direkt aus Feedback starten;
- Auswahl-Decision mit Alternativen, Begründung, Nachteilen und offenen Fragen.

**Exit:** Ein Team durchläuft `Native Issue → drei Variants → Play → Feedback
→ neue Revision → Auswahl`, ohne Git- oder Infrastrukturdetails zu bedienen.

## R3 — Portable Execution und Warm Scheduler

- Provider Installations und Descriptor-Upgrades persistieren;
- `execution_placement.v1` verbindet Application Target, Compute Environment,
  Runner, Working Copy und Runtime Driver;
- vorhandenen Process-/OCI-Pfad als ersten Runtime Driver adaptieren;
- Desired/Observed Runtime State, Health, Services, Ports, Data Profile,
  Limits und Cleanup Receipts speichern;
- Hot-/Warm-Menge pro Project begrenzen;
- LRU, Idle Stop, Singleflight-Rehydration, Quoten und Kosten einsetzen;
- vorhandene Customer Environments zuerst nutzen.

**Exit:** Dutzende gespeicherte Variant Revisions benötigen nur eine kleine,
konfigurierte Zahl warmer Runtimes. Restart und Cleanup erhalten alle
fachlichen Revisionen, Inventories, Evidenzen und Decisions.

## R4 — Batteries Included Execution

- ein schmaler Sonaloop Managed Environment Provider;
- zunächst ein Hetzner Driver, eine Region, eine Image-Familie und wenige
  Ressourcenprofile;
- idempotentes Provision, Observe, Stop, Resume und Destroy;
- Orphan-Erkennung, Auto-Stop, Kill Switch, Quoten und Kosten vor Rollout;
- reproduzierbare native Review Previews mit Retention und Access Policy.

**Exit:** Drei kompatible Runtimes teilen eine Managed Environment und bleiben
einzeln stoppbar. Ein abgebrochener Provider-Vorgang wird ohne doppelte oder
verwaiste Ressource reconciliiert.

## R5 — Managed Agent und Developer Workspaces

Die Lieferfolge ist bewusst eng:

1. ein Managed Agent für einen bekannten Implementation-Run-Typ;
2. Progress, Logs, Kosten und Approval Requests;
3. Resume unabhängig von Browser und Terminal;
4. persönliche Devbox mit persistentem Home und Working-Copy-Leases;
5. isolierte persönliche Agent Credentials;
6. lokale Agents über denselben MCP-/Revision-Publish-Vertrag.

**Exit:** Disconnect beendet keine Agent Session. Kein anderer Benutzer oder
Managed Run kann persönliche Credentials lesen. Lokal, remote und managed
entsteht dieselbe Variant-Revision-Lineage.

## R6 — Evidenz und Decision Ledger

- strukturierte Testpläne, Aufgaben, Consent und Sessions;
- Ereignisse, Task Completion, Zeit, Beobachtungen und Abbruchpunkte;
- Findings aus Feedback, Tests, Inventory Drift und Reviews;
- Decision Records mit Alternativen, Evidenz, Konsequenzen, Scope und
  Supersession;
- Markdown-/Repository-Export für Product Decisions und ADRs;
- Vergleich über Revisionen, Feedback, Tests, Findings, Kosten und Aufwand.

**Exit:** Zwei exakte Revisionen lassen sich vergleichen, ohne Sessions oder
Evidenz zu vermischen. Eine spätere Decision kann eine frühere ablösen, ohne
Historie zu löschen.

## R7 — Delivery und Product Intent Review

1. GitHub-PR für die exakt ausgewählte Revision;
2. Checks, Approvals und Status in einer kompakten Delivery-Ansicht;
3. Product Intent Review zunächst für eine Kategorie und nicht-blockierend;
4. Finding-Validierung gegen Diff, Issue, Variant, Inventory Binding,
   Decisions und Tests;
5. Agent Feedback Loop;
6. rollenbasierte Merge-, Deployment- und Release-Policies.

**Exit:** Externe Retries erzeugen keinen zweiten PR. Findings besitzen
konkrete Kontextreferenzen und einen begründeten Human Override. Blocking Mode
beginnt erst nach gemessener Präzision und expliziter Organization Policy.

## R8 — Provider-Ökosystem

Erst nachdem ein enger Pfad bewiesen ist, folgt ein zweiter Provider:

- Vercel als Review-Preview-Adapter;
- GitLab als zweiter Source-Control-Pfad;
- weitere Issue-, Environment-, Identity-, Secret- und DeploymentProvider;
- Organization Policies, SSO, Datenresidenz, Audit Export und Abrechnung;
- gemeinsames Contract-Test-Kit einschließlich Descriptor-Upgrades.

**Exit:** Ein Providerwechsel verändert keine fachliche ID und keinen
historischen Binding- oder Receipt-Digest.

## R9 — Advanced Multi-Variant Development

Erst nach stabiler Einzel-Issue-Journey:

- Review Scenarios aus mehreren Issue-Varianten;
- temporäre Merge-Runtimes und Konfliktanalyse;
- Feature-Flag-Varianten;
- Experiment- und Analytics-Integration;
- automatische Variant-Evaluation mit menschlicher Entscheidung.

## Was bewusst nicht früh gebaut wird

- kein allgemeiner Kubernetes- oder Cloud-Orchestrator;
- keine VM pro Variant;
- kein generisches `Provider.execute(json)`;
- kein vollständiger Linear-, GitHub-, Vercel- oder IDE-Klon;
- keine freie Hosted Remote Shell;
- keine automatische Variant-Komposition vor stabiler Revision-/Runtime-
  Lineage;
- kein Product-Intent-Blocking ohne gemessene Präzision.

## Nächste Arbeitspakete

1. Inventory Snapshot und Context Binding;
2. Variant Revision Read Model;
3. Preview-v2-Projektion;
4. persistierte Provider Installations und Upgradepfad;
5. Execution Placement;
6. Runtime Aggregate über den vorhandenen Customer Runner;
7. Warm Scheduler über vorhandene Capacity;
8. Native Work Item plus Feedback-/Selection-Schnitt;
9. erst danach Managed Hetzner Provisioning.

Die Vision ist erreicht, wenn sowohl ein vollständig sonaloop-eigener Pfad als
auch ein modularer Enterprise-Pfad dieselben fachlichen Objekte verwenden und
ein Providerwechsel keine Variant, Revision, Inventory-Bindung, Evidenz oder
Decision umdeutet.
