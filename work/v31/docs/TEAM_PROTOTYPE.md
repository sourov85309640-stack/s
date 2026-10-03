# Section team, stage 1: BRAINSTORM + PROTOTYPE (5 or 6 variants)

You are the brainstorm-and-prototype member of a section team. Read, in order:
1. docs/BRIEF.md (all of it, including NEWEST owner direction and ARCHITECTURE)
2. docs/IMPLEMENT_COMMON.md
3. docs/01_HANDOVER_A-Z.md sections 6 to 9 (design system, technical lessons, the to-do for your section, known bugs)
4. The skills in /home/user/s/work/02_SKILLS_REFERENCE.md that your task names (read them in full; `grep -n '^# SKILL:'` for line numbers). Always also read: no-ai-design-slop, animate (Hard Rules + Never Ship), emil-design-eng, interfaces-that-feel, find-animation-opportunities, ambient-section-particles, prototype/variant ideas are summarised in the BRIEF (parallel-concepts: spread variants across what the visitor DOES, not only how it looks).
5. src/core.js, src/depth.js, src/base.css, your current section partial(s) in src/sections/ (old dark markup: rewrite freely) and the old CSS/JS for it in _old/styles_interim.css, _old/motion_interim.js, _old/app_interim.js (reuse what works, the old code has hard-won fixes listed in the handover section 7).
6. Optional reference for hover/background-colour effects only (NOT a gold standard, big file): reference/uav-aerial-solutions-site.html. Do not copy its assets or copy.

Then:
A. Brainstorm 8 to 10 ideas for your section's key immersive moment and its layered parallax (back / content / front). Pick 5 or 6 GENUINELY different concepts (different interaction model, not colour swaps).
B. Build all of them in your own files, side by side, behind a variant switch: the section element gets `data-v="1".."6"`; read `?v=N` from the URL in your JS (default 1) and set it; scope variant CSS/JS by `[data-v="N"]`. Shared, good-in-every-variant parts (light theme conversion, correct copy, accessible markup, layered parallax pieces) are built once.
C. Build (`python3 build.py out/<tag>.html`) and test every variant in Playwright (tools/qa_lib.py) at 1440x900 and 390x844 touch, scrolling into and through the section (forward and reverse), hover where relevant, and reduced motion once. Capture 2 to 4 screenshots per variant (states in motion, e.g. 25/50/75 percent through a scroll scene) into shots/<tag>_v<N>_*.png and LOOK at each with the Read tool. Fix obvious breakage so each variant is a fair candidate.
D. Write docs/proto_<tag>.md: for each variant: one-paragraph concept, what the visitor sees/does, screenshot paths, measured frame times (qa_lib.frame_times while scrolling through), problems found, your own scores 1 to 10 for immersion, clarity/conversion, restraint (not over-pushed), craft, performance. End with your recommendation and why.
E. Do NOT delete the variants: a judge will look at them next. Report under 300 words with the doc path and the out file path. Then stop.
