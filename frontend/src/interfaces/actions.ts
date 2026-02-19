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
}

export interface ILoginZodErrors extends IBaseZodErrors {
    identifier?: string[];
    password?: string[];
}

export interface IRegisterZodErrors extends IBaseZodErrors {
    username?: string[];
    email?: string[];
    password?: string[];
}

export interface ILoginAction extends IBaseAction {
    zodErrors: ILoginZodErrors | null;
}

export interface IRegisterAction extends IBaseAction {
    zodErrors: IRegisterZodErrors | null;
}
