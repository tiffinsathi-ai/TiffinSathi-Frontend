# Backend changes for subscription edit payment

## 1. DTO (if not already present)

**PaymentInitiationRequest.java** – for `POST /api/subscriptions/edit/payment/initiate`:

```java
package com.tiffin_sathi.dtos;

public class PaymentInitiationRequest {
    private String modificationId;  // editHistoryId from apply response
    private String paymentMethod;  // ESEWA, KHALTI

    public String getModificationId() { return modificationId; }
    public void setModificationId(String modificationId) { this.modificationId = modificationId; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
```

## 2. SubscriptionEditService – new method

Add this method (and implement it similarly to `processEditPayment`, but look up by `editHistoryId` and use the linked payment):

```java
/**
 * Initiate payment for an existing edit (by edit-history/modification ID).
 * Returns payment URL and data for gateway redirect.
 */
PaymentInitiationResponse initiatePaymentByModificationId(String modificationId, String paymentMethod, String email);
```

Implementation idea:

- Load `SubscriptionEditHistory` by `modificationId` (or `editHistoryId`).
- Verify the edit belongs to the user (via subscription → user).
- Get the existing PENDING payment linked to that edit (or create one if your logic allows).
- Call your eSewa/Khalti initiation and return `PaymentInitiationResponse` (e.g. `paymentUrl`, `paymentData`).

## 3. Apply response – avoid circular JSON

In `applySubscriptionEdit`, ensure the returned `EditSubscriptionResponseDTO` does **not** hold full `Subscription` / `SubscriptionDay` entities. Map only:

- `editStatus`, `editHistoryId` (or `modificationId`), `additionalPayment` / `additionalPaymentAmount`, `refundAmount`, etc.

Do **not** put entities that have `subscription` ↔ `subscriptionDays` in the response, or add `@JsonIgnore` on the back-reference (e.g. `SubscriptionDay.subscription`).

## 4. Duplicate key on `payments`

Constraint `UK7dlkg5hxn3mdha0gqt9mw8nxy` is likely on `(subscription_id)` or `(subscription_id, payment_type)`. Either:

- **Option A:** Allow multiple rows per subscription (e.g. unique only on `payment_id`), or
- **Option B:** In the service, before inserting a new EDIT payment, find an existing PENDING EDIT payment for that subscription and **update** it instead of inserting.

After these changes, the controller file was updated to add `POST /payment/initiate` and to accept `amount` as number or string in `POST /{subscriptionId}/payment`.
