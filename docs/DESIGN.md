# Clinix Design System Specification

## 1. Core Principles
* **Aesthetics:** Minimalism, Material 3 Expressive, Swiss Design principles.
* **Accessibility:** Strict adherence to WCAG 2.1 AA contrast ratios.

## 2. Typography
* **Headings:** Montserrat (Weights: 600 Semi-bold, 700 Bold)
* **Body & UI Elements:** Inter (Weights: 400 Regular, 500 Medium)

## 3. Color Palette (Noguchi Gold Theme)
Mapped to Angular Material & UI semantics:
* **Background & Surface (Neutral Light):** Tone of White (`#FAF9F6` / `#FFFFFF`)
    * *Usage:* Main application background, card backgrounds, sidebar background.
* **Primary (Text & High Emphasis):** `Onyx Black` (`#19171b`)
    * *Usage:* Primary headings, active sidebar text, main body text.
* **Secondary (Muted Elements):** `Smoked Charcoal` (`#252628`)
    * *Usage:* Secondary text, inactive icons, borders, subtle UI dividers.
* **Action Accent:** `Gold` (`#d29f22`)
    * *Usage:* Floating action buttons, primary call-to-action buttons, active route indicators.
* **Highlight / Alert:** `Deep Red` (`#5d0018`)
    * *Usage:* Drug allergies warning badges, alerts, critical highlights.

## 4. Layout Architecture
* **Global Layout:** CSS Grid/Flexbox approach. Left Sidebar + Main Content view.
* **Sidebar (Navigation):**
    * **Behavior:** Collapsible (Expanded width ~250px, Collapsed width ~80px).
    * **Top (Brand Area):** * Expanded: "Clinix" (Montserrat Bold, Primary color).
        * Collapsed: "Cx".
    * **Middle (Routes):** Patients, Doctors, Appointments, Finances.
    * **Bottom:** Placeholder container for V2 User profile/settings.
* **Main Content Area:**
    * **Header Area:** Dynamic h1 displaying the current feature name (e.g., "Patients").
    * **Content:** Scrollable workspace.
