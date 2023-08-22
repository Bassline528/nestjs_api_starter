import * as argon2 from "argon2";

export const hashData = async (data: string) => {
    return await argon2.hash(data);
};

export const compareHash = async (data: string, hash: string) => {
    return await argon2.verify(hash,data);
};
