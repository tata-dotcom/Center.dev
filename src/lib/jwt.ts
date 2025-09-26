import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars'
)

export async function signJWT(payload: Record<string, unknown>, expiresIn: string = '24h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { payload, error: null }
  } catch (error) {
    return { payload: null, error: error instanceof Error ? error.message : 'Invalid token' }
  }
}