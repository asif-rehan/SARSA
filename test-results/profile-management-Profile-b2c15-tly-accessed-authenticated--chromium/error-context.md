# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "Sign In" [level=1] [ref=e5]
        - paragraph [ref=e6]: Welcome back! Please sign in to your account
      - generic [ref=e7]:
        - button "Sign in with Google" [ref=e9]:
          - img [ref=e10]
          - text: Sign in with Google
        - generic [ref=e19]: or
        - generic [ref=e20]:
          - link "Subscribe Now" [ref=e21] [cursor=pointer]:
            - /url: /subscription
          - link "Back to Home" [ref=e22] [cursor=pointer]:
            - /url: /
  - button "Open Next.js Dev Tools" [ref=e28] [cursor=pointer]:
    - img [ref=e29]
  - alert [ref=e32]
```