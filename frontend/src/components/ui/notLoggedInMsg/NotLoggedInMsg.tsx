import Link from "next/link";
import { Info } from "lucide-react";

import { Button } from "../shadcn/button";

interface NotLoggedInMsgProps {
    message: string;
}

export default function NotLoggedInMsg({
    message,
}: Readonly<NotLoggedInMsgProps>) {
    return (
        <div className="absolute flex flex-col items-center justify-center w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full p-8 text-center bg-white dark:bg-dark-mode-black z-[1999] transition-colors">
            <Info className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                You are not logged in
            </h3>
            <p className="mb-4 max-w-xs text-sm text-gray-600 dark:text-gray-400">
                {message}
            </p>
            <Button
                asChild
                className="text-white bg-bright-blue hover:bg-blue-600"
                size="lg"
            >
                <Link href="/signIn">Sign in</Link>
            </Button>
        </div>
    );
}
