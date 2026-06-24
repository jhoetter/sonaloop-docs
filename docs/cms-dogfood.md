---
title: "Sonaloop CMS dogfood run"
description: "Sonaloop CMS can manage a Git-backed Markdown docs repository locally without introducing another hosted CMS."
status: draft
route: "/cms-dogfood"
kind: "landing"
audience: "Developers and operators evaluating Sonaloop MCP documentation."
cta: "Review the dogfood branch and decide whether the CMS config should stay in sonaloop-docs."
sourceIssue: "https://github.com/jhoetter/sonaloop-docs/issues/120"
source_issue: "https://github.com/jhoetter/sonaloop-docs/issues/120"
provenance: "issue-to-draft:120"
---

# Sonaloop CMS dogfood run

## Hero

Sonaloop CMS can manage a Git-backed Markdown docs repository locally without introducing another hosted CMS.

## Problem

Add a reproducible dogfood note proving Sonaloop CMS can inventory, validate and draft against the existing MkDocs documentation repository.

## Value proposition

TODO: draft this section.

## Proof

- `sonaloop-cms init --dry-run` detected 22 docs pages and 4 docs assets in sonaloop-docs.
- `sonaloop-cms validate` checked 22 docs with 0 errors before the draft.

## FAQ

TODO: draft this section.

## CTA

Review the dogfood branch and decide whether the CMS config should stay in sonaloop-docs.

## Draft TODOs

- TODO: Human review for tone, proof and accuracy.
