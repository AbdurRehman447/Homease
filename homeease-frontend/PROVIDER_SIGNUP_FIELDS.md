# Service Provider Signup - Field Requirements

## Implemented Fields (MVP Demo Version)

### 1. Basic Personal Information
- ✅ Full name (required)
- ✅ Phone number (required)
- ✅ Email address (required)
- ⏳ Profile photo (file upload - for full version)

### 2. Service Information
- ✅ Primary service category (dropdown - required)
- ✅ Sub-services offered (multi-select/text - required)
- ✅ Service description (textarea - required)
- ✅ Years of experience (number input - required)

### 3. Location & Coverage
- ✅ City (dropdown - required)
- ✅ Areas/neighborhoods served (text - required)
- ✅ Willing to travel (Yes/No - required)

### 4. Pricing Information
- ✅ Starting price (number - required)
- ✅ Price type (Fixed/Hourly/After inspection - required)
- ✅ Minimum service charge (number - required)

### 5. Availability & Schedule
- ✅ Available days (checkbox - required)
- ✅ Available time slots (checkbox - required)
- ✅ Emergency service (Yes/No - optional)

### 6. Professional Profile
- ✅ Short bio/introduction (textarea - required)
- ✅ Languages spoken (text - optional)
- ✅ Team size (Individual/Small team - optional)

### 7. Verification (For Full Version)
- ⏳ Government ID upload
- ⏳ Certifications upload
- ⏳ Portfolio images upload

## Usage

The signup form will show different fields based on selected role:
- **Customer:** Basic fields only (name, email, phone, address, password)
- **Provider:** All MVP fields listed above

## Navigation
- URL parameter `?role=provider` auto-selects provider role
- "Become a Provider" button in navbar links to `/signup?role=provider`
