# Design System Document

## 1. Overview & Creative North Star: "The Intellectual Curator"
This design system is built to transform a standard blog into a high-end digital publication. The Creative North Star is **"The Intellectual Curator"**—a visual language that balances the gravitas of a traditional broadsheet with the fluid, breathing room of modern minimalism.

To move beyond "template" layouts, we embrace **Intentional Asymmetry**. We treat typography as a structural element rather than just a medium for content. By utilizing generous white space (the "breathing room") and overlapping elements, we create a sense of depth and architectural intent. The goal is to make the reader feel like they are stepping into a quiet, well-lit study: authoritative, mentor-like, and deeply premium.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The color palette is rooted in a sophisticated interplay between Deep Teal (`#1b4a42`) and Bone White (`#FAF9F6`), accented by the vibrant warmth of Magenta (`#c43b73`) and a sophisticated Olive (`#807d6b`).

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders are strictly prohibited for sectioning or containment. We define boundaries through **Background Color Shifts**.
* Instead of a line between sections, transition from `surface` (#FAF9F6) to `surface-container-low` (#F4F3F1).
* This creates a "seamless" editorial flow that feels integrated, not boxed in.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create "nested" importance:
* **Base:** `surface` (#FAF9F6) for the main page.
* **Secondary Content:** `surface-container-low` (#F4F3F1) for sidebars or metadata blocks.
* **Featured Elements:** `surface-container-highest` (#E3E2E0) for high-impact callouts.

### The Glass & Signature Texture Rule
To elevate the "Premium" feel:
* **Glassmorphism:** Use `surface_variant` at 70% opacity with a `24px` backdrop-blur for floating navigation or sticky headers.
* **Signature Gradients:** For primary CTAs or Hero backgrounds, use a subtle linear gradient from `primary` (`#1b4a42`) to `primary_container` (#1B2B4B) at a 135-degree angle. This adds "soul" and prevents the deep colors from feeling flat or "corporate."

---

## 3. Typography: Editorial Authority
We utilize a high-contrast scale where the Serif acts as the "Voice" and the Sans-Serif acts as the "Function."

* **The Voice (Serif - Newsreader):** Used for all `display` and `headline` tokens. It should be tracked slightly tighter (-2%) in large formats to feel like a premium masthead.
* **The Function (Sans - Inter):** Used for `title`, `body`, and `label` tokens. It provides a clean, neutral counterpoint to the expressive serif.

**Hierarchy Strategy:**
* Use `display-lg` as a graphic element. Don't be afraid to let a headline "bleed" or sit asymmetrically against a large margin.
* `body-lg` (1rem) is the workhorse. Line height must be set to `1.6` for long-form readability, ensuring the "Editorial" vibe is maintained in the reading experience.

---

## 4. Elevation & Depth: Tonal Layering
We reject the "drop shadow" defaults of the early web. Depth in this system is achieved through **Tonal Layering**.

* **The Layering Principle:** Place a `surface-container-lowest` card (#FFFFFF) on a `surface-container-low` section (#F4F3F1). The 1% shift in value creates a soft, natural lift that mimics fine stationery.
* **Ambient Shadows:** If a floating element (like a Modal or Pop-over) is required, use a "Shadow-Blur" approach: `0px 20px 40px`, with the color set to `on-surface` (#1A1C1A) at **4% opacity**. It should be felt, not seen.
* **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast modes), use the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons
* **Primary:** Background: `primary` (`#1b4a42`) or the Signature Gradient. Text: `on-primary`. Roundedness: `sm` (0.125rem) for a sharp, professional edge.
* **Secondary:** Background: `secondary` (`#c43b73`). Use this sparingly for "Actionable Insights" or Newsletter signups.
* **Tertiary:** No background. Text: `primary`. Hover state: `surface-container-high` background.

### Input Fields & Text Areas
* **Style:** Minimalist. No bottom line or full box. Use a `surface-container-lowest` background with a subtle 1px `outline-variant` at 20% opacity.
* **Focus:** Transition the background to `surface-container-high` and the label to `secondary` (Magenta).

### Cards & Article Previews
* **Forbid Dividers:** Do not use lines to separate articles in a list.
* **Spacing:** Use `spacing-12` (4rem) between list items. Use vertical white space as the primary separator.
* **Layout:** Experiment with "Horizontal Cards" where the image takes up 40% width and the text 60%, creating a magazine-style spread.

### Bespoke Component: "The Pull Quote"
* **Design:** A `headline-md` serif text block.
* **Accent:** Use a `2px` vertical bar of `secondary` (Magenta) on the left side only.
* **Placement:** Asymmetrically placed, slightly overlapping the margin of the body text.

---

## 6. Do's and Don'ts

### Do:
* **Do** use `spacing-20` and `spacing-24` for section padding. Generosity with space equals premium quality.
* **Do** use `metadata-gray` (#6B7280) for timestamps and reading times to keep them subordinate to the narrative.
* **Do** overlap images and text blocks slightly (using negative margins) to create a custom, "designed" feel rather than a grid-fill feel.

### Don't:
* **Don't** use pure black (#000000). Always use `on-surface` (#1A1C1A) for text to maintain the soft "paper" aesthetic.
* **Don't** use standard `md` or `lg` roundedness for primary containers. Keep it to `sm` (0.125rem) or `none` to maintain an authoritative, architectural edge.
* **Don't** use center-alignment for long-form text. Editorial authority is best conveyed through strong left-alignment with wide right margins.