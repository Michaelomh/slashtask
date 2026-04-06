---
AUDIT_MODE: standard
TARGET_URL: https://app.todoist.com
DATE: 2026-04-06
---

## SITE DNA — Todoist Web App (app.todoist.com)

> **Audit scope:** Authenticated app shell at `app.todoist.com/app/upcoming`. The user is logged in and the full React app is rendered. All measurements are from a 1710×896px viewport.

---

## Step 1.1 — Macro Page Architecture

**Structural strategy:** Framework root is `#todoist_app` (React app with CSS Modules). No `<section>` tags used. Layout is a flat two-panel flex row inside `div.xPiLGH0`.

```
PAGE ARCHITECTURE: Todoist — app.todoist.com/app/upcoming
Viewport: 1710 × 896px
╔══════════════════════════════════════════════════════════╗
║  ROOT: #todoist_app  [1710×896]                          ║
║  └─ .xPiLGH0  display:flex  flex-direction:row           ║
╠══════════════════════════════════════════════════════════╣
║  PANEL A: SIDEBAR  [280×896]                             ║
║  BG: #262626 (--left-menu-background)                    ║
║  LAYOUT: fixed-width 280px, flex column, <nav>           ║
╠══════════════════════════════════════════════════════════╣
║  PANEL B: MAIN VIEW  [1430×896]  bg:#1f1f1f              ║
║  LAYOUT: flex column, overflow-y:scroll                  ║
║  └─ ZONE 1: Top sticky bar       [1415×56]  sticky top:0 ║
║  └─ ZONE 2: Title + month nav    [1415×95]  static       ║
║  └─ ZONE 3: 7-day strip          [1415×29]  sticky top:56║
║  └─ SCROLL BODY: Task list sections (variable height)    ║
╚══════════════════════════════════════════════════════════╝
```

- **Grid philosophy:** Two hard panels — sidebar is fixed 280px, main takes all remaining width. No max-width constraint on the outer shell; inner task list content maxes at ~800px within the main panel.
- **Whitespace rhythm:** Based on 4px/8px/12px/16px/24px/32px reactist spacing scale.
- **Stacking:** Sidebar and main live at same z-index level. Within main, Zone 1 (z:5) and Zone 3 (z:3) stack above the scrolling task list.

---

## Step 1.2 — Design Token Extraction

