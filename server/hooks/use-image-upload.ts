type ImageUploadResProps = {
  data: {
    preSignedUrl: string
    imageUrl: string
  }
}

async function imageUpload(file: File): Promise<ImageUploadResProps> {
  // Add file size check (1MB = 1048576 bytes)
  if (file.size > 1048576) {
    throw new Error("File size exceeds the maximum limit of 1MB")
  }

  try {
    const res = await fetch("/api/image-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        filetype: file.type,
        filesize: file.size,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.message)
    }

    return await res.json()
  } catch (error: any) {
    throw Error(error?.message)
  }
}

export const getPreSignedUrl = async (file: File) => {
  try {
    const data = await imageUpload(file)

    if (!data.data) {
      return null
    }

    return data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return null
  }
}

export const uploadFileToS3 = async (url: string, file: File) => {
  try {
    const buffer = await file.arrayBuffer()

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open("PUT", url, true)
      xhr.setRequestHeader("Content-Type", file.type)
      xhr.setRequestHeader("Cache-Control", "max-age=630720000")

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject()
          }
        }
      }

      xhr.send(buffer)
    })

    return true // For sucessfull uploads
  } catch (error: any) {
    return false
  }
}
