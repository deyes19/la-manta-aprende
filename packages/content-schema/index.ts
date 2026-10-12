import { z } from "zod";
export const activitySchema = z
  .object({
    kind: z.enum(["number", "choice", "groups"]),
    prompt: z.string().min(1),
    answer: z.union([z.number().int().nonnegative(), z.string().min(1)]),
    explanation: z.string().min(1),
    choices: z.array(z.string()).optional(),
    objective: z.enum([
      "grupos_iguales",
      "suma_repetida",
      "multiplicacion",
      "problemas",
    ]),
  })
  .superRefine((a, c) => {
    if (a.kind === "choice" && !a.choices?.includes(String(a.answer)))
      c.addIssue({
        code: "custom",
        message: "La respuesta debe estar entre las opciones",
      });
    if (a.kind !== "choice" && typeof a.answer !== "number")
      c.addIssue({ code: "custom", message: "Respuesta numérica requerida" });
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
    ]),
    title: z.string().min(1),
    instruction: z.string().min(10),
    text: z.array(z.string()).default([]),
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
    if (s.activity?.kind === "groups" && !s.groups)
      c.addIssue({ code: "custom", message: "Falta representación de grupos" });
  });
export const unitSchema = z
  .object({
    id: z.string(),
    version: z.number().int().positive(),
    title: z.string(),
    grade: z.number().int().min(1).max(5),
    subject: z.string(),
    period: z.number().int().min(1).max(4),
    source: z.object({
      file: z.string(),
      locator: z.string(),
      status: z.enum(["PENDIENTE_FUENTE", "VALIDADO"]),
    }),
    curriculum: z.object({
      competence: z.string(),
      evidence: z.array(z.string()).min(1),
      dba: z.string().nullable(),
    }),
    steps: z.array(stepSchema).min(8),
  })
  .superRefine((u, c) => {
    const phases = new Set(u.steps.map((s) => s.phase));
    if (phases.size !== 8)
      c.addIssue({ code: "custom", message: "Se requieren los ocho momentos" });
    if (new Set(u.steps.map((s) => s.id)).size !== u.steps.length)
      c.addIssue({ code: "custom", message: "Identificadores duplicados" });
    const checks = u.steps.filter((s) => s.phase === "Demuestro lo aprendido");
    if (new Set(checks.map((s) => s.activity?.objective)).size !== 4)
      c.addIssue({ code: "custom", message: "Evaluar los cuatro objetivos" });
  });
export type Unit = z.infer<typeof unitSchema>;
export type Step = Unit["steps"][number];