```
DESIGN TOKENS
─────────────────────────────────────────────────────────────────
PALETTE (Dark Theme — active):

  Background / Surface:
  bg-base-primary      #1f1f1f                → main content area bg
  bg-base-secondary    #262626                → sidebar bg, outer shell
  bg-raised-primary    #282828                → popovers, dropdowns
  bg-raised-secondary  #333333                → nested elevated surfaces
  bg-scrollbar-track   #2c2c2c                → scrollbar track

  Text:
  text-primary         #ffffff / rgb(255,255,255)  → all primary labels, task text
  text-secondary       #d1d1d1 / rgb(209,209,209)  → nav labels, metadata, sidebar secondary
  text-tertiary        #cccccc / rgb(204,204,204)  → project labels in tasks
  text-quaternary      #808080 / rgb(128,128,128)  → inline "Add task" ghost text
  text-muted           #777777 / rgb(119,119,119)  → task count badges
  text-dim             #555555 / rgb(85,85,85)     → prev-arrow in nav pill

  Brand / Accent:
  brand-red-primary    #d04348 / rgb(208,67,72)    → today date badge background
  brand-red-idle       #d04348                     → primary action fill (buttons)
  brand-red-hover      #e36564                     → primary action hover
  brand-coral-label    #e26a60 / rgb(226,106,96)   → "Add task" sidebar text, nav icons
  brand-coral-active   #f07f75 / rgb(240,127,117)  → "Upcoming" active nav text
  brand-coral-deep     #de4c4a / rgb(222,76,74)    → Upcoming nav icon
  brand-red-active-bg  #472525 / rgb(71,37,37)     → active nav item background
  brand-destructive    #e06155                     → destructive actions

  Status / Semantic:
  overdue-red          #ff7066                     → overdue date text, P1 checkbox
  orange-notification  #f48318                     → notification badge dot
  reschedule-coral     #e26a60                     → "Reschedule" link color

  Priority Colors:
  priority-p1          #ff7066   → P1 checkbox border (urgent red)
  priority-p2          #ff9a13   → P2 checkbox border (orange)
  priority-p3          #5297ff   → P3 checkbox border (blue)
  priority-p4          #a9a9a9   → P4 checkbox border (gray, default)

  Project Icon Colors (user-assigned, examples):
  project-work         #ff8e84 / rgb(255,142,132)  → salmon pink
  project-health       #eb96c8 / rgb(235,150,200)  → lavender pink
  project-misc         #f48318 / rgb(244,131,24)   → orange
  project-social       #7ecc48 / rgb(126,204,72)   → green
  project-passion      #148fad / rgb(20,143,173)   → teal

  Borders / Dividers:
  divider-primary      #3d3d3d / rgb(61,61,61)     → task item bottom border, nav pill border
  scrollbar-thumb      #939393                     → scrollbar thumb

  Focus:
  focus-ring           #2a4c80                     → focus box-shadow outer
  focus-ring-light     #dceaff                     → focus ring light mode

─────────────────────────────────────────────────────────────────
TYPOGRAPHY SCALE:
  Role            | Font Family                        | Weight | Size  | Tracking   | Line-Height
  ─────────────────────────────────────────────────────────────────────────────────────────────
  Page Title (H1) | -apple-system, system-ui stack     | 700    | 26px  | normal     | normal
  Section Header  | -apple-system, system-ui stack     | 700    | 14px  | normal     | normal
  Task Body       | -apple-system, system-ui stack     | 400    | 14px  | 0.091px    | 21px
  Nav Label       | -apple-system, system-ui stack     | 400    | 13px  | normal     | 32px
  Add Task (side) | -apple-system, system-ui stack     | 600    | 14px  | normal     | normal
  Account Name    | -apple-system, system-ui stack     | 600    | 13px  | normal     | normal
  Month/Year      | -apple-system, system-ui stack     | 600    | 12px  | normal     | normal
  Day Label       | -apple-system, system-ui stack     | 400    | 13px  | normal     | normal
  Today Day Label | -apple-system, system-ui stack     | 600    | 13px  | normal     | normal
  Due Date        | -apple-system, system-ui stack     | 400    | 12px  | normal     | normal
  Project Label   | -apple-system, system-ui stack     | 400    | 12px  | normal     | normal
  "Used: 5/5"     | -apple-system, system-ui stack     | 700    | 10px  | normal     | normal
  Help & Resrc    | -apple-system, system-ui stack     | 600    | 14px  | normal     | normal
  Reschedule      | -apple-system, system-ui stack     | 600    | 13px  | normal     | normal
  Display btn     | -apple-system, system-ui stack     | 600    | 13px  | normal     | normal

  Font stack (full): -apple-system, system-ui, "Segoe UI", Roboto, Noto, Oxygen-Sans, Ubuntu,
                     Cantrell, "Helvetica Neue", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"
  Mono stack: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, "Cascadia Mono", Consolas,
              "Liberation Mono", "Courier New", monospace

  ⚑ DRAMA NOTES: The typographic hierarchy is deliberately flat and utilitarian — page title is
  only 26px/700 against 14px/400 task text. The visual weight shift happens through COLOR not size.
  The coral/red brand color on "Add task" and active nav creates all the visual energy. Without it,
  the UI would read as nearly monochrome.

─────────────────────────────────────────────────────────────────
SPACING GRID: Base unit = 4px
  Scale: 4, 8, 12, 16, 24, 32px (reactist tokens: xsmall/small/medium/large/xlarge/xxlarge)
  Sidebar width: 280px fixed
  Task list content max-width: ~800px (within 1430px main panel)
  Task item height: 59px
  Nav item height: 34px
  Zone 1 height: 56px
  Zone 2 height: 95px
  Zone 3 height: 29px
  Section header height: 32–33px
  Day column width: 114px × 7 = 800px total

BORDER RADIUS:
  small (5px)  → buttons, nav items, today badge, avatar, drag handle, project icons
  large (10px) → modals, large cards (inferred from reactist tokens)

SHADOW SYSTEM:
  raised-1: 0px 2px 8px 0px rgba(0,0,0,0.33)   → dropdowns, popovers
  raised-2: 0px 4px 8px rgba(0,0,0,0.2)         → elevated modals
  raised-3: 0px 16px 50px 0px rgba(0,0,0,X)     → full-screen overlays

TEXTURE: none (flat dark surfaces, no grain or noise)
─────────────────────────────────────────────────────────────────
```

