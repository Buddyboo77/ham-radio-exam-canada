# SignalAce Canada - App Store Submission Guide

## Step 1: Take Screenshots

### iPhone Screenshots (Using Simulator or Device)
```bash
# Using Xcode simulator for iOS
# Or use real iPhone with Screenshot button

# Recommended sizes: 1242 x 2688px (or as app store specifies)
# Need 5-8 screenshots showing key features
```

**What to capture:**
1. Home screen with daily bonus popup
2. Quiz setup/configuration
3. Active quiz question
4. Quiz results with score
5. Morse code training
6. Study guide
7. Level up celebration
8. Pro upgrade screen

### Android Screenshots
Same content, 1080 x 1920px format

## Step 2: Create Apple Developer Account

1. Go to developer.apple.com
2. Sign in with Apple ID
3. Enroll in Apple Developer Program ($99/year)
4. Set up Team ID
5. Create App ID: `ca.signalace.examprep`
6. Generate signing certificates

## Step 3: Create Google Play Developer Account

1. Go to play.google.com/console
2. Sign in with Google account
3. Pay one-time $25 registration fee
4. Set up organization
5. Create app listing

## Step 4: Build and Sign Apps

### iOS Build
```bash
# In Replit, use Capacitor to build iOS
npm run build
npx cap add ios
npx cap copy
# Then build in Xcode or use fastlane
```

### Android Build
```bash
# In Replit, use Capacitor to build Android
npm run build
npx cap add android
npx cap copy
# Then build APK/AAB in Android Studio
```

## Step 5: Submit to App Stores

### For Apple App Store:
1. Open App Store Connect (appstoreconnect.apple.com)
2. Create new app entry
3. Fill in app information from STORE_LISTING.md
4. Upload screenshots
5. Upload privacy policy (link to in-app page)
6. Set pricing ($0 free with $8.88 CAD in-app purchase)
7. Build & sign app with certificates
8. Upload binary
9. Submit for review

### For Google Play Store:
1. Open Google Play Console
2. Create new app
3. Fill in app information
4. Upload screenshots
5. Set privacy policy (link to in-app page)
6. Set pricing ($0 free with $8.88 CAD in-app purchase)
7. Generate keystore (for signing)
8. Build signed APK/AAB
9. Upload to Play Store
10. Submit for review

## Step 6: Handle App Store Review

### Apple App Store
- Review typically takes 24-48 hours
- May ask questions about:
  - Data collection practices (privacy)
  - In-app purchase functionality
  - Offline functionality
- Check email regularly for reviewer questions

### Google Play Store
- Review typically takes 2-4 hours to 24+ hours
- Usually quicker than Apple
- May ask about:
  - Content rating questionnaire
  - Data safety section
  - In-app purchase implementation

## Step 7: Launch Announcement

Once approved:
1. Share app store links on social media
2. Create landing page: signalace.app
3. Email announcement to contacts
4. Reddit: r/amateurradio
5. RAC (Radio Amateurs of Canada) groups
6. Amateur radio communities

## Troubleshooting

### If App is Rejected

**Common reasons:**
- Metadata doesn't match actual app functionality
- Privacy policy missing or incomplete
- Technical bugs preventing normal use
- Content violates guidelines

**Resolution:**
1. Read reviewer feedback carefully
2. Fix any issues mentioned
3. Resubmit with explanation
4. Usually allowed up to 3 rejections before app ID deleted

### If Build Fails

Check:
- TypeScript compilation errors
- Missing dependencies
- Native code issues (Capacitor)
- Signing certificate problems

### If Features Don't Work on Device

- Test offline mode specifically
- Check storage permissions
- Verify audio/vibration permissions
- Test on multiple devices

## Maintenance

After launch, plan to:
- Monitor app store reviews weekly
- Respond to user feedback
- Fix bugs reported by users
- Update content as ISED releases new questions
- Release updates periodically (v1.1, 1.2, etc.)

## Contact Info for Store Submissions

- **Support Email**: support@signalace.app
- **Developer Name**: SignalAce
- **Website**: signalace.app (when ready)

---

**Total time estimate:**
- Preparation: 2-4 hours
- Screenshots: 30 minutes
- Account setup: 30 minutes
- Store listing creation: 1 hour
- App building: 1-2 hours
- Submission: 30 minutes
- Review wait time: 1-3 days

**Total: 6-10 hours of work over 2-4 days**
