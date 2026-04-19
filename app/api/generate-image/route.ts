export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    // 🔥 1. Перевод через DeepSeek (OpenAI-совместимый API)
    const translateResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Translate user text to English for image generation. Only return translation, no explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const translateData = await translateResponse.json();

    const translatedText =
      translateData?.choices?.[0]?.message?.content || prompt;

    console.log("TRANSLATED:", translatedText);

    // 🔥 2. Генерация картинки
    const finalPrompt = `${translatedText}, ultra realistic, high quality, professional lighting, detailed, sharp focus`;

    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: finalPrompt,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
        }),
      }
    );

    const data = await response.json();

    console.log("STABILITY:", data);

    if (!data.artifacts) {
      return Response.json({ images: [], error: data });
    }

    return Response.json({
      images: data.artifacts.map(
        (img: any) => `data:image/png;base64,${img.base64}`
      ),
    });

  } catch (e) {
    console.error("ERROR:", e);
    return Response.json({ images: [] });
  }
}