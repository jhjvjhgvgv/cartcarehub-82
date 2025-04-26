
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_TOKEN);

export async function generateCartIcon() {
  return await hf.textToImage({
    inputs: 'A minimalist shopping cart icon, flat design, purple and dark purple colors, clean lines, vector style, simple background',
    model: 'stabilityai/stable-diffusion-xl-base-1.0'
  });
}

export async function generateCartPreview() {
  return await hf.textToImage({
    inputs: 'A modern warehouse with maintenance workers servicing shopping carts, soft purple and green colors, clean industrial setting, professional illustration',
    model: 'stabilityai/stable-diffusion-xl-base-1.0'
  });
}
