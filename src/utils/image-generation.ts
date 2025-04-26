
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_TOKEN);

export async function generateCartIcon() {
  return await hf.textToImage({
    inputs: 'A minimalist shopping cart icon, flat design, purple and dark purple colors, clean lines, vector style, simple background, high resolution',
    model: 'stabilityai/stable-diffusion-xl-base-1.0'
  });
}

export async function generateCartPreview() {
  return await hf.textToImage({
    inputs: 'A professional dashboard screenshot showing cart management analytics, soft purple and green color palette, modern UI design with charts, graphs, and store information, clean and professional look',
    model: 'stabilityai/stable-diffusion-xl-base-1.0'
  });
}

