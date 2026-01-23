# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e12]
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - heading "Sign In" [level=1] [ref=e16]
        - paragraph [ref=e17]: Welcome back! Please sign in to your account
      - generic [ref=e18]:
        - button "Sign in with Google" [ref=e20]:
          - img [ref=e21]
          - text: Sign in with Google
        - generic [ref=e30]: or continue with email
        - generic [ref=e31]:
          - generic [ref=e33]:
            - button "Sign In" [ref=e34]
            - button "Sign Up" [ref=e35]
          - generic [ref=e36]:
            - generic [ref=e37]:
              - text: Email
              - textbox "Email" [ref=e38]:
                - /placeholder: Enter your email
            - generic [ref=e39]:
              - text: Password
              - textbox "Password" [ref=e40]:
                - /placeholder: Enter your password
            - button "Sign In" [ref=e41]
        - generic [ref=e43]:
          - link "Subscribe Now" [ref=e44] [cursor=pointer]:
            - /url: /subscription
          - link "Back to Home" [ref=e45] [cursor=pointer]:
            - /url: /
```