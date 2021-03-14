'use strict';
import nodemailer from 'nodemailer';

export async function sendMail(to: string, html: string) {
	/**
	 * Generate test SMTP service account from ethereal.email
	 */
	// let testAccount = await nodemailer.createTestAccount();
	/**
	 * create reusable transporter object using the default SMTP transport
	 */
	let transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false,
		auth: {
			user: 'h2te3ffh5z3nfp7v@ethereal.email',
			pass: 'RmcTXCAK1RqEsmdGuM'
		}
	});
	/**
	 * send mail with defined transport object
	 */
	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>',
		to,
		subject: 'Change password',
		html
	});
	console.log('Message sent: %s', info.messageId);
	/**
	 * Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	 */
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	/**
	 * Preview only available when sending through an Ethereal account
	 * Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	 */
}
