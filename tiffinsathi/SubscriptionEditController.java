// SubscriptionEditController.java
// Place this in your backend: src/main/java/com/tiffin_sathi/controller/SubscriptionEditController.java

package com.tiffin_sathi.controller;

import com.tiffin_sathi.dtos.EditSubscriptionRequestDTO;
import com.tiffin_sathi.dtos.EditSubscriptionResponseDTO;
import com.tiffin_sathi.dtos.PaymentInitiationRequest;
import com.tiffin_sathi.dtos.PaymentInitiationResponse;
import com.tiffin_sathi.services.SubscriptionEditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions/edit")
@CrossOrigin(origins = "*")
public class SubscriptionEditController {

    @Autowired
    private SubscriptionEditService subscriptionEditService;

    // Calculate edit price difference
    @PostMapping("/calculate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> calculateEditPrice(@RequestBody EditSubscriptionRequestDTO request,
                                                Authentication authentication) {
        try {
            String email = authentication.getName();
            EditSubscriptionResponseDTO response = subscriptionEditService.calculateEditPrice(request, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Apply subscription edit
    @PostMapping("/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> applySubscriptionEdit(@RequestBody EditSubscriptionRequestDTO request,
                                                   Authentication authentication) {
        try {
            String email = authentication.getName();
            EditSubscriptionResponseDTO response = subscriptionEditService.applySubscriptionEdit(request, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Initiate payment by modification/edit-history ID (used when frontend has modificationId from apply response)
    @PostMapping("/payment/initiate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentInitiationResponse> initiateModificationPayment(
            @RequestBody PaymentInitiationRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            PaymentInitiationResponse response = subscriptionEditService
                    .initiatePaymentByModificationId(request.getModificationId(), request.getPaymentMethod(), email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Process additional payment for edit by subscription ID (existing endpoint)
    @PostMapping("/{subscriptionId}/payment")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentInitiationResponse> processEditPayment(
            @PathVariable String subscriptionId,
            @RequestBody Map<String, Object> paymentRequest,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String paymentMethod = paymentRequest.get("paymentMethod") != null
                    ? paymentRequest.get("paymentMethod").toString()
                    : null;
            Double amount = null;
            if (paymentRequest.get("amount") != null) {
                Object a = paymentRequest.get("amount");
                amount = a instanceof Number ? ((Number) a).doubleValue() : Double.parseDouble(a.toString());
            }
            if (paymentMethod == null || amount == null) {
                return ResponseEntity.badRequest().build();
            }
            PaymentInitiationResponse response = subscriptionEditService
                    .processEditPayment(subscriptionId, email, paymentMethod, amount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get edit history for a subscription
    @GetMapping("/{subscriptionId}/history")
    @PreAuthorize("hasAnyRole('USER', 'VENDOR')")
    public ResponseEntity<?> getEditHistory(@PathVariable String subscriptionId,
                                            Authentication authentication) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(subscriptionEditService.getEditHistory(subscriptionId, email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
