import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  GetObjectCommand,
  DeleteObjectCommand,
  ListBucketInventoryConfigurationsOutputFilterSensitiveLog,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { existsSync, createWriteStream } from "fs";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Agent } from "https";
import { Response, NextFunction } from "express";
import { pipeline } from "stream";
import { promisify } from "util";
import * as archiver from "archiver";
import { Archiver } from "archiver";
import { PassThrough, Readable } from "stream";
import { AbstractSubmitters, Abstracts } from "../repo/eventAbstractReviews";
import * as config from "../utilities/config";
import moment from "moment";
import { TextDecoder } from "util";
import { Participant } from "../repo/participant";
import { where } from "sequelize";

const s3HttpAgent = new Agent({ rejectUnauthorized: false });

const pipelineAsync = promisify(pipeline);

const s3 = new S3Client({
  endpoint: config.S3CLIENT_ENDPOINT,
  region: config.S3CLIENT_REGION,
  credentials: {
    accessKeyId: config.S3CLIENT_ACCESSKEYID,
    secretAccessKey: config.S3CLIENT_SECRETACCESSKEY,
  },
  requestHandler: new NodeHttpHandler({
    httpsAgent: s3HttpAgent,
  }),
});

async function upload(Key: string, Body: any): Promise<any> {
  const command = new PutObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key,
    Body,
  });

  const { $metadata } = await s3.send(command);
  if ($metadata?.httpStatusCode === 200) {
    const objects = await listObjects(Key);
    if (!!objects?.Contents && objects.Contents?.length > 0) {
      const content = objects?.Contents?.find((c: any) => c.Key === Key);
      if (!!content) return content;
    }
  }

  throw new Error(`Failed to upload file ${Key}`);
}

async function listObjects(prefix: string): Promise<any> {
  const command = new ListObjectsV2Command({
    Bucket: config.S3CLIENT_BUCKET,
    Prefix: prefix,
  });

  let isTruncated = true;
  let response: ListObjectsV2CommandOutput;

  while (isTruncated) {
    const s3Response = await s3.send(command);
    if (!!response?.Contents) {
      response.Contents = response?.Contents?.concat(s3Response.Contents);
    } else {
      response = s3Response;
    }
    isTruncated = s3Response.IsTruncated;
    command.input.ContinuationToken = s3Response.NextContinuationToken;
  }

  return response;
}

async function download(Key: string): Promise<Uint8Array> {
  const command = new GetObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key,
  });
  const { Body } = await s3.send(command);

  const byteArray = await Body.transformToByteArray();
  return byteArray;
}

async function streamS3ObjectToClient(
  key: string,
  res: Response
): Promise<void> {
  const getObjectParams = {
    Bucket: config.S3CLIENT_BUCKET,
    Key: key,
  };

  try {
    // Create a command to get the object
    const getCommand = new GetObjectCommand(getObjectParams);

    // Sending command to S3 and getting the object stream
    const { Body } = await s3.send(getCommand);

    if (Body) {
      const fileName = key.substring(key.lastIndexOf("/") + 1);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      // Listen for the 'close' event on the response, which indicates the client has disconnected
      res.on("close", () => {
        console.log("Client disconnected, closing stream");
        res.end(); // Ensure to close the response if the client disconnects
      });

      // If Body is a stream (in Node.js environments), pipe it directly
      await pipelineAsync(Body as NodeJS.ReadableStream, res).catch((error) => {
        // This catch handles any errors that occur during streaming.
        console.error("Pipeline failed", error);
        if (!res.headersSent) {
          res
            .status(500)
            .json({ error: `Failed to stream the file. ${error}` });
        }
      });
    } else {
      throw new Error("Expected body to be a stream");
    }
  } catch (error) {
    console.error("S3 Stream Error:", error);
    res
      .status(500)
      .json({ error: `Error streaming the file from S3: ${error}` });
  }
}

async function deleteObject(Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key,
  });

  console.log("Key: ");
  console.log(Key);

  try {
    await s3.send(command);
  } catch (err) {
    console.error(err);
  }
}

