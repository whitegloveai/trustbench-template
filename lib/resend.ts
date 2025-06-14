import { RESEND_API_KEY_ENV } from "@/env"
import { Resend } from "resend"

export const resend = new Resend(RESEND_API_KEY_ENV)
