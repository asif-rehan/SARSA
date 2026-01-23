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
        - generic [ref=e19]: or continue with email
        - generic [ref=e20]:
          - generic [ref=e22]:
            - button "Sign In" [ref=e23]
            - button "Sign Up" [ref=e24]
          - generic [ref=e25]:
            - generic [ref=e26]:
              - text: Email
              - textbox "Email" [ref=e27]:
                - /placeholder: Enter your email
            - generic [ref=e28]:
              - text: Password
              - textbox "Password" [ref=e29]:
                - /placeholder: Enter your password
            - button "Sign In" [ref=e30]
        - generic [ref=e32]:
          - link "Subscribe Now" [ref=e33]:
            - /url: /subscription
          - link "Back to Home" [ref=e34]:
            - /url: /
  - button "Open Next.js Dev Tools" [ref=e40] [cursor=pointer]:
    - img [ref=e41]
  - alert [ref=e46]
```