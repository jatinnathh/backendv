import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET || "development-access-secret-change-me";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "development-refresh-secret-change-me";

export async function createAccessToken(userId, role, expiresIn = "15m") {
    let exp = expiresIn;
    if (expiresIn === "expired") {
        exp = -3600; // 1 hour ago
    }

    return new Promise((resolve, reject) => {
        jwt.sign(
            { type: "access", role, sub: userId },
            accessSecret,
            { expiresIn: exp === -3600 ? undefined : exp },
            (err, token) => {
                if (err || !token) reject(err);
                else resolve(token);
            }
        );
    });
}

export async function createRefreshToken(userId, sid) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { type: "refresh", sid, sub: userId },
            refreshSecret,
            { expiresIn: "7d" },
            (err, token) => {
                if (err || !token) reject(err);
                else resolve(token);
            }
        );
    });
}

export async function verifyAccessToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, accessSecret, (err, decoded) => {
            if (err) return reject(err);
            if (decoded.type !== "access") return reject(new Error("Invalid token type"));
            resolve(decoded);
        });
    });
}

export async function verifyRefreshToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, refreshSecret, (err, decoded) => {
            if (err) return reject(err);
            if (decoded.type !== "refresh") return reject(new Error("Invalid token type"));
            resolve(decoded);
        });
    });
}
