 Here's an analysis of your application's subscription process for a hiring company, outlining the user and
  system flow:

  Core Components:


   * `companies` table: Stores company registration details, including a is_verified flag.
   * `billing_addresses` table: Stores billing information for each company.
   * `subscriptions` table: Records active and past subscriptions for companies.
   * `Pesapal`: The third-party payment gateway used for processing payments.
   * `subscriptionController.js`: Handles fetching plans, managing subscription status, and processing payment
      callbacks.
   * `billingController.js`: Manages company billing addresses.
   * `pesapalController.js`: Integrates with the Pesapal API for initiating payments.

  User/System Flow:


   1. Company Onboarding & Verification:
       * User: A hiring company registers and logs into the platform.
       * System: The company's account is created in the companies table.
       * System: The authenticateToken and requireVerification middleware ensure that only authenticated and
         verified companies can initiate subscription payments. (Verification likely involves an admin
         reviewing uploaded certificates, as indicated by is_verified and certificate_url in the companies
         table).


   2. Billing Address Setup:
       * User: The company user navigates to a billing section to provide or update their billing address
         details (e.g., email, phone, name, physical address).
       * System: The frontend sends a POST request to /api/billing.
       * System: billingController.upsertBillingAddress saves this information to the billing_addresses table,
          linked to the company's ID. This is a prerequisite for payment initiation.


   3. Viewing Subscription Plans:
       * User: The company user views available subscription plans (e.g., Monthly, Annual, Per Job).
       * System: The frontend sends a GET request to /api/subscription/plans.
       * System: subscriptionController.getSubscriptionPlans returns a list of hardcoded plans with their
         descriptions, prices, and features.


   4. Initiating Subscription Payment:
       * User: The company user selects a desired plan and proceeds to pay.
       * System: The frontend sends a POST request to /api/subscription/initiate (or
         /api/subscription/payment/initiate) with the chosen planType.
       * System (`pesapalController.submitOrder`):
           * Retrieves the company's billing address from the billing_addresses table.
           * Fetches the details of the selected plan (currently hardcoded).
           * Obtains an authentication token from Pesapal.
           * Constructs a payment request payload for Pesapal, including the amount, currency (UGX),
             description, and a callback_url (/api/subscription/callback).
           * Crucially, it inserts a new record into the `subscriptions` table with a `PENDING` status, the
             `company_id`, `plan_type`, and the `pesapal_tracking_id` (which maps to `pesapal_txn_id` in the
             database). This record is used for reconciliation.
           * Submits the order to Pesapal's API.
           * Returns a redirect_url received from Pesapal to the frontend.


   5. Pesapal Payment Gateway Interaction:
       * User: The company user is redirected to the Pesapal payment gateway (via the redirect_url) to
         complete the payment using their preferred method (e.g., mobile money, card).
       * Pesapal: After the user successfully completes the payment, Pesapal sends an Instant Payment
         Notification (IPN) to the callback_url provided by your application.


   6. Handling Payment Callback (IPN):
       * System (`subscriptionController.handleCallback`): Pesapal's IPN hits the POST
         /api/subscription/callback endpoint.
       * System:
           * It receives the OrderTrackingId, OrderNotificationType, and OrderMerchantReference from Pesapal.
           * If OrderNotificationType is "IPN" (indicating a successful payment notification), it updates the
             corresponding record in the subscriptions table from PENDING to ACTIVE using the
             OrderMerchantReference (which matches the pesapal_tracking_id stored earlier).
           * It sets the start_date and end_date for the subscription based on the plan_type.
           * A WebSocket notification is sent to the company, informing them of the subscription update.
           * If OrderNotificationType is not "IPN" (e.g., a redirect after payment), it redirects the user to
             a frontend payment-complete page.


   7. Subscription Activation and Status:
       * System: Once the subscriptions table record is ACTIVE, the company's subscription is live.
       * User: The company user can view their current subscription status.
       * System: The frontend sends a GET request to /api/subscription/current (or /api/subscription/status).
       * System (`subscriptionController.getCurrentSubscription`): Fetches the latest subscription for the
         company, determines its status (active, expired, none), and calculates remaining days.


   8. Job Posting (Post-Subscription):
       * User: With an active subscription, the company can now post jobs, which are linked to their
         company_id in the jobs table.

  Database Schema Overview:


   * `companies`: id (UUID), name, email, phone, country, password_hash, is_verified (BOOLEAN),
     certificate_url.
   * `billing_addresses`: id (UUID), company_id (FK to companies), email_address, phone_number, country_code,
     first_name, last_name, etc.
   * `subscriptions`: id (UUID), company_id (FK to companies), plan_type (e.g., 'monthly', 'annual',
     'per_job'), `start_date, end_date`, `is_active (BOOLEAN), auto_renew` (BOOLEAN), `pesapal_txn_id` (stores
      the Pesapal transaction ID).
   * `jobs`: company_id (FK to companies), and other job-related fields.


  This flow outlines how companies select plans, make payments via Pesapal, and how your system tracks and
  activates their subscriptions.

