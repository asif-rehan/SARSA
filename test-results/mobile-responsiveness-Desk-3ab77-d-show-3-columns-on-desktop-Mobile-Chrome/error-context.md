# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - main [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - heading "Sign In" [level=1] [ref=e15]
        - paragraph [ref=e16]: Welcome back! Please sign in to your account
      - generic [ref=e17]:
        - button "Sign in with Google" [ref=e19]:
          - img [ref=e20]
          - text: Sign in with Google
        - generic [ref=e29]: or continue with email
        - generic [ref=e30]:
          - generic [ref=e32]:
            - button "Sign In" [ref=e33]
            - button "Sign Up" [ref=e34]
          - generic [ref=e35]:
            - generic [ref=e36]:
              - text: Email
              - textbox "Email" [ref=e37]:
                - /placeholder: Enter your email
            - generic [ref=e38]:
              - text: Password
              - textbox "Password" [ref=e39]:
                - /placeholder: Enter your password
            - button "Sign In" [ref=e40]
        - generic [ref=e42]:
          - link "Subscribe Now" [ref=e43] [cursor=pointer]:
            - /url: /subscription
          - link "Back to Home" [ref=e44] [cursor=pointer]:
            - /url: /
```