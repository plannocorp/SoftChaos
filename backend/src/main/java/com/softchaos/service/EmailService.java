package com.softchaos.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@softchaos.local}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    /**
     * Envia email simples
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        log.info("Enviando email para: {}", to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);

            log.info("Email enviado com sucesso para: {}", to);
        } catch (Exception e) {
            log.error("Erro ao enviar email para: {}", to, e);
            throw new RuntimeException("Erro ao enviar email", e);
        }
    }

    /**
     * Envia email HTML
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        log.info("Enviando email HTML para: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);

            log.info("Email HTML enviado com sucesso para: {}", to);
        } catch (MessagingException e) {
            log.error("Erro ao enviar email HTML para: {}", to, e);
            throw new RuntimeException("Erro ao enviar email HTML", e);
        }
    }

    /**
     * Envia email de confirmação de newsletter
     */
    public void sendNewsletterConfirmationEmail(String to, String name, String token) {
        log.info("Enviando email de confirmação de newsletter para: {}", to);

        String confirmationUrl = frontendUrl + "/newsletter/confirm?token=" + token;

        String htmlContent = """
                <html>
                <body>
                    <h2>Bem-vindo ao Soft Chaos!</h2>
                    <p>Olá %s,</p>
                    <p>Obrigado por se inscrever na nossa newsletter!</p>
                    <p>Para confirmar sua inscrição, clique no link abaixo:</p>
                    <p><a href="%s">Confirmar Inscrição</a></p>
                    <p>Se você não se inscreveu, ignore este email.</p>
                    <br>
                    <p>Equipe Soft Chaos</p>
                </body>
                </html>
                """.formatted(name != null ? name : "Leitor", confirmationUrl);

        sendHtmlEmail(to, "Confirme sua inscrição - Soft Chaos", htmlContent);
    }

    /**
     * Envia email de boas-vindas após confirmação
     */
    public void sendWelcomeEmail(String to, String name) {
        log.info("Enviando email de boas-vindas para: {}", to);

        String htmlContent = """
                <html>
                <body>
                    <h2>Inscrição Confirmada!</h2>
                    <p>Olá %s,</p>
                    <p>Sua inscrição foi confirmada com sucesso!</p>
                    <p>Agora você receberá nossas novidades sobre publicidade, marketing e criatividade.</p>
                    <p>Acesse nosso blog: <a href="%s">%s</a></p>
                    <br>
                    <p>Equipe Soft Chaos</p>
                </body>
                </html>
                """.formatted(name != null ? name : "Leitor", frontendUrl, frontendUrl);

        sendHtmlEmail(to, "Bem-vindo ao Soft Chaos!", htmlContent);
    }

    /**
     * Envia newsletter para lista de emails
     */
    public void sendNewsletter(String subject, String htmlContent, java.util.List<String> recipients) {
        log.info("Enviando newsletter para {} destinatários", recipients.size());

        int successCount = 0;
        int errorCount = 0;

        for (String recipient : recipients) {
            try {
                sendHtmlEmail(recipient, subject, htmlContent);
                successCount++;
            } catch (Exception e) {
                log.error("Erro ao enviar newsletter para: {}", recipient, e);
                errorCount++;
            }
        }

        log.info("Newsletter enviada. Sucesso: {}, Erros: {}", successCount, errorCount);
    }

    /**
     * Envia notificação de novo comentário
     */
    public void sendNewCommentNotification(String articleTitle, String commentAuthor, String commentContent) {
        log.info("Enviando notificação de novo comentário no artigo: {}", articleTitle);

        String htmlContent = """
                <html>
                <body>
                    <h2>Novo Comentário</h2>
                    <p>Um novo comentário foi postado no artigo: <strong>%s</strong></p>
                    <p><strong>Autor:</strong> %s</p>
                    <p><strong>Comentário:</strong></p>
                    <p>%s</p>
                    <p>Acesse o painel administrativo para aprovar ou rejeitar.</p>
                </body>
                </html>
                """.formatted(articleTitle, commentAuthor, commentContent);

        // Envia para email do admin (configurar no application.properties)
        sendHtmlEmail(fromEmail, "Novo Comentário - Soft Chaos", htmlContent);
    }
}