> Draw for me the flow diagram

✦

    1 graph TD
    2     A[Hiring Company User] --> B{JobPop Backend System};
    3
    4     subgraph JobPop Backend System
    5         B --> C[1. Company Registration/Login];
    6         C --> D[2. Billing Address Setup (src/controllers/billingController.js)];
    7         D --> E[3. View Subscription Plans (src/controllers/subscriptionController.js)];
    8         E --> F[4. Initiate Payment (src/controllers/pesapalController.js)];
    9         F --> G{Pesapal Payment Gateway};
   10     end
   11
   12     subgraph Pesapal Payment Gateway
   13         G --> H[5. User Completes Payment on Pesapal];
   14         H --> I[6. Pesapal Sends IPN Callback to JobPop Backend];
   15     end
   16
   17     subgraph JobPop Backend System
   18         I --> J[7. Handle Payment Callback (src/controllers/subscriptionController.js)];
   19         J --> K[8. Update Subscription Status to ACTIVE (subscriptions table)];
   20         K --> L[9. Send WebSocket Notification to Company];
   21         L --> M[10. Company Views Current Subscription Status];
   22         M --> N[11. Company Posts Jobs (if subscription is active)];
   23     end
   24
   25     N --> O[Job Posting Functionality];
   26
   27     style A fill:#f9f,stroke:#333,stroke-width:2px;
   28     style G fill:#ccf,stroke:#333,stroke-width:2px;


  Explanation of the Flow Diagram:


   * A (Hiring Company User): Represents the user interacting with the JobPop platform.
   * B (JobPop Backend System): The core application logic.
   * C (Company Registration/Login): The initial step where a company creates an account or logs in.
   * D (Billing Address Setup): The user provides their billing information, which is stored in the
     billing_addresses table via billingController.js. This is a prerequisite for payment.
   * E (View Subscription Plans): The user browses the available subscription plans, fetched by
     subscriptionController.js.
   * F (Initiate Payment): The user selects a plan, and the system, specifically pesapalController.js,
     prepares and sends the payment request to Pesapal. At this stage, a PENDING entry is created in the
     subscriptions table.
   * G (Pesapal Payment Gateway): The external payment service.
   * H (User Completes Payment on Pesapal): The user is redirected to Pesapal's interface to finalize the
     payment.
   * I (Pesapal Sends IPN Callback to JobPop Backend): After successful payment, Pesapal notifies your backend
      via an Instant Payment Notification (IPN) to the predefined callback URL.
   * J (Handle Payment Callback): Your subscriptionController.js receives and processes the IPN from Pesapal.
   * K (Update Subscription Status to ACTIVE): The subscriptions table is updated, changing the status of the
     relevant subscription from PENDING to ACTIVE, and setting start_date and end_date.
   * L (Send WebSocket Notification to Company): The system can optionally send a real-time notification to
     the company about their activated subscription.
   * M (Company Views Current Subscription Status): The user can check their active subscription details
     through subscriptionController.js.
   * N (Company Posts Jobs): With an active subscription, the company gains access to post jobs.
   * O (Job Posting Functionality): Represents the separate module for managing job postings, which is now
     accessible.
   * A (Hiring Company User): Represents the user interacting with the JobPop platform.
   * B (JobPop Backend System): The core application logic.
   * C (Company Registration/Login): The initial step where a company creates an account or logs in.
   * D (Billing Address Setup): The user provides their billing information, which is stored in the
     billing_addresses table via billingController.js. This is a prerequisite for payment.
   * E (View Subscription Plans): The user browses the available subscription plans, fetched by

here is the official pesapal documentation for making a payment #fetch https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest

here is the expected sample request from pesapal documentation while submitting a payment to pesapal  {
    "id": "AA1122-3344ZZ",
    "currency": "KES",
    "amount": 100.00,
    "description": "Payment description goes here",
    "callback_url": "https://www.myapplication.com/response-page",
    "redirect_mode": "",
    "notification_id": "fe078e53-78da-4a83-aa89-e7ded5c456e6",
    "branch": "Store Name - HQ",
    "billing_address": {
        "email_address": "john.doe@example.com",
        "phone_number": "0723xxxxxx",
        "country_code": "KE",
        "first_name": "John",
        "middle_name": "",
        "last_name": "Doe",
        "line_1": "Pesapal Limited",
        "line_2": "",
        "city": "",
        "state": "",
        "postal_code": "",
        "zip_code": ""
    }
}