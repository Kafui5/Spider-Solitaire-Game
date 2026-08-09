# Privacy Rules — Silk Spider Solitaire

## Absolute Rules

1. **No personal data collection** — name, email, phone, location: never collected
2. **No analytics SDKs** — no Firebase Analytics, no Amplitude, no Mixpanel
3. **No crash reporting to external services** — no Crashlytics, no Sentry
4. **No advertising identifiers** — no GAID, no IDFA
5. **No third-party SDKs that phone home** — only Google Play Billing (for purchases)
6. **All data stays on-device** — AsyncStorage only
7. **No cloud sync** (yet) — if added later, must be opt-in and transparent

## Internet Usage

The app uses internet **only** for:
- Making optional in-app purchases (Google Play Billing)
- Restoring previously purchased items

**No other network requests are made. Ever.**

## Data Stored Locally

| Data | Purpose | Deletable |
|------|---------|-----------|
| Game save | Resume interrupted games | Yes (reset) |
| Statistics | Win rate, best times | Yes (reset) |
| Settings | User preferences | Yes (reset) |
| Purchase state | Track what's unlocked | Restored from Play Store |
| Reward progress | XP, mastery, achievements | Yes (reset) |
| Daily challenge history | Streak tracking | Yes (reset) |

## Google Play Data Safety Declaration

For the Data Safety section in Play Console:
- **Does your app collect or share user data?** No
- **Is all data encrypted in transit?** N/A (no data transmitted)
- **Can users request data deletion?** Yes (in-app reset option)
- **Does your app follow Google's Families Policy?** Yes (no ads, no data collection)

## Privacy Policy URL

Must be hosted before submission. Content matches `privacy-policy.md` in project root.
Suggested URL: https://greenmidori.com/silk-spider/privacy

## If We Add Analytics Later

If any measurement is ever added:
- Must be **first-party only** (custom events to own backend)
- Must be **opt-in** with clear explanation
- Must be **anonymous** (no user identification)
- Must update the privacy policy before deployment
- Must update the Play Store data safety declaration
