# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e13]
  - main [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]:
        - heading "Sign In" [level=1] [ref=e17]
        - paragraph [ref=e18]: Welcome back! Please sign in to your account
      - generic [ref=e19]:
        - button "Sign in with Google" [ref=e21]:
          - img [ref=e22]
          - text: Sign in with Google
        - generic [ref=e31]: or continue with email
        - generic [ref=e32]:
          - generic [ref=e34]:
            - button "Sign In" [ref=e35]
            - button "Sign Up" [ref=e36]
          - generic [ref=e37]:
            - generic [ref=e38]:
              - text: Email
              - textbox "Email" [ref=e39]:
                - /placeholder: Enter your email
            - generic [ref=e40]:
              - text: Password
              - textbox "Password" [ref=e41]:
                - /placeholder: Enter your password
            - button "Sign In" [ref=e42]
        - generic [ref=e44]:
          - link "Subscribe Now" [ref=e45]:
            - /url: /subscription
          - link "Back to Home" [ref=e46]:
            - /url: /
```