package com.litevar.ihub.common.core.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * @author uncle
 * @since 2024/8/2 14:25
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MailSendUtil {

    private final JavaMailSenderImpl mailSender;

    @Async
    public void send(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        message.setFrom(mailSender.getUsername());
        mailSender.send(message);
    }

    @Async
    public void sendHtml(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom(mailSender.getUsername());
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email", e);
        }
    }
}
