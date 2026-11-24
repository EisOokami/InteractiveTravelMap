export function geminiKeyStorageKey(userId: number): string {
    return `interactive-travel-map:gemini-key:user:${userId}`;
}

export function clearUserLocalData(userId: number): void {
    try {
        const keys: string[] = [];

        for (let index = 0; index < window.localStorage.length; index++) {
            const key = window.localStorage.key(index);

            if (
                key &&
                key.startsWith("interactive-travel-map:") &&
                key.endsWith(`:user:${userId}`)
            ) {
                keys.push(key);
            }
        }

        keys.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
        console.warn("Failed to clear user local data:", error);
    }
}
