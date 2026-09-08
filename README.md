# Расходник — native iOS app

A standalone SwiftUI rewrite of the Расходник expense tracker. No web view, no
JavaScript, no external dependencies.

## What is here

```
ios/
  Rashodnik.xcodeproj/        the Xcode project (open this)
  Rashodnik/
    RashodnikApp.swift        app entry point
    Models.swift              Account, Category, Tx, Debt, AppSettings, seed data
    Store.swift               single source of truth + local persistence
    Format.swift              money, dates, periods
    Icons.swift               original symbol names -> SF Symbols
    Haptics.swift             Taptic Engine feedback
    Theme.swift               colours and shared UI pieces
    Info.plist
    Assets.xcassets/
    Views/
      RootView.swift              tabs, add menu, modal editors
      WelcomeView.swift           onboarding + starting balances
      PinPadView.swift            PIN pad and lock screen
      HomeView.swift              balance, accounts, recent operations
      HistoryView.swift           search, filters, grouped history
      AnalyticsView.swift         donut, categories, insights
      MoreView.swift              settings, theme, data
      AccountsView.swift          account management and account detail
      AccountEditorView.swift     add/edit/delete an account
      CategoriesView.swift        categories, subcategories, editor
      DebtsView.swift             debts, detail, payments
      DebtEditorView.swift        new debt + payment sheet
      TransactionEditorView.swift income/expense/transfer editor + pickers
      TxRowView.swift             shared transaction row
```

## Requirements

- Xcode 16 or newer. The project uses the synchronized-folder format, so any
  Swift file added under `Rashodnik/` is compiled automatically — there is no
  file list to maintain.
- iOS 17.0 or newer on the device.
- No Swift Package Manager or CocoaPods dependencies — nothing to resolve.

## Opening and building

1. Open `ios/Rashodnik.xcodeproj`.
2. Select the `Rashodnik` scheme and an iPhone destination.
3. Under Signing & Capabilities pick your team, and change the bundle
   identifier if `com.rashodnik.app` is taken.
4. Build and run.

## Bundle identifier

`PRODUCT_BUNDLE_IDENTIFIER` is `com.rashodnik.app` in both Debug and Release.
Change it in Build Settings, or override it on the command line.

## App icon

`Assets.xcassets/AppIcon.appiconset` declares a single 1024×1024 universal slot
but ships no image, so the app builds and runs without one. Add a 1024×1024 PNG
without alpha and reference it from that `Contents.json` before submitting to
the App Store.

## Building an IPA on Codemagic

The project archives with plain `xcodebuild`, so a minimal workflow is enough:

```yaml
workflows:
  ios:
    name: Rashodnik iOS
    instance_type: mac_mini_m2
    environment:
      xcode: latest
      ios_signing:
        distribution_type: ad_hoc          # or app_store
        bundle_identifier: com.rashodnik.app
    scripts:
      - name: Set up signing
        script: keychain initialize && xcode-project use-profiles
      - name: Build IPA
        script: |
          xcode-project build-ipa \
            --project "ios/Rashodnik.xcodeproj" \
            --scheme "Rashodnik"
    artifacts:
      - build/ios/ipa/*.ipa
```

Signing still needs an Apple Developer account and a provisioning profile that
matches the bundle identifier; that part cannot be bypassed.

## Data

Everything lives on the device in `UserDefaults` under the key `rashodnik.v1`,
JSON-encoded with the same field names the previous version used. Nothing is
sent anywhere and there is no backend.

## Note on this port

This is a hand-written rewrite, not a generated wrapper: the data model,
derived balances, formatting rules, category tree and every screen were ported
one by one. It has not been compiled — nothing in the environment it was
written in can run Swift — so expect to fix a small number of compile errors on
the first build.
