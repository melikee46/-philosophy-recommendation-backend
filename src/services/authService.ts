import { UserRepository } from '../repositories/userRepository';
import { PasswordUtil } from '../utils/password';
import { JwtUtil } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { RegisterInput, LoginInput } from '../schemas/authSchemas';
import { ErrorCodes } from '../constants/errorCodes';

export class AuthService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  async register(input: RegisterInput) {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw ApiError.conflict('Bu e-posta adresi ile zaten bir hesap mevcut');
    }

    const existingUsername = await this.userRepository.findByUsername(input.username);
    if (existingUsername) {
      throw ApiError.conflict('Bu kullanıcı adı zaten alınmış');
    }

    const passwordHash = await PasswordUtil.hash(input.password);

    const user = await this.userRepository.create({
      email: input.email.toLowerCase(),
      username: input.username,
      passwordHash,
    });

    const accessToken = JwtUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const refreshToken = JwtUtil.generateRefreshToken({
      userId: user.id,
    });

    // Hash and store refresh token for secure revocation and rotation
    const refreshTokenHash = await PasswordUtil.hash(refreshToken);
    await this.userRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByIdentifier(input.identifier);
    if (!user) {
      throw ApiError.unauthorized('Geçersiz e-posta/kullanıcı adı veya şifre');
    }

    const isMatch = await PasswordUtil.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Geçersiz e-posta/kullanıcı adı veya şifre');
    }

    const accessToken = JwtUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const refreshToken = JwtUtil.generateRefreshToken({
      userId: user.id,
    });

    const refreshTokenHash = await PasswordUtil.hash(refreshToken);
    await this.userRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = JwtUtil.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.refreshTokenHash) {
      throw ApiError.unauthorized('Geçersiz oturum', ErrorCodes.TOKEN_INVALID);
    }

    const isValidToken = await PasswordUtil.compare(refreshToken, user.refreshTokenHash);
    if (!isValidToken) {
      // Possible token reuse attempt - revoke refresh token
      await this.userRepository.updateRefreshTokenHash(user.id, null);
      throw ApiError.unauthorized('Yenileme tokenı geçersiz veya önceden kullanılmış', ErrorCodes.TOKEN_INVALID);
    }

    // Rotate tokens
    const newAccessToken = JwtUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const newRefreshToken = JwtUtil.generateRefreshToken({
      userId: user.id,
    });

    const newRefreshTokenHash = await PasswordUtil.hash(newRefreshToken);
    await this.userRepository.updateRefreshTokenHash(user.id, newRefreshTokenHash);

    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Kullanıcı bulunamadı');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
