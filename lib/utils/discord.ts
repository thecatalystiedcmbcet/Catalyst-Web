export interface DiscordLogPayload {
    action: string;
    entity_type: string;
    entity_id?: string;
    entity_name?: string;
    performed_by?: string;
    details?: string;
    status: "success" | "error";
}

/**
 * Sends a formatted embed to a Discord webhook.
 * Safe to call unconditionally — if DISCORD_WEBHOOK_URL is not set it is a no-op.
 */
export async function sendDiscordWebhook(payload: DiscordLogPayload): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    const color = payload.status === "success" ? 0x2ecc71 : 0xe74c3c;
    const statusEmoji = payload.status === "success" ? "✅" : "❌";

    const embed = {
        title: `${statusEmoji} ${payload.action}`,
        color,
        fields: [
            { name: "Entity Type", value: payload.entity_type, inline: true },
            { name: "Entity Name", value: payload.entity_name ?? "—", inline: true },
            { name: "Performed By", value: payload.performed_by ?? "system", inline: true },
            ...(payload.entity_id
                ? [{ name: "Entity ID", value: payload.entity_id, inline: true }]
                : []),
            ...(payload.details
                ? [{ name: "Details", value: payload.details, inline: false }]
                : []),
        ],
        footer: { text: "Catalyst Dashboard" },
        timestamp: new Date().toISOString(),
    };

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] }),
        });
    } catch (err) {
        // Never let a webhook failure break the main request
        console.warn("Discord webhook failed:", err);
    }
}
