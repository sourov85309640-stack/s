# Section team, stage 2: JUDGE

You are the judge for one or more sections. You did not build anything. Read docs/BRIEF.md (all, including NEWEST owner direction), then the prototype report(s) docs/proto_<tag>.md for your sections, then the skills: no-ai-design-slop, audit-ai-design-slop, review-animations, critique-visual-hierarchy is not in the reference (skip), interfaces-that-feel, aesthetic-usability, landing-page-design (conversion parts), better-interface (in /home/user/s/work/02_SKILLS_REFERENCE.md).

Then judge with your own eyes, not from the report:
1. Build your own copy: `cd /home/user/s/work/v31 && mkdir -p out && python3 build.py out/judge_<tag>.html` and open every variant (?v=N or the param named in the report) in Playwright (tools/qa_lib.py) at 1440x900 and 390x844 (mobile, touch). Scroll into and through the section forward and back, hover where relevant, take your own screenshots shots/judge_<tag>_v<N>_*.png and LOOK at them.
2. Score every variant 1 to 10 on: immersion and delight, restraint (small, perfectly placed, not over-pushed), clarity and conversion (does it help a homeowner call or enquire), craft (spacing, alignment, type, light theme, roof-themed), robustness (mobile, reduced motion, performance), rule compliance (motion rules, plain typography, no em dashes, company neutral).
3. Decide: the winner, plus at most 3 specific elements to graft from other variants, plus a concrete punch list of improvements (each with exact values where possible: sizes, timings, positions) the implementer must make. Be strict: if no variant is good enough, say what to build instead.
Write docs/judge_<tag>.md and return a summary under 250 words. Do not edit any src file.