---

## Step 1.3 — Section Blueprints

### PANEL A: Sidebar

```
SIDEBAR: Left navigation panel
Width: 280px | Height: 896px | BG: #262626
┌──────────────────────────────────────────┐
│  [ACCOUNT BAR]           h:58px          │
│  ┌─────────────────┐  [bell] [sidebar]   │
│  │ avatar + Michael│  34x34   32x32      │
│  └─────────────────┘                     │
│──────────────────────────────────────────│
│  [ADD TASK]              h:34px          │
│  ⊕ Add task              (coral text)    │
│  [+ icon 24px]  [text 14px/600/#e26a60]  │
│  [waveform icon at right 32x32]          │
│──────────────────────────────────────────│
│  [SEARCH]                h:34px          │
│  ○ Search                                │
│──────────────────────────────────────────│
│  [NAV ITEMS]  each 230x34px              │
│  ▦ Upcoming  ← ACTIVE                   │
│    bg:#472525  br:5px  w:256px           │
│    icon #de4c4a, text #f07f75            │
│  📊 Reporting                            │
│  ○○○ More                               │
│──────────────────────────────────────────│
│  My Projects  [USED: 5/5]   h:36px      │
│    badge: 10px/700/#b3b3b3 gray pill     │
│──────────────────────────────────────────│
│  [PROJECT LIST]  each 230x34px           │
│  # Work           [count: 8]  right      │
│  # Health         [count: 8]  right      │
│  # Misc/NonWork   [count: 20] right      │
│  # Social/Events  [count: 15] right      │
│  # Passion Project [count: 2] right      │
│   (colored # icons per project)          │
│──────────────────────────────────────────│
│          [SPACER — flex-grow]            │
│──────────────────────────────────────────│
│  ⓘ Help & resources      h:32px         │
│  14px/600/#d1d1d1                        │
└──────────────────────────────────────────┘
Layout: flex column, padding 0 12px, gap ~4px between groups
```

**CONTENT MAP: Sidebar**
```
  Account avatar      → initials/photo circle [26×26px], br:50%
  Account name        → "Michael" | 13px/600/#d1d1d1
  Account chevron     → dropdown caret icon
  Notifications link  → bell icon 34×34, notification dot #f48318
  Sidebar toggle btn  → sidebar icon 32×32, aria-expanded:true
  Add task            → "Add task" | 14px/600/#e26a60 | coral + icon
  AI waveform icon    → right side of Add task row, 32×32
  Search              → "Search" | 13px/400/#fff | circle icon
  Upcoming (active)   → "Upcoming" | 13px/400/#f07f75 | bg:#472525 br:5px
  Reporting           → "Reporting" | 13px/400/#fff
  More                → "More" | 13px/400/#fff
  My Projects label   → "My Projects" | 13px bold/#fff
  "USED: 5/5" badge   → 10px/700/#b3b3b3 gray pill
  Work project        → # icon #ff8e84 + "Work" 13px/400/#fff + "8" right 12px/#777
  Health project      → # icon #eb96c8 + "Health" + "8"
  Misc/NonWork        → # icon #f48318 + "Misc/NonWork" + "20"
  Social/Events       → # icon #7ecc48 + "Social/Events" + "15"
  Passion Project     → # icon #148fad + "Passion Project" + "2"
  Help & resources    → ⓘ circle icon + "Help & resources" | 14px/600/#d1d1d1
```

---

### PANEL B: Main View — Zone 1 (Top Sticky Bar)

```
ZONE 1: Top sticky toolbar
Height: 56px | BG: #1f1f1f | Position: sticky top:0 | z-index:5
Padding: 0 12px | Width: 1415px
┌─────────────────────────────────────────────────────────┐
│                              [  Display: 1  ]           │
│                              111x32 btn, br:5px         │
└─────────────────────────────────────────────────────────┘
Layout: CSS grid (1 column), align right
"Display: 1" button: 13px/600/#d1d1d1, border: 1px solid transparent,
                     bg:transparent, br:5px — icon (list icon 16px) + text
```