async function getImageContentInBase64(Key: string): Promise<any> {
  const command = new GetObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key,
  });
  const { Body } = await s3.send(command);

  const byteArray = await Body.transformToString("base64");
  return byteArray;
}

async function getDownloadPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 180, // The URL expires in 3 minutes
    });
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned URL", error);
    throw error;
  }
}

export async function getSingleFile(
  key: string,
  res: Response,
  fileName: string
) {
  try {
    const command = new GetObjectCommand({
      Bucket: config.S3CLIENT_BUCKET,
      Key: key,
    });
    const { Body, ContentType } = await s3.send(command);

    if (Body instanceof Readable) {
      // Set CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Content-Type", ContentType || "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      Body.pipe(res); // Now you can pipe it since TypeScript knows Body is a Readable stream
    } else {
      throw new Error("Expected a stream but did not receive one.");
    }
  } catch (error) {
    console.error("Failed to download file:", error);
    res.status(500).send("Server error");
  }
}

function utf8ToUnicode(utf8String: any) {
  const decoder = new TextDecoder("utf-8");
  const utf8Array = new Uint8Array([...utf8String].map((c) => c.charCodeAt(0)));
  const unicodeString = decoder.decode(utf8Array);
  return unicodeString;
}

//Download All button in File collection
async function getAllBucketFilesZippedFileCollection(
  collectionId: string,
  applicantNetId: string,
  res: Response,
  submissionType: string
): Promise<any> {
  try {
    const bucketName = config.S3CLIENT_BUCKET;
    const folderPrefix = `${collectionId}/${applicantNetId}/${submissionType}/`;

    const uploadedFiles = await listObjects(folderPrefix);

    const fileNames =
      uploadedFiles?.Contents?.map((c: any) =>
        String(c?.Key)?.slice(String(c?.Key).lastIndexOf("/") + 1)
      ).filter((c: any) => c?.length > 0) ?? [];

    if (uploadedFiles.length === 0) {
      res.status(404).send("No files found in the bucket.");
      return;
    }

    const zip = archiver.create("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();

    zipStream.on("finish", () => {
      console.log("Zip stream finished.");
    });

    const dateString = moment(new Date()).format("YYMMDDHHmmss");
    res.attachment(`Files_${dateString}.zip`);
    zip.pipe(zipStream).pipe(res);

    zip.on("error", (err: any) => {
      console.error("Archiver error:", err);
      // Close the zipStream to prevent hanging responses
      zipStream.end();
      if (!res.headersSent) {
        res.status(500).send("Error creating zip file.");
      }
    });

    //   for (let i = 0; i < fileNames.length; i++) {
    //     await addToZip(zip, `${collectionId}/${applicantNetId}/${submissionType}/${fileNames[i]}`, bucketName, utf8ToUnicode(fileNames[i]));
    //   }
    for (const fileName of fileNames) {
      await addToZip(
        zip,
        `${collectionId}/${applicantNetId}/${submissionType}/${fileName}`,
        bucketName,
        utf8ToUnicode(fileName)
      );
    }

    // Finalize the zip and ensure all streams have been appended
    await zip.finalize();

    //   return zip;
  } catch (error) {
    console.error("Error zipping and downloading files:", error);
    if (!res.headersSent) {
      res.status(500).send("Error processing your request");
    }
  }
}

//Download Selected button in File collection
async function getAllBucketSelectedFilesZippedFileCollection(
  collectionId: string,
  applicantNetId: string[],
  res: Response
): Promise<any> {
  try {
    const zip = archiver.create("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();

    zipStream.on("finish", () => {
      console.log("Zip stream finished.");
    });

    const dateString = moment(new Date()).format("YYMMDDHHmmss");
    res.attachment(`Files_${dateString}.zip`);
    zip.pipe(zipStream).pipe(res);

    zip.on("error", (err: any) => {
      console.error("Archiver error:", err);
      // Close the zipStream to prevent hanging responses
      zipStream.end();
      if (!res.headersSent) {
        res.status(500).send("Error creating zip file.");
      }
    });

    const bucketName = config.S3CLIENT_BUCKET;

    for (const netId of applicantNetId) {
      const submissionType = ["abstract", "paper"];
      for (const type of submissionType) {
        const folderPrefix = `${collectionId}/${netId}/${type}/`;

        const uploadedFiles = await listObjects(folderPrefix);

        const fileNames =
          uploadedFiles?.Contents?.map((c: any) =>
            String(c?.Key)?.slice(String(c?.Key).lastIndexOf("/") + 1)
          ).filter((c: any) => c?.length > 0) ?? [];

        if (uploadedFiles.length === 0) {
          res.status(404).send("No files found in the bucket.");
          return;
        }

        // for (let i = 0; i < fileNames.length; i++) {
        //     await addToZip(zip, `${collectionId}/${netId}/${type}/${fileNames[i]}`, bucketName, `${netId}/${type}/${utf8ToUnicode(fileNames[i])}`);
        // }
        for (const fileName of fileNames) {
          await addToZip(
            zip,
            `${collectionId}/${netId}/${type}/${fileName}`,
            bucketName,
            `${netId}/${type}/${utf8ToUnicode(fileName)}`
          );
        }
      }
    }

    // Finalize the zip and ensure all streams have been appended
    await zip.finalize();

    //   return zip;
  } catch (error) {
    console.error("Error zipping and downloading files:", error);
    if (!res.headersSent) {
      res.status(500).send("Error processing your request");
    }
  }
}

function extractS3FileName(fileKey: string) {
  return fileKey.split("/").pop();
} // "documents/1.pdf" -> "1.pdf"

async function getS3FolderFiles(
  prefix: string,
  bucketName: string,
  filteredS3FileNames: string[]
): Promise<any[]> {
  let continuationToken: string | undefined = undefined;
  let allFiles: any[] = [];

  do {
    const listObjectsResponse: ListObjectsV2CommandOutput = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    allFiles = allFiles.concat(listObjectsResponse.Contents || []);
    continuationToken = listObjectsResponse.NextContinuationToken;
  } while (continuationToken);

  allFiles = allFiles.filter(
    (file) =>
      !file.Key.endsWith("/") &&
      filteredS3FileNames.includes(extractS3FileName(file.Key))
  ); // Filter out default placeholder which is
  // (1) not the file
  // (2) files which are downloadable

  return allFiles;
}

async function addToZip(
  zip: Archiver,
  fileKey: string,
  bucketName: string,
  fileName: string
): Promise<void> {
  console.log("check user file name in zipping process, ", fileName);
  const data = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    })
  );
  const nodeStream = data.Body as Readable;
  if (!nodeStream) {
    console.error("Failed to get stream for:", fileKey);
    return;
  }

  const zippedFileName = fileName || extractS3FileName(fileKey);
  zip.append(nodeStream, { name: zippedFileName });
}

