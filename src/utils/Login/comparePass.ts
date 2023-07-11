import bcrypt from 'bcrypt'
export const comparePass = async(client_pass:string, db_pass:string):Promise<boolean> => {
    const isPasswordMatch = await bcrypt.compare(client_pass, db_pass)
    return isPasswordMatch
}