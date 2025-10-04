package com.biccShop.controller;

import com.biccShop.model.Complaint;
import com.biccShop.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private static final Logger log = LoggerFactory.getLogger(ComplaintController.class);
    private final EmailService emailService;

    public ComplaintController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping(
        value = "/admin/notify",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> notifyAdmin(@RequestBody Complaint complaint) {
        log.debug("Received complaint: {}", complaint);
        String subject = "Nouvelle réclamation client";
        String body = """
            <b>Nouvelle réclamation reçue :</b><br>
            <b>Nom:</b> %s<br>
            <b>Email:</b> %s<br>
            <b>Adresse:</b> %s<br>
            <b>Sujet:</b> %s<br>
            <b>Description:</b> %s<br>
            """.formatted(
                nullToEmpty(complaint.getCustomerName()),
                nullToEmpty(complaint.getCustomerEmail()),
                nullToEmpty(complaint.getCustomerAddress()),
                nullToEmpty(complaint.getSubject()),
                nullToEmpty(complaint.getDescription())
            );

        emailService.sendHtml("biccmanager2025@gmail.com", subject, body);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification envoyée à l'admin");
        return ResponseEntity.ok(response);
    }

    private String nullToEmpty(String v) {
        return v == null ? "" : v;
    }
}