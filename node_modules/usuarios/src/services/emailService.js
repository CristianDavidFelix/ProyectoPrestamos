const nodemailer = require('nodemailer');

const sendConfirmationEmail = async (email, nombre, link, password) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verifica tu cuenta',
            text: `Hola ${nombre},\n\nGracias por registrarte en nuestra plataforma. Aquí tienes tus credenciales:\n\nCorreo: ${email}\nContraseña: ${password}\n\nPor favor verifica tu cuenta haciendo clic en el siguiente enlace:\n${link}\n\nEste enlace expirará en 1 hora.\n\n¡Gracias por unirte!`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo de verificación enviado a ${email}`);
    } catch (error) {
        console.error('Error al enviar el correo:', error.message);
        throw new Error('No se pudo enviar el correo de verificación');
    }
};

module.exports = { sendConfirmationEmail };
