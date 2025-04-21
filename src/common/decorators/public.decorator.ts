import { SetMetadata } from '@nestjs/common';
import { ONLY_LOGIN_KEY, PUBLIC_KEY } from '../constants/auth.constant';

export const Public = () => SetMetadata(PUBLIC_KEY, true);
export const NeedLogin = () => SetMetadata(ONLY_LOGIN_KEY, true);
