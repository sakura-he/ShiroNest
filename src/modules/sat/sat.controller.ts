import { Public } from '@/common/decorators/public.decorator';
import { Controller, Post } from '@nestjs/common';
import { SatService } from './sat.service';

@Controller('sat')
export class SatController {
  constructor(private readonly satService: SatService) {}
  @Public()
  @Post('split_audio')
  // @Body() options: SplitAudioDto
  splitAudio() {
    let options = {
      label_json_path: '/Users/shironeko/Desktop/d/dataset/label.json',
      audio_file_path: '/Users/shironeko/Desktop/d/dataset/asmr.mp3',
      output_dir: '/Users/shironeko/Desktop/d/dataset/audio'
    };
    return this.satService.splitAudio(options);
  }
}
