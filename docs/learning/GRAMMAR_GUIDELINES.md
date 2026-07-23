# DeutschFlow — Grammar Guidelines

**Version:** 1.0 · **Updated:** 2026-07-12 · **Status:** Active · **Sprint:** 6.3A

> Grammar is discovered, not lectured. One pattern per lesson, in service of a capability.

---

## 1. How grammar is discovered (notice → name)
The Grammar (Pattern Discovery) stage runs **after** dialogue + vocabulary:
1. **Notice:** point to lines the learner *already saw* ("You saw: *Ich heiße Anna* · *ich bin Ben*").
2. **Name:** give the pattern a plain-English name ("Saying your name").
3. **Explain the why:** one concise rule + a compact table + 2–3 examples built from **this lesson's** vocabulary.

**Rationale:** the Noticing Hypothesis + input-before-rule keeps cognitive load low and makes the rule feel *earned*, not imposed. (Grammar-first lecturing is the failure mode we avoid.)

---

## 2. When explicit rules appear
- **Always after exposure**, never before.
- **One** rule per lesson. If a capability needs two rules → two lessons.
- Tables are minimal (e.g., 6-row pronoun/conjugation chart), never exhaustive paradigms at A1.
- Terminology is introduced gently: use the plain name first ("the verb comes second"), the grammatical term second and optional ("V2 word order").

---

## 3. When the AI (Emma) explains grammar
Emma explains grammar **on demand** and **during recovery**, not as the primary channel:
- Learner taps "Explain more" on a pattern → Emma gives a level-appropriate, example-led explanation.
- Learner misses an exercise twice → the *why* line can escalate to an Emma micro-explanation.
- Emma **never** front-runs the lesson's discovery moment. See AI_TUTOR_GUIDELINES (hint ladder).

---

## 4. Examples (pattern spec)
Each grammar pattern authored as:
```
name: "Saying your name"
rule: "Use ich heiße … or ich bin …. Both mean 'my name is / I am'."
table: [[ich, heiße], [du, heißt], [er/sie, heißt]]
examples: ["Ich heiße Anna.", "Wie heißt du?"]   # from this lesson only
why: "'heiße' is slightly more formal than 'bin'."
```

---

## 5. Common mistakes (author a `pitfalls` list per pattern)
| Pattern | Typical beginner error | In-lesson handling |
|---|---|---|
| Verb-second (V2) | Verb placed third ("Ich heiße nicht…" ok; "Heute ich gehe" ✗) | Exercise + why-line: "the verb comes second" |
| Noun gender | Wrong article (der/die/das) | Always teach with article; MCQ on article |
| Formal/informal | *du* vs *Sie* mixed | Note in dialogue context; flag in feedback |
| False friends | "bekommen" → "become" | Card "watch out" + exercise distractor |

## 6. Recovery strategies
- **Miss once:** kind feedback + correct answer + one-line *why*.
- **Miss twice:** auto-reveal + Emma micro-explanation offer; flag the item for extra SRS.
- **Never block.** Grammar is practiced, not gated. (Guided-not-Gated.)

## 7. Assumptions & trade-offs
- **Assumption:** most A1 patterns fit one table + 2–3 examples; complex morphology (cases) is spread across a unit, not one lesson.
- **Trade-off:** inductive discovery is slower per rule than direct instruction but yields better transfer and confidence; grammar-hungry learners get depth via Emma "Explain more" and the standalone Grammar reference.
- **Edge case:** exceptions (irregular verbs) are introduced as *whole forms* (memorized chunks) before the rule is generalized.
