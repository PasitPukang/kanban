import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken'

/**
 * โครงสร้างข้อมูล (Payload) ที่เราฝังไว้ใน JWT Token
 */
export interface AuthUserPayload {
  userId: string
  email: string
  name?: string
  role?: 'SUPER_ADMIN' | 'USER'
}

/**
 * Custom Request Type เพื่อให้ TypeScript รู้จัก req.user ใน Controller ต่างๆ
 */
export interface AuthenticatedRequest extends Request { 
  user?: AuthUserPayload
}

// โหลด Secret Key จาก Environment Variable
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-clicknext-jwt-key-2026'

export const isSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false
  const clean = email.trim().toLowerCase()
  return (
    clean === 'pasitpukang1234567@gmail.com' ||
    clean === 'psitpukang1234567@gmail.com' ||
    clean === 'apsitpukang1234567@gmail.com'
  )
}

/**
 * Middleware: ตรวจสอบความถูกต้องของ JWT Token (บังคับ Login)
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access token missing or invalid format. Expected format: "Bearer <token>"'
    })
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required'
    })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & AuthUserPayload

    req.user = {
      userId: decoded.userId || (decoded as any).id,
      email: decoded.email,
      name: decoded.name,
      role: isSuperAdminEmail(decoded.email) ? 'SUPER_ADMIN' : (decoded.role || 'USER')
    }

    next()
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again.'
      })
      return
    }

    if (error instanceof JsonWebTokenError) {
      res.status(403).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Invalid authentication token. Verification failed.'
      })
      return
    }

    res.status(500).json({
      success: false,
      message: 'Internal authentication error',
      error: (error as Error).message
    })
  }
}

/**
 * Middleware: ตรวจสอบสิทธิ์ Super Admin เท่านั้น
 */
export const requireSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
    return
  }

  const isSuper = req.user.role === 'SUPER_ADMIN' || isSuperAdminEmail(req.user.email)

  if (!isSuper) {
    res.status(403).json({
      success: false,
      code: 'FORBIDDEN_SUPER_ADMIN_ONLY',
      message: 'Forbidden: Super Admin access required. Contact system administrator.'
    })
    return
  }

  next()
}

/**
 * Middleware: ทางเลือก (Optional Auth)
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & AuthUserPayload
    req.user = {
      userId: decoded.userId || (decoded as any).id,
      email: decoded.email,
      name: decoded.name,
      role: isSuperAdminEmail(decoded.email) ? 'SUPER_ADMIN' : (decoded.role || 'USER')
    }
  } catch {
    // Token invalid -> pass without req.user
  }

  next()
}

/**
 * Helper Function: ใช้สร้าง JWT Token สำหรับส่งให้ Client ตอน Login หรือ Register
 */
export const generateToken = (payload: AuthUserPayload, expiresIn: SignOptions['expiresIn'] = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}
