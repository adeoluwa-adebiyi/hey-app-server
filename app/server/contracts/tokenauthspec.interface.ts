export interface TokenAuthSpec{
    verify(tokenObject: any, handler?: any): boolean;
    generateToken(claims: any): string;
    generateRefreshToken(claims: any): string;
}