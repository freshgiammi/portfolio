---
title: "Markdown Rendering Test — Every Feature"
published: 2026-06-01
description: A comprehensive test of every markdown rendering feature supported by this blog
image: /images/blog/markdown-test.jpg
---

This post exists to verify every markdown rendering feature works correctly.

---

## Inline Formatting

**Bold text**, *italic text*, ~~strikethrough~~, `inline code`, **_bold italic_**.

Subscript: H~2~O, Superscript: E=mc^2^ (if supported).

---

## All Heading Levels

# H1 — Page Title (should only appear once per page)

## H2 — Section Heading

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

### H3 — Subsection

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

#### H4 — Deeper Subsection

Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.

##### H5 — Even Deeper

Donec eu libero sit amet quam egestas semper.

###### H6 — Deepest Level

Aenean ultricies mi vitae est. Mauris placerat eleifend leo.

---

## Blockquotes

> This is a blockquote.
>
> > Nested blockquote for testing.
>
> Back to the outer level.

---

## Lists

### Unordered

- Item one
- Item two
  - Nested item A
  - Nested item B
    - Deeply nested
- Item three

### Ordered

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

### Task List (if supported)

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

---

## Code Blocks

### Plain text

```
This is a plain code block with no language specified.
Line two.
```

### JavaScript / TypeScript

```typescript
interface User {
  id: string
  name: string
  email: string
}

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json() as Promise<User>
}

const user = await fetchUser("abc-123")
console.log(user.name)
```

### Rust

```rust
fn factorial(n: u32) -> u32 {
    match n {
        0 | 1 => 1,
        _ => n * factorial(n - 1),
    }
}

fn main() {
    let result = factorial(10);
    println!("10! = {}", result);
}
```

### Python

```python
from dataclasses import dataclass
from typing import Optional


@dataclass
class Node:
    value: int
    left: Optional["Node"] = None
    right: Optional["Node"] = None


def inorder(node: Optional[Node]) -> list[int]:
    if node is None:
        return []
    return inorder(node.left) + [node.value] + inorder(node.right)
```

### Bash

```bash
#!/usr/bin/env bash
set -euo pipefail

for file in src/**/*.ts; do
  npx oxlint --fix "$file"
done

echo "Done!"
```

### JSON

```json
{
  "name": "freshgiammi-portfolio",
  "version": "3.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "typescript": "^5.5.0"
  }
}
```

### Diff

```diff
- const x = 1
+ const x = 2
```

---

## Mermaid Diagrams

### Flowchart

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Ship it]
    B -->|No| D[Debug]
    D --> B
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant DB

    Client->>Server: GET /api/users
    Server->>DB: SELECT * FROM users
    DB-->>Server: rows
    Server-->>Client: JSON response
```

### Gantt Chart

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Design
    Research       :done, 2026-01-01, 14d
    Wireframes     :done, 2026-01-15, 10d
    section Development
    Frontend       :active, 2026-01-25, 30d
    Backend        :2026-02-01, 30d
    section Testing
    QA             :2026-03-01, 14d
```

---

## Tables

| Feature | Support | Notes |
|---------|---------|-------|
| Bold | ✅ | `**text**` |
| Italic | ✅ | `*text*` |
| Code | ✅ | `` `code` `` |
| Tables | ✅ | Pipe syntax |
| Mermaid | ✅ | Diagrams |
| GFM | ✅ | GitHub Flavored |

### Right-aligned columns

| Left | Center | Right |
|:-----|:------:|------:|
| One | Two | Three |
| Alpha | Beta | Gamma |

---

## Links

- [External link](https://example.com)
- [Relative link](/blog)
- [Link with title](https://example.com "Example Title")

---

## Images

![Placeholder](https://placehold.co/600x200?text=Test+Image "Test image caption")

![Random landscape](https://picsum.photos/seed/blogtest1/800/400 "A random landscape from picsum")

![Random portrait](https://picsum.photos/seed/blogtest2/600/800 "A random portrait from picsum")

---

## Horizontal Rules

Above

---

Below

---

## HTML Inline

This paragraph contains <span style="color: var(--accent)">accent-colored text</span> and a <kbd>Ctrl</kbd> + <kbd>C</kbd> keyboard shortcut.

---

## Definition List (if supported)

Term A
: Definition for term A

Term B
: Definition for term B
: Another definition for term B

---

## Footnotes (if supported)

Here's a sentence with a footnote.[^1]

[^1]: This is the footnote content.

---

## Escaping

Literal asterisks: \*not italic\*

Literal backticks: \`not code\`

---

## Mixed Content

Here is a paragraph with `inline code`, **bold**, *italic*, and a [link](https://example.com).

> A blockquote containing **bold** and `code`.
>
> ```json
> { "nested": "code block inside blockquote" }
> ```

1. A list item with `code` and **bold**
2. Another item with a nested blockquote
   > Quoted inside a list
3. Final item

---

## Long Code Block with Line Wrap

```typescript
// This is a deliberately long line to test horizontal scrolling or wrapping behaviour in code blocks
const reallyLongVariableName: Record<string, Array<{ id: string; name: string; value: number; tags: string[] }>> = {}
```

---

That covers all supported rendering features. If anything looks wrong, the markdown parser or styles need adjustment.
