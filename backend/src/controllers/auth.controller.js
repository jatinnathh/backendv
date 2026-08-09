import crypto from "crypto";
import { AuthService } from "../services/auth.service.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { createTrace } from "../utils/trace.js";

const DUMMY_HASH = "$2b$12$GCRGqNKKjJMGPpC.eZ3eC.5dd.zuMQ.LBgIW9fjq.qYrGXFvrUciO";

export const register = async (req, res, next) => {
    const { trace, add } = createTrace();
    add("validation", { status: "active" });

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            add("validation", { success: false, result: "Missing fields" });
            return res.status(400).json({ error: "name , email and password are required" });
        }
        if (password.length < 8) {
            add("validation", { success: false, result: "Password too short" });
            return res.status(400).json({ error: "password len must be more than 8 " });
        }

        add("validation", { success: true });

        add("normalize_email", { status: "active" });
        const normalizedEmail = email.trim().toLowerCase();
        add("normalize_email", { before: email, after: normalizedEmail });

        add("database_lookup", { status: "active" });
        const dbLookupStart = Date.now();
        const existingUser = await AuthService.findUserByEmail(normalizedEmail);
        const dbLookupEnd = Date.now();

        if (existingUser) {
            add("database_lookup", {
                operation: "User.findUnique",
                found: true,
                durationMs: dbLookupEnd - dbLookupStart,
            });
            return res.status(409).json({ error: "user already exits" });
        }

        add("database_lookup", {
            operation: "User.findUnique",
            found: false,
            durationMs: dbLookupEnd - dbLookupStart,
        });

        add("password_hash", { status: "active" });
        const hashStart = Date.now();
        const passwordHash = await hashPassword(password);
        const hashEnd = Date.now();
        add("password_hash", {
            algorithm: "bcrypt",
            cost: 12,
            durationMs: hashEnd - hashStart,
        });

        add("database_insert", { status: "active" });
        const insertStart = Date.now();
        
        const user = await AuthService.createUser({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash
        });
        
        const insertEnd = Date.now();
        add("database_insert", {
            operation: "User.create",
            success: true,
            durationMs: insertEnd - insertStart,
        });

        res.status(201).json({
            message: "User created successfully",
            user,
            trace,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { trace, add } = createTrace();
    add("validation", { status: "active" });

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            add("validation", { success: false, result: "Missing fields" });
            return res.status(400).json({ error: "Email and password are required" });
        }

        add("validation", { success: true });

        add("normalize_email", { status: "active" });
        const normalizedEmail = email.trim().toLowerCase();
        add("normalize_email", { before: email, after: normalizedEmail });

        add("database_lookup", { status: "active" });
        const dbLookupStart = Date.now();
        const user = await AuthService.findUserByEmail(normalizedEmail);
        const dbLookupEnd = Date.now();

        if (!user) {
            add("database_lookup", {
                operation: "User.findUnique",
                found: false,
                durationMs: dbLookupEnd - dbLookupStart,
            });
            return res.status(401).json({ error: "Invalid email or password" });
        }

        add("database_lookup", {
            operation: "User.findUnique",
            found: true,
            durationMs: dbLookupEnd - dbLookupStart,
        });

        add("password_verification", { status: "active" });
        const passVerifyStart = Date.now();
        const passwordValid = await verifyPassword(password, user.passwordHash);
        const passVerifyEnd = Date.now();

        if (!passwordValid) {
            add("password_verification", {
                algorithm: "bcrypt",
                matched: false,
                durationMs: passVerifyEnd - passVerifyStart,
            });
            return res.status(401).json({ error: "Invalid email or password", trace });
        }

        add("password_verification", {
            algorithm: "bcrypt",
            matched: true,
            durationMs: passVerifyEnd - passVerifyStart,
        });

        add("access_token_generation", { status: "active" });
        const accessToken = await createAccessToken(user.id, user.role);
        add("access_token_generation", {
            expiresIn: "15m",
            payload: { sub: user.id, role: user.role, type: "access" },
        });

        add("refresh_token_generation", { status: "active" });
        const sid = crypto.randomUUID();
        const refreshToken = await createRefreshToken(user.id, sid);
        add("refresh_token_generation", { expiresIn: "7d" });

        add("session_insert", { status: "active" });
        const sessionInsertStart = Date.now();

        const refreshTokenHash = await hashPassword(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await AuthService.createSession(user.id, sid, refreshTokenHash, expiresAt);
        
        const sessionInsertEnd = Date.now();
        add("session_insert", {
            operation: "Session.create",
            success: true,
            durationMs: sessionInsertEnd - sessionInsertStart,
        });

        add("set_cookie", { status: "active" });
        add("set_cookie", {
            attributes: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 604800,
            },
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7 * 1000,
            path: "/",
        });

        res.json({
            message: "Login successful",
            trace,
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    const { trace, add } = createTrace();

    try {
        add("read_cookie", { status: "active" });
        const refreshTokenValue = req.cookies?.refreshToken;

        if (!refreshTokenValue) {
            add("read_cookie", { success: false, result: "Missing refresh cookie" });
            return res.status(401).json({ error: "No refresh token provided", trace });
        }

        add("read_cookie", { success: true, result: "Found refreshToken" });

        add("verify_jwt", { status: "active" });
        let payload;
        try {
            payload = await verifyRefreshToken(refreshTokenValue);
        } catch (error) {
            add("verify_jwt", { success: false, result: "Invalid or expired JWT" });
            return res.status(401).json({ error: "Invalid refresh token", trace });
        }
        add("verify_jwt", { success: true, payload });

        add("delete_session", { status: "active" });
        try {
            await AuthService.deleteSession(payload.sid);
            add("delete_session", { success: true });
        } catch (error) {
            add("delete_session", { success: false, result: "Session not found or already deleted" });
        }

        add("clear_cookie", { status: "active" });
        res.clearCookie("refreshToken", { path: "/" });
        add("clear_cookie", { success: true });

        res.json({
            message: "Logged out successfully",
            trace,
        });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    const { trace, add } = createTrace();

    try {
        add("read_cookie", { status: "active" });
        const refreshTokenValue = req.cookies?.refreshToken;

        if (!refreshTokenValue) {
            add("read_cookie", { success: false, result: "Missing refresh cookie" });
            return res.status(401).json({ error: "No refresh token provided", trace });
        }

        add("read_cookie", { success: true, result: "Found refreshToken" });

        add("verify_jwt", { status: "active" });
        let payload;
        try {
            payload = await verifyRefreshToken(refreshTokenValue);
        } catch (error) {
            add("verify_jwt", { success: false, result: "Invalid or expired JWT" });
            return res.status(401).json({ error: "Invalid refresh token", trace });
        }
        add("verify_jwt", { success: true, payload });

        add("find_session", { status: "active" });
        const session = await AuthService.findSessionById(payload.sid);

        if (!session) {
            add("find_session", { success: false, result: "No session found" });
            return res.status(401).json({ error: "Session not found", trace });
        }
        add("find_session", { success: true, sessionId: session.id });

        add("verify_hash", { status: "active" });
        const isValid = await verifyPassword(refreshTokenValue, session.refreshTokenHash);

        if (!isValid) {
            add("verify_hash", { success: false, result: "Token hash mismatch" });
            return res.status(401).json({ error: "Invalid refresh token", trace });
        }
        add("verify_hash", { success: true, result: "Hash matched" });

        add("generate_access_token", { status: "active" });
        const user = await AuthService.findUserById(payload.sub);

        if (!user) {
            add("generate_access_token", { success: false, result: "User not found" });
            return res.status(401).json({ error: "User not found", trace });
        }

        const accessToken = await createAccessToken(user.id, user.role);
        add("generate_access_token", { success: true, expiresIn: "15m" });

        res.json({
            message: "Token refreshed successfully",
            accessToken,
            trace,
        });
    } catch (error) {
        next(error);
    }
};

export const protectedRoute = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication failed" });
    }

    res.json({
        message: "Protected resource accessed",
        user: req.user
    });
};

export const generateLabToken = async (req, res) => {
    try {
        const { expiresIn } = req.body;
        const allowedExpiry = ["5s", "10s", "30s", "1m", "expired"];

        if (!allowedExpiry.includes(expiresIn)) {
            return res.status(400).json({ error: "Invalid lab configuration" });
        }

        const token = await createAccessToken("demo-user", "USER", expiresIn);

        res.json({
            token,
            expiresIn,
        });
    } catch {
        res.status(500).json({ error: "Failed to generate token" });
    }
};

export const timingLab = async (req, res) => {
    try {
        const { email, protectionOn, password = "wrongpassword" } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const start = Date.now();

        const dbLookupStart = Date.now();
        let user = await AuthService.findUserByEmail(email.trim().toLowerCase());

        if (!user && email === "timing-demo@backendvisualizer.dev") {
            user = await AuthService.createUser({
                email: "timing-demo@backendvisualizer.dev",
                passwordHash: DUMMY_HASH,
                name: "Demo User",
                role: "USER",
            }); 
        }
        const dbLookupDuration = Date.now() - dbLookupStart;

        const hashStart = Date.now();
        let hashDuration = 0;

        if (user) {
            const passToVerify = user.passwordHash || DUMMY_HASH; 
            await verifyPassword(password, passToVerify);
            hashDuration = Date.now() - hashStart;
        } else if (protectionOn) {
            await verifyPassword(password, DUMMY_HASH);
            hashDuration = Date.now() - hashStart;
        } else {
            hashDuration = 0;
        }

        const totalDuration = Date.now() - start;

        res.json({
            email,
            exists: !!user,
            dbLookupDuration,
            hashDuration,
            totalDuration,
            protectionOn,
        });
    } catch (error) {
        console.error("Timing lab error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const seedLab = async (req, res) => {
    try {
        const email = "timing-demo@backendvisualizer.dev";
        const password = "timing-demo-password";

        const hash = await hashPassword(password);

        await AuthService.upsertUser(email, hash, "Demo User");
        const dummyHash = await hashPassword("dummy_password");

        res.json({ message: "Seeded", dummyHash });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ error: "Failed to seed" });
    }
};
