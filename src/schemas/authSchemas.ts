import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  username: z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir')
    .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  password: z
    .string()
    .min(12, 'Şifre en az 12 karakter olmalıdır')
    .refine(
      (password) => Buffer.byteLength(password, 'utf8') <= 72,
      'Şifre UTF-8 olarak en fazla 72 byte olabilir'
    ),
}).strict();

export const loginSchema = z.object({
  identifier: z.string().min(1, 'E-posta veya kullanıcı adı gereklidir'),
  password: z.string().min(1, 'Şifre gereklidir'),
}).strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Yenileme tokenı gereklidir'),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
