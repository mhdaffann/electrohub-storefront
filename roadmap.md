# Authentication
- [x] Enable email authentication and secure stored profiles.
- [x] Build registration, login, password recovery, and protected account pages.
- [x] Update account navigation without changing the cart.
- [x] Verify sign-up, login errors, account page protection and cart survival in browser.
- [x] Verify signed-in account page, refresh persistence, logout and account protection in browser.
- [ ] GitHub connection: user must complete linking in Project settings → Git.

# Store database
- [x] Categories, products, orders and order items tables with secure access rules; seed current catalog.
- [x] Load categories and products from the database everywhere (shop, home, product page, cart, menus).
- [x] Profile management: edit full name on account page; show order history.
- [x] Email verification: resend confirmation from login (60s cooldown).
- [x] Fix menu/test build errors; verify homepage and menu in browser.

# Demo checkout (no Stripe account yet; no payments)
- [ ] Delivery form (name, phone, address) with validation; order summary with images and totals.
- [ ] "Place demo order" saves order + items server-side from database prices; no duplicates.
- [ ] Confirmation page; demo orders shown and labelled in My Account.
- [ ] Tests for order rules; browser check.
- [ ] Stripe checkout: waiting until the user has a Stripe account.
