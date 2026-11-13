import { IUserSession } from "@/interfaces/interfaces";
import { formatDistanceToNow } from "date-fns";

export function getSessionLabel(session: IUserSession) {
    if (!session.browser.name && !session.os.name && !session.device.model) {
        return "Unknown device";
    }

    return `${session.browser.name ?? "Unknown browser"} on ${session.device.model ?? session.os.name ?? "unknown device"}`;
}

export function getSessionActivity(session: IUserSession) {
    if (session.isCurrent) {
        return "Active now";
    }

    const date = new Date(session.lastUsedAt);

    return Number.isNaN(date.getTime())
        ? "Activity unavailable"
        : `Last active ${formatDistanceToNow(date, { addSuffix: true })}`;
}

export function formatSessionDate(value: string) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Unknown"
        : date.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          });
}
