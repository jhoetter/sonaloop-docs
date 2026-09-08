# The shared Persona card

The Research Persona page and its MCP App use the same customer-owned view and
native services. A name change in either surface updates the same Persona. The
Persona ID and slug remain stable; the portrait is the native Research avatar.

Click the name or another editable field to change it. Click the avatar to enter
a portrait prompt and generate an image. An image prompt guides that operation;
it does not silently rewrite the Persona's profile. Image generation needs the
customer's configured provider key and may incur provider charges.

The card preserves unsaved input when saving fails. If the Persona changed
elsewhere, refresh its current state before applying another edit. If an image
operation's outcome is unknown, inspect its status instead of starting another
generation. The previous confirmed image remains available on a failed operation.
Older imported profiles may expose unsupported field shapes as read-only with an
explanation; the card does not silently flatten or discard them.

## Connect through MCP

Install the Research package and connect `sonaloop-mcp` in your MCP host. The
normal native tools continue to work in text-only clients. For an interactive
card, a host must implement MCP Apps; MCP tool support alone does not imply UI
rendering. Third-party client behavior depends on the actual client's capability.

- `list_personas` obtains real Persona IDs or slugs.
- `get_persona_surface` returns the current Persona and declares the card resource.
- `brief_persona` gathers the instructions for authoring a complete native profile.
- `record_persona_surface` persists that authored profile and returns the card.

`record_persona_surface` is a create operation, not a draft. Use it only when the
user has requested creation. Keep one `operation_id` for an exact create intent;
do not allocate another merely because a response was interrupted. The card's
update/avatar/status tools are declared for App use. Host visibility hints do not
replace the server's actual authorization or the host's action policy.

The resource is `ui://sonaloop/persona/v1`, with MIME
`text/html;profile=mcp-app`. The installed customer package supplies the HTML,
JavaScript and CSS. Tool results contain useful text and a structured Persona DTO;
validated image data is delivered as private rendering metadata, outside model
input. Credentials and native filesystem paths are not part of the card DTO.

## Source ownership and deployment

The view source lives in the Research repository at
`sonaloop/web/assets/persona-view/persona-view.js`. A product adapter handles native
HTTP/CSRF; a standard MCP App adapter handles tool messages. Both import that same
source. Native services own validation, authorization, operation replay, concurrency
and files. No separate card database or avatar store is required.

The customer build ships content-hashed product assets and
`sonaloop/mcp_server/ui/persona.html` with `persona.manifest.json`. The deterministic
manifest records source and artifact hashes, component/DTO versions, actions,
states and fallback. The same customer release can run without a capture or
governance service being online.

The MCP also exposes this manifest as the read-only JSON resource
`sonaloop://ui/persona/manifest`; tools reference it through
`sonaloop/uiManifestUri`. A catalog can associate the declaration with the exact
customer source revision. The manifest is inspectable evidence, not an execution
permission or a claim that a particular client has rendered the card.

`examples/mcp-app-host` is a separate local reference host that can be copied and
installed independently. It discovers an explicitly allowed MCP tool set, provides
a direct tool test and optionally calls an OpenAI model using a server-side key.
It contains no Persona rendering or business workflow. Its opaque iframe uses the
same forwarded port. It is an integration example; production cloud identity,
tenant provisioning and policy remain the customer's deployment responsibility.

## Use the reference agent

The reference host defaults to GPT-5.6 Terra, with reasoning effort set to `none`
for interactive requests. `OPENAI_MODEL` can select another supported model; an
unavailable model produces an error instead of a silent fallback. The API key
stays on the server.

Sending a message immediately clears and refocuses the composer. You can write
the next draft while the reply streams. Text, tool progress, any required action
approval and the interactive card appear in the order they occur. Tool details
can be expanded; later text does not replace a card you are editing. Scrolling
up keeps your reading position, and the down-arrow returns to the latest reply.

Stop prevents further model work and tool dispatch. A native action that has
already started may finish; its actual result remains visible. Stop does not undo
a saved change. After an interruption, the host retrieves the known request
status without resending the action. If the status cannot be reached, use
**Status prüfen**; an unknown outcome is not a reason to repeat a write.

Chat sessions belong to the current browser cookie and live in the host process.
The reference implementation retains at most 20 sessions and 40 turns per process;
it is not persistent conversation storage. Restarting the host loses that chat
history, while native Research data remains in its own store.

For implementation details see the Research repository's
`docs/persona-surface-contract.md` and the example host README.
