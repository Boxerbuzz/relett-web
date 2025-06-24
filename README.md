
# Property Platform - Backend Functions & Default System

## Overview

This document describes the comprehensive backend system for managing user defaults, property interactions, notifications, and analytics in the Property Platform.

## Database Functions

### User Management Functions

#### `handle_new_user()`

**Type:** Database Trigger Function  
**Trigger:** `auth.users` table on INSERT  
**Purpose:** Creates default records for new users

**Created Records:**

- Default notification preferences
- Default account (wallet)
- Default user role (landowner)
- Default portfolio allocations
- Default user preferences

#### `update_user_defaults(p_user_id, p_preferences, p_notification_types, p_portfolio_targets)`

**Type:** Database RPC Function  
**Purpose:** Updates user preference defaults via API calls

**Parameters:**

- `p_user_id` (uuid): User ID
- `p_preferences` (jsonb): Notification preferences
- `p_notification_types` (jsonb): Specific notification type settings
- `p_portfolio_targets` (jsonb): Portfolio allocation targets

### Property Management Functions

#### `handle_new_property()`

**Type:** Database Trigger Function  
**Trigger:** `properties` table on INSERT  
**Purpose:** Sets default values for new properties

**Default Values Set:**

- views: 0
- likes: 0
- favorites: 0
- ratings: 0
- review_count: 0
- is_featured: false
- is_verified: false
- is_tokenized: false
- is_ad: false
- is_deleted: false
- is_exclusive: false

#### `track_property_interaction(p_property_id, p_user_id, p_interaction_type, p_metadata)`

**Type:** Database RPC Function  
**Purpose:** Tracks user interactions with properties

**Interaction Types:**

- `view`: Property page visits
- `like`: Property likes
- `favorite`: Adding to favorites
- `share`: Sharing property
- `inquiry`: Property inquiries
- `contact`: Contacting property owner

#### `update_property_analytics()`

**Type:** Database RPC Function  
**Purpose:** Updates aggregated property statistics

**Updates:**

- Average ratings from reviews
- Total review counts
- Favorite counts
- Like counts

### Investment Functions

#### `create_investment_tracking(p_user_id, p_tokenized_property_id, p_tokens_owned, p_investment_amount, p_purchase_price_per_token)`

**Type:** Database RPC Function  
**Purpose:** Creates investment tracking records

**Returns:** `uuid` - Tracking record ID

### Notification Functions

#### `notify_property_price_change()`

**Type:** Database Trigger Function  
**Trigger:** `properties` table on UPDATE  
**Purpose:** Notifies users when property prices change

#### `notify_verification_status_change()`

**Type:** Database Trigger Function  
**Trigger:** `identity_verifications` table on UPDATE  
**Purpose:** Notifies users when verification status changes

#### `create_notification_with_delivery(p_user_id, p_type, p_title, p_message, p_metadata, p_action_url, p_action_label, p_sender_id)`

**Type:** Database RPC Function  
**Purpose:** Creates notifications and triggers delivery processing

## Edge Functions

### User Management

#### `user-created-webhook`

**Purpose:** Handles post-user creation setup  
**Trigger:** Called by database trigger after user creation  
**Actions:**

- Sends welcome notification
- Logs user creation event
- Additional custom processing

#### `update-user-defaults`

**Purpose:** API endpoint for updating user defaults  
**Method:** POST  
**Body:**

```json
{
  "user_id": "uuid",
  "preferences": {
    "email_notifications": boolean,
    "push_notifications": boolean,
    "sms_notifications": boolean,
    "quiet_hours_start": "HH:MM",
    "quiet_hours_end": "HH:MM",
    "do_not_disturb": boolean
  },
  "notification_types": {
    "property_updates": boolean,
    "investment_opportunities": boolean,
    ...
  },
  "portfolio_targets": {
    "property_type": {
      "residential": { "target": 60, "threshold": 5 },
      "commercial": { "target": 30, "threshold": 5 }
    }
  }
}
```

### Property Interactions

#### `track-interaction`

**Purpose:** API endpoint for tracking property interactions  
**Method:** POST  
**Body:**

```json
{
  "property_id": "uuid",
  "user_id": "uuid",
  "interaction_type": "view|like|favorite|share|inquiry|contact",
  "metadata": {
    "view_duration": number,
    "device_type": string,
    "platform": string,
    ...
  }
}
```

### Notifications

#### `process-notification`

**Purpose:** Processes notification delivery across multiple channels  
**Features:**

- Multi-channel delivery (email, SMS, push)
- Respects user preferences
- Handles quiet hours
- Delivery tracking
- Integration with OneSignal and Twilio

#### `send-chat-notification`

**Purpose:** Handles chat message notifications  
**Trigger:** New messages in conversations  
**Features:**

- Notifies all conversation participants except sender
- Includes message preview
- Deep linking to conversation

#### `send-booking-notification`

**Purpose:** Handles booking-related notifications  
**Trigger:** New bookings, status changes  
**Features:**

- Notifies users, property owners, and agents
- Handles reservations, rentals, and inspections
- Status change notifications

