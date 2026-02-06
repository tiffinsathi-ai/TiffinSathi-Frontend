# Fix: Duplicate entry 'SUB...' for key 'payments.UK7dlkg5hxn3mdha0gqt9mw8nxy'

## What’s wrong

When the user clicks **Proceed to Payment**, the backend calls `POST /api/subscriptions/edit/apply`.  
That flow **inserts** a new row into `payments` for the subscription.  
Your table has a **unique constraint** `UK7dlkg5hxn3mdha0gqt9mw8nxy` that already has a row for this `subscription_id` (or subscription_id + something), so the second INSERT fails with:

```text
Duplicate entry 'SUB202602A2898BC9' for key 'payments.UK7dlkg5hxn3mdha0gqt9mw8nxy'
```

So the apply endpoint returns **400** and the frontend shows that error.

---

## Fix (choose one)

### Option A – Allow multiple payments per subscription (recommended)

You must be able to have **more than one payment per subscription** (e.g. initial payment + edit payment).

1. **Inspect the constraint**

   In MySQL:

   ```sql
   SHOW CREATE TABLE payments;
   -- or
   SELECT CONSTRAINT_NAME, COLUMN_NAME
   FROM information_schema.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND CONSTRAINT_NAME = 'UK7dlkg5hxn3mdha0gqt9mw8nxy';
   ```

   You’ll see which column(s) are in `UK7dlkg5hxn3mdha0gqt9mw8nxy` (often `subscription_id` alone or `subscription_id` + `payment_type`).

2. **Drop the unique constraint**

   If the constraint is on `subscription_id` (only one payment per subscription ever):

   ```sql
   ALTER TABLE payments DROP INDEX UK7dlkg5hxn3mdha0gqt9mw8nxy;
   ```

   If it’s a composite unique (e.g. `subscription_id` + `payment_type`), same command.  
   Ensure you still have a **primary key** on `payments` (e.g. `payment_id`). Do **not** drop the primary key.

3. **Optional:** Add a normal (non-unique) index if you query by `subscription_id`:

   ```sql
   CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
   ```

After this, multiple rows per subscription are allowed and the duplicate-key error on apply should stop.

---

### Option B – Reuse existing PENDING EDIT payment (no DB change)

Keep the unique constraint but **don’t insert** a second payment for the same subscription when one already exists. **Update** the existing one instead.

In **SubscriptionEditService** (or wherever you create the edit payment in `applySubscriptionEdit`):

1. Before creating a new payment for the edit:
   - Find an existing payment for this subscription with `payment_type = 'EDIT'` and `payment_status = 'PENDING'` (or your equivalent).
2. If such a payment exists:
   - **Update** it (amount, `updated_at`, etc.) and link it to the current edit history. Do **not** insert.
3. If it does **not** exist:
   - **Insert** the new payment as you do now.

Pseudocode:

```java
// In applySubscriptionEdit, when you need to create/link payment:
Payment editPayment = paymentRepository
    .findBySubscriptionIdAndPaymentTypeAndPaymentStatus(
        subscriptionId, "EDIT", "PENDING"
    )
    .stream().findFirst().orElse(null);

if (editPayment != null) {
    editPayment.setAmount(additionalAmount);
    editPayment.setUpdatedAt(Instant.now());
    // set other fields as needed
    paymentRepository.save(editPayment);
} else {
    editPayment = new Payment(...);
    paymentRepository.save(editPayment);
}
```

Then your unique constraint can stay (e.g. one PENDING EDIT per subscription), and you won’t get a duplicate key on the second apply.

---

## Summary

- **Option A:** Drop `payments.UK7dlkg5hxn3mdha0gqt9mw8nxy` so multiple payments per subscription are allowed.
- **Option B:** Keep the constraint and in code **update** an existing PENDING EDIT payment instead of inserting a new one.

After applying one of these on the backend, **Proceed to Payment** should succeed (no more 400 from duplicate key).
