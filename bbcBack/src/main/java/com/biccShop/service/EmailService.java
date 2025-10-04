package com.biccShop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


        @Autowired
	JavaMailSender mailer;

	@Async
	public void sendEmail(String to, String subject, String body) {
		SimpleMailMessage m = new SimpleMailMessage();
		m.setFrom(".");
		m.setTo(to);
		m.setSubject(subject);
		m.setText(body);

		mailer.send(m);
	}

	@Async
	public void sendContentEmail(String to, String subject, String body) {
		MimeMessage m = mailer.createMimeMessage();
		try {
			m.setFrom("humarchive1@gmail.com");
			m.setRecipient(Message.RecipientType.TO, new InternetAddress(to, false));
			m.setSubject(subject);
			m.setContent(body, "text/html");
		} catch (AddressException e) {
			e.printStackTrace();
		} catch (MessagingException e) {
			e.printStackTrace();
		}
		mailer.send(m);
	}
    public void sendHtml(String to, String subject, String htmlBody) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlBody, true); // true = HTML
                mailSender.send(message);
                log.info("Email sent to {}", to);
            } catch (MessagingException e) {
                log.error("Failed to build email", e);
                throw new IllegalStateException("Email build error", e);
            } catch (Exception ex) {
                log.error("Failed to send email", ex);
                throw new IllegalStateException("Email send error", ex);
            }
        }


    }




