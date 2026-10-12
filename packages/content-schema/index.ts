import { z } from "zod";
export const activitySchema = z
  .object({
    kind: z.enum([
      "number",
      "choice",
      "groups",
      "text",
      "order",
      "decimal",
      "fraction",
    ]),
    prompt: z.string().min(1),
    answer: z.union([z.number().finite().nonnegative(), z.string().min(1)]),
    explanation: z.string().min(1),
    choices: z.array(z.string()).optional(),
    objective: z.string().regex(/^[a-z][a-z0-9_]*$/),
    acceptedAnswers: z.array(z.string().min(1)).optional(),
  })
  .superRefine((a, c) => {
    if (a.kind === "choice" && !a.choices?.includes(String(a.answer)))
      c.addIssue({
        code: "custom",
        message: "La respuesta debe estar entre las opciones",
      });
    if (
      ["number", "groups", "decimal", "fraction"].includes(a.kind) &&
      typeof a.answer !== "number"
    )
      c.addIssue({ code: "custom", message: "Respuesta numérica requerida" });
    if (["text", "order"].includes(a.kind) && typeof a.answer !== "string")
      c.addIssue({ code: "custom", message: "Respuesta textual requerida" });
    if (
      a.kind === "order" &&
      (!a.choices ||
        a.choices.length < 2 ||
        new Set(a.choices).size !== a.choices.length ||
        [...a.choices].sort().join("|") !==
          String(a.answer).split("|").sort().join("|"))
    )
      c.addIssue({
        code: "custom",
        message: "La secuencia debe contener cada elemento exactamente una vez",
      });
  });
export const stepSchema = z
  .object({
    id: z.string().min(1),
    phase: z.enum([
      "Hoy aprenderé",
      "Descubro",
      "Aprendo",
      "Mi cuaderno",
      "Practico",
      "Mi misión",
      "Demuestro lo aprendido",
      "Terminé",
      "Juego",
      "Arte",
      "Literatura",
      "Exploro",
    ]),
    title: z.string().min(1),
    instruction: z.string().min(10),
    text: z.array(z.string()).default([]),
    showDate: z.boolean().optional(),
    symbol: z.string().optional(),
    dictation: z.string().optional(),
    freePlay: z
      .object({ symbols: z.array(z.string()).min(1).max(10) })
      .optional(),
    visual: z
      .discriminatedUnion("kind", [
        z.object({
          kind: z.literal("fraction"),
          parts: z.number().int().min(2).max(12),
          selected: z.number().int().min(0).max(12),
        }),
        z.object({
          kind: z.literal("bars"),
          labels: z.array(z.string()).min(1),
          values: z.array(z.number().int().min(0).max(20)).min(1),
        }),
        z.object({
          kind: z.literal("shapes"),
          names: z.array(
            z.enum([
              "cubo",
              "prisma",
              "pirámide",
              "cono",
              "cilindro",
              "esfera",
            ]),
          ),
        }),
        z.object({ kind: z.literal("flag") }),
        z.object({
          kind: z.literal("grid"),
          rows: z.number().int().min(1).max(10),
          columns: z.number().int().min(1).max(10),
        }),
      ])
      .optional(),
    adjustableGroups: z.boolean().optional(),
    hint: z.string().min(1),
    groups: z
      .tuple([
        z.number().int().min(1).max(10),
        z.number().int().min(1).max(5),
        z.string(),
      ])
      .optional(),
    activity: activitySchema.optional(),
  })
  .superRefine((s, c) => {
    if (s.phase === "Mi cuaderno" && !s.text.length)
      c.addIssue({
        code: "custom",
        message: "Falta texto literal del cuaderno",
      });
    if (s.activity?.kind === "fraction" && s.visual?.kind !== "fraction")
      c.addIssue({
        code: "custom",
        message: "Faltan las partes iguales de la fracción",
      });
    if (
      s.visual?.kind === "bars" &&
      s.visual.labels.length !== s.visual.values.length
    )
      c.addIssue({
        code: "custom",
        message: "Datos y etiquetas del diagrama no coinciden",
      });
    if (s.activity?.kind === "groups" && !s.groups)
      c.addIssue({ code: "custom", message: "Falta representación de grupos" });
  });
export const unitSchema = z
  .object({
    id: z.string(),
    version: z.number().int().positive(),
    title: z.string(),
    grade: z.number().int().min(0).max(5),
    approach: z.enum(["primary", "preschool"]).default("primary"),
    subject: z.string(),
    period: z.number().int().min(1).max(4),
    source: z.object({
      file: z.string(),
      locator: z.string(),
      complementary: z
        .array(z.object({ file: z.string(), locator: z.string() }))
        .optional(),
      status: z.enum(["PENDIENTE_FUENTE", "FUENTE_CONSULTADA", "VALIDADO"]),
    }),
    curriculum: z.object({
      competence: z.string(),
      evidence: z.array(z.string()).min(1),
      dba: z.string().nullable(),
      learning: z.array(z.string()).optional(),
      themes: z.array(z.string()).optional(),
      objectives: z
        .array(z.string().regex(/^[a-z][a-z0-9_]*$/))
        .min(1)
        .optional(),
    }),
    metadata: z
      .object({
        materials: z.array(z.string()).optional(),
        pedagogicalStatus: z.enum(["PENDIENTE_REVISION", "APROBADO"]),
        note: z.string().optional(),
        pendingValidation: z.array(z.string()).optional(),
      })
      .optional(),
    steps: z.array(stepSchema).min(8),
  })
  .superRefine((u, c) => {
    const phases = new Set<string>(u.steps.map((s) => s.phase));
    if (
      u.approach === "primary" &&
      ![
        "Hoy aprenderé",
        "Descubro",
        "Aprendo",
        "Mi cuaderno",
        "Practico",
        "Mi misión",
        "Demuestro lo aprendido",
        "Terminé",
      ].every((p) => phases.has(p))
    )
      c.addIssue({ code: "custom", message: "Se requieren los ocho momentos" });
    if (new Set(u.steps.map((s) => s.id)).size !== u.steps.length)
      c.addIssue({ code: "custom", message: "Identificadores duplicados" });
    const checks = u.steps.filter((s) => s.phase === "Demuestro lo aprendido");
    if (
      u.approach === "primary" &&
      (!checks.length || checks.some((s) => !s.activity))
    )
      c.addIssue({
        code: "custom",
        message: "Se requiere evaluación con objetivos observables",
      });
    if (
      u.curriculum.objectives &&
      u.curriculum.objectives.some(
        (o) => !checks.some((s) => s.activity?.objective === o),
      )
    )
      c.addIssue({
        code: "custom",
        message: "Cada objetivo declarado requiere una comprobación",
      });
    if (
      u.approach === "preschool" &&
      (u.grade !== 0 ||
        phases.has("Mi cuaderno") ||
        !["Juego", "Arte", "Literatura", "Exploro"].every((p) => phases.has(p)))
    )
      c.addIssue({
        code: "custom",
        message:
          "Transición requiere actividades rectoras, sin copias de primaria",
      });
    if (u.grade === 0 && u.approach !== "preschool")
      c.addIssue({
        code: "custom",
        message: "Transición requiere enfoque preescolar",
      });
  });
export type Unit = z.infer<typeof unitSchema>;
export type Step = Unit["steps"][number];
