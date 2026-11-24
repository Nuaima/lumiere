import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/analyze-skin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { imageDataUrl } = (await request.json()) as { imageDataUrl: string };
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return Response.json({ error: "AI not configured" }, { status: 500 });
          if (!imageDataUrl?.startsWith("data:image/")) {
            return Response.json({ error: "Invalid image" }, { status: 400 });
          }

          const systemPrompt = `You are a board-certified dermatology + facial-aesthetics AI for the BeautyIQ platform. Analyze the user's selfie and return a STRICT JSON object via the report_skin tool. Be clinical, inclusive, kind, and culturally aware. Use the Monk Skin Tone Scale (1=lightest, 10=deepest). For clinical sub-scores, 0 = none/best, 100 = severe. For symmetry, evenness, hydration, radiance, beautyIQ: higher = better. Never refuse cosmetic analysis of a clearly visible human face. If the image is unclear, still provide best-effort estimates and lower the confidence score.`;

          const body = {
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  { type: "text", text: "Analyze this selfie and produce a complete BeautyIQ intelligence report including clinical sub-scores and facial geometry." },
                  { type: "image_url", image_url: { url: imageDataUrl } },
                ],
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "report_skin",
                  description: "Return structured skin + facial analysis.",
                  parameters: {
                    type: "object",
                    properties: {
                      monkTone: { type: "integer", description: "Monk Skin Tone 1-10" },
                      undertone: { type: "string", enum: ["warm", "cool", "neutral"] },
                      skinType: { type: "string", enum: ["dry", "oily", "combination", "normal"] },
                      concerns: {
                        type: "array",
                        items: { type: "string", enum: ["acne", "redness", "dullness", "pores", "dark-spots", "wrinkles", "dryness", "oiliness", "uneven-tone", "clear"] },
                      },
                      hydration: { type: "integer", description: "0-100 higher=better" },
                      evenness: { type: "integer", description: "0-100 higher=better" },
                      radiance: { type: "integer", description: "0-100 higher=better" },
                      clinical: {
                        type: "object",
                        description: "Clinical sub-scores 0-100, 0=none/best, 100=severe",
                        properties: {
                          acne: { type: "integer" },
                          pigmentation: { type: "integer" },
                          redness: { type: "integer" },
                          pores: { type: "integer" },
                          wrinkles: { type: "integer" },
                          darkCircles: { type: "integer" },
                        },
                        required: ["acne", "pigmentation", "redness", "pores", "wrinkles", "darkCircles"],
                      },
                      faceShape: { type: "string", enum: ["oval", "round", "square", "heart", "oblong", "diamond", "triangle"] },
                      eyeShape: { type: "string", enum: ["almond", "round", "hooded", "monolid", "upturned", "downturned"] },
                      lipShape: { type: "string", enum: ["full", "thin", "wide", "heart", "round", "balanced"] },
                      browShape: { type: "string", enum: ["arched", "straight", "rounded", "s-shaped", "angular"] },
                      symmetry: { type: "integer", description: "0-100 facial symmetry" },
                      beautyIQ: { type: "integer", description: "0-100 composite skin+facial harmony score" },
                      confidence: { type: "integer", description: "0-100" },
                      summary: { type: "string", description: "3-4 sentence personalized clinical analysis" },
                      amRoutine: { type: "array", items: { type: "string" }, description: "3-5 morning steps" },
                      pmRoutine: { type: "array", items: { type: "string" }, description: "3-5 evening steps" },
                      shadeFamily: { type: "string", description: "Recommended foundation shade family, e.g. 'warm beige 4N'" },
                    },
                    required: ["monkTone", "undertone", "skinType", "concerns", "hydration", "evenness", "radiance", "clinical", "faceShape", "eyeShape", "lipShape", "browShape", "symmetry", "beautyIQ", "confidence", "summary", "amRoutine", "pmRoutine", "shadeFamily"],
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "report_skin" } },
          };


          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!upstream.ok) {
            if (upstream.status === 429) return Response.json({ error: "Rate limit, try again shortly." }, { status: 429 });
            if (upstream.status === 402) return Response.json({ error: "AI credits exhausted. Add credits in workspace settings." }, { status: 402 });
            const t = await upstream.text();
            console.error("AI gateway error:", upstream.status, t);
            return Response.json({ error: "AI analysis failed" }, { status: 500 });
          }

          const data = await upstream.json();
          const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (!args) return Response.json({ error: "No analysis returned" }, { status: 500 });
          const parsed = JSON.parse(args);
          return Response.json(parsed);
        } catch (e) {
          console.error("analyze-skin error:", e);
          return Response.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
        }
      },
    },
  },
});
