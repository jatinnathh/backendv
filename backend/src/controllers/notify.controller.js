import nodemailer from "nodemailer";

const defaultGeo = {
    country: "Unknown",
    region: "Unknown",
    city: "Unknown",
    postal: "Unknown",
    latitude: "Unknown",
    longitude: "Unknown",
    timezone: "Unknown",
    isp: "Unknown",
    asn: "Unknown",
};

const geoCache = new Map();

export const notifyVisitor = async (req, res) => {
    try {
        const {
            event = "Stackview Page Visitor",
            details = "A visitor accessed your Stackview site.",
            scenario = "Page Visit Alert",
            result = "Success",
        } = req.body || {};

        const headers = req.headers;

        const ip = (headers["x-forwarded-for"] || "").split(",")[0].trim() ||
            headers["x-real-ip"] ||
            "Unknown";

        let geo = { ...defaultGeo };

        if (ip !== "Unknown" && ip !== "127.0.0.1" && ip !== "::1") {
            if (geoCache.has(ip)) {
                geo = geoCache.get(ip);
            } else {
                try {
                    const geoResponse = await fetch(
                        `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,zip,lat,lon,timezone,isp,as`,
                        { signal: AbortSignal.timeout(4000) }
                    );

                    const data = await geoResponse.json();

                    if (data.status === "success") {
                        geo = {
                            country: data.country ?? "Unknown",
                            region: data.regionName ?? "Unknown",
                            city: data.city ?? "Unknown",
                            postal: data.zip ?? "Unknown",
                            latitude: data.lat ?? "Unknown",
                            longitude: data.lon ?? "Unknown",
                            timezone: data.timezone ?? "Unknown",
                            isp: data.isp ?? "Unknown",
                            asn: data.as ?? "Unknown",
                        };
                        geoCache.set(ip, geo);
                    }
                } catch (err) {
                    console.error("[Notify API] Geo lookup failed:", err);
                }
            }
        }

        const visitor = {
            timestamp: new Date().toISOString(),
            event,
            scenario,
            result,
            ip,
            geo,
            userAgent: headers["user-agent"] ?? "Unknown",
            language: headers["accept-language"] ?? "Unknown",
            referer: headers["referer"] ?? "None",
            secFetchSite: headers["sec-fetch-site"] ?? "Unknown",
            secFetchMode: headers["sec-fetch-mode"] ?? "Unknown",
            secFetchDest: headers["sec-fetch-dest"] ?? "Unknown",
            secChUa: headers["sec-ch-ua"] ?? "Unknown",
            secChUaPlatform: headers["sec-ch-ua-platform"] ?? "Unknown",
            secChUaMobile: headers["sec-ch-ua-mobile"] ?? "Unknown",
            forwarded: headers["forwarded"] ?? "Unknown",
            host: headers["host"] ?? "Unknown",
            origin: headers["origin"] ?? "Unknown",
            accept: headers["accept"] ?? "Unknown",
            acceptEncoding: headers["accept-encoding"] ?? "Unknown",
            cacheControl: headers["cache-control"] ?? "Unknown",
        };

        console.log("[Notify API] Visitor info:", visitor);

        const textBody = `
New Visitor Alert

Time:
${new Date().toLocaleString()}

IP:
${ip}

Country:
${geo.country}

State:
${geo.region}

City:
${geo.city}

Postal:
${geo.postal}

Latitude:
${geo.latitude}

Longitude:
${geo.longitude}

Timezone:
${geo.timezone}

ISP:
${geo.isp}

ASN:
${geo.asn}

User-Agent:
${headers["user-agent"] ?? "Unknown"}

Language:
${headers["accept-language"] ?? "Unknown"}

Referer:
${headers["referer"] ?? "None"}

Platform:
${headers["sec-ch-ua-platform"] ?? "Unknown"}

Browser:
${headers["sec-ch-ua"] ?? "Unknown"}

Mobile:
${headers["sec-ch-ua-mobile"] ?? "Unknown"}

Event:
${event}

Scenario:
${scenario}

Result:
${result}

Details:
${details}
`;

        const senderEmail = process.env.SMTP_USER || process.env.SMTP_EMAIL;
        const rawPassword = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
        const senderPassword = rawPassword ? rawPassword.replace(/^"|"$/g, "") : "";
        const receiverEmail = process.env.NOTIFICATION_EMAIL || senderEmail;
        const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
        const smtpPort = Number(process.env.SMTP_PORT) || 465;

        if (!senderEmail || !senderPassword || !receiverEmail) {
            console.warn("[Notify API] Missing SMTP credentials in .env. Skipping email notification.");
            res.json({
                status: "skipped",
                reason: "No SMTP credentials found in .env",
                visitor,
            });
            return;
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: senderEmail,
                pass: senderPassword,
            },
        });

        const locationInfo = [geo.city, geo.country].filter((c) => c && c !== "Unknown").join(", ") || ip;
        const subject = `StackView Visitor Alert: ${event} (${locationInfo})`;

        const info = await transporter.sendMail({
            from: `"Stackview Alerts" <${senderEmail}>`,
            to: receiverEmail,
            subject: subject,
            text: textBody,
        });

        console.log("[Notify API] Message sent: %s", info.messageId);

        res.json({ status: "success", messageId: info.messageId, visitor });
    } catch (error) {
        console.error("[Notify API] Failed to send email:", error);
        res.status(500).json({ status: "error", error: String(error) });
    }
};
