import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
export const GetResetPaswordUserIDByUsernameSchema = z.coerce.string().trim().min(1);
export type GetResetPaswordUserIDByUsernameDto = z.infer<typeof GetResetPaswordUserIDByUsernameSchema>;

export const ResetPasswordSchema = z.object({
    userid:z.coerce.number(),
    o_pw:z.string().trim().min(1),
    n_pd:z.string().trim().min(1),
    confirm_n_pw:z.string().trim().min(1)
});
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema){}