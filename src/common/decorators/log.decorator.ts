import { SetMetadata } from '@nestjs/common';
import { SAVE_LOG_KEY } from '../constants/auth.constant';

export const SaveLog = () => SetMetadata(SAVE_LOG_KEY, true);
