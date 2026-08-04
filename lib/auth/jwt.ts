
// lib\auth\jwt.ts

import { SignJWT, jwtVerify } from "jose";

const accessSecret = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET!
);

const refreshSecret = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET!
);

export async function createAccessToken(
    userId: string,
    role: string,
    expiresIn = "15m"
) {
    let exp: number | string = expiresIn;
    if (expiresIn === "expired") {
        exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    }

    return new SignJWT({
        role,
        type: "access",
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(accessSecret);
}

export async function createRefreshToken(
    userId: string,
    sid: string
) {
    return new SignJWT({
        type: "refresh",
        sid,
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(refreshSecret);
}

export async function verifyAccessToken(
    token: string
) {
    const { payload } = await jwtVerify(
        token,
        accessSecret
    );

    if (payload.type !== "access") {
        throw new Error("Invalid token type");
    }

    return payload;
}

export async function verifyRefreshToken(
    token: string
) {
    const { payload } = await jwtVerify(
        token,
        refreshSecret
    );

    if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
    }

    return payload;
}