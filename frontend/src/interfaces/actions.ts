export interface IBaseZodErrors {
    [key: string]: string[] | undefined;
}

export interface IDetailsError {
    field: string;
    message: string;
}

export interface IBaseAction {
    zodErrors: IBaseZodErrors | null;
    status: "error" | "message" | "success" | null;
    message: string | null;
    error: string | null;
    details: IDetailsError[] | null;
    formData: FormData | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
}

export interface ILoginZodErrors extends IBaseZodErrors {
    identifier?: string[];
    password?: string[];
    tempToken?: string[];
    token?: string[];
    acceptTerms?: string[];
}

export interface IRegisterZodErrors extends IBaseZodErrors {
    username?: string[];
    email?: string[];
    password?: string[];
    terms?: string[];
}

export interface IUpdateProfileZodErrors extends IBaseZodErrors {
    username?: string[];
    email?: string[];
    currentPassword?: string[];
}

export interface IChangePasswordZodErrors extends IBaseZodErrors {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
}

export interface IForgotPasswordZodErrors extends IBaseZodErrors {
    email?: string[];
}

export interface IResetPasswordZodErrors extends IBaseZodErrors {
    newPassword?: string[];
    confirmPassword?: string[];
    id?: string[];
    token?: string[];
}

export interface IMfaEnableZodErrors extends IBaseZodErrors {
    token?: string[];
}

export interface IMfaDisableZodErrors extends IBaseZodErrors {
    password?: string[];
    token?: string[];
}

export interface IMfaRegenerateBackupCodesZodErrors extends IBaseZodErrors {
    password?: string[];
}

export interface IResendVerificationZodErrors extends IBaseZodErrors {
    email?: string[];
}

export interface IDeleteAccountZodErrors extends IBaseZodErrors {
    id?: string[];
    password?: string[];
    tempToken?: string[];
    code?: string[];
}

export interface ISetPasswordZodErrors extends IBaseZodErrors {
    newPassword?: string[];
    confirmPassword?: string[];
}

export interface IEmailCodeZodErrors extends IBaseZodErrors {
    tempToken?: string[];
    intent?: string[];
    code?: string[];
}

export interface ILoginAction extends IBaseAction {
    zodErrors: ILoginZodErrors | null;
}

export interface IRegisterAction extends IBaseAction {
    zodErrors: IRegisterZodErrors | null;
}

export interface IUpdateProfileAction extends IBaseAction {
    zodErrors: IUpdateProfileZodErrors | null;
}

export interface IChangePasswordAction extends IBaseAction {
    zodErrors: IChangePasswordZodErrors | null;
}

export interface IForgotPasswordAction extends IBaseAction {
    zodErrors: IForgotPasswordZodErrors | null;
}

export interface IResetPasswordAction extends IBaseAction {
    zodErrors: IResetPasswordZodErrors | null;
}

export interface IMfaEnableAction extends IBaseAction {
    zodErrors: IMfaEnableZodErrors | null;
}

export interface IMfaDisableAction extends IBaseAction {
    zodErrors: IMfaDisableZodErrors | null;
}

export interface IMfaRegenerateBackupCodesAction extends IBaseAction {
    zodErrors: IMfaRegenerateBackupCodesZodErrors | null;
}

export interface IResendVerificationAction extends IBaseAction {
    zodErrors: IResendVerificationZodErrors | null;
}

export interface IEmailCodeAction extends IBaseAction {
    zodErrors: IEmailCodeZodErrors | null;
}

export interface IDeleteAccountAction extends IBaseAction {
    zodErrors: IDeleteAccountZodErrors | null;
}

export interface ISetPasswordAction extends IBaseAction {
    zodErrors: ISetPasswordZodErrors | null;
}
