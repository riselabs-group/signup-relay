export interface TranslationDictionary {
  dir: 'ltr' | 'rtl';
  lang: 'en' | 'fa';
  app_title: string;
  nav_home: string;
  nav_share: string;
  nav_apps: string;
  nav_docs: string;
  index_title: string;
  index_subtitle: string;
  tab_instant: string;
  tab_custom: string;
  index_generate: string;
  index_open_dc: string;
  index_copy_link: string;
  index_copied: string;
  index_dc_not_installed: string;
  index_manual_title: string;
  index_manual_step1: string;
  index_manual_step2: string;
  index_manual_step3: string;
  index_ios_title: string;
  index_ios_path: string;
  status_online: string;
  status_offline: string;
  step_1_personalize: string;
  step_2_activate: string;
  altcha_verifying: string;
  altcha_verified: string;
  altcha_failed: string;
  altcha_click_to_verify: string;
  btn_submit: string;
  footer_fs_statement: string;
  footer_powered_by: string;
  footer_version: string;
  apps_title: string;
  apps_subtitle: string;
  apps_security_title: string;
  apps_security_desc: string;
  apps_search_placeholder: string;
  apps_no_results: string;
  share_title: string;
  share_display_name: string;
  share_handle_label: string;
  share_copy_invite: string;
  share_native_button: string;
  wizard_username_label: string;
  wizard_password_label: string;
  wizard_password_optional: string;
  wizard_password_show: string;
  wizard_password_hide: string;
  wizard_success_badge: string;
  wizard_reset_btn: string;
  app_details: string;
  app_add_to_chat: string;
  app_close: string;
  validation_username_format: string;
  validation_username_instant: string;
  validation_username_length: string;
  validation_username_dc_prefix: string;
  validation_username_reserved: string;
  validation_username_dots: string;
  validation_username_chars: string;
  validation_password_length: string;
  validation_password_upper: string;
  validation_password_lower: string;
  validation_password_digit: string;
  validation_password_symbol: string;
  validation_password_chars: string;
  validation_password_username: string;
  error_create_account: string;
  error_deltachat_disabled: string;
  error_not_found: string;
  error_method_not_allowed: string;
  error_registration_closed: string;
  error_instant_accounts_disabled: string;
  error_custom_accounts_disabled: string;
  error_invalid_password: string;
  error_invalid_password_hash: string;
  error_invalid_domain: string;
  error_invalid_domain_not_configured: string;
  error_invalid_domain_not_found: string;
  error_invalid_domain_no_name: string;
  error_altcha_required: string;
  error_altcha_invalid: string;
  error_altcha_replay: string;
  error_bad_request: string;
  error_bad_request_body: string;
  error_internal: string;
  error_account_exists: string;
  error_unsupported_hash: string;
  error_endpoints_not_configured: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_create_account: string;
  hero_tag_e2e: string;
  hero_tag_notracking: string;
  hero_tag_federated: string;
  card_calls_title: string;
  card_calls_desc: string;
  card_storage_title: string;
  card_storage_desc: string;
  card_security_title: string;
  card_security_desc: string;
  card_focus_title: string;
  card_focus_desc: string;
  [key: string]: string;
}