---

### PANEL B: Main View — Zone 2 (Title + Month Nav)

```
ZONE 2: Page title + calendar navigation
Height: 95px | BG: transparent | Position: static
Width: 1415px, inner content max-width ~800px centered-left
┌──────────────────────────────────────────────────────┐
│  Upcoming                      [< Today >]           │
│  H1 26px/700/white             nav pill 114x32       │
│                                border:1px solid      │
│  April 2026 ▼                  #3d3d3d br:5px        │
│  12px/600/#d1d1d1                                    │
└──────────────────────────────────────────────────────┘
Left column: H1 (125x35) then month selector below (70x28)
Right column: prev/Today/next group (114x32, br:5px, border:1px solid #3d3d3d)
  - ‹ button: 24x32, color:#4d4d4d (dimmed, at start of week)
  - "Today": 62x32, 13px/600/#d1d1d1
  - › button: 24x32, color:#d1d1d1
"April 2026": span "April" 14px/600/#fff + "2026" 12px/600/#d1d1d1 + dropdown caret
```

---

### PANEL B: Main View — Zone 3 (7-Day Strip)

```
ZONE 3: 7-day horizontal day selector strip
Height: 29px | BG: #1f1f1f | Position: sticky top:56px | z-index:3
Width: 1415px, inner .calendar width: 800px (flex row)
┌──────────────────────────────────────────────────────┐
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun                   │
│   6    7    8    9   10   11   12                    │
│  [⬤]                                                 │
│  today badge                                         │
└──────────────────────────────────────────────────────┘
Each day column: A tag, 114x28px, flex column, center-aligned
TODAY (Mon 6):
  - "Mon" label: SPAN 13px/600/#fff
  - "6" date: SPAN 23x20px, bg:#d04348, color:#fff, br:5px (pill badge)
OTHER DAYS:
  - Day name: SPAN 13px/400/#d1d1d1
  - Date: SPAN 13px/400/#d1d1d1
Separator: 1px solid #3d3d3d below strip (rendered as bottom border of zone or top of task list)
```

---

### PANEL B: Main View — Task List Scroll Body

```
TASK LIST BODY: Scrollable content below the 3 sticky zones
Scroll starts at: top:180px (56 + 95 + 29 = 180px of sticky headers)
Section headers stick at: top:85px (within scroll area)

SECTION HEADER COMPONENT (h:33px, sticky top:85px, bg:#1f1f1f):
  padding: 0 16px
  ┌──────────────────────────────────────────────────┐
  │ ▼ Overdue                          Reschedule   │
  │   14px/700/#fff                    13px/600/coral│
  └──────────────────────────────────────────────────┘
  OR for date sections:
  ┌──────────────────────────────────────────────────┐
  │  6 Apr ‧ Today ‧ Monday                          │
  │  14px/700/#fff                                   │
  └──────────────────────────────────────────────────┘

TASK ITEM COMPONENT (LI, h:59px, bg:#1f1f1f, borderBottom:1px solid #3d3d3d):
  Total width: 800px, padding-top: 8px
  ┌────────────────────────────────────────────────────────────┐
  │ [≡] [○]  Complete amplitude dashboards for...    Work  #  │
  │ drag  cb  14px/400/white                         12px/ccc  │
  │           3 Mar ↺                                          │
  │           12px/400/#ff7066 (overdue red)                   │
  └────────────────────────────────────────────────────────────┘
  Layout breakdown (left to right):
  - Drag handle: 24×24px, hidden by default (show on hover)
  - Checkbox circle: 24×24px, border-color = priority color
    P1:#ff7066  P2:#ff9a13  P3:#5297ff  P4:#a9a9a9(default)
  - Task content area (flex-grow):
    - Task text: 14px/400/#fff, letterSpacing:0.091px, line-height:21px
    - Can contain underlined hyperlinks
    - Meta row below: due date + project label + # icon
  - Action buttons (right, appear on hover): task options

INLINE "ADD TASK" ROW (h:33px, below each section's tasks):
  ┌──────────────────────────────────────────┐
  │  + Add task                              │
  │  14px/400/#808080 gray, + icon coral     │
  └──────────────────────────────────────────┘
```

---

## Step 1.3b — Visual Composition Inventory