//Download All button in AMS - Trace abstract/paper status
async function getAllAbstractZippedAmsTraceStatus(
  eventId: string,
  res: Response,
  submissionType: string,
  abstractCollection: any,
): Promise<any> {
  try {
    const bucketName = config.S3CLIENT_BUCKET;
    const folderPrefix = `${config.S3CLIENT_AMS_FOLDER}/${eventId}/${submissionType}/`;

    const uploadedFiles = await listObjects(folderPrefix);

    const fileNames = uploadedFiles?.Contents?.map((c: any) =>
      String(c?.Key)?.slice(String(c?.Key).lastIndexOf('/') + 1)
    ).filter((c: any) => c?.length > 0) ?? [];

    if (uploadedFiles.length === 0) {
      res.status(404).send("No files found in the bucket.");
      return;
    }

    const zip = archiver.create("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();

    zipStream.on("finish", () => {
      console.log("Zip stream finished.");
    });

    const dateString = moment(new Date()).format('YYMMDDHHmmss');
    submissionType === 'abstract' ? res.attachment(`Abstracts_${dateString}.zip`) : res.attachment(`Papers_${dateString}.zip`);
    zip.pipe(zipStream).pipe(res);

    zip.on("error", (err: any) => {
      console.error("Archiver error:", err);
      // Close the zipStream to prevent hanging responses
      zipStream.end();
      if (!res.headersSent) {
        res.status(500).send("Error creating zip file.");
      }
    });

    for (const abstract of abstractCollection) {
      const abstractSubmitter = await AbstractSubmitters.findOne({ where: { id: abstract.submitterId } });
      if (abstract.fileName) {
        abstract.fileName = Buffer.from(abstract.fileName, 'latin1').toString('utf8');
      }
      await addToZip(zip, abstract.s3FileKey, bucketName, `${abstractSubmitter.email}/${abstract.fileName}`);
    }

    // Finalize the zip and ensure all streams have been appended
    await zip.finalize();

  } catch (error) {
    console.error("Error zipping and downloading files:", error);
    if (!res.headersSent) {
      res.status(500).send("Error processing your request");
    }
  }
}

//Download All button in AMS - Trace abstract/paper status
async function getAllPaperZippedAmsTraceStatus(
  eventId: string,
  res: Response,
  submissionType: string,
  paperCollection: any,
): Promise<any> {
  try {
    const bucketName = config.S3CLIENT_BUCKET;
    const folderPrefix = `${config.S3CLIENT_AMS_FOLDER}/${eventId}/${submissionType}/`;

    const uploadedFiles = await listObjects(folderPrefix);

    const fileNames = uploadedFiles?.Contents?.map((c: any) =>
      String(c?.Key)?.slice(String(c?.Key).lastIndexOf('/') + 1)
    ).filter((c: any) => c?.length > 0) ?? [];

    if (uploadedFiles.length === 0) {
      res.status(404).send("No files found in the bucket.");
      return;
    }

    const zip = archiver.create("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();

    zipStream.on("finish", () => {
      console.log("Zip stream finished.");
    });

    const dateString = moment(new Date()).format('YYMMDDHHmmss');
    res.attachment(`Papers_${dateString}.zip`);
    zip.pipe(zipStream).pipe(res);

    zip.on("error", (err: any) => {
      console.error("Archiver error:", err);
      // Close the zipStream to prevent hanging responses
      zipStream.end();
      if (!res.headersSent) {
        res.status(500).send("Error creating zip file.");
      }
    });

    for (const paper of paperCollection) {
      const selectedAbstract = await Abstracts.findOne({ where: { id: paper.abstractId } });
      const abstractSubmitter = await AbstractSubmitters.findOne({ where: { id: selectedAbstract.submitterId } });
      if (paper.fileName) {
        paper.fileName = Buffer.from(paper.fileName, 'latin1').toString('utf8');
      }
      await addToZip(zip, paper.s3FileKey, bucketName, `${abstractSubmitter.email}/${paper.fileName}`);
    }

    // Finalize the zip and ensure all streams have been appended
    await zip.finalize();

  } catch (error) {
    console.error("Error zipping and downloading files:", error);
    if (!res.headersSent) {
      res.status(500).send("Error processing your request");
    }
  }
}

const streamToString = async (stream: Readable): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
};

async function getCsvObject(Key: string): Promise<any> {
  const command = new GetObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key,
  });
  const { Body } = await s3.send(command);

  // Check if Body is a stream and convert it to a string
  if (Body instanceof Readable) {
    const csvString = await streamToString(Body);
    return csvString; // or parse it as needed
  }

  throw new Error("Unexpected Body type");
}

