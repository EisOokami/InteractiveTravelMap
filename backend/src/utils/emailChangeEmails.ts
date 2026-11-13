import dotenv from "dotenv";
import { emailTemplate } from "./emailTemplate.js";
import { transporter } from "./email.js";

dotenv.config({ quiet: true });

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export async function sendEmailChangeApproval(
    username: string,
    currentEmail: string,
    newEmail: string,
    token: string,
): Promise<void> {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: currentEmail,
        subject: "Approve the email change for your account",
        html: emailTemplate({
            logo: "cid:app-logo",
            title: "Approve the email change",
            heading: `Hi, ${escapeHtml(username)}!`,
            description: `
                A request was made to change the email address of your account to <strong>${escapeHtml(newEmail)}</strong>.
                If it was you, open the link below within 24 hours and approve it. We will then send a confirmation link to the new address.
            `,
            buttonText: "Approve email change",
            buttonUrl: `${process.env.WEB_URL}/confirmEmailChange?token=${token}`,
            footer: "If this wasn't you, ignore this email and change your password. Your account keeps its current address.",
        }),
        attachments: [
            {
                filename: "logo.png",
                path: "./assets/generallogo.png",
                cid: "app-logo",
            },
        ],
    });
}

export async function sendEmailChangeConfirmation(
    username: string,
    newEmail: string,
    token: string,
): Promise<void> {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newEmail,
        subject: "Confirm your new email address",
        html: emailTemplate({
            logo: "cid:app-logo",
            title: "Confirm your new email address",
            heading: `Hi, ${escapeHtml(username)}!`,
            description: `
                You asked to use <strong>${escapeHtml(newEmail)}</strong> as the email address of your account.
                Open the link below within 24 hours to confirm it.
            `,
            buttonText: "Confirm email address",
            buttonUrl: `${process.env.WEB_URL}/confirmEmailChange?token=${token}`,
            footer: "If you did not request this change, ignore this email.",
        }),
        attachments: [
            {
                filename: "logo.png",
                path: "./assets/generallogo.png",
                cid: "app-logo",
            },
        ],
    });
}

export async function sendEmailChangedNotice(
    username: string,
    previousEmail: string,
    newEmail: string,
): Promise<void> {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: previousEmail,
        subject: "Your account email address was changed",
        html: emailTemplate({
            logo: "cid:app-logo",
            title: "Account email changed",
            heading: `Hi, ${escapeHtml(username)}!`,
            description: `The email address of your account was changed to <strong>${escapeHtml(newEmail)}</strong>. All sessions were signed out.`,
            footer: "If this wasn't you, contact us right away.",
        }),
        attachments: [
            {
                filename: "logo.png",
                path: "./assets/generallogo.png",
                cid: "app-logo",
            },
        ],
    });
}