export const en: TranslationDictionary = {
  dir: 'ltr',
  lang: 'en',
  app_title: 'ChatChi',
  nav_home: 'Home',
  nav_share: 'Share ID',
  nav_apps: 'WebXDC Apps',
  nav_docs: 'Docs',
  index_title: 'ChatChi Relay',
  index_subtitle: 'Secure, decentralized communication for DeltaChat.',
  tab_instant: 'Instant Setup',
  tab_custom: 'Custom Account',
  index_generate: 'Create New Account',
  index_open_dc: 'Open DeltaChat',
  index_copy_link: 'Copy Link',
  index_copied: 'Copied to clipboard!',
  index_dc_not_installed: 'DeltaChat was not detected. Please install the app or use the copy link button.',
  index_manual_title: 'Manual setup instructions:',
  index_manual_step1: 'In DeltaChat, tap "Create new profile".',
  index_manual_step2: 'Select "Use Other Server".',
  index_manual_step3: 'Scan invitation code or tap "Paste from clipboard".',
  index_ios_title: 'iOS (iPhone) setup guide:',
  index_ios_path: 'New account > Use Other Server > Scan > Paste',
  status_online: 'Online',
  status_offline: 'Offline',
  step_1_personalize: '1. Personalization',
  step_2_activate: '2. Activation',
  altcha_verifying: 'Verifying challenge...',
  altcha_verified: 'Verified',
  altcha_failed: 'Verification failed. Please retry.',
  altcha_click_to_verify: 'I am not a robot',
  btn_submit: 'Create Custom Mailbox',
  footer_fs_statement: 'This is a server for communication with DeltaChat.',
  footer_powered_by: 'Powered by ChatChi for use with DeltaChat.',
  footer_version: 'Version 0.02.1',
  apps_title: 'WebXDC App Store',
  apps_subtitle: 'Independent mini-apps to run inside DeltaChat chats',
  apps_security_title: 'WebXDC Apps Security Notice',
  apps_security_desc: 'WebXDC files are application code running in a sandbox on your device. Only open apps from trusted sources and never run unknown files in chat.',
  apps_search_placeholder: 'Search apps...',
  apps_no_results: 'No applications found matching your search.',
  share_title: 'Create DeltaChat Contact Share Card',
  share_display_name: 'Display Name',
  share_handle_label: 'Email or DeltaChat Address',
  share_copy_invite: 'Copy Invite Link',
  share_native_button: 'Share',
  wizard_username_label: 'Desired Username',
  wizard_password_label: 'Password (optional)',
  wizard_password_optional: 'Leave empty to generate one',
  wizard_password_show: 'Show password',
  wizard_password_hide: 'Hide password',
  wizard_success_badge: 'Account successfully created!',
  wizard_reset_btn: 'Create Another Account',
  app_details: 'Details',
  app_add_to_chat: 'Add to Chat',
  app_close: 'Close',
  validation_username_format: 'Invalid username',
  validation_username_instant: 'Invalid username: Instant username must match dc_ + 12 hex chars',
  validation_username_length: 'Invalid username: Username must be between 3 and 32 characters',
  validation_username_dc_prefix: "Invalid username: Username prefix 'dc_' is reserved for instant accounts",
  validation_username_reserved: 'Invalid username: Username is reserved',
  validation_username_dots: 'Invalid username: Username cannot start/end with dot or contain consecutive dots',
  validation_username_chars: 'Invalid username: Username contains invalid characters',
  validation_password_length: 'Password must be at least 12 characters',
  validation_password_upper: 'Password must include an uppercase letter',
  validation_password_lower: 'Password must include a lowercase letter',
  validation_password_digit: 'Password must include a digit',
  validation_password_symbol: 'Password must include one of - _ .',
  validation_password_chars: 'Password may only use letters, digits, and - _ .',
  validation_password_username: 'Password must not match the username',
  error_create_account: 'Failed to create account',
  error_deltachat_disabled: 'DeltaChat module is disabled',
  error_not_found: 'Not found: Endpoint not found',
  error_method_not_allowed: 'Method not allowed',
  error_registration_closed: 'Account registration is currently closed',
  error_instant_accounts_disabled: 'Instant account creation is disabled',
  error_custom_accounts_disabled: 'Custom account creation is disabled',
  error_invalid_password: 'Invalid password: Plaintext password is not accepted',
  error_invalid_password_hash: 'Password hash does not match the configured algorithm',
  error_invalid_domain: 'Invalid domain',
  error_invalid_domain_not_configured: 'Invalid domain: Primary domain is not configured',
  error_invalid_domain_not_found: 'Invalid domain: Primary domain not found',
  error_invalid_domain_no_name: 'Invalid domain: Domain has no name',
  error_altcha_required: 'Altcha proof-of-work solution is required',
  error_altcha_invalid: 'Invalid Altcha challenge solution',
  error_altcha_replay: 'Altcha challenge solution has already been used',
  error_bad_request: 'Bad request',
  error_bad_request_body: 'Bad request: Missing request body',
  error_internal: 'Internal server error',
  error_account_exists: 'An account with this email already exists',
  error_unsupported_hash: 'Unsupported hash algorithm',
  error_endpoints_not_configured: 'IMAP/SMTP endpoints are not configured',
  hero_headline: 'Your Address, Your Space.',
  hero_subheadline: 'A distinctive, secure, and decentralized platform for all your communication needs.',
  hero_cta_create_account: 'Create Account Now',
  hero_tag_e2e: 'End-to-End Encrypted',
  hero_tag_notracking: 'Secure Global Communication',
  hero_tag_federated: 'Always Accessible',
  card_calls_title: 'Audio & Video Calls',
  card_calls_desc: 'High-quality, secure peer-to-peer audio and video calling without intermediaries.',
  card_storage_title: 'Local-First Personal Data Storage',
  card_storage_desc: 'All your messages, media, and contacts remain strictly stored locally on your device.',
  card_security_title: 'Inherently Secure Communication Methods',
  card_security_desc: 'Built with open end-to-end encryption standards and zero reliance on centralized surveillance.',
  card_focus_title: 'Focused on Security, Simplicity & Usability',
  card_focus_desc: 'Crafted with uncompromising security, clean minimalism, and effortless everyday usability.',
};
