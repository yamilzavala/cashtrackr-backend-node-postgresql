import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Confirm your account',
            html: `
                <p>Hello: ${user.name}, you have been created your CashTrackr account, it is almost ready, </p>
                <p> Visit the following link: </p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account<a/>  
                <p>enter code: <b>${user.token}</b></p>
            `
        })

        console.log(email)
    }

    static sendPasswordResetToken = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Restore your password',
            html: `
                <p>Hello: ${user.name}, you have been requested to restore your password</p>
                <p> Visit the following link: </p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Restore Password<a/>  
                <p>enter code: <b>${user.token}</b></p>
            `
        })

        console.log(email)
    }
}