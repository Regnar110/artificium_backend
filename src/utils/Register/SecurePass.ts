import bcrypt from 'bcrypt'

export const SecurePass = async (unsecurePass:string):Promise<string> => {
    return await bcrypt.hash(unsecurePass,10);
}