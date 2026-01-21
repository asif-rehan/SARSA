"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/loading/loading-button"
import { FormFieldWithHelp } from "./form-field-with-help"
import { FormStatus } from "./form-status"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(100, "Subject must not exceed 100 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must not exceed 1000 characters"),
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => Promise<void>
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  async function handleSubmit(data: ContactFormData) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      setSuccess("Thank you for your message! We'll get back to you soon.")
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <FormStatus 
        error={error}
        success={success}
        onClearError={() => setError(null)}
        onClearSuccess={() => setSuccess(null)}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormFieldWithHelp
                label="Full Name"
                description="Enter your first and last name"
                helpText="This will be used to address you in our response"
                required
              >
                <Input placeholder="John Doe" {...field} />
              </FormFieldWithHelp>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormFieldWithHelp
                label="Email Address"
                description="We'll use this to respond to your inquiry"
                helpText="Your email will never be shared with third parties"
                required
              >
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormFieldWithHelp>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormFieldWithHelp
                label="Subject"
                description="Brief description of your inquiry"
                helpText="Help us categorize your message for faster response"
                required
              >
                <Input placeholder="How can we help you?" {...field} />
              </FormFieldWithHelp>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormFieldWithHelp
                label="Message"
                description="Provide details about your inquiry (10-1000 characters)"
                helpText="The more details you provide, the better we can assist you"
                required
              >
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Tell us how we can help you..."
                  {...field}
                />
              </FormFieldWithHelp>
            )}
          />

          <div className="flex gap-4">
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Sending..."
              className="flex-1"
            >
              Send Message
            </LoadingButton>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                setError(null)
                setSuccess(null)
              }}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}