### Hero/Active View: Upcoming Task List

```
COMPOSITION MAP: Upcoming View
The visual interest is NOT in animation or illustration — it's in the layered
sticky header system and the color-coded metadata system within each task item.

PRIMARY FOCAL POINTS:
  1. "Upcoming" H1 — large 26px/700/white, immediate visual anchor top-left
  2. Active nav item in sidebar — #472525 maroon bg with 5px br, coral text
  3. Today "6" badge — #d04348 red pill in day strip, only colored element in strip
  4. "Overdue" section header + "Reschedule" coral — only color in task area
  5. Task due dates in overdue red (#ff7066) — stands out from white task text

DEPTH SYSTEM:
  Layer 1 (bottom): Main bg #1f1f1f — task list scroll area
  Layer 2: Sidebar bg #262626 — slightly lighter, creates panel separation
  Layer 3 (sticky zones): bg #1f1f1f with z-index 3 and 5 — zone 1 and zone 3
  Layer 4: Popovers/dropdowns bg #282828 or #333 with shadow

SIDEBAR VISUAL COMPOSITION:
  - Vertical rhythm: each nav row exactly 34px tall
  - Active state punch: maroon swatch #472525 is the single most saturated
    element in the sidebar — immediately draws eye to current location
  - Project icons: 5 colored # hashtag symbols, each 24px, unique brand color
    reading order: salmon → pink → orange → green → teal (warm to cool)
  - Count numerals right-aligned in #777 muted gray — secondary info layer
```

---

## Step 1.4 — Scroll & Entrance Animation Audit

The Todoist web app is a **functional, animation-light** interface. Transitions are micro-level (hover state changes), not entrance animations.

```
ANIMATION: Nav item hover/active background
Section: Sidebar
Trigger: hover / active (page navigation)
Library: CSS transitions
TIMELINE:
  DEFAULT → HOVER:
    background-color: rgba(0,0,0,0) → rgba(255,255,255,0.1)
    color: #fff/#d1d1d1 → #fff
    DURATION: 300ms  EASING: cubic-bezier(0.4, 0, 0.2, 1)
  DEFAULT → ACTIVE:
    background-color: rgba(0,0,0,0) → #472525
    color: #fff → #f07f75 (coral)
    DURATION: 300ms  EASING: cubic-bezier(0.4, 0, 0.2, 1)
PROPERTIES ANIMATED: color, background-color
LOOP: no
```

```
ANIMATION: Button hover state
Section: All buttons (sidebar, zones, task actions)
Trigger: hover
Library: CSS transitions
TIMELINE:
  DEFAULT → HOVER:
    background-color transitions at 300ms cubic-bezier(0.4,0,0.2,1)
    Primary btn: #d04348 → #e36564
    Ghost btn:   transparent → rgba(255,255,255,0.1)
PROPERTIES ANIMATED: color, background-color
LOOP: no
```

```
ANIMATION: Sticky header snap
Section: Zone 1 (top bar) + Zone 3 (day strip) + Section headers
Trigger: scroll — no animation, instant position via CSS sticky
Library: CSS position:sticky (no JS)
Zone 1 sticks at: top:0px (always visible)
Zone 3 sticks at: top:56px (below Zone 1)
Section headers stick at: top:85px (below Zones 1+3)
PROPERTIES ANIMATED: none (CSS sticky, no transition)
```

**No entrance animations, no scroll-triggered reveals, no GSAP/Framer detected.**

---

## Step 1.5 — Micro-Interaction Catalog

```
INTERACTION: Sidebar nav item (inactive)
STATE     | background              | color      | transform  | other
──────────────────────────────────────────────────────────────────
DEFAULT   | rgba(0,0,0,0)           | #fff/#d1d1d1| scale(1)  | –
HOVER     | rgba(255,255,255,0.1)   | #fff        | scale(1)  | –
ACTIVE    | #472525                 | #f07f75     | scale(1)  | br:5px
MECHANISM: CSS transition
DURATION: 300ms  EASING: cubic-bezier(0.4,0,0.2,1)
⚑ SPECIAL: Active bg is dark maroon #472525 (NOT the brand red). The text
  shifts to a lighter coral #f07f75. The icon color also shifts to deep coral #de4c4a.
```