//Download button in registrant attachment
async function getAllAttachmentZippeRegistrant(
  eventId: string,
  res: Response,
  attachmentCollection: any,
): Promise<any> {
  try {
    const bucketName = config.S3CLIENT_BUCKET;
    const folderPrefix = `${config.S3CLIENT_ATTACHMENT_FOLDER}/${eventId}/${attachmentCollection[0].participantId}/`;
    const uploadedFiles = await listObjects(folderPrefix);

    if (uploadedFiles.length === 0) {
      res.status(404).send("No files found in the bucket.");
      return;
    }

    const zip = archiver.create("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();

    zipStream.on("finish", () => {
      console.log("Zip stream finished.");
    });

    const participant = await Participant.findOne({where:{id: attachmentCollection[0].participantId}});
    const dateString = moment(new Date()).format('YYMMDDHHmmss');
    // res.attachment(`Attachment_${dateString}.zip`);
    res.attachment(`Attachment_${participant.email}_${dateString}.zip`);
    zip.pipe(zipStream).pipe(res);

    zip.on("error", (err: any) => {
      console.error("Archiver error:", err);
      // Close the zipStream to prevent hanging responses
      zipStream.end();
      if (!res.headersSent) {
        res.status(500).send("Error creating zip file.");
      }
    });

    for (const attachment of attachmentCollection) {
      if (attachment.fileName) {
        attachment.fileName = Buffer.from(attachment.fileName, 'latin1').toString('utf8');
      }
      await addToZip(zip, attachment.s3Key, bucketName, attachment.fileName);
    }

    // Finalize the zip and ensure all streams have been appended
    await zip.finalize();

  } catch (error) {
    console.error("Error zipping and downloading files:", error);
    if (!res.headersSent) {
      res.status(500).send("Error processing your request");
    }
  }
}

//Download all button in registrant attachment
async function getAllAttachmentZipped(
  eventId: string,
  res: Response,
  attachmentCollection: any,
): Promise<any> {
  try {
    const bucketName = config.S3CLIENT_BUCKET;
    const folderPrefix = `${config.S3CLIENT_ATTACHMENT_FOLDER}/${eventId}/`;
    const uploadedFiles = await listObjects(folderPrefix);

    if (uploadedFiles.length === 0) {
      res.status(404).send("No files found in the bucket.");
      return;
    }

    const zip = archiver.create("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();

    zipStream.on("finish", () => {
      console.log("Zip stream finished.");
    });

    const dateString = moment(new Date()).format('YYMMDDHHmmss');
    res.attachment(`Attachment_${eventId}_${dateString}.zip`);
    zip.pipe(zipStream).pipe(res);

    zip.on("error", (err: any) => {
      console.error("Archiver error:", err);
      // Close the zipStream to prevent hanging responses
      zipStream.end();
      if (!res.headersSent) {
        res.status(500).send("Error creating zip file.");
      }
    });

    for (const attachment of attachmentCollection) {
      const participant = await Participant.findOne({where: {id: attachment.participantId}});
      if (attachment.fileName) {
        attachment.fileName = Buffer.from(attachment.fileName, 'latin1').toString('utf8');
      }
      await addToZip(zip, attachment.s3Key, bucketName,` ${participant.email}/${attachment.fileName}`);
    }

    // Finalize the zip and ensure all streams have been appended
    await zip.finalize();

  } catch (error) {
    console.error("Error zipping and downloading files:", error);
    if (!res.headersSent) {
      res.status(500).send("Error processing your request");
    }
  }
}
async function uploadWebPageContentToS3(key: string, content: string): Promise<any> {
  const command = new PutObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key: key,
    Body: content,
    ContentType: 'text/plain',
  });

  try {
    const response = await s3.send(command);
    console.log(`File uploaded successfully. ${response.$metadata.httpStatusCode}`);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

async function getTextFileFromS3(key: string): Promise<string | undefined> {
  const command = new GetObjectCommand({
    Bucket: config.S3CLIENT_BUCKET,
    Key: key,
  });

  try {
    const response = await s3.send(command);
    const stream = response.Body as Readable;
    const text = await streamToStringPageContent(stream);
    // console.log('File content:', text);
    return text;
  } catch (error) {
    console.error('Error retrieving file:', error);
    return undefined;
  }
}

// Helper function to convert a stream to a string
function streamToStringPageContent(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export {
  upload,
  listObjects,
  download,
  streamS3ObjectToClient,
  deleteObject,
  getImageContentInBase64,
  getDownloadPresignedUrl,
  getAllBucketFilesZippedFileCollection,
  getAllBucketSelectedFilesZippedFileCollection,
  getAllAbstractZippedAmsTraceStatus,
  getAllPaperZippedAmsTraceStatus,
  getCsvObject,
  getAllAttachmentZippeRegistrant,
  getAllAttachmentZipped,
  uploadWebPageContentToS3,
  getTextFileFromS3
};
