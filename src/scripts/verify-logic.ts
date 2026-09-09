import { PasswordUtil } from '../utils/password';
import { JwtUtil } from '../utils/jwt';
import { Role } from '@prisma/client';
import { registerSchema } from '../schemas/authSchemas';
import { recommendationPackQuerySchema } from '../schemas/recommendationSchemas';
import { submitQuizSchema } from '../schemas/quizSchemas';

async function runTests() {
  console.log('🧪 Starting Philosophy Recommendation Logic Verification...');

  // Test 1: Password Utility
  const rawPassword = 'SecretPassword123!';
  const hash = await PasswordUtil.hash(rawPassword);
  const match = await PasswordUtil.compare(rawPassword, hash);
  const falseMatch = await PasswordUtil.compare('WrongPassword', hash);
  if (!match || falseMatch) {
    throw new Error('PasswordUtil verification failed!');
  }
  console.log('✅ 1. PasswordUtil hashing and comparison passed.');

  // Test 2: JWT Access & Refresh Tokens
  const tokenPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'marcus@stoic.com',
    username: 'marcus',
    role: Role.USER,
  };
  const accessToken = JwtUtil.generateAccessToken(tokenPayload);
  const verifiedAccess = JwtUtil.verifyAccessToken(accessToken);
  if (verifiedAccess.userId !== tokenPayload.userId || verifiedAccess.role !== Role.USER) {
    throw new Error('JWT Access Token verification failed!');
  }

  const refreshToken = JwtUtil.generateRefreshToken({ userId: tokenPayload.userId });
  const verifiedRefresh = JwtUtil.verifyRefreshToken(refreshToken);
  if (verifiedRefresh.userId !== tokenPayload.userId) {
    throw new Error('JWT Refresh Token verification failed!');
  }
  console.log('✅ 2. JWT Access & Refresh Token generation and verification passed.');

  // Test 3: Zod Schemas
  const validRegister = registerSchema.safeParse({
    email: 'seneca@rome.it',
    username: 'seneca_philosopher',
    password: 'StoicWisdom123!',
  });
  if (!validRegister.success) {
    throw new Error('Register schema failed on valid input: ' + JSON.stringify(validRegister.error));
  }

  const invalidRegister = registerSchema.safeParse({
    email: 'not-an-email',
    username: 'ab', // too short
    password: '123', // too short
  });
  if (invalidRegister.success) {
    throw new Error('Register schema should have rejected invalid input!');
  }

  const packQuery = recommendationPackQuerySchema.safeParse({
    philosophy: 'stoicism',
    level: 'BEGINNER',
  });
  if (!packQuery.success) {
    throw new Error('Recommendation pack query schema failed: ' + JSON.stringify(packQuery.error));
  }

  const quizSubmission = submitQuizSchema.safeParse({
    answers: [
      {
        questionId: '123e4567-e89b-12d3-a456-426614174000',
        selectedOptionId: '123e4567-e89b-12d3-a456-426614174001',
      },
    ],
  });
  if (!quizSubmission.success) {
    throw new Error('Quiz submission schema failed: ' + JSON.stringify(quizSubmission.error));
  }
  console.log('✅ 3. Zod validation schemas passed all validation assertions.');

  console.log('\n🎉 ALL LOGIC AND ARCHITECTURAL UNIT CHECKS PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
