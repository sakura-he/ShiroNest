import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
export const SplitAudioSchema = z.object({
    label_json_path: z.string(),
    audio_file_path: z.string(),
    output_dir: z.string()
});
export class SplitAudioDto extends createZodDto(SplitAudioSchema) {}