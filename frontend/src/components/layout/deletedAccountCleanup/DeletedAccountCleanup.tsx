"use client";

import { useEffect } from "react";
import { clearUserLocalData } from "@/libs/localData";

export default function DeletedAccountCleanup({
    userId,
}: Readonly<{ userId: number }>) {
    useEffect(() => {
        clearUserLocalData(userId);

        document.cookie = "deletedAccountId=; Max-Age=0; path=/";
    }, [userId]);

    return null;
}
