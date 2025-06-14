import { UserType } from "@/server/db/schema-types"
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { format } from "date-fns"

import { configuration } from "@/lib/config"

type FeedbackMailProps = {
  feedback: string
  fromUser: Pick<UserType, "name" | "image" | "email" | "id">
}

export function FeedbackMail({ feedback, fromUser }: FeedbackMailProps) {
  return (
    <Html>
      <Head />
      <Preview>You have received a feedback {configuration.site.name}!</Preview>
      <Tailwind>
        <Body className="m-auto bg-white font-sans">
          <Container className="w–[465px] border-border mx-auto my-[40px] rounded border border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={fromUser.image ?? ""}
                width="40"
                height="37"
                alt={`${configuration.site.name} Logo`}
                className="mx-auto my-0 rounded-full object-cover"
              />
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Feedback from <strong>{fromUser.name}</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{fromUser.name}</strong> has sent feedback on{" "}
              <strong>{configuration.site.name}</strong>
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">{feedback}</Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[24px] text-black">
              Sent on {format(new Date(), "MMM dd, yyyy")}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