```
INTERACTION: Task checkbox (complete task)
STATE     | background              | color      | border          | other
────────────────────────────────────────────────────────────────────────
DEFAULT   | transparent             | –          | 2px solid [P#]  | circle, 24×24
HOVER     | [P# color] 10% opacity  | –          | 2px solid [P#]  | checkmark SVG appears
CLICK     | [P# color]             | #fff        | none            | strikethrough on text
MECHANISM: CSS transition + React state
⚑ SPECIAL: Priority color determines BOTH the border AND the fill on complete.
  P4 (gray/no priority) uses #a9a9a9 border.
```

```
INTERACTION: "Add task" sidebar button
STATE     | color              | other
─────────────────────────────────────────────────
DEFAULT   | #e26a60 (coral)    | + icon + text
HOVER     | #f07f75 (lighter)  | bg: rgba(255,255,255,0.06) subtle
MECHANISM: CSS transition 300ms ease-in-out
```

```
INTERACTION: "< Today >" navigation pill
Container: 114×32px, border:1px solid #3d3d3d, br:5px
STATE     | ‹ button color    | Today color | › button color
─────────────────────────────────────────────────────────────
DEFAULT   | #4d4d4d (dimmed)  | #d1d1d1     | #d1d1d1
HOVER     | #d1d1d1           | #fff        | #fff
Pill container bg: transparent, border unchanged on hover
```

```
INTERACTION: Display button (top-right, Zone 1)
111×32px, br:5px, border:1px solid transparent
DEFAULT: bg:transparent, color:#d1d1d1
HOVER:   bg:rgba(255,255,255,0.06), border becomes visible #3d3d3d
```

---

## Step 1.6 — Component Behavior Deep-Dive

```
STATE MACHINE: 7-Day Calendar Strip (Zone 3)
Location: Zone 3, sticky below page title
Type: Cycler (week navigation via prev/next arrows)
STATES:
  State A: Current week displayed (Mon–Sun with today highlighted)
  State B: Previous/next week (no today badge visible, all days muted)
INITIAL STATE: A (current week)
TRANSITION A→B:
  Trigger: Click ‹ or › arrows in "< Today >" nav group (Zone 2)
  Effect: Day labels and dates slide/replace (instant, no animation)
  Today btn: re-enables ‹ button when navigated away from current week
INTERNAL LAYOUT:
  Container: .calendar > .calendar__weeks > div [800×28px flex row]
  7 A-tag children, each 114×28px
  TODAY cell: contains SPAN with bg:#d04348, color:#fff, br:5px, [23×20px]
  OTHER cells: plain SPAN, 13px/400/#d1d1d1
```

```
STATE MACHINE: Overdue Section Collapse
Location: Task list body, "Overdue" section header
Type: Toggle
STATES:
  State A: Expanded (chevron pointing down, tasks visible)
  State B: Collapsed (chevron pointing right, tasks hidden)
INITIAL STATE: A (expanded)
TRANSITION A→B: Click on "Overdue" text or collapse icon
  Tasks: height animates 0 (likely CSS height:0 + overflow:hidden or display toggle)
```

```
COMPONENT: Sticky Section Headers
Type: CSS position:sticky with top:85px
Behavior: Each date group header (e.g. "6 Apr · Today · Monday") sticks at
  top:85px when scrolled past. Multiple headers can stack — later one pushes
  earlier one off. Creates accordion-like navigation as user scrolls.
Z-index: inherits from task list layer (below Zones 1 and 3)
```

---

## Step 1.7 — Scroll Choreography Map

```
SCROLL CHOREOGRAPHY MAP — Upcoming view
─────────────────────────────────────────────────────────────────────
Scroll position │ Event
─────────────────────────────────────────────────────────────────────
0px (top)       │ Zone 1 (top bar) visible and sticky at top:0
                │ Zone 2 (title) visible, static
                │ Zone 3 (day strip) visible, sticky at top:56px
                │ First section header ("Overdue") visible below strip
─────────────────────────────────────────────────────────────────────
>180px          │ Zone 2 (title + month) scrolls away
                │ "Overdue" header snaps to sticky position top:85px
─────────────────────────────────────────────────────────────────────
>680px (approx) │ "6 Apr · Today · Monday" section header reaches
                │ top:85px, pushes "Overdue" header up and out
─────────────────────────────────────────────────────────────────────
Continuous      │ Each subsequent day section header stacks/unstacks
                │ at top:85px as user scrolls
─────────────────────────────────────────────────────────────────────
SCROLL BEHAVIORS:
  Parallax elements: NONE
  Sticky elements:
    - Zone 1 (top bar): top:0, z:5, never unsticks
    - Zone 3 (day strip): top:56px, z:3, never unsticks
    - Section headers: top:85px each, z:auto, unstick as replaced by next
  Nav state change: NONE (sidebar doesn't morph on scroll)
  Total scroll height of task list: ~71,594px (80 tasks loaded)
─────────────────────────────────────────────────────────────────────
```

