import * as crypto from "crypto"
import * as path from "path"
import { NextRequest } from "next/server"
import { S3_UPLOAD_BUCKET_ENV } from "@/env"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Ratelimit } from "@upstash/ratelimit"

import { awsClient } from "@/lib/aws"
import { RATE_LIMIT_1_MINUTE, RATE_LIMIT_5 } from "@/lib/constants"
import { redis } from "@/lib/redis"
import { responses } from "@/lib/responses"

const getFilename = (originalName: string) => {
  const originalExtension = path.extname(originalName)
  const currentTime = new Date().getTime().toString()
  const hash = crypto.createHash("md5").update(currentTime).digest("hex")
  const filename = `${hash}${originalExtension}`
  return filename
}

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMIT_5, RATE_LIMIT_1_MINUTE),
})

export async function POST(req: NextRequest) {
  try {
    const { filesize, filename, filetype } = await req.json()
    const { user } = await getCurrentUser()

    if (!user) {
      return responses.notAuthenticatedResponse()
    }

    const identifier = `ratelimit:image-upload:${user.id}`
    const { success } = await ratelimit.limit(identifier)

    const MAX_FILE_SIZE = 1048576 // 1MB in bytes

    // Check file size
    if (filesize > MAX_FILE_SIZE) {
      return responses.badRequestResponse("File size exceeds the maximum limit of 1MB")
    }

    if (!success) {
      return responses.tooManyRequestsResponse()
    }

    const generatedFilename = getFilename(filename)

    const params = {
      Bucket: S3_UPLOAD_BUCKET_ENV,
      Key: `${user.id}/${generatedFilename}`,
      ContentType: filetype,
      CacheControl: "max-age=63072000",
    }

    const preSignedUrl = await getSignedUrl(awsClient, new PutObjectCommand(params), {
      expiresIn: 60 * 60,
    })

    const command = new PutObjectCommand(params)
    await awsClient.send(command)

    const imageUrl = `https://${S3_UPLOAD_BUCKET_ENV}.s3.amazonaws.com/${user.id}/${generatedFilename}`
    const uploadResult = {
      preSignedUrl,
      imageUrl,
    }

    return responses.successResponse(uploadResult, "Image uploaded successfully")
  } catch (error: any) {
    return responses.internalServerErrorResponse(error.message)
  }
}
