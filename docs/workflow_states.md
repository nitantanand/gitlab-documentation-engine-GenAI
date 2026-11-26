# AI Workflow States

A content job moves through a series of states during the AI documentation lifecycle, from source document upload to final Markdown publication.

## State Table

| Status | Meaning | Set by |
|---|---|---|
| `uploaded` | Source document has been uploaded and is ready for processing | Content Intake |
| `reading` | Technical context is extracted and supporting knowledge is retrieved | Context Reader |
| `writing` | The initial documentation draft is generated | Documentation Writer |
| `fact_checking` | Generated content is verified against the uploaded source | Fact Checker |
| `tone_editing` | Clarity, structure, and audience-appropriate tone are improved | Tone Editor |
| `ready_for_human_review` | AI processing is complete and the draft is waiting for human review | AI Workflow |
| `approved` | The human reviewer has approved the documentation | Human Reviewer |
| `revision_requested` | The human reviewer has requested changes to the draft | Human Reviewer |
| `publishing` | Approved content is being prepared for publication | Publishing Coordinator |
| `published` | Final documentation has been generated as Markdown | Publishing Coordinator |
| `failed` | The workflow encountered an AI or system execution error | AI Workflow |

## State Diagram

```text
uploaded
   |
   v
reading
   |
   v
writing
   |
   v
fact_checking
   |
   v
tone_editing
   |
   v
ready_for_human_review
   |
   +-- APPROVE ----------> approved
   |                          |
   |                          v
   |                      publishing
   |                          |
   |                          v
   |                      published
   |
   +-- REQUEST REVISION --> revision_requested
                              |
                              v
                           writing
                              |
                              v
                        fact_checking
                              |
                              v
                         tone_editing
                              |
                              v
                   ready_for_human_review
```


# Workflow Notes — GitLab AI Content Engine

## Source Document and Context Retrieval

- The uploaded document serves as the primary source of truth for the AI documentation workflow.
- During the reading stage, the Context Reader extracts relevant technical information from the uploaded source.
- The Context Reader can also retrieve supplementary information from ChromaDB, including style guides, sample documentation, and content templates.
- ChromaDB provides additional supporting context but does not replace or override the uploaded source document.

## AI Documentation Generation and Validation

- During the writing stage, the Documentation Writer uses the extracted and verified context to generate the initial documentation draft.
- During the `fact_checking` stage, the Fact Checker validates generated claims against the uploaded source and identifies unsupported or inaccurate information.
- During the `tone_editing` stage, the Tone Editor enhances clarity, structure, and audience-appropriate language while preserving verified technical details.

## Human Review and Revision Process

- `ready_for_human_review` acts as a mandatory human approval checkpoint before publishing.
- Documentation is not published automatically after the AI workflow is completed.
- If the reviewer approves the draft, the workflow transitions to `approved`, followed by the publishing stage.
- If changes are requested, the workflow transitions to `revision_requested`, and reviewer feedback is passed back to the Documentation Writer.
- After revisions, the documentation follows the complete review cycle again:

  **Documentation Writer → Fact Checker → Tone Editor → Human Review**

- Previous document versions can be retained to maintain traceability of revisions, feedback, and review decisions.

## Publishing and Workflow States

- The Publishing Coordinator prepares approved documentation for export in Markdown format.
- `published` represents the final workflow state in the current MVP.
- `failed` represents an AI execution or system-level error and is handled separately from revisions requested by a human reviewer.

---

## Workflow Summary

The application follows a source-grounded, human-in-the-loop documentation process in which AI agents generate, validate, and refine technical content before it reaches the publishing stage.

**Overall Flow:**

`Uploaded Source → Context Reader → Documentation Writer → Fact Checker → Tone Editor → Human Review → Approval → Publishing Coordinator → Markdown Export`

**Revision Flow:**

`Human Review → Revision Requested → Documentation Writer → Fact Checker → Tone Editor → Human Review`

**Important:** Human approval is mandatory before publishing, ensuring that the final documentation remains accurate, traceable, and aligned with the original source.