---

## Step 1.8 — Technical Stack Detection

```
TECHNICAL STACK
  Framework: React (confirmed — __reactFiber$ key on DOM elements)
              Confidence: HIGH
  Bundler:   Webpack / custom bundler (hashed CSS Module class names like
              .hiGMgHg, .xPiLGH0, .TGcY7vK confirmed)
  Animation: CSS transitions only (300ms, cubic-bezier(0.4,0,0.2,1))
              No GSAP, no Framer Motion, no Anime.js
  Scroll:    Native browser scroll (no Lenis, no Locomotive)
  UI Lib:    Reactist — Doist's own React design system
              (confirmed via --reactist-* CSS custom properties)
              CSS Modules for component-level scoping
  State:     Unknown (Redux not detected in window globals; likely Zustand
              or React context + React Query given SPA patterns)
  No Tailwind, no Alpine, no Vue, no Svelte detected.

CSS Custom Properties system: TWO layers:
  1. --reactist-* tokens (spacing, typography scale, border radius, base colors)
  2. --product-library-* tokens (Doist product design system — semantic color roles
     with idle/hover/disabled/on states per component type)
  3. --animation-* tokens (timing: 150ms/200ms/250ms/300ms/375ms)
  4. --ease-* easing curves (material design cubic-bezier values)
```

---

## Step 1.9 — Motion Philosophy + Copy Voice

```
MOTION PHILOSOPHY:
Todoist's motion is ruthlessly functional — transitions exist only to confirm
state changes, never to delight or entertain. The single easing curve
(cubic-bezier(0.4,0,0.2,1) = Material Design's "standard") applied uniformly
to all elements at 300ms creates a composed, professional feel with zero
playfulness. Sticky headers that snap without animation give the interface a
snap-to-grid physicality. If all CSS transitions were removed, the app would
be functionally identical — the transitions are cosmetic confirmation only.
The emotional output is: calm, reliable, in-control. Nothing surprises you.

COPY VOICE PATTERN:
  Tone:          Functional, neutral, zero marketing language inside app
  Sentence form: Ultra-short fragments for labels — "Upcoming", "Overdue",
                 "Reschedule", "Add task", "More". Never full sentences.
  Key device:    Direct action verbs ("Add", "Search", "Reschedule") —
                 the copy IS the action, no preamble
  Date format:   "6 Apr ‧ Today ‧ Monday" — stacked context (day, relative,
                 full name) using middle-dot separator ‧ (U+2027)
  Separator:     "‧" (interpunct) between date context elements — subtle,
                 non-intrusive, higher visual weight than a slash
```

---

## SITE DNA Summary

| Property | Value |
|---|---|
| Design language | Functional dark SaaS — flat, dense, utility-first |
| Primary bg | #1f1f1f (main) / #262626 (sidebar) |
| Brand color | #d04348 (today badge) / #e26a60 (Add task, active nav text) |
| Active nav | bg:#472525 + text:#f07f75 + br:5px |
| Typography | System-ui stack, tight scale: 10/12/13/14/26px |
| Layout | Two-panel (280px sidebar + flex-grow main) |
| Sticky system | 3 zones: top bar 56px, day strip 29px, section headers 85px |
| Radius | 5px universal (10px large for modals) |
| Transitions | 300ms cubic-bezier(0.4,0,0.2,1) on color+bg only |
| Animations | None (scroll-triggered, no entrance effects) |
| Framework | React + CSS Modules + Reactist design system |
| Priority system | 4 levels: red/orange/blue/gray (#ff7066/#ff9a13/#5297ff/#a9a9a9) |