## Frontend Hooks

### `useDefaultsManager`

**Purpose:** Manages user defaults and preferences

**Methods:**

- `updateUserDefaults(userId, updates)`: Updates user preferences
- `trackInteraction(propertyId, userId, type, metadata)`: Tracks interactions
- `createInvestmentTracking(...)`: Creates investment records
- `updatePropertyAnalytics()`: Updates property analytics

### `useInteractionTracker`

**Purpose:** Simplified interaction tracking

**Methods:**

- `trackPropertyView(propertyId, metadata)`
- `trackPropertyLike(propertyId)`
- `trackPropertyFavorite(propertyId, listName, notes)`
- `trackPropertyInquiry(propertyId, type, message)`
- `trackPropertyShare(propertyId, platform)`
- `trackPropertyContact(propertyId, method)`

## Notification Types

### User Lifecycle

- `general`: Welcome messages, announcements
- `verification_updates`: Identity verification status changes

### Property Related

- `property_updates`: Price changes, status updates
- `property_verification`: Property verification status
- `property_viewing`: Viewing requests and confirmations
- `property_inspection`: Inspection scheduling and results

### Financial

- `payment_notifications`: Payment confirmations and failures
- `dividend_alerts`: Investment dividend distributions
- `transaction_alerts`: Transaction confirmations

### Investment

- `investment_opportunities`: New investment offerings
- `tokenization_updates`: Property tokenization status
- `auction_notifications`: Auction start, end, bid updates

### Rental & Booking

- `rental_requests`: New rental applications
- `rental_approvals`: Rental application status
- `reservation_updates`: Booking confirmations and changes

### Communication

- `chat_messages`: New messages in conversations
- `inquiry_responses`: Responses to property inquiries

### System

- `system_announcements`: Platform updates and maintenance
- `market_insights`: Market analysis and trends (optional)

## Default User Preferences

### Notification Preferences

```json
{
  "email_notifications": true,
  "push_notifications": true,
  "sms_notifications": false,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "07:00",
  "do_not_disturb": false,
  "notification_types": {
    "property_updates": true,
    "property_verification": true,
    "property_viewing": true,
    "property_inspection": true,
    "payment_notifications": true,
    "dividend_alerts": true,
    "transaction_alerts": true,
    "investment_opportunities": true,
    "tokenization_updates": true,
    "auction_notifications": true,
    "rental_requests": true,
    "rental_approvals": true,
    "reservation_updates": true,
    "chat_messages": true,
    "inquiry_responses": true,
    "verification_updates": true,
    "system_announcements": true,
    "market_insights": false,
    "purchase_confirmations": true,
    "purchase_updates": true,
    "delivery_notifications": false
  }
}
```

### Portfolio Allocations

```json
{
  "property_type": {
    "residential": { "target": 60, "threshold": 5 },
    "commercial": { "target": 30, "threshold": 5 },
    "land": { "target": 10, "threshold": 5 }
  },
  "location": {
    "lagos": { "target": 40, "threshold": 5 },
    "abuja": { "target": 30, "threshold": 5 },
    "other": { "target": 30, "threshold": 5 }
  }
}
```

### Account Defaults

- Type: "wallet"
- Amount: 0
- Points: 0
- Currency: "NGN"
- Status: "active"

## Environment Variables Required

### Notification Services

- `ONESIGNAL_APP_ID`: OneSignal application ID
- `ONESIGNAL_API_KEY`: OneSignal API key
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `TWILIO_EMAIL_API_KEY`: Twilio email API key

### Supabase

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

## Testing the System

### User Creation

1. Create a new user account
2. Check that default records are created in:
   - `notification_preferences`
   - `accounts`
   - `user_roles`
   - `portfolio_allocations`
   - `user_preferences`

### Property Interaction(s)

1. View a property (should increment view count)
2. Like a property (should create record in `property_likes`)
3. Favorite a property (should create record in `property_favorites`)
4. Make an inquiry (should notify property owner)

### Notification(s)

1. Change a property price (should notify users who favorited it)
2. Update verification status (should notify the user)
3. Send a chat message (should notify conversation participants)

### Analytics

1. Run `update_property_analytics()` function
2. Check that property stats are updated correctly

## Troubleshooting

### Common Issues

1. **Notification not sent**: Check user preferences and quiet hours
2. **Interaction not tracked**: Verify user authentication and property existence
3. **Defaults not created**: Check database triggers are properly installed
4. **Function timeouts**: Check for complex queries or external API delays

### Logs

- Edge function logs available in Supabase dashboard
- Database function logs in PostgreSQL logs
- Client-side errors in browser console

## Maintenance

### Regular Tasks

1. Run `update_property_analytics()` daily
2. Clean up old audit trail records
3. Monitor notification delivery rates
4. Update portfolio allocations based on user activity

### Performance Monitoring

- Track edge function execution times
- Monitor database query performance
- Check notification delivery success rates
- Analyze user interaction patterns

`### firebase deploy --only hosting:web-relett`
