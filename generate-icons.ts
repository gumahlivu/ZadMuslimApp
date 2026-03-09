import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prayers = [
  { name: 'Fajr', prompt: 'A flat vector app icon for Fajr (dawn) prayer, minimalist, Islamic geometric art style, perfectly centered, solid dark blue and orange background, vibrant colors, UI icon design.' },
  { name: 'Sunrise', prompt: 'A flat vector app icon for Sunrise, minimalist, Islamic geometric art style, perfectly centered, solid light blue and yellow background, vibrant colors, UI icon design.' },
  { name: 'Dhuhr', prompt: 'A flat vector app icon for Dhuhr (midday) prayer, minimalist, Islamic geometric art style, perfectly centered, solid bright blue and gold background, vibrant colors, UI icon design.' },
  { name: 'Asr', prompt: 'A flat vector app icon for Asr (afternoon) prayer, minimalist, Islamic geometric art style, perfectly centered, solid warm orange background, vibrant colors, UI icon design.' },
  { name: 'Maghrib', prompt: 'A flat vector app icon for Maghrib (sunset) prayer, minimalist, Islamic geometric art style, perfectly centered, solid purple and orange background, crescent moon, vibrant colors, UI icon design.' },
  { name: 'Isha', prompt: 'A flat vector app icon for Isha (night) prayer, minimalist, Islamic geometric art style, perfectly centered, solid dark navy background, stars and moon, vibrant colors, UI icon design.' }
];

async function generate() {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  for (const p of prayers) {
    console.log(`Generating ${p.name}...`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: p.prompt,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "512px"
          }
        }
      });
      
      let found = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          fs.writeFileSync(`./public/${p.name}.png`, Buffer.from(base64Data, 'base64'));
          console.log(`Saved ${p.name}.png`);
          found = true;
          break;
        }
      }
      if (!found) console.log(`No image data found for ${p.name}`);
    } catch (e) {
      console.error(`Failed for ${p.name}:`, e);
    }
  }
}

generate();
