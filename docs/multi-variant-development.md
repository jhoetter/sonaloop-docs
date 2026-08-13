# Multi-Variant Software Development

## Produktvision für sonaloop-v4

sonaloop-v4 entwickelt sich zur **Control Plane für Multi-Variant Software
Development**:

```text
Idee
→ Issue
→ mehrere ausführbare Varianten
→ Feedback und User Tests
→ nachvollziehbare Entscheidung
→ Pull Request und kontrollierte Auslieferung
```

Der Ausgangspunkt ist einfach: Wenn Coding Agents Implementierungen günstiger
und schneller machen, können Produktteams mehrere reale Lösungsalternativen
erleben, statt eine einzige Lösung anhand abstrakter Spezifikationen zu
diskutieren. Der neue Engpass ist die sichere Koordination dieser Alternativen.

!!! note "Status"

    Diese Seite beschreibt das langfristige Zielbild vom 13. August 2026. Sie
    ist keine Behauptung, dass jeder hier genannte Provider oder Workflow heute
    bereits verfügbar ist. Der ausgelieferte Umfang wird jeweils in den
    Feature- und Betriebsdokumenten beschrieben.

## Das fachliche Modell

Branches, Worktrees, Container und Preview-URLs sind technische Mittel. Das
Produktmodell bleibt davon unabhängig:

```text
Issue
└── Variant Set
    ├── Variant
    │   └── unveränderliche Variant Revision
    └── Variant
        └── unveränderliche Variant Revision

Variant Revision
├── Preview
├── Feedback
├── User-Test-Evidenz
├── Decision
└── Delivery
```

Damit kann eine Variante zunächst visuell sein, über mehrere Revisionen bis zu
einem Production Candidate reifen und auf einer anderen kompatiblen
Infrastruktur erneut materialisiert werden.

## Batteries included, aber austauschbar

Jede wesentliche Provider-Kategorie soll langfristig eine sonaloop-eigene
Standardimplementierung und eine austauschbare Schnittstelle besitzen:

| Kategorie | sonaloop-Ziel | Externe Beispiele |
| --- | --- | --- |
| Issues | Native Issues | Linear, Jira, GitHub Issues |
| Agents | Managed Agent | persönliche oder kundeneigene Agenten |
| Environments | Managed Environment | Customer Runner, weitere Compute-Anbieter |
| Previews | Live- und Review-Preview | Vercel, Netlify, Kunden-CI |
| Source Control | Provider-Integration | GitHub, GitLab, Bitbucket |
| Delivery | koordinierter Delivery-Flow | kundeneigene CI/CD |

Provider sollen nach maschinenlesbaren Fähigkeiten gewählt und unabhängig
kombiniert werden. Ein Providerwechsel darf Variant-, Revision-, Feedback-,
Test-, Decision- oder Delivery-Historie nicht umdeuten.

## Vier Dinge, die getrennt bleiben müssen

Die Architektur unterscheidet bewusst:

| Objekt | Bedeutung | Beispiele |
| --- | --- | --- |
| Application Target | die App, gegen die Capture oder Review läuft | Dev App, Staging |
| Compute Environment | CPU, RAM, Storage, Netzwerk und Policies | Customer Server, Managed VM |
| Working Copy | veränderlicher Source-Arbeitsstand | Worktree, Checkout |
| Runtime | laufende Materialisierung einer Working Copy oder Revision | Prozess, Container, Service-Stack |

Ein Worktree isoliert Git-Zustand, aber keine Ports, Prozesse, Datenbanken oder
Credentials. Eine Compute Environment kann mehrere Devboxen und Runtimes
tragen. Eine fachliche Variant ist keines dieser Objekte.

Diese Trennung ist Voraussetzung für kostengünstige Warm Pools: Dutzende
Varianten benötigen nicht automatisch Dutzende VMs. Kompatible Runtimes können
gebündelt, inaktive Runtimes gestoppt und ausgewählte Revisionen reproduzierbar
rehydriert werden.

## Die echte App bleibt die Review-Oberfläche

Screenshots bleiben unveränderliche Evidenz und ein Fail-soft-Fallback. Der
eigentliche Vergleich findet jedoch in einer ausführbaren App statt. Eine
Preview Shell ergänzt die Kundenanwendung um ein dezentes Control Panel für:

- Baseline-, Variant- und Revisionswechsel;
- Feedback und strukturierte Tests;
- Evidenz und Decisions;
- Delivery-Status und Freigaben.

Eine optionale Preview Bridge kann Route, echte Readiness, Flow-Ereignisse und
DOM-verankertes Feedback melden. Ohne Bridge bleibt ein sicherer Basic Mode
mit Screenshot-Kontext und routenbezogenem Feedback nutzbar.

## Sequenzierter Ausbau

Der Ausbau erfolgt entlang lieferbarer, rückwärtskompatibler Schnitte:

1. **Multi-Variant Core:** begrenzte Variant Batches, Revisionen, Warm
   Runtimes, qualifiziertes Play und Feedback.
2. **Saubere Execution-Grenzen:** Application Target, Compute Environment,
   Devbox, Working Copy und Runtime als getrennte Identitäten.
3. **Provider-Verträge:** Capability-Inventar, gebundene Provider-Auswahl,
   Receipts und gemeinsame Contract-Tests.
4. **Batteries included:** Native Issues, Managed Agent, Managed Environment
   und native Review Previews.
5. **Evidence und Delivery:** strukturierte User Tests, Decision Ledger,
   Product Intent Review, Pull Requests, Approvals und Release.

Als erster kompatibler Fundament-Schnitt akzeptiert die Variant-Ausführung
bereits idempotente, begrenzte Batches von zwei bis zwanzig konfigurierten
Rezepten; der ältere Pair-Vertrag bleibt bestehen. Das ist noch keine freie
Variant-Autorierung und noch kein Managed-Compute-Produkt, beseitigt aber die
technische Pair-only-Grenze, ohne alle Runtimes gleichzeitig heiß halten zu
müssen.

Die Plattform ersetzt Git, spezialisierte Issue-Systeme oder Cloud-Anbieter
nicht zwangsläufig. Sie besitzt die produktorientierte Klammer über deren
Artefakte:

> Eine Idee wird zu mehreren realen Alternativen; die gewählte Alternative
> bleibt samt Evidenz und Intention bis zur Auslieferung nachvollziehbar.
