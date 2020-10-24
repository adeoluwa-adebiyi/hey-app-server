export interface BaseHasherSpec{
    hash(data: any): any;
}

export interface StringHasherSpec extends BaseHasherSpec{
    hash(data: string): any;
}

export interface VerifiableStringHasherSpec extends BaseHasherSpec{
    verify(hash: string ,data: string): Promise<boolean>;
}

export interface PasswordHasherSpec{
    hashPassword(password: string): Promise<string>;
    verifyPassword(hash: string, password: string): Promise<boolean>;
}