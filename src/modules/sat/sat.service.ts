import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs-extra';
import * as path from 'path';
import { SplitAudioDto } from './dto/sat.dto';
@Injectable()
export class SatService {
    splitAudio(options: SplitAudioDto) {
        // 配置
        const LABEL_JSON_PATH = options.label_json_path; // mini-json 导出的路径
        const AUDIO_FILE_PATH = options.audio_file_path; // 你的大音频文件
        const OUTPUT_DIR = options.output_dir; // 切割后小片段的保存目录
        console.log('LABEL_JSON_PATH', LABEL_JSON_PATH);
        console.log('AUDIO_FILE_PATH', AUDIO_FILE_PATH);
        console.log('OUTPUT_DIR', OUTPUT_DIR);

        async function aggregatedSegments(OUTPUT_DIR: string) {
            await fs.ensureDir(OUTPUT_DIR);
            const newOutputFile = path.join(OUTPUT_DIR, 'aggregated_segments.json');
            // 读取打标数据
            const annotations = JSON.parse(await fs.readFile(LABEL_JSON_PATH, 'utf-8'));
            // 最终输出的片段列表

            // 遍历任务
            let task = annotations[0].annotations[0].result;
            const segmentsMap = new Map<string, any>();

            for (const item of task) {
                const id = item.id;
                const { start, end } = item.value;
                const key = id as string;

                if (!segmentsMap.has(key)) {
                    segmentsMap.set(key, {
                        id,
                        start,
                        end,
                        tool: [],
                        action: [],
                        position: [],
                        strength: [],
                        texture: [],
                        description: '' // 这里暂时留空，因为你给的 json 没看到描述字段
                    });
                }

                const seg = segmentsMap.get(key);

                // 根据 from_name 分类
                switch (item.from_name) {
                    case 'tool':
                        seg.tool.push(...(item.value.labels || []));
                        break;
                    case 'action':
                        seg.action.push(...(item.value.labels || []));
                        break;
                    case 'position':
                        seg.position.push(...(item.value.labels || []));
                        break;
                    case 'strength':
                        seg.strength.push(...(item.value.choices || []));
                        break;
                    case 'texture':
                        seg.texture.push(...(item.value.choices || []));
                        break;
                    case 'description':
                        seg.description = (item.value.text || []).join(' ');
                        break;
                    default:
                        // 不认识的 from_name 暂时忽略
                        break;
                }
            }

            const segments = Array.from(segmentsMap.values());
            // 保存为 json aggregated_segments.json 到文件
            fs.writeFileSync(newOutputFile, JSON.stringify(segments, null, 2));
            return newOutputFile;
        }
        async function main() {
            // 分割后的音频文件目录
            const splitAudioDir = path.join(OUTPUT_DIR, 'split_audio');
            // 分割后的音频文件元数据
            const splitMetadataFile = path.join(OUTPUT_DIR, 'split_metadata');
            await fs.ensureDir(splitAudioDir);
            await fs.ensureDir(splitMetadataFile);
            // 聚合后的标签数据JSON
            let aggregatedSegmentsFilePath = await aggregatedSegments(OUTPUT_DIR);
            // 读取打标数据
            const annotations = JSON.parse(await fs.readFile(aggregatedSegmentsFilePath, 'utf-8'));

            for (const region of annotations) {
                const start = region.start;
                const end = region.end;
                const duration = end - start;
                const tools = region.tool.join('+'); // 合并标签
                const action = region.action.join('+');
                const position = region.position.join('+');
                const texture = region.texture;
                const strength = region.strength;
                const description = region.description;
                const outputFileName = `cut_${region.id}.wav`;
                const outputPath = path.join(splitAudioDir, outputFileName);

                // 调用 ffmpeg 切割
                await new Promise((resolve, reject) => {
                    ffmpeg
                        .default(AUDIO_FILE_PATH)
                        .setStartTime(start)
                        .duration(duration)
                        .output(outputPath)
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });

                const metadata = {
                    prompt: `tools: ${tools}, actions: ${action}, position: ${position}, strength: ${strength}`,
                    seconds_start:0,
                    seconds_total: Math.floor(duration),
                    labels: `tools: ${tools}, actions: ${action}, position: ${position}, strength: ${strength}`
                };

                const metadataPath = path.join(splitMetadataFile, outputFileName.replace('.wav', '.json'));
                await fs.ensureDir(path.dirname(metadataPath));
                await fs.writeJson(metadataPath, metadata, { spaces: 2 });

                console.log(`切割并生成 metadata: ${outputFileName}`);
            }
            return ('处理完成！');
        }

       

        main().then(console.log).catch(console.error);
    }
}